// Migrasi dari Next.js NextResponse Proxy ke Vite Client Fetch Helper
// File lama di-backup ke src/proxy.ts.bak

export async function proxyRequest(url: string, options: RequestInit = {}) {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
