global using AumoBackend.Core;
global using AumoBackend.Controllers;
global using Microsoft.AspNetCore.Components;
global using Microsoft.Extensions.Hosting;
global using static Microsoft.AspNetCore.Components.Web.RenderMode;
global using AumoBlazor;
global using AumoBlazor.Components;

namespace AumoFinance.Models
{
    public class JournalEntry : AumoBackend.Core.JournalEntry {}
    
    public class JournalImportResultDto
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public int TotalTransactionsRead { get; set; }
        public int TotalLinesRead { get; set; }
        public List<string> Warnings { get; set; } = new();
        public List<JournalTransactionImportDto> Transactions { get; set; } = new();
    }

    public class JournalTransactionImportDto
    {
        public DateTime Date { get; set; }
        public string JournalType { get; set; } = string.Empty;
        public List<JournalLineImportDto> Lines { get; set; } = new();
    }

    // Implicit wrapper agar RefNumber kompatibel secara ganda dengan int dan string
    public struct FlexibleRefNumber
    {
        private string _value;
        public FlexibleRefNumber(string value) => _value = value ?? string.Empty;
        public FlexibleRefNumber(int value) => _value = value.ToString();

        public static implicit operator string(FlexibleRefNumber r) => r._value ?? string.Empty;
        public static implicit operator FlexibleRefNumber(string s) => new FlexibleRefNumber(s);
        public static implicit operator int(FlexibleRefNumber r) => int.TryParse(r._value, out var i) ? i : 0;
        public static implicit operator FlexibleRefNumber(int i) => new FlexibleRefNumber(i);

        public static bool operator ==(FlexibleRefNumber a, FlexibleRefNumber b) => a._value == b._value;
        public static bool operator !=(FlexibleRefNumber a, FlexibleRefNumber b) => a._value != b._value;
        public static bool operator ==(FlexibleRefNumber a, int b) => (int)a == b;
        public static bool operator !=(FlexibleRefNumber a, int b) => (int)a != b;
        public static bool operator ==(int a, FlexibleRefNumber b) => a == (int)b;
        public static bool operator !=(int a, FlexibleRefNumber b) => a != (int)b;
        public static bool operator ==(FlexibleRefNumber a, string b) => a._value == b;
        public static bool operator !=(FlexibleRefNumber a, string b) => a._value != b;
        public static bool operator ==(string a, FlexibleRefNumber b) => a == b._value;
        public static bool operator !=(string a, FlexibleRefNumber b) => a != b._value;

        public static bool operator >(FlexibleRefNumber a, int b) => (int)a > b;
        public static bool operator <(FlexibleRefNumber a, int b) => (int)a < b;
        public static bool operator >=(FlexibleRefNumber a, int b) => (int)a >= b;
        public static bool operator <=(FlexibleRefNumber a, int b) => (int)a <= b;

        public static bool operator >(string a, FlexibleRefNumber b) => int.TryParse(a, out var ai) && ai > (int)b;
        public static bool operator <(string a, FlexibleRefNumber b) => int.TryParse(a, out var ai) && ai < (int)b;
        public static bool operator >=(string a, FlexibleRefNumber b) => int.TryParse(a, out var ai) && ai >= (int)b;
        public static bool operator <=(string a, FlexibleRefNumber b) => int.TryParse(a, out var ai) && ai <= (int)b;

        public override bool Equals(object? obj) => obj?.ToString() == _value;
        public override int GetHashCode() => _value?.GetHashCode() ?? 0;
        public override string ToString() => _value ?? string.Empty;
    }

    public class JournalLineImportDto
    {
        public int RowIndex { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public FlexibleRefNumber RefNumber { get; set; }
        public decimal? Debit { get; set; }
        public decimal? Credit { get; set; }
        public bool IsNewAccount { get; set; }
    }
}

namespace AumoFinance.Models.DTOs {}

namespace AumoFinance.Controllers
{
    namespace Api {}
}

namespace AumoFinance.Services
{
    public interface IJournalImportService {}
    public class JournalImportService : IJournalImportService {}
    
    public class TxNumberService 
    {
        public string GetNextTxNumber() => "TX-001";
        public Task<string> GenerateAsync(Guid userId, string journalType, DateTime date) 
            => Task.FromResult("TX-001");
    }
    
    public class RenderKeepAliveService : IHostedService
    {
        public Task StartAsync(CancellationToken cancellationToken) => Task.CompletedTask;
        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}

namespace AumoFinance.Services.Security {}
