<script lang="ts" setup>
  // Helpers
	import { computed } from 'vue';
	// Props
	const props = withDefaults(defineProps<{
		modelValue?: boolean;
		offLabel?: string;
		onLabel?: string;
	}>(), {
		modelValue: true,
		offLabel: 'Off',
		onLabel: 'On'
	});
	const label = computed(() => props.modelValue ? props.onLabel : props.offLabel);
	// Emits
	defineEmits(['update:modelValue']);
</script>

<template>
  <div class="toggle">
		<label>
			<span class="container">
				<input type="checkbox" :checked="props.modelValue" @input="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)">
      	<span class="slider"/>
			</span>
			<span class="label" v-if="label">{{ label }}</span>
		</label>
  </div>
</template>

<style lang="scss" scoped>
	div.toggle {
		color: var(--vp-c-neutral);
		> label {
			display: flex;
			flex-direction: row;
			align-items: center;
			> span.container {
				position: relative;
				display: inline-block;
				width: 38px;
				height: 21px;
				> input {
					opacity: 0;
					width: 0;
					height: 0;
					&:checked + span.slider {
						background-color: var(--vp-c-brand-3);
						&:before {
							transform: translateX(15px);
						}
					}
					&:focus-visible + span.slider {
						border-color: var(--vp-c-brand-1);
						box-shadow: 0 0 1px var(--vp-c-brand-3);
					}
				}
				> span.slider {
					position: absolute;
					cursor: pointer;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background-color: var(--vp-c-gray-soft);
					transition: .4s;
					border-radius: 19px;
					box-sizing: border-box;
					border: 1px solid transparent;
					&:before {
						position: absolute;
						content: "";
						height: 15px;
						width: 15px;
						left: 2px;
						bottom: 2px;
						background-color: var(--vp-c-white);
						transition: .4s;
						border-radius: 50%;
					}
					&:hover {
						border-color: var(--vp-c-brand-1);
					}
				}
			}
			> span.label {
				margin-left: 5px;
			}
		}
	}
</style>
