using System.Security.Cryptography;
using System.Text;

namespace MyTide.Api.Signals;

public static class SignalEndpoints
{
    /// <summary>Original signals returned per request (each with all its replies).</summary>
    public const int RecentThreadLimit = 100;
    public const string WritePolicy = "signal-write";
    /// <summary>How long a writer can take back their own signal.</summary>
    public const long SelfDeleteWindowMs = 3 * 60_000;

    public static IEndpointRouteBuilder MapSignalEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/health", async (SignalStore store) =>
            await store.IsReachableAsync()
                ? Results.Ok(new { status = "ok" })
                : Results.Problem("signal store unavailable", statusCode: StatusCodes.Status503ServiceUnavailable));

        app.MapGet("/api/signals", async (SignalStore store) =>
            Results.Ok(await store.ListRecentAsync(RecentThreadLimit)));

        app.MapPost("/api/signals", async (SignalRequest request, SignalStore store, TimeProvider clock) =>
        {
            var (text, error) = SignalValidator.Validate(request);
            if (error is not null) return Results.BadRequest(new { error });

            var id = request.Id ?? Guid.NewGuid().ToString("N");
            var createdAt = clock.GetUtcNow().ToUnixTimeMilliseconds();
            var deleteKeyHash = request.DeleteKey is null ? null : Sha256Hex(request.DeleteKey);
            var (outcome, signal) = await store.InsertAsync(id, request.ThreadId, text!, request.From!, createdAt, deleteKeyHash);

            return outcome switch
            {
                InsertOutcome.Created => Results.Created($"/api/signals/{id}", signal),
                InsertOutcome.AlreadyStored => Results.Ok(signal),
                InsertOutcome.IdConflict => Results.Conflict(new { error = "訊號識別碼已被使用" }),
                InsertOutcome.ParentNotFound => Results.BadRequest(new { error = "找不到要回覆的訊號" }),
                _ => Results.BadRequest(new { error = "回應只能接在原始訊號上" }),
            };
        }).RequireRateLimiting(WritePolicy);

        // Two ways to remove a signal (and its replies):
        // - its writer, with the one-time X-Delete-Key, within SelfDeleteWindowMs;
        // - the site owner, with the AdminToken bearer token, at any time.
        app.MapDelete("/api/signals/{id}", async (string id, HttpRequest http, SignalStore store, IConfiguration config, TimeProvider clock) =>
        {
            if (!SignalValidator.IsSignalId(id)) return Results.BadRequest(new { error = "訊號識別碼格式無效" });

            if (http.Headers.ContainsKey("Authorization"))
            {
                var adminToken = config["AdminToken"];
                if (string.IsNullOrEmpty(adminToken) || !IsAuthorized(http, adminToken)) return Results.Unauthorized();
                return await store.DeleteAsync(id) ? Results.NoContent() : Results.NotFound();
            }

            var key = http.Headers["X-Delete-Key"].ToString();
            if (!SignalValidator.IsSignalId(key)) return Results.NotFound();

            var outcome = await store.DeleteOwnAsync(id, Sha256Hex(key), clock.GetUtcNow().ToUnixTimeMilliseconds(), SelfDeleteWindowMs);
            return outcome switch
            {
                SelfDeleteOutcome.Deleted => Results.NoContent(),
                SelfDeleteOutcome.WrongKey => Results.Json(new { error = "只能收回自己放出的訊號" }, statusCode: StatusCodes.Status403Forbidden),
                SelfDeleteOutcome.Expired => Results.Json(new { error = "已經超過可以收回的時間" }, statusCode: StatusCodes.Status403Forbidden),
                _ => Results.NotFound(),
            };
        });

        return app;
    }

    static string Sha256Hex(string value) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(value))).ToLowerInvariant();

    static bool IsAuthorized(HttpRequest http, string adminToken)
    {
        var header = http.Headers.Authorization.ToString();
        const string scheme = "Bearer ";
        if (!header.StartsWith(scheme, StringComparison.Ordinal)) return false;

        var supplied = Encoding.UTF8.GetBytes(header[scheme.Length..]);
        var expected = Encoding.UTF8.GetBytes(adminToken);
        return CryptographicOperations.FixedTimeEquals(supplied, expected);
    }
}
