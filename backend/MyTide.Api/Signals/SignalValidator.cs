using System.Globalization;
using System.Text;

namespace MyTide.Api.Signals;

public static class SignalValidator
{
    public const int MaxTextElements = 40;

    /// <summary>
    /// Returns the cleaned text, or an error message for the visitor.
    /// Signals are one quiet line: control characters, line breaks and
    /// bidirectional overrides (which can flip how text reads) are removed.
    /// </summary>
    public static (string? Text, string? Error) Validate(SignalRequest request)
    {
        if (!SignalBanks.IsValid(request.From)) return (null, "訊號來源無效");
        if (request.Id is not null && !IsSignalId(request.Id)) return (null, "訊號識別碼格式無效");
        if (request.ThreadId is not null && !IsSignalId(request.ThreadId)) return (null, "回覆訊號格式無效");

        var text = Clean(request.Text);
        if (text.Length == 0) return (null, "請先寫下一句話");
        if (new StringInfo(text).LengthInTextElements > MaxTextElements) return (null, $"訊號最多 {MaxTextElements} 個字");

        return (text, null);
    }

    /// <summary>Ids are 32 lowercase hex characters (a GUID in "N" format).</summary>
    public static bool IsSignalId(string value) =>
        value.Length == 32 && Guid.TryParseExact(value, "N", out _) && value == value.ToLowerInvariant();

    static string Clean(string? text)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;

        var builder = new StringBuilder(text.Length);
        foreach (var rune in text.Normalize(NormalizationForm.FormC).EnumerateRunes())
        {
            var category = Rune.GetUnicodeCategory(rune);
            var isBidiControl = rune.Value is (>= 0x202A and <= 0x202E) or (>= 0x2066 and <= 0x2069);
            if (category == UnicodeCategory.Control || isBidiControl) continue;
            builder.Append(rune.ToString());
        }

        return builder.ToString().Trim();
    }
}
