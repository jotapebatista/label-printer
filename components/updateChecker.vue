<script>
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
import { relaunch } from '@tauri-apps/api/process';

async function checkForUpdates() {
  try {
    const { shouldUpdate } = await checkUpdate();
    if (shouldUpdate) {
      const userConfirmed = confirm("A new update is available. Install now?");
      if (userConfirmed) {
        await installUpdate();
        await relaunch();
      }
    }
  } catch (error) {
    console.error("Update check failed:", error);
  }
}

onMounted(async () => {
  await checkForUpdates();
});

</script>