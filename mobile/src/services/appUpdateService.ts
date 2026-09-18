import * as Application from "expo-application";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import * as SecureStore from "expo-secure-store";

// Konsepnya sama seperti AppUpdateService.kt di aumo-finance-android:
// cek GitHub Releases repo ini, banding versi, unduh APK-nya, lalu minta
// install. Bedanya di sini rilisnya dibuat OTOMATIS oleh EAS lewat hook
// eas-build-on-success (lihat scripts/publish-github-release.js) - jadi
// "deteksi rilis dari EAS" secara tidak langsung: rilis GitHub = hasil
// build EAS yang sukses.

const GITHUB_OWNER = "rdmmoonlight";
const GITHUB_REPO = "aumo-finance-web";

const AUTO_UPDATE_KEY = "aumo_auto_update_enabled";

interface GithubAsset {
  name: string;
  browser_download_url: string;
}

interface GithubRelease {
  tag_name: string;
  assets: GithubAsset[];
}

function compareVersions(a: string, b: string): number {
  const partsA = a.split(".").map((n) => parseInt(n, 10) || 0);
  const partsB = b.split(".").map((n) => parseInt(n, 10) || 0);
  const maxLen = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < maxLen; i++) {
    const partA = partsA[i] ?? 0;
    const partB = partsB[i] ?? 0;
    if (partA !== partB) return partA - partB;
  }
  return 0;
}

export async function isAutoUpdateEnabled(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(AUTO_UPDATE_KEY);
  // Default aktif, sama seperti default Kotlin-nya (getBoolean(KEY, true)).
  return value === null ? true : value === "true";
}

export async function setAutoUpdateEnabled(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(AUTO_UPDATE_KEY, enabled ? "true" : "false");
}

async function installApk(fileUri: string): Promise<void> {
  const contentUri = await FileSystem.getContentUriAsync(fileUri);
  await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
    data: contentUri,
    flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
    type: "application/vnd.android.package-archive",
  });
  // Catatan: kalau user belum pernah mengizinkan "Install unknown apps"
  // untuk app ini, Android sendiri yang akan menampilkan dialog izin itu
  // sebagai bagian dari alur install di atas.
}

async function downloadAndInstall(
  apkUrl: string,
  version: string,
): Promise<void> {
  const fileUri = `${FileSystem.cacheDirectory}AumoFinance_v${version}.apk`;
  const { uri } = await FileSystem.downloadAsync(apkUrl, fileUri);
  await installApk(uri);
}

export async function checkForUpdateSilently(): Promise<void> {
  if (__DEV__) {
    return;
  }

  const enabled = await isAutoUpdateEnabled();
  if (!enabled) {
    return;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`,
    );
    if (!response.ok) return;

    const release: GithubRelease = await response.json();
    const rawTag = release.tag_name ?? "";
    const latestVersion = rawTag.toLowerCase().startsWith("v")
      ? rawTag.slice(1)
      : rawTag;
    const currentVersion = Application.nativeApplicationVersion ?? "0.0.0";

    if (compareVersions(latestVersion, currentVersion) <= 0) {
      return;
    }

    const apkAsset = release.assets?.find((asset) =>
      asset.name.endsWith(".apk"),
    );
    if (!apkAsset) return;

    await downloadAndInstall(apkAsset.browser_download_url, latestVersion);
  } catch {
    // Diam-diam gagal - jangan ganggu pemakaian normal app kalau cek update error.
  }
}
