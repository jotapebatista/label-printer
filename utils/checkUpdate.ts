import { check } from "@tauri-apps/plugin-updater";
import { ask, message } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";

export default async function checkForAppUpdates() {
	try {
		const update = await check();

		if (!update) {
			await message(
				"Failed to check for updates.\nPlease try again later.",
				{
					title: "Error",
					kind: "error",
					okLabel: "OK",
				}
			);
			return;
		}

		if (update.available) {
			const userConfirmed = await ask(
				`Update to ${update.version} is available!\n\nRelease notes:\n${update.body}`,
				{
					title: "Update Available",
					kind: "info",
					okLabel: "Update",
					cancelLabel: "Cancel",
				}
			);

			if (userConfirmed) {
				await update.downloadAndInstall();
				await invoke("graceful_restart"); 
			}
		} else {
			await message("You are on the latest version. Stay awesome!", {
				title: "No Update Available",
				kind: "info",
				okLabel: "OK",
			});
		}
	} catch (error) {
		await message(`Error while checking for updates:\n${(error as Error).message}`, {
			title: "Update Error",
			kind: "error",
			okLabel: "OK",
		});
	}
}
