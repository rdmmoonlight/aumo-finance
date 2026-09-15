// Menaikkan angka urutan build dalam bulan berjalan, dipakai oleh
// "npm run build:android" sebelum memanggil `eas build`.
//
// Skema versi: <tahun>.<bulan>.<urutan build dalam bulan itu>
// Contoh: build ke-3 di bulan September 2026 -> "2026.9.3"
//
// State disimpan di build-version.json (harus ikut di-commit ke git supaya
// urutannya konsisten lintas build/lintas orang yang build).

const fs = require('fs');
const path = require('path');

const STATE_PATH = path.join(__dirname, '..', 'build-version.json');

function loadState() {
  if (!fs.existsSync(STATE_PATH)) {
    return { month: null, build: 0 };
  }
  return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
}

function main() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const state = loadState();

  const nextBuild = state.month === currentMonth ? state.build + 1 : 1;
  const nextState = { month: currentMonth, build: nextBuild };

  fs.writeFileSync(STATE_PATH, JSON.stringify(nextState, null, 2) + '\n');

  const version = `${now.getFullYear()}.${now.getMonth() + 1}.${nextBuild}`;
  console.log(`Version dinaikkan ke ${version} (build ke-${nextBuild} bulan ${currentMonth}).`);
  console.log('Jangan lupa commit build-version.json setelah build ini.');
}

main();
