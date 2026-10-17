namespace MyTide.Api.Signals;

/// <summary>Body of <c>POST /api/signals</c>: a new signal, or a reply when <see cref="ThreadId"/> is set.</summary>
/// <param name="Id">Optional client-generated id (32 hex chars) so a retried send is not stored twice.</param>
/// <param name="DeleteKey">Optional one-time key (32 hex chars) that lets the writer take the signal back for a few minutes.</param>
public sealed record SignalRequest(string? Text, string? From, string? Id = null, string? ThreadId = null, string? DeleteKey = null);

/// <summary>One signal as returned by <c>GET /api/signals</c>; replies are nested under their original signal.</summary>
public sealed record SignalResponse(
    string Id,
    string? ThreadId,
    string Text,
    string From,
    long WrittenAt,
    string Departed,
    SignalSource? Source,
    List<SignalResponse> Replies);

public sealed record SignalSource(string Title, string DayKey);

/// <summary>Result of <c>POST /api/signals</c>.</summary>
public sealed record SignalCreated(string Id, long CreatedAt);

/// <summary>A row of the <c>signals</c> table.</summary>
public sealed record StoredSignal(
    string Id,
    string? ThreadId,
    string Text,
    string From,
    long CreatedAt,
    string Departed,
    string? SourceTitle,
    string? SourceDayKey);

public static class SignalBanks
{
    public const string Past = "past";
    public const string Today = "today";

    public static bool IsValid(string? bank) => bank is Past or Today;
}
