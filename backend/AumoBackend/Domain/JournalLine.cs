namespace AumoBackend.Domain;

/// <summary>
/// Satu baris jurnal pada objek domain. Tidak mengenal EF Core, ASP.NET, maupun DTO.
/// </summary>
public sealed record JournalLine(int AccountId, string? Description, decimal Debit, decimal Credit)
{
    /// <summary>
    /// Baris bernilai: memiliki akun dan salah satu nominal tidak nol.
    /// Baris yang tidak bernilai diabaikan saat jurnal dibuat.
    /// </summary>
    public bool IsEffective => this.AccountId != 0 && (this.Debit != 0 || this.Credit != 0);
}
