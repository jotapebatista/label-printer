import { check } from '@tauri-apps/plugin-updater';
import { ask, message } from '@tauri-apps/plugin-dialog';
import { invoke } from "@tauri-apps/api/core";
import { getVersion } from '@tauri-apps/api/app';

const GITHUB_RELEASES_API = "https://api.github.com/repos/jotapebatista/label-printer/releases/latest";

async function fetchLatestVersion() {
  try {
    const response = await fetch(GITHUB_RELEASES_API);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const releaseData = await response.json();

    // Find latest.json in the release assets
    const latestJsonAsset = releaseData.assets.find((asset: any) =>
      asset.name === "latest.json"
    );

    if (!latestJsonAsset) throw new Error("latest.json not found in release assets");

    // Fetch the latest.json file content
    const latestJsonResponse = await fetch(latestJsonAsset.browser_download_url);
    if (!latestJsonResponse.ok) throw new Error(`Failed to download latest.json`);

    return await latestJsonResponse.json();
  } catch (error) {
    console.error("Failed to fetch latest version:", error);
    return null;
  }
}


export default async function checkForAppUpdates() {
  try {
    const latest = await fetchLatestVersion();
    if (!latest) {
      await message("Could not check for updates. Try again later.", {
        title: "Update Check Failed",
        kind: "error",
        okLabel: "OK"
      });
      return;
    }

    const currentVersion = await getVersion();
    if (latest.version === currentVersion) {
      await message("You are on the latest version. Stay awesome!", {
        title: "No Update Available",
        kind: "info",
        okLabel: "OK"
      });
      return;
    }

    // If a new version is available, confirm update
    const userConfirmed = await ask(
      `Update to ${latest.version} is available!\n\nRelease notes:\n${latest.release_notes}`,
      {
        title: "Update Available",
        kind: "info",
        okLabel: "Update",
        cancelLabel: "Cancel"
      }
    );

    if (userConfirmed) {
      const update = await check();
      if (update?.available) {
        await update.downloadAndInstall();
        await invoke("graceful_restart"); // Make sure this exists in your Tauri backend
      } else {
        await message("Update check failed. Please try again later.", {
          title: "Error",
          kind: "error",
          okLabel: "OK"
        });
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    await message(`Error while checking for updates:\n${errorMessage}`, {
      title: "Update Error",
      kind: "error",
      okLabel: "OK"
    });
  }
}
