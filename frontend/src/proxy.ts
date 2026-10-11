// Migrasi dari Next.js NextResponse Proxy ke Vite Client Fetch Helper
// File lama di-backup ke src/proxy.ts.bak

export async function proxyRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    // credentials: "include" memastikan cookie (termasuk HttpOnly) otomatis terkirim
    credentials: options.credentials || "include",
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
