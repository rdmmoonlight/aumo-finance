namespace AumoBackend.Domain;

/// <summary>
/// Dilempar ketika sebuah aturan domain akuntansi dilanggar (jurnal tidak seimbang, periode sudah ditutup,
/// tanggal jatuh pada periode terkunci, dst.). Pesannya aman ditampilkan kepada pengguna.
/// </summary>
/// <remarks>
/// Turunan <see cref="InvalidOperationException"/> dengan sengaja: pemanggil dan pemetaan HTTP yang sudah ada
/// (<c>ControllerBaseExtensions.HandleServiceException</c>, <c>JournalsController</c>) tetap menghasilkan
/// 400 Bad Request dan pesan yang sama. Kesalahan non-aturan (konfigurasi, infrastruktur, argumen null)
/// tetap memakai pengecualian bawaan .NET.
/// </remarks>
public class DomainRuleViolation : InvalidOperationException
{
    public DomainRuleViolation(string message)
        : base(message)
    {
    }

    public DomainRuleViolation(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
