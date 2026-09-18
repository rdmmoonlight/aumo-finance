// SATU-SATUNYA sumber penomoran versi AumoMobile. Hanya dijalankan oleh
// workflow GitHub Actions ".github/workflows/build-apk-manual.yml"
// (trigger manual, workflow_dispatch). Jalur EAS Build TIDAK LAGI menaikkan
// versi ini (hook eas-build-pre-install/eas-build-on-success sudah dicabut
// dari mobile/package.json) - kalau build lewat `eas build` dijalankan,
// app.config.js hanya akan membaca versi terakhir yang ditulis di sini,
// tanpa menaikkannya.
//
// Skema versi: <tahun 2 digit>.<bulan 2 digit>.<urutan build GitHub Actions bulan itu>
// Contoh: build ke-8 pada workflow run di bulan September 2026 -> "26.09.8"
//
// State disimpan di build-version.json, di-commit balik ke repo oleh
// workflow setelah build sukses, supaya urutannya konsisten antar run.

const fs = require("fs");
const path = require("path");

const STATE_PATH = path.join(__dirname, "..", "build-version.json");

function loadState() {
  if (!fs.existsSync(STATE_PATH)) {
    return { month: null, build: 0 };
  }
  return JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
}

function main() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const yy = String(yyyy).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const currentMonth = `${yyyy}-${mm}`;

  const state = loadState();
  const nextBuild = state.month === currentMonth ? state.build + 1 : 1;
  const nextState = { month: currentMonth, build: nextBuild };

  fs.writeFileSync(STATE_PATH, JSON.stringify(nextState, null, 2) + "\n");

  // "version" (tanpa 'v') ditanam ke app.config.js sebagai Application.nativeApplicationVersion.
  // "tag" (pakai 'v') dipakai untuk nama GitHub Release. appUpdateService.ts men-strip 'v'
  // dari tag rilis sebelum membandingkan, jadi kedua angka ini WAJIB sama persis
  // selain prefix 'v'-nya.
  const version = `${yy}.${mm}.${nextBuild}`;
  const tag = `v${version}`;
  console.log(`Versi build: ${tag}`);

  // Tulis ke GITHUB_OUTPUT supaya step lain di workflow bisa memakainya
  const githubOutput = process.env.GITHUB_OUTPUT;
  if (githubOutput) {
    fs.appendFileSync(githubOutput, `version=${version}\ntag=${tag}\n`);
  }
}

main();
