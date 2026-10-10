import type { VanillaPage } from "@/lib/router";

/**
 * Contoh halaman Vanilla JS (page.ts / page.js).
 * Aturan: export default fungsi yang mengisi `container`; boleh mengembalikan cleanup.
 * Hapus folder ini jika tidak diperlukan.
 */
const page: VanillaPage = (container, { query, navigate }) => {
  container.innerHTML = `
    <div class="mx-auto max-w-md p-6 space-y-3">
      <h1 class="text-lg font-semibold">Halaman Vanilla JS</h1>
      <p class="text-sm text-muted-foreground">
        Dirender tanpa React. Query: <code>${query.toString() || "(kosong)"}</code>
      </p>
      <p class="text-sm">
        <a href="/auth" class="underline">Ke halaman React (/auth)</a>
      </p>
      <button id="btn-home" class="rounded-md border px-3 py-1.5 text-sm">Ke /home</button>
    </div>
  `;

  const btn = container.querySelector<HTMLButtonElement>("#btn-home");
  const onClick = () => navigate("/home");
  btn?.addEventListener("click", onClick);

  return () => btn?.removeEventListener("click", onClick);
};

export default page;
