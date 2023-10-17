<script lang="ts" setup>
	// Helpers
	import { computed } from 'vue';
	// Props
	const props = withDefaults(defineProps<{
		modelValue?: string[];
		label: string;
	}>(), {
		modelValue: () => []
	});
	const list = computed(() => [...props.modelValue].reverse());
</script>

<template>
  <div class="bullets">
		<span class="label" v-if="props.label">{{ props.label }}</span>
		<div class="container">
			<ul>
				<li v-for="(bullet, index) in list" :key="index" :style="{ backgroundColor: bullet }"/>
			</ul>
		</div>
  </div>
</template>

<style lang="scss" scoped>
	div.bullets {
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
			max-width: 100%;
			overflow: hidden;
			display: flex;
			flex-direction: row;
			> ul {
				list-style: none;
				margin: 0;
				padding: 0;
				display: flex;
				flex-direction: row;
				> li {
					height: 10px;
					width: 10px;
					margin: 0 2px;
					border-radius: 50%;
				}
			}
		}
	}
</style>
