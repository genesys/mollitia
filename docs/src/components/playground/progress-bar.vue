<script lang="ts" setup>
	// Props
	const props = withDefaults(defineProps<{
		modelValue?: number;
		max?: number;
		label?: string;
		color?: string;
	}>(), {
		modelValue: 0,
		max: 100,
		color: 'var(--vp-c-brand-3)'
	});
</script>

<template>
  <div class="progress-bar">
		<span class="label" v-if="props.label">{{ props.label }}</span>
		<div class="container">
			<div class="current" :style="{ width: `${100 * props.modelValue / props.max}%`, backgroundColor: props.color }"/>
		</div>
  </div>
</template>

<style lang="scss" scoped>
	div.progress-bar {
		width: 100%;
		display: flex;
		flex-direction: row;
		align-items: center;
		> span.label {
			margin-right: 5px;
			white-space: nowrap;
		}
		> div.container {
			width: 100%;
			height: 10px;
			border-radius: 10px;
			background-color: var(--vp-c-gray-soft);
			overflow: hidden;
			> div.current {
				width: 0%;
				height: 10px;
				border-radius: 10px;
				transition: all .25s ease;
			}
		}
	}
</style>
