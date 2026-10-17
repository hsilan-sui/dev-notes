using System.Threading.RateLimiting;
using Microsoft.AspNetCore.HttpOverrides;
using MyTide.Api.Signals;

var builder = WebApplication.CreateBuilder(args);

var dataDirectory = builder.Configuration["DataDirectory"]
    ?? Path.Combine(builder.Environment.ContentRootPath, "data");
var allowedOrigins = (builder.Configuration["AllowedOrigins"]
    ?? "https://hsilan-sui.github.io,http://localhost:3003,http://127.0.0.1:3003")
    .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);

builder.Services.AddSingleton(SignalStore.ForDirectory(dataDirectory));
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.WithOrigins(allowedOrigins).AllowAnyHeader().WithMethods("GET", "POST", "DELETE")));

// Hosts terminate TLS in a proxy; trust its X-Forwarded-For so each visitor
// gets their own rate limit instead of sharing the proxy's address.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

// Per visitor: 10 signals a minute, so one person cannot silence everyone else.
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy(SignalEndpoints.WritePolicy, http => RateLimitPartition.GetFixedWindowLimiter(
        http.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 10,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0,
        }));
});

var app = builder.Build();

app.UseForwardedHeaders();
app.UseCors();
app.UseRateLimiter();

await app.Services.GetRequiredService<SignalStore>().InitializeAsync();
app.MapSignalEndpoints();

app.Run();
