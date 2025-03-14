<template>
	<!-- <nav
		class="w-full h-20 bg-gray-200 dark:bg-gray-700 text-white flex items-center px-6 py-8 shadow-md"
	>
		<h1 class="text-lg font-semibold">Barix - Label Printer</h1>
		<div class="ml-auto flex items-center gap-4">
			<n-button text @click="openSettings">
				<n-icon size="20"><SettingsOutline /></n-icon>
			</n-button>
			<n-switch v-model:value="darkMode" @update:value="toggleDarkMode" />
		</div>
	</nav> -->
</template>

<script setup>
import { ref, onMounted } from "vue";
import { SettingsOutline } from "@vicons/ionicons5";
import { NIcon, NButton, NSwitch } from "naive-ui";

import checkForAppUpdates from "~/utils/checkUpdate";

onMounted(() => {
	checkForAppUpdates();
})

// Dark mode state
const darkMode = ref(false);

onMounted(() => {
	// Load stored theme preference
	darkMode.value = localStorage.getItem("darkMode") === "true";
	updateHtmlClass();
});

const toggleDarkMode = () => {
	localStorage.setItem("darkMode", darkMode.value);
	updateHtmlClass();
};

const updateHtmlClass = () => {
	if (darkMode.value) {
		document.documentElement.classList.add("dark");
	} else {
		document.documentElement.classList.remove("dark");
	}
};

const openSettings = () => {
	console.log("Settings clicked");
};
</script>
