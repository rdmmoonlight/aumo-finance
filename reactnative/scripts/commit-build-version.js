// Dijalankan otomatis oleh EAS lewat hook "eas-build-on-success" - commit
// dan push build-version.json (yang sudah dinaikkan di eas-build-pre-install
// oleh bump-build-number.js) balik ke GitHub, supaya build berikutnya
// melanjutkan urutan yang benar TANPA perlu commit manual.
//
// Butuh secret GIT_PUSH_TOKEN (GitHub PAT khusus, scope tulis ke repo ini
// saja) yang di-set lewat:
//   eas env:create --name GIT_PUSH_TOKEN --value <PAT> --visibility secret --scope project

const { execSync } = require('child_process');

const REPO = 'github.com/rdmmoonlight/aumo-finance-web.git';

function run(cmd) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

function hasStagedChanges() {
  try {
    execSync('git diff --cached --quiet');
    return false;
  } catch {
    return true;
  }
}

function main() {
  const token = process.env.GIT_PUSH_TOKEN;
  if (!token) {
    console.log(
      'GIT_PUSH_TOKEN belum diset sebagai EAS secret - lewati auto-commit build-version.json.'
    );
    return;
  }

  run('git config user.email "eas-build@aumofinance.local"');
  run('git config user.name "EAS Build"');
  run(`git remote set-url origin https://x-access-token:${token}@${REPO}`);
  run('git add build-version.json');

  if (!hasStagedChanges()) {
    console.log('build-version.json tidak berubah, tidak ada yang di-commit.');
    return;
  }

  run('git commit -m "chore: bump build-version.json [skip ci]"');
  run('git fetch origin main');
  
  // Gunakan --autostash agar sisa file terubah akibat proses build disimpan sementara saat rebase
  run('git rebase --autostash origin/main');
  
  run('git push origin HEAD:main');
}

main();
