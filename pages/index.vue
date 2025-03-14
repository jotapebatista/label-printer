<template>
	<div
		class="h-screen w-screen flex flex-col bg-gray-200 dark:bg-gray-900 overflow-hidden"
	>
		<!-- Navbar Component -->
		<Navbar />

		<!-- Alerts -->
		<div class="absolute top-4 right-4">
			<n-alert
				closable
				v-if="apiResponse"
				:type="apiSuccess ? 'success' : 'error'"
			>
				{{ apiResponse }}
			</n-alert>
		</div>

		<!-- Main Content -->
		<div class="flex-grow flex items-center justify-center p-6">
			<div
				class="w-full max-w-5xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6"
			>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-2">
					<!-- Printer Configuration -->
					<n-card
						:class="
							printedStickers.length ? 'col-span-1' : 'col-span-2'
						"
						title="Printer Configuration"
						embedded
						class="bg-gray-100 dark:bg-gray-700 shadow-md rounded-lg"
					>
						<div class="grid grid-cols-2 gap-2">
							<n-form-item label="Printer Brand">
								<n-select
									v-model:value="brand"
									placeholder="Choose a printer type"
									:options="printerOptions"
								/>
							</n-form-item>
							<n-form-item label="Printer IP">
								<n-input
									v-model:value="ipAddr"
									placeholder="Enter printer IP"
								/>
							</n-form-item>
							<n-form-item label="Label Format">
								<n-select
									v-model:value="labelFormat"
									placeholder="Choose the label format"
									:options="labelOptions"
								/>
							</n-form-item>
							<n-form-item label="Copies">
								<n-input-number
									v-model:value="copies"
									type="number"
									min="1"
									class="w-full"
								/>
							</n-form-item>

							<!-- Test Mode Warning -->
							<div
								hidden
								class="bg-amber-100 dark:bg-emerald-800 border-l-4 border-emerald-500 p-4 rounded-lg flex items-center space-x-4"
							>
								<n-icon
									size="32"
									class="text-amber-600 dark:text-amber-300"
								>
									<Warning />
								</n-icon>
								<div>
									<p
										class="text-sm font-semibold text-gray-700 dark:text-gray-200"
									>
										Test Mode
									</p>
									<n-popover trigger="hover">
										<template #trigger>
											<n-switch
												v-model:value="testMode"
											/>
										</template>
										<span>Use for development only!!</span>
									</n-popover>
								</div>
							</div>
						</div>

						<div>
							<n-form-item
								label="Save Mac Address"
								class="w-full"
							>
								<n-input
									v-model:value="macsFile"
									placeholder="Enter file name"
									class="w-full"
								/>
							</n-form-item>
						</div>

						<n-form-item label="QR Code Input">
							<n-input
								v-model:value="qrInput"
								type="textarea"
								placeholder="Scan QR code"
								@input="debouncedPrint"
								class="rounded-md"
							/>
						</n-form-item>

						<n-form-item>
							<n-button
								type="primary"
								block
								:disabled="!isFormValid"
								class="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-md transition"
								@click="generatePayload"
							>
								Print Sticker
							</n-button>
						</n-form-item>
					</n-card>

					<!-- Printed Stickers -->
					<n-card
						v-if="printedStickers.length"
						class="col-span-1 bg-gray-100 dark:bg-gray-700 shadow-md rounded-lg"
						title="Printed Stickers"
						embedded
					>
						<ul v-if="labelFormat !== 'nomac'" class="space-y-2">
							<li
								v-for="(sticker, index) in printedStickers"
								:key="index"
								class="border-b border-gray-300 dark:border-gray-600 pb-2"
							>
								<strong>MAC:</strong> {{ sticker.macaddress
								}}<br />
								<strong>Serial:</strong>
								{{ sticker.serialnumber }}<br />
								<strong>Reg ID:</strong> {{ sticker.regid }}
							</li>
						</ul>
						<ul v-else class="space-y-2">
							<li
								v-for="(sticker, index) in printedStickers"
								:key="index"
								class="border-b border-gray-300 dark:border-gray-600 pb-2"
							>
								<strong>Serial:</strong> {{ sticker }}
							</li>
						</ul>
					</n-card>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	NCard,
	NFormItem,
	NInput,
	NInputNumber,
	NSelect,
	NSwitch,
	NButton,
	NAlert,
	NPopover,
	NIcon,
} from "naive-ui";
import { Warning } from "@vicons/ionicons5";
const brand = ref("");
const ipAddr = ref("");
const labelFormat = ref("");
const copies = ref(1);
const dataFormat = ref("string");
const qrInput = ref("");
const macsFile = ref("");
const apiResponse = ref<string | null>(null);
const apiSuccess = ref<boolean>(false);
const printedStickers = ref<any[]>([]);
const lastPrintedInput = ref<string | null>(null);
const testMode = ref<boolean>(false);
const chatEl = ref<HTMLElement>();
let debounceTimer: any = null;

const printerOptions = [
	{ label: "Choose a printer type", value: "" },
	{ label: "Brother", value: "brother" },
	{ label: "TSC", value: "tsc" },
	{ label: "TSC - Double Sticker", value: "tsc-double" },
];
const labelOptions = [
	{ label: "Choose the label format", value: "" },
	{ label: "AE", value: "ae" },
	{ label: "Barix", value: "barix" },
	{ label: "NoMac", value: "nomac" },
	{ label: "EdgePlayer", value: "edgeplayer" },
];

const errors = ref({
	brand: false,
	ipAddr: false,
	labelFormat: false,
	qrInput: false,
});

const debouncedPrint = () => {
	clearTimeout(debounceTimer);
	debounceTimer = setTimeout(() => {
		generatePayload();
	}, 500);
};

const isFormValid = computed(() => {
	return brand.value && ipAddr.value && labelFormat.value && qrInput.value;
});

watch(printedStickers, (newVal) => {
	if (newVal.length) {
		setTimeout(() => {
			if (chatEl.value) {
				chatEl.value.scrollTo({
					top: chatEl.value.scrollHeight,
					behavior: "smooth",
				});
			}
		}, 500);
	}
});

const validateForm = () => {
	errors.value.brand = !brand.value;
	errors.value.ipAddr = !ipAddr.value;
	errors.value.labelFormat = !labelFormat.value;
	errors.value.qrInput = !qrInput.value;
	return isFormValid.value;
};

const fetchPrintedStickers = async () => {
	try {
		const response = await fetch(
			`http://192.168.40.103:9000/file?file_name=${macsFile.value}`
		);
		const result = await response.json();

		if (result.units && Array.isArray(result.units)) {
			printedStickers.value = result.units;
		} else {
			printedStickers.value = [];
		}
	} catch (error) {
		console.error("Error fetching printed stickers:", error);
	}
};

const detectInputType = () => {
	try {
		JSON.parse(qrInput.value);
		dataFormat.value = "json";
	} catch (error) {
		dataFormat.value = "string";
	}
};

const generatePayload = async () => {
	if (!validateForm()) return;

	detectInputType();

	const jsonPayload = JSON.stringify({
		brand: brand.value,
		address: ipAddr.value,
		protocol: "tcp",
		label_format: labelFormat.value,
		input_data: qrInput.value,
		output_file: macsFile.value,
		copies: copies.value,
		data_format: dataFormat.value,
		test_mode: testMode.value,
	});

	try {
		const response = await fetch("http://192.168.40.103:9000/print", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: jsonPayload,
		});
		lastPrintedInput.value = qrInput.value;

		const result = await response.json();

		apiSuccess.value = response.ok;
		apiResponse.value = response.ok
			? `Success: ${JSON.stringify(result.message)}`
			: `Error: ${JSON.stringify(result.error)}`;

		if (response.ok || labelFormat.value === "nomac") {
			qrInput.value = "";
		}

		if (macsFile.value && response.ok) {
			await fetchPrintedStickers();
		}
	} catch (error: any) {
		apiSuccess.value = false;
		apiResponse.value = `Error: ${error.message}`;
	}
};
</script>
