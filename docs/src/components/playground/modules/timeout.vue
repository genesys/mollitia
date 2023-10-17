<script lang="ts" setup>
  // Helpers
  import * as Mollitia from 'mollitia';
  import { onMounted, onUnmounted, ref, watch } from 'vue';
  // Components
  import Circuit from '../circuit.vue';
	import Number from '../../form/number.vue';
  import ProgressBar from '../progress-bar.vue';
  // Refs
  const circuitRef = ref<InstanceType<typeof Circuit>|null>(null);
  const color = ref<string>('var(--vp-c-brand-3)');
  const timeoutDelay = ref<number>(300);
  const progress = ref<number>(0);
  const startTime = ref<number>(0);
  const interval = ref<number>(0);
  // Constants
  const timeout = new Mollitia.Timeout({
    delay: timeoutDelay.value
  });
  const circuit = new Mollitia.Circuit({
    options: {
      modules: [
        timeout
      ]
    }
  });
  // Handlers
  watch([timeoutDelay], () => {
    timeout.delay = timeoutDelay.value;
  });
  function handleExecute () {
    color.value = 'var(--vp-c-brand-3)';
    startTime.value = Date.now();
    interval.value = window.setInterval(() => {
      progress.value = Date.now() - startTime.value;
      if (progress.value >= circuitRef.value.duration) {
        clearInterval(interval.value);
      }
    }, 100);
  }
  function handleTimeout () {
    color.value = 'var(--vp-c-red-3)';
    progress.value = Date.now() - startTime.value;
    clearInterval(interval.value);
  }
  // Lifecycle
  onMounted(() => {
    timeout.on('execute', handleExecute);
    timeout.on('timeout', handleTimeout);
  });
  onUnmounted(() => {
    timeout.off('execute', handleExecute);
    timeout.off('timeout', handleTimeout);
  });
</script>

<template>
  <div class="timeout">
    <Circuit ref="circuitRef" :circuit="circuit">
      <div class="content">
        <div class="form">
          <div class="row">
            <Number class="delay" v-model="timeoutDelay" label="Delay (in ms):"/>
          </div>
        </div>
        <div class="visualization">
          <ProgressBar :modelValue="progress" :color="color" :max="circuitRef?.duration" label="Progress:"/>
        </div>
      </div>
    </Circuit>
  </div>
</template>

<style lang="scss" scoped>
	div.timeout {
    font-size: 14px;
		div.content {
      display: flex;
      flex-direction: row;
      > div.form {
        display: flex;
        flex-direction: column;
        > div.row {
          display: flex;
          flex-direction: row;
          align-items: center;
          margin: 5px 0;
        }
      }
      > div.visualization {
        flex-grow: 1;
        padding: 5px 10px;
      }
    }
	}
</style>
