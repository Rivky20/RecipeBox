using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;

namespace RecipeBoxServer.Controllers;

[ApiController]
[Route("api/ai")]
public class AIController : ControllerBase
{
    private readonly HttpClient _http;
    private readonly string _googleApiKey;
    private const string GoogleAIUrl = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

    public AIController(IHttpClientFactory httpClientFactory, IConfiguration config)
    {
        _http = httpClientFactory.CreateClient();
        _googleApiKey = config["GoogleAI:ApiKey"] ?? throw new InvalidOperationException("Google AI API key not configured.");
    }

    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] JsonElement body)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, GoogleAIUrl);
        request.Headers.Add("Authorization", $"Bearer {_googleApiKey}");
        request.Content = new StringContent(body.GetRawText(), Encoding.UTF8, "application/json");

        var response = await _http.SendAsync(request);
        var content = await response.Content.ReadAsStringAsync();

        Console.WriteLine($"Google AI status: {(int)response.StatusCode}");
        Console.WriteLine($"Google AI body: {content}");

        return Content(content, "application/json", Encoding.UTF8);
    }
}
