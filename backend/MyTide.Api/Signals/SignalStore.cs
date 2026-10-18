using Microsoft.Data.Sqlite;

namespace MyTide.Api.Signals;

public enum SelfDeleteOutcome
{
    Deleted,
    NotFound,
    /// <summary>The key does not match, or the signal was stored without one.</summary>
    WrongKey,
    /// <summary>The take-back window has passed.</summary>
    Expired,
}

public enum InsertOutcome
{
    Created,
    /// <summary>The same signal (same id, text and bank) was already stored: a retried send.</summary>
    AlreadyStored,
    /// <summary>The id is already used by a different signal.</summary>
    IdConflict,
    ParentNotFound,
    /// <summary>Replies attach to original signals only, never to other replies.</summary>
    ParentIsReply,
}

/// <summary>All SQLite access for signals.</summary>
public sealed class SignalStore(string connectionString)
{
    public static SignalStore ForDirectory(string dataDirectory)
    {
        Directory.CreateDirectory(dataDirectory);
        var connectionString = new SqliteConnectionStringBuilder
        {
            DataSource = Path.Combine(dataDirectory, "mytide-signals.db"),
            ForeignKeys = true,
        }.ToString();
        return new SignalStore(connectionString);
    }

    public async Task InitializeAsync()
    {
        await using var connection = await OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = """
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS signals (
                id TEXT PRIMARY KEY,
                thread_id TEXT NULL REFERENCES signals(id) ON DELETE CASCADE,
                text TEXT NOT NULL,
                from_bank TEXT NOT NULL CHECK(from_bank IN ('past', 'today')),
                created_at INTEGER NOT NULL,
                departed TEXT NOT NULL,
                source_title TEXT NULL,
                source_day_key TEXT NULL
            );
            CREATE INDEX IF NOT EXISTS ix_signals_thread_created ON signals(thread_id, created_at);
            CREATE INDEX IF NOT EXISTS ix_signals_created ON signals(created_at);
            """;
        await command.ExecuteNonQueryAsync();

        // Added later (same as the Worker's 0002 migration): writers may take a signal back.
        await using var columns = connection.CreateCommand();
        columns.CommandText = "SELECT COUNT(*) FROM pragma_table_info('signals') WHERE name = 'delete_key_hash'";
        if (Convert.ToInt64(await columns.ExecuteScalarAsync()) == 0)
        {
            await using var alter = connection.CreateCommand();
            alter.CommandText = "ALTER TABLE signals ADD COLUMN delete_key_hash TEXT NULL";
            await alter.ExecuteNonQueryAsync();
        }

        // Added later (same as the Worker's 0003 migration): 語氣 before a signal.
        await using var toneColumn = connection.CreateCommand();
        toneColumn.CommandText = "SELECT COUNT(*) FROM pragma_table_info('signals') WHERE name = 'tone'";
        if (Convert.ToInt64(await toneColumn.ExecuteScalarAsync()) == 0)
        {
            await using var alter = connection.CreateCommand();
            alter.CommandText = "ALTER TABLE signals ADD COLUMN tone TEXT NULL";
            await alter.ExecuteNonQueryAsync();
        }
    }

    public async Task<bool> IsReachableAsync()
    {
        try
        {
            await using var connection = await OpenAsync();
            await using var command = connection.CreateCommand();
            command.CommandText = "SELECT 1";
            return await command.ExecuteScalarAsync() is not null;
        }
        catch (SqliteException)
        {
            return false;
        }
    }

    /// <summary>The most recent <paramref name="threadLimit"/> signals, oldest first, each with all its replies.</summary>
    public async Task<List<SignalResponse>> ListRecentAsync(int threadLimit)
    {
        await using var connection = await OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = """
            WITH recent AS (
                SELECT id FROM signals WHERE thread_id IS NULL
                ORDER BY created_at DESC, id DESC LIMIT $limit
            )
            SELECT id, thread_id, text, from_bank, created_at, departed, source_title, source_day_key, tone
            FROM signals
            WHERE id IN (SELECT id FROM recent) OR thread_id IN (SELECT id FROM recent)
            ORDER BY created_at, id
            """;
        command.Parameters.AddWithValue("$limit", threadLimit);

        var rows = new List<StoredSignal>();
        await using (var reader = await command.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
            {
                rows.Add(new StoredSignal(
                    reader.GetString(0),
                    reader.IsDBNull(1) ? null : reader.GetString(1),
                    reader.GetString(2),
                    reader.GetString(3),
                    reader.IsDBNull(8) ? SignalValidator.DefaultTone : reader.GetString(8),
                    reader.GetInt64(4),
                    reader.GetString(5),
                    reader.IsDBNull(6) ? null : reader.GetString(6),
                    reader.IsDBNull(7) ? null : reader.GetString(7)));
            }
        }

        var threads = new List<SignalResponse>();
        var byId = new Dictionary<string, SignalResponse>();
        foreach (var row in rows)
        {
            var response = ToResponse(row);
            if (row.ThreadId is null)
            {
                byId[row.Id] = response;
                threads.Add(response);
            }
            else if (byId.TryGetValue(row.ThreadId, out var parent))
            {
                parent.Replies.Add(response);
            }
        }

        return threads;
    }

    public async Task<(InsertOutcome Outcome, SignalCreated? Signal)> InsertAsync(
        string id, string? threadId, string text, string from, string tone, long createdAt, string? deleteKeyHash = null)
    {
        await using var connection = await OpenAsync();
        await using var transaction = (SqliteTransaction)await connection.BeginTransactionAsync();

        await using (var existing = connection.CreateCommand())
        {
            existing.Transaction = transaction;
            existing.CommandText = "SELECT text, from_bank, thread_id, created_at FROM signals WHERE id = $id";
            existing.Parameters.AddWithValue("$id", id);
            await using var reader = await existing.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var same = reader.GetString(0) == text
                    && reader.GetString(1) == from
                    && (reader.IsDBNull(2) ? null : reader.GetString(2)) == threadId;
                return same
                    ? (InsertOutcome.AlreadyStored, new SignalCreated(id, reader.GetInt64(3)))
                    : (InsertOutcome.IdConflict, null);
            }
        }

        if (threadId is not null)
        {
            await using var parent = connection.CreateCommand();
            parent.Transaction = transaction;
            parent.CommandText = "SELECT thread_id FROM signals WHERE id = $id";
            parent.Parameters.AddWithValue("$id", threadId);
            var parentThreadId = await parent.ExecuteScalarAsync();
            if (parentThreadId is null) return (InsertOutcome.ParentNotFound, null);
            if (parentThreadId is not DBNull) return (InsertOutcome.ParentIsReply, null);
        }

        await using (var insert = connection.CreateCommand())
        {
            insert.Transaction = transaction;
            insert.CommandText = """
                INSERT INTO signals (id, thread_id, text, from_bank, tone, created_at, departed, delete_key_hash)
                VALUES ($id, $threadId, $text, $from, $tone, $createdAt, 'today', $deleteKeyHash)
                """;
            insert.Parameters.AddWithValue("$id", id);
            insert.Parameters.AddWithValue("$threadId", (object?)threadId ?? DBNull.Value);
            insert.Parameters.AddWithValue("$text", text);
            insert.Parameters.AddWithValue("$from", from);
            insert.Parameters.AddWithValue("$tone", tone);
            insert.Parameters.AddWithValue("$createdAt", createdAt);
            insert.Parameters.AddWithValue("$deleteKeyHash", (object?)deleteKeyHash ?? DBNull.Value);
            await insert.ExecuteNonQueryAsync();
        }

        await transaction.CommitAsync();
        return (InsertOutcome.Created, new SignalCreated(id, createdAt));
    }

    /// <summary>Lets a writer take back their own signal while the window is open.</summary>
    public async Task<SelfDeleteOutcome> DeleteOwnAsync(string id, string deleteKeyHash, long now, long windowMs)
    {
        await using (var connection = await OpenAsync())
        await using (var command = connection.CreateCommand())
        {
            command.CommandText = "SELECT created_at, delete_key_hash FROM signals WHERE id = $id";
            command.Parameters.AddWithValue("$id", id);
            await using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync()) return SelfDeleteOutcome.NotFound;

            var stored = reader.IsDBNull(1) ? null : reader.GetString(1);
            var matches = stored is not null && System.Security.Cryptography.CryptographicOperations.FixedTimeEquals(
                System.Text.Encoding.ASCII.GetBytes(stored), System.Text.Encoding.ASCII.GetBytes(deleteKeyHash));
            if (!matches) return SelfDeleteOutcome.WrongKey;
            if (now - reader.GetInt64(0) > windowMs) return SelfDeleteOutcome.Expired;
        }

        return await DeleteAsync(id) ? SelfDeleteOutcome.Deleted : SelfDeleteOutcome.NotFound;
    }

    /// <summary>Removes a signal and, for an original signal, all of its replies.</summary>
    public async Task<bool> DeleteAsync(string id)
    {
        await using var connection = await OpenAsync();
        await using var command = connection.CreateCommand();
        // Replies first: databases created before ON DELETE CASCADE do not cascade.
        command.CommandText = """
            DELETE FROM signals WHERE thread_id = $id;
            DELETE FROM signals WHERE id = $id;
            SELECT changes();
            """;
        command.Parameters.AddWithValue("$id", id);
        return Convert.ToInt64(await command.ExecuteScalarAsync()) > 0;
    }

    async Task<SqliteConnection> OpenAsync()
    {
        var connection = new SqliteConnection(connectionString);
        await connection.OpenAsync();
        return connection;
    }

    static SignalResponse ToResponse(StoredSignal row) => new(
        row.Id,
        row.ThreadId,
        row.Text,
        row.From,
        row.Tone,
        row.CreatedAt,
        row.Departed,
        row.SourceTitle is null || row.SourceDayKey is null ? null : new SignalSource(row.SourceTitle, row.SourceDayKey),
        []);
}
