// Dijalankan otomatis oleh EAS lewat hook "eas-build-on-success" (dirantai
// setelah commit-build-version.js). Membuat GitHub Release bertag v<versi>
// dan meng-upload APK hasil build EAS sebagai asset-nya, supaya aplikasi RN
// bisa auto-update dengan cek GitHub Releases - persis mekanisme yang sudah
// dipakai AppUpdateService.kt di aumo-finance-android, sumbernya cuma
// dipindah: rilisnya sekarang dibuat otomatis dari build EAS, bukan manual.
//
// Butuh secret yang sama dengan commit-build-version.js: GIT_PUSH_TOKEN
// (GitHub PAT, permission Contents: Read & Write - cukup untuk membuat
// release + upload asset juga, tidak perlu token terpisah).

const fs = require('fs');
const path = require('path');

const OWNER = 'rdmmoonlight';
const REPO = 'aumo-finance-web';
const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}`;

function findApk() {
  const preferredPath = path.join('android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
  if (fs.existsSync(preferredPath)) return preferredPath;

  // Fallback: cari .apk apa saja di bawah outputs/, kalau nama file default berubah.
  const outputsDir = path.join('android', 'app', 'build', 'outputs');
  const stack = [outputsDir];
  while (stack.length) {
    const dir = stack.pop();
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name.endsWith('.apk')) return full;
    }
  }
  return null;
}

async function main() {
  const token = process.env.GIT_PUSH_TOKEN;
  if (!token) {
    console.log('GIT_PUSH_TOKEN belum diset - lewati pembuatan GitHub Release.');
    return;
  }

  const versionState = JSON.parse(fs.readFileSync('build-version.json', 'utf8'));
  const version = `${versionState.month.split('-')[0]}.${Number(versionState.month.split('-')[1])}.${versionState.build}`;
  const tag = `v${version}`;

  const apkPath = findApk();
  if (!apkPath) {
    console.log('File APK tidak ketemu di android/app/build/outputs - lewati pembuatan GitHub Release.');
    return;
  }

  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'aumo-finance-eas-build',
  };

  console.log(`Membuat GitHub Release ${tag}...`);
  const releaseRes = await fetch(`${API_BASE}/releases`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tag_name: tag,
      name: `AumoFinance ${version}`,
      body: `Build otomatis dari EAS (production, Android) - ${version}.`,
      draft: false,
      prerelease: false,
    }),
  });

  if (!releaseRes.ok) {
    console.log(`Gagal membuat release: ${releaseRes.status} ${await releaseRes.text()}`);
    return;
  }

  const release = await releaseRes.json();
  const uploadUrl = release.upload_url.replace(/\{.*\}$/, '');
  const assetName = `AumoFinance_v${version}.apk`;
  const apkBuffer = fs.readFileSync(apkPath);

  console.log(`Upload ${assetName} (${(apkBuffer.length / 1024 / 1024).toFixed(1)} MB)...`);
  const uploadRes = await fetch(`${uploadUrl}?name=${encodeURIComponent(assetName)}`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Length': String(apkBuffer.length),
    },
    body: apkBuffer,
  });

  if (!uploadRes.ok) {
    console.log(`Gagal upload APK: ${uploadRes.status} ${await uploadRes.text()}`);
    return;
  }

  console.log(`GitHub Release ${tag} siap, APK terupload.`);
}

main().catch((err) => {
  console.log(`publish-github-release.js error: ${err.message}`);
});
