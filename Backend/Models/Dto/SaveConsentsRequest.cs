namespace SentraSence.Api.Models.Dto;

public class ConsentItem
{
    public string ConsentType { get; set; } = null!;
    public bool Granted { get; set; }
}

public class SaveConsentsRequest
{
    public List<ConsentItem> Consents { get; set; } = new();
    public string ConsentVersion { get; set; } = "1.0";
}
