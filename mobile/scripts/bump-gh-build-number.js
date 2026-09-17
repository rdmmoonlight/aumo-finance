// Dipakai KHUSUS oleh workflow GitHub Actions ".github/workflows/build-apk-manual.yml"
// (trigger manual, workflow_dispatch) — terpisah dari bump-build-number.js yang
// dipakai jalur EAS Build.
//
// Skema versi: v<tahun 2 digit>.<bulan 2 digit>.<urutan build GitHub Actions bulan itu>
// Contoh: build ke-3 pada workflow run di bulan September 2026 -> "v26.09.3"
//
// State disimpan di build-version-gh.json, di-commit balik ke repo oleh
// workflow setelah build sukses, supaya urutannya konsisten antar run.

const fs = require('fs');
const path = require('path');

const STATE_PATH = path.join(__dirname, '..', 'build-version-gh.json');

function loadState() {
  if (!fs.existsSync(STATE_PATH)) {
    return { month: null, build: 0 };
  }
  return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
}

function main() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const yy = String(yyyy).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const currentMonth = `${yyyy}-${mm}`;

  const state = loadState();
  const nextBuild = state.month === currentMonth ? state.build + 1 : 1;
  const nextState = { month: currentMonth, build: nextBuild };

  fs.writeFileSync(STATE_PATH, JSON.stringify(nextState, null, 2) + '\n');

  const version = `v${yy}.${mm}.${nextBuild}`;
  console.log(`Versi build manual GitHub Actions: ${version}`);

  // Tulis ke GITHUB_OUTPUT supaya step lain di workflow bisa memakainya
  const githubOutput = process.env.GITHUB_OUTPUT;
  if (githubOutput) {
    fs.appendFileSync(githubOutput, `version=${version}\n`);
  }
}

main();
