using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(options => options.AddServerHeader = false);
builder.Services.AddProblemDetails();
var app = builder.Build();

var webRoot = app.Environment.WebRootPath;
var home = File.ReadAllText(Path.Combine(webRoot, "index.html"))
    .Replace("data-runtime=\"static\"", "data-runtime=\"api\"", StringComparison.Ordinal);
var traces = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(
    File.ReadAllText(Path.Combine(webRoot, "data", "traces.json")))
    ?? throw new InvalidOperationException("The demonstration catalog could not be loaded.");

app.UseExceptionHandler();
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    context.Response.Headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
    context.Response.Headers.ContentSecurityPolicy = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'";
    await next(context);
});
app.UseStaticFiles();
app.MapGet("/", () => Results.Content(home, "text/html; charset=utf-8"));
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));
app.MapGet("/api/traces/{scenario}", (string scenario) =>
    traces.TryGetValue(scenario, out var trace)
        ? Results.Json(trace)
        : Results.Problem(statusCode: 404, title: "Unknown demonstration scenario",
            detail: "Choose cache, search, success, timeout, or duplicate."));
app.MapGet("/api/profile", () => Results.Ok(new
{
    name = "Umut Oku",
    focus = new[] { ".NET", "Microservices", "Product & search", "PostgreSQL", "Redis", "Elasticsearch", "Operations", "Payments" },
    github = "https://github.com/Umutoku",
    linkedin = "https://www.linkedin.com/in/umutoku/"
}));
app.MapFallback(() => Results.Problem(statusCode: 404, title: "Page not found"));
app.Run();
