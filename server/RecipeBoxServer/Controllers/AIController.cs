using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;

namespace RecipeBoxServer.Controllers;

[ApiController]
[Route("api/ai")]
public class AIController : ControllerBase
{
    private readonly HttpClient _http;
    private readonly string _openRouterApiKey;
    private const string OpenRouterUrl = "https://openrouter.ai/api/v1/chat/completions";

    public AIController(IHttpClientFactory httpClientFactory, IConfiguration config)
    {
        _http = httpClientFactory.CreateClient();
        var key = config["OpenRouter:ApiKey"];
        if (string.IsNullOrWhiteSpace(key))
            throw new InvalidOperationException("OpenRouter API key not configured (OpenRouter__ApiKey env var missing or empty).");
        _openRouterApiKey = key;
    }

    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] JsonElement body)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, OpenRouterUrl);
        request.Headers.Add("Authorization", $"Bearer {_openRouterApiKey}");
        request.Headers.Add("HTTP-Referer", "https://recipebox-hetz.onrender.com");
        request.Headers.Add("X-Title", "RecipeBox");
        request.Content = new StringContent(body.GetRawText(), Encoding.UTF8, "application/json");

        var response = await _http.SendAsync(request);
        var content = await response.Content.ReadAsStringAsync();

        Console.WriteLine($"Google AI status: {(int)response.StatusCode}");
        Console.WriteLine($"Google AI body: {content}");

        return new ContentResult
        {
            Content = content,
            ContentType = "application/json",
            StatusCode = (int)response.StatusCode
        };
    }
}
