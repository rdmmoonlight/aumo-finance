using System.Runtime.InteropServices;

namespace 

public class RustCoreNativeService
{
    [DllImport("axum", EntryPoint = "get_salam")]
    private static extern IntPtr get_salam();

    public string GetSalam()
    {
        IntPtr ptr = get_salam();
        return Marshal.PtrToStringAnsi(ptr) ?? string.Empty;
    }
}
