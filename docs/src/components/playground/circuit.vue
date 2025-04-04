<script lang="ts">
	export type ExecuteParams = {
		duration: number;
	};
</script>

<script lang="ts" setup>
  // Helpers
  import * as Mollitia from 'mollitia';
	import { computed, ref } from 'vue';
  import { useData } from 'vitepress';
	// Components
	import { VPButton } from 'vitepress/theme';
	import Number from '../form/number.vue';
	import Toggle from '../form/toggle.vue';
	// Types
	type Log = { message: string };
	// Constants
	const { isDark } = useData();
	// Props
	const props = withDefaults(defineProps<{
		circuit: Mollitia.Circuit;
		duration?: any;
	}>(), {
		duration: 500
	});
	// Emits
	const emit = defineEmits(['success', 'failure']);
	// Refs
	const theme = computed(() => isDark.value ? 'dark' : 'light');
	const duration = ref<number>(props.duration);
	const success = ref<boolean>(true);
	const logs = ref<string[]>([]);
	// Methods
	defineExpose({
		duration,
		logs
	});
	function request (): Promise<Log> {
		return new Promise((resolve, reject) => {
			window.setTimeout(() => {
				if (success.value) {
					resolve({ message: 'Normal Success' });
				} else {
					reject(new Error('Normal Failure'));
				}
			}, duration.value);
		});
	}
	async function execute () {
		try {
			const res = await props.circuit.fn(request).execute<Log>({
				duration: duration.value
			} satisfies ExecuteParams);
			logs.value = [...logs.value, res.message];
			emit('success', res);
		} catch (err) {
			logs.value = [...logs.value, err.message];
			emit('failure', err);
		}
	}
</script>

<template>
  <div :class="['circuit', theme]">
		<!-- Module Configuration -->
		<div class="module">
			<slot/>
		</div>
		<!-- Actions -->
		<div class="actions">
			<Number class="delay" v-model="duration" label="Duration (in ms):"/>
			<Toggle v-model="success" off-label="Failure" on-label="Success"/>
			<VPButton class="send" text="Execute" @click="() => execute()"/>
		</div>
		<!-- Logs -->
		<div class="logs" v-html="logs.join('<br/>')"/>
  </div>
</template>

<style lang="scss" scoped>
	div.circuit {
		background-color: var(--vp-c-bg-alt);
		border-radius: 8px;
		> div.module {
			padding: 10px;
		}
		> div.actions {
			border-top: 1px solid var(--vp-c-divider);
			padding: 10px;
			display: flex;
			flex-direction: row;
			align-items: center;
			> .delay {
				padding-right: 10px;
				margin-right: 10px;
				border-right: 1px solid var(--vp-c-divider);
			}
			> .send {
				margin-left: auto;
			}
		}
		> div.logs {
			border-top: 1px solid var(--vp-c-divider);
			color: var(--vp-c-text-2);
			padding: 10px;
			min-height: 100px;
			max-height: 250px;
			resize: vertical;
			overflow: auto;
		}
	}
</style>
