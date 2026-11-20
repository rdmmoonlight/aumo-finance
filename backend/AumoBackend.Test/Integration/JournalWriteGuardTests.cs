namespace AumoBackend.Test.Unit;

using System.Text.RegularExpressions;

/// <summary>
/// Penjaga satu pintu posting (Fase 2.5): tidak ada kode di proyek AumoBackend yang menulis tabel GeneralJournal
/// selain <c>JournalPostingService</c>. Kriteria selesai: pencarian Add/Remove di luar satu kelas tidak menemukan apa pun.
/// </summary>
public class JournalWriteGuardTests
{
    private const string GateFile = "JournalPostingService.cs";

    // Pengecualian tertulis: PeriodsService.Selection.cs memulihkan baris arsip apa adanya (JournalEntryId asli,
    // INSERT ... SELECT dari schema archive). Itu salinan ulang, bukan posting jurnal baru.
    private const string RestoreFile = "PeriodsService.Selection.cs";

    private static readonly Regex DbSetWrite = new(
        @"(GeneralJournals|Set<GeneralJournal>\(\))\s*\.\s*(Add|AddRange|AddAsync|AddRangeAsync|Remove|RemoveRange|Attach|AttachRange|Update|UpdateRange)\s*\(",
        RegexOptions.Compiled);

    private static readonly Regex BulkWrite = new(
        @"GeneralJournals[^;]*?\.\s*(ExecuteDelete|ExecuteUpdate)(Async)?\s*\(",
        RegexOptions.Compiled);

    private static readonly Regex RawSqlWrite = new(
        @"(INSERT\s+INTO|DELETE\s+FROM|UPDATE)\s+[^;]{0,60}?GeneralJournal\b",
        RegexOptions.Compiled);

    [Fact]
    public void GeneralJournals_AreWrittenOnlyByJournalPostingService()
    {
        var projectDir = FindProjectDirectory();
        var violations = new List<string>();

        foreach (var file in Directory.EnumerateFiles(projectDir, "*.cs", SearchOption.AllDirectories))
        {
            var relative = Path.GetRelativePath(projectDir, file);
            var segments = relative.Split(Path.DirectorySeparatorChar);
            if (segments.Any(s => s is "Migrations" or "obj" or "bin"))
            {
                continue;
            }

            string name = Path.GetFileName(file);
            if (name == GateFile)
            {
                continue;
            }

            string text = File.ReadAllText(file);
            Collect(violations, relative, text, DbSetWrite);
            Collect(violations, relative, text, BulkWrite);

            if (name != RestoreFile)
            {
                Collect(violations, relative, text, RawSqlWrite);
            }
        }

        Assert.True(
            violations.Count == 0,
            "Penulisan GeneralJournals di luar JournalPostingService:\n" + string.Join("\n", violations));
    }

    private static void Collect(List<string> violations, string relative, string text, Regex pattern)
    {
        foreach (Match m in pattern.Matches(text))
        {
            int line = text.AsSpan(0, m.Index).Count('\n') + 1;
            violations.Add($"{relative}:{line}  {m.Value.Trim()}");
        }
    }

    private static string FindProjectDirectory()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null)
        {
            var candidate = Path.Combine(dir.FullName, "AumoBackend", "AumoBackend.csproj");
            if (File.Exists(candidate))
            {
                return Path.GetDirectoryName(candidate)!;
            }

            dir = dir.Parent;
        }

        throw new DirectoryNotFoundException("Folder proyek AumoBackend tidak ditemukan dari " + AppContext.BaseDirectory);
    }
}
