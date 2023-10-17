<script lang="ts" setup>
  // Helpers
  import * as Mollitia from 'mollitia';
  import { onMounted, onUnmounted, ref } from 'vue';
  // Components
  import Circuit from '../circuit.vue';
	import Toggle from '../../form/toggle.vue';
  import ProgressBar from '../progress-bar.vue';
  // Refs
  const circuitRef = ref<InstanceType<typeof Circuit>|null>(null);
  const filter = ref<boolean>(true);
  const progress = ref<number>(0);
  const startTime = ref<number>(0);
  const interval = ref<number>(0);
  // Constants
  const fallback = new Mollitia.Fallback({
    callback (err) {
      return filter.value ? new Error('Fallback Failure') : err;
    }
  });
  const circuit = new Mollitia.Circuit({
    options: {
      modules: [
        fallback
      ]
    }
  });
  // Handlers
  function handleExecute () {
    startTime.value = Date.now();
    interval.value = window.setInterval(() => {
      progress.value = Date.now() - startTime.value;
      if (progress.value >= circuitRef.value.duration) {
        clearInterval(interval.value);
      }
    }, 100);
  }
  // Lifecycle
  onMounted(() => {
    fallback.on('execute', handleExecute);
  });
  onUnmounted(() => {
    fallback.off('execute', handleExecute);
  });
</script>

<template>
  <div class="fallback">
    <Circuit ref="circuitRef" :circuit="circuit">
      <div class="content">
        <div class="form">
          <div class="row">
            <span>Filtering:</span>
            <Toggle class="filter" v-model="filter"/>
          </div>
        </div>
        <div class="visualization">
          <div class="row">
            <ProgressBar class="progress" :modelValue="progress" :max="circuitRef?.duration" label="Progress:"/>
          </div>
        </div>
      </div>
    </Circuit>
  </div>
</template>

<style lang="scss" scoped>
	div.fallback {
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
          > .filter {
            margin-left: 5px;
          }
        }
      }
      > div.visualization {
        flex-grow: 1;
        padding: 5px 10px;
      }
    }
	}
</style>
