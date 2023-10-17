<script lang="ts" setup>
	// Props
	const props = withDefaults(defineProps<{
		modelValue?: number;
		step?: number;
		label?: string;
	}>(), {
		modelValue: 0,
		step: 1
	});
	// Emits
	defineEmits(['update:modelValue']);
</script>

<template>
  <div class="number">
		<label>
			<span class="label" v-if="props.label">{{ props.label }}</span>
			<input type="number" :value="props.modelValue" :step="props.step" @input="$emit('update:modelValue', +($event.target as HTMLInputElement).value)"/>
		</label>
  </div>
</template>

<style lang="scss" scoped>
	div.number {
		> label {
			> span.label {
				margin-right: 5px;
			}
			> input {
				font-size: inherit;
				padding: 0 5px;
				background-color: var(--vp-c-gray-soft);
				color: var(--vp-c-neutral);
				border-radius: 8px;
				width: 50px;
				border: 1px solid transparent;
				&:hover {
					border-color: var(--vp-c-brand-1);
				}
				&:focus-visible {
					border-color: var(--vp-c-brand-1);
				}
			}
		}
	}
</style>
