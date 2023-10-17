<script lang="ts" setup>
  // Helpers
  import * as Mollitia from 'mollitia';
  import { onMounted, onUnmounted, ref, watch } from 'vue';
  // Components
  import Circuit from '../circuit.vue';
	import Number from '../../form/number.vue';
  import ProgressBar from '../progress-bar.vue';
  import Bullets from '../bullets.vue';
  // Refs
  const circuitRef = ref<InstanceType<typeof Circuit>|null>(null);
  const ratelimitLimitPeriod = ref<number>(5000);
  const ratelimitLimitForPeriod = ref<number>(2);
  const progress = ref<number>(0);
  const results = ref<string[]>([]);
  const ratelimitProgress = ref<number>(0);
  const startTime = ref<number>(0);
  const interval = ref<number>(0);
  const ratelimitInterval = ref<number>(0);
  const ratelimitColor = ref<string>('var(--vp-c-yellow-2)');
  // Constants
  const ratelimit = new Mollitia.Ratelimit({
    limitPeriod: ratelimitLimitPeriod.value,
    limitForPeriod: ratelimitLimitForPeriod.value
  });
  const circuit = new Mollitia.Circuit({
    options: {
      modules: [
        ratelimit
      ]
    }
  });
  // Handlers
  watch([ratelimitLimitPeriod], () => {
    ratelimit.limitPeriod = ratelimitLimitPeriod.value;
  });
  watch([ratelimitLimitForPeriod], () => {
    ratelimit.limitForPeriod = ratelimitLimitForPeriod.value;
  });
  function handleExecute () {
    if (ratelimitProgress.value && ratelimitProgress.value < ratelimitLimitPeriod.value) {
      return;
    }
    ratelimitColor.value = 'var(--vp-c-yellow-2)';
    startTime.value = Date.now();
    interval.value = window.setInterval(() => {
      progress.value = Date.now() - startTime.value;
      if (progress.value >= circuitRef.value.duration) {
        clearInterval(interval.value);
      }
    }, 100);
    ratelimitInterval.value = window.setInterval(() => {
      ratelimitProgress.value = Date.now() - startTime.value;
      if (ratelimitProgress.value >= ratelimitLimitPeriod.value) {
        ratelimitColor.value = 'var(--vp-c-green-2)';
        clearInterval(ratelimitInterval.value);
      }
    }, 100);
  }
  function handleSuccess () {
    results.value.push('var(--vp-c-green-2)');
  }
  function handleFailure () {
    results.value.push('var(--vp-c-red-2)');
  }
  // Lifecycle
  onMounted(() => {
    ratelimit.on('execute', handleExecute);
  });
  onUnmounted(() => {
    ratelimit.off('execute', handleExecute);
  });
</script>

<template>
  <div class="ratelimit">
    <Circuit ref="circuitRef" :circuit="circuit" @success="handleSuccess" @failure="handleFailure">
      <div class="content">
        <div class="form">
          <div class="row">
            <Number v-model="ratelimitLimitPeriod" label="Limit Period (in ms):"/>
          </div>
          <div class="row">
            <Number v-model="ratelimitLimitForPeriod" label="Limit for Period:"/>
          </div>
        </div>
        <div class="visualization">
          <div class="row">
            <ProgressBar class="progress" :modelValue="progress" :max="circuitRef?.duration" label="Progress:"/>
          </div>
          <div class="row">
            <Bullets class="bullets" :modelValue="results" label="Results:"/>
          </div>
          <div class="row">
            <ProgressBar class="internal" :modelValue="ratelimitProgress" :color="ratelimitColor" :max="ratelimitLimitPeriod" label="Ratelimit Duration:"/>
          </div>
        </div>
      </div>
    </Circuit>
  </div>
</template>

<style lang="scss" scoped>
	div.ratelimit {
    font-size: 14px;
		div.content {
      display: flex;
      flex-direction: row;
      > div.form {
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        > div.row {
          display: flex;
          flex-direction: row;
          align-items: center;
          margin: 5px 0;
        }
      }
      > div.visualization {
        padding: 5px 10px;
        display: flex;
        flex-direction: column;
        min-width: 0;
        flex-grow: 1;
        > div.row {
          display: flex;
          flex-direction: row;
          align-items: center;
          margin: 5px 0;
        }
      }
    }
	}
</style>
