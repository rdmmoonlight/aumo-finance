using System.Diagnostics;
using System.Runtime.InteropServices;

namespace AumoBackend.Services.Core;

public class AxumProcessHostedService : IHostedService, IDisposable
{
    private Process? _process;
    private readonly ILogger<AxumProcessHostedService> _logger;
    private readonly IWebHostEnvironment _env;

    public AxumProcessHostedService(ILogger<AxumProcessHostedService> logger, IWebHostEnvironment env)
    {
        _logger = logger;
        _env = env;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        var executableName = RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? "axum.exe" : "axum";
        var executablePath = Path.Combine(_env.ContentRootPath, executableName);

        if (!File.Exists(executablePath))
        {
            _logger.LogError("[AXUM] Executable tidak ditemukan di path: {Path}", executablePath);
            return Task.CompletedTask;
        }

        var startInfo = new ProcessStartInfo
        {
            FileName = executablePath,
            WorkingDirectory = _env.ContentRootPath,
            UseShellExecute = false,
            CreateNoWindow = true,
            RedirectStandardOutput = true,
            RedirectStandardError = true
        };

        try
        {
            _process = new Process { StartInfo = startInfo };

            _process.OutputDataReceived += (sender, args) =>
            {
                if (!string.IsNullOrEmpty(args.Data))
                    _logger.LogInformation("[AXUM STDOUT] {Data}", args.Data);
            };

            _process.ErrorDataReceived += (sender, args) =>
            {
                if (!string.IsNullOrEmpty(args.Data))
                    _logger.LogError("[AXUM STDERR] {Data}", args.Data);
            };

            _process.Start();
            _process.BeginOutputReadLine();
            _process.BeginErrorReadLine();

            _logger.LogInformation("[AXUM] Berhasil menyalakan proses Axum Core (PID: {PID})", _process.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AXUM] Gagal menjalankan proses Axum Core");
        }

        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        if (_process != null && !_process.HasExited)
        {
            _logger.LogInformation("[AXUM] Mematikan proses Axum Core...");
            try
            {
                _process.Kill(entireProcessTree: true);
                _process.WaitForExit(2000);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AXUM] Gagal mematikan proses Axum");
            }
        }

        return Task.CompletedTask;
    }

    public void Dispose()
    {
        _process?.Dispose();
    }
}
