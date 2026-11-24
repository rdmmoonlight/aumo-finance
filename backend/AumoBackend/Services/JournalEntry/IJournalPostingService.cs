namespace AumoBackend.Services.JournalEntry;

using AumoBackend.Domain;
using AumoBackend.Models;

/// <summary>Perintah menulis jurnal baru. Nomor transaksi dan <c>JournalEntryId</c> diberikan oleh pintu posting.</summary>
/// <param name="UserId">Pemilik jurnal.</param>
/// <param name="JournalType">General, Adjusting, atau Reversing. Kosong dianggap General.</param>
/// <param name="EntryDate">Tanggal jurnal; menentukan periode.</param>
/// <param name="Lines">Baris jurnal. Baris tanpa akun atau tanpa nominal diabaikan oleh aturan domain.</param>
/// <param name="CreatedAt">Waktu pembuatan dari perangkat; kosong atau default berarti saat ini (UTC).</param>
/// <param name="SourceJournalEntryId">Jurnal sumber (dipakai jurnal pembalik).</param>
public sealed record PostJournalCommand(
    Guid UserId,
    string? JournalType,
    DateTime EntryDate,
    IReadOnlyList<JournalLine> Lines,
    DateTime? CreatedAt = null,
    int? SourceJournalEntryId = null);

/// <summary>Perintah mengganti isi jurnal yang sudah ada. <c>JournalEntryId</c>, nomor transaksi, jenis, dan waktu pembuatan tetap.</summary>
public sealed record ReplaceJournalCommand(
    Guid UserId,
    int JournalEntryId,
    DateTime EntryDate,
    IReadOnlyList<JournalLine> Lines);

/// <summary>Hasil posting: kepala jurnal dan baris yang tersimpan (<c>LineId</c> sudah terisi).</summary>
public sealed record PostedJournal(
    int JournalEntryId,
    string TransactionNumber,
    string JournalType,
    DateTime EntryDate,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    IReadOnlyList<GeneralJournal> Rows);

/// <summary>
/// Satu-satunya pintu penulisan tabel <c>GeneralJournals</c>. Kode lain tidak boleh menambah, mengubah,
/// atau menghapus baris tabel itu; <c>JournalWriteGuardTests</c> menjaganya.
/// </summary>
/// <remarks>
/// Pintu ini yang memeriksa, sebelum menulis apa pun: aturan domain jurnal (minimal dua baris bernilai, saldo seimbang),
/// akun aktif milik pengguna, kunci periode menurut tanggal entri (bukan periode yang sedang dipilih), dan nomor transaksi.
/// Pelanggaran dilaporkan lewat <see cref="DomainRuleViolation"/>; tidak ada baris yang tertulis dan nomor transaksi tidak terpakai.
/// Jalur apa pun yang menulis jurnal (input biasa, jurnal pembalik, saldo awal, dan import bila kelak dibangun)
/// mendapat pemeriksaan yang sama karena hanya lewat sini.
/// <para>
/// Semua operasi memakai <c>AppDbContext</c> milik pemanggil (scoped). Bila pemanggil sudah membuka transaksi,
/// operasi ikut di dalamnya; bila belum, setiap operasi menyimpan atomik lewat satu <c>SaveChanges</c>.
/// </para>
/// </remarks>
public interface IJournalPostingService
{
    /// <summary>Menulis jurnal baru: memeriksa aturan domain, akun, dan kunci periode pada <c>EntryDate</c>, memberi nomor transaksi dan <c>JournalEntryId</c>, lalu menyimpan.</summary>
    Task<PostedJournal> PostAsync(PostJournalCommand command, CancellationToken ct = default);

    /// <summary>Mengganti seluruh baris satu jurnal milik pengguna. Ditolak bila tanggal jurnal lama atau tanggal baru berada di periode tertutup. Melempar <see cref="KeyNotFoundException"/> bila jurnal tidak ada.</summary>
    Task<PostedJournal> ReplaceAsync(ReplaceJournalCommand command, CancellationToken ct = default);

    /// <summary>Menghapus seluruh baris satu jurnal milik pengguna dan mengembalikan jumlah baris yang dihapus. Ditolak bila tanggal jurnal berada di periode tertutup. Melempar <see cref="KeyNotFoundException"/> bila jurnal tidak ada.</summary>
    Task<int> RemoveAsync(Guid userId, int journalEntryId, CancellationToken ct = default);
}
