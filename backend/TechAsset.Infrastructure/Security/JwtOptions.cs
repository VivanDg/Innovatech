namespace TechAsset.Infrastructure.Security;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Key { get; set; } = string.Empty;
    public string Issuer { get; set; } = "TechAsset";
    public string Audience { get; set; } = "TechAsset.Web";
    public int ExpirationMinutes { get; set; } = 480;
}
