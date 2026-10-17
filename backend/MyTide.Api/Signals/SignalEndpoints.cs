using System.Security.Cryptography;
using System.Text;

namespace MyTide.Api.Signals;

public static class SignalEndpoints
{
    /// <summary>Original signals returned per request (each with all its replies).</summary>
    public const int RecentThreadLimit = 100;
    public const string WritePolicy = "signal-write";

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
            var (outcome, signal) = await store.InsertAsync(id, request.ThreadId, text!, request.From!, createdAt);

            return outcome switch
            {
                InsertOutcome.Created => Results.Created($"/api/signals/{id}", signal),
                InsertOutcome.AlreadyStored => Results.Ok(signal),
                InsertOutcome.IdConflict => Results.Conflict(new { error = "訊號識別碼已被使用" }),
                InsertOutcome.ParentNotFound => Results.BadRequest(new { error = "找不到要回覆的訊號" }),
                _ => Results.BadRequest(new { error = "回應只能接在原始訊號上" }),
            };
        }).RequireRateLimiting(WritePolicy);

        // Moderation: anonymous signals can be removed by the site owner only.
        // Disabled unless the AdminToken setting is configured.
        app.MapDelete("/api/signals/{id}", async (string id, HttpRequest http, SignalStore store, IConfiguration config) =>
        {
            var adminToken = config["AdminToken"];
            if (string.IsNullOrEmpty(adminToken)) return Results.NotFound();
            if (!IsAuthorized(http, adminToken)) return Results.Unauthorized();
            if (!SignalValidator.IsSignalId(id)) return Results.BadRequest(new { error = "訊號識別碼格式無效" });

            return await store.DeleteAsync(id) ? Results.NoContent() : Results.NotFound();
        });

        return app;
    }

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
