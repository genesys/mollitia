<script lang="ts" setup>
	// Props
	const props = withDefaults(defineProps<{
		modelValue?: string;
		label?: string;
	}>(), {
		modelValue: ''
	});
	// Emits
	defineEmits(['update:modelValue']);
</script>

<template>
  <div class="number">
		<label>
			<span class="label" v-if="props.label">{{ props.label }}</span>
			<select :value="props.modelValue" @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)">
				<slot/>
			</select>
		</label>
  </div>
</template>

<style lang="scss" scoped>
	div.number {
		> label {
			> span.label {
				margin-right: 5px;
			}
			> select {
				appearance: none;
				font-size: inherit;
				padding: 0 5px;
				border-radius: 8px;
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
