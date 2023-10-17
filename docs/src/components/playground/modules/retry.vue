<script lang="ts" setup>
  // Helpers
  import * as Mollitia from 'mollitia';
  import { onMounted, onUnmounted, ref, watch } from 'vue';
  // Components
  import Circuit from '../circuit.vue';
	import Number from '../../form/number.vue';
  import Toggle from '../../form/toggle.vue';
  import Select from '../../form/select.vue';
  import ProgressBar from '../progress-bar.vue';
  type Attempt = {
    progress: number;
    color: string;
  };
  // Refs
  const circuitRef = ref<InstanceType<typeof Circuit>|null>(null);
  const attempts = ref<number>(2);
  const retryInterval = ref<number>(1000);
  const retryMaxInterval = ref<number>(2500);
  const retryMode = ref<Mollitia.RetryMode>(Mollitia.RetryMode.CONSTANT);
  const retryFactor = ref<number>(2);
  const fastFirst = ref<boolean>(false);
  const jitterAdjustment = ref<number>(0.1);
  const currentAttempt = ref<number>(0);
  const progress = ref<Attempt[]>(new Array(attempts.value + 1).fill({ progress: 0, color: 'var(--vp-c-brand-3)' }));
  const retryDelayProgress = ref<number>(0);
  const currentRetryDelay = ref<number>(0);
  const startTime = ref<number>(0);
  const interval = ref<number>(0);
  // Constants
  const retry = new Mollitia.Retry({
    attempts: attempts.value,
    interval: retryInterval.value,
    maxInterval: retryMaxInterval.value,
    mode: retryMode.value,
    factor: retryFactor.value,
    fastFirst: fastFirst.value,
    jitterAdjustment: jitterAdjustment.value
  });
  const circuit = new Mollitia.Circuit({
    options: {
      modules: [
        retry
      ]
    }
  });
  // Handlers
  watch([attempts], () => {
    retry.attempts = attempts.value;
    progress.value = new Array(attempts.value + 1).fill({ progress: 0, color: 'var(--vp-c-brand-3)' });
  });
  watch([retryInterval], () => {
    retry.interval = retryInterval.value;
  });
  watch([retryMaxInterval], () => {
    retry.maxInterval = retryMaxInterval.value;
  });
  watch([retryMode], () => {
    retry.mode = retryMode.value;
  });
  watch([retryFactor], () => {
    retry.factor = retryFactor.value;
  });
  watch([fastFirst], () => {
    retry.fastFirst = fastFirst.value;
  });
  watch([jitterAdjustment], () => {
    retry.jitterAdjustment = jitterAdjustment.value;
  });
  function computeProgress () {
    startTime.value = Date.now();
    interval.value = window.setInterval(() => {
      progress.value[currentAttempt.value] = {
        progress: Date.now() - startTime.value,
        color: 'var(--vp-c-brand-3)'
      };
      if (progress.value[currentAttempt.value].progress >= circuitRef.value.duration) {
        clearInterval(interval.value);
      }
    }, 100);
  }
  function handleExecute () {
    currentAttempt.value = 0;
    progress.value = new Array(attempts.value + 1).fill({ progress: 0, color: 'var(--vp-c-brand-3)' });
    computeProgress();
  }
  function handleRetry () {
    clearInterval(interval.value);
    currentAttempt.value++;
    computeProgress();
  }
  function handleDelayBeforeNextRetry (circuit: Mollitia.Circuit, delay: number) {
    circuitRef.value.logs.push(`Waiting for ${delay}ms before next attempt...`);
    clearInterval(interval.value);
    progress.value[currentAttempt.value] = {
      progress: circuitRef.value.duration,
      color: 'var(--vp-c-red-3)'
    };
    currentRetryDelay.value = delay;
    startTime.value = Date.now();
    interval.value = window.setInterval(() => {
      retryDelayProgress.value = Date.now() - startTime.value;
      if (retryDelayProgress.value >= delay) {
        clearInterval(interval.value);
      }
    }, 100);
  }
  function handleFailure () {
    clearInterval(interval.value);
    progress.value[currentAttempt.value] = {
      progress: circuitRef.value.duration,
      color: 'var(--vp-c-red-3)'
    };
    retryDelayProgress.value = currentRetryDelay.value;
  }
  // Lifecycle
  onMounted(() => {
    retry.on('execute', handleExecute);
    retry.on('retry', handleRetry);
    retry.on('delay-before-next-retry', handleDelayBeforeNextRetry);
  });
  onUnmounted(() => {
    retry.off('execute', handleExecute);
    retry.off('retry', handleRetry);
    retry.off('delay-before-next-retry', handleDelayBeforeNextRetry);
  });
</script>

<template>
  <div class="timeout">
    <Circuit ref="circuitRef" :circuit="circuit" :duration="1000" @failure="handleFailure">
      <div class="content">
        <div class="form">
          <div class="row">
            <Number v-model="attempts" label="Attempts:"/>
          </div>
          <div class="row">
            <Number v-model="retryInterval" label="Interval (in ms):"/>
          </div>
          <div class="row">
            <Number v-model="retryMaxInterval" label="Max Interval (in ms):"/>
          </div>
          <div class="row">
            <Select v-model="retryMode" label="Mode:">
              <option v-for="mode in Object.values(Mollitia.RetryMode)" :key="mode" :value="mode">{{ mode.toUpperCase() }}</option>
            </Select>
          </div>
          <div class="row">
            <Number v-model="retryFactor" label="Factor:"/>
          </div>
          <div class="row">
            <span>Fast First:</span>
            <Toggle class="fast-first" v-model="fastFirst"/>
          </div>
          <div class="row">
            <Number v-model="jitterAdjustment" :step="0.1" label="Jitter Adjustment:"/>
          </div>
        </div>
        <div class="visualization">
          <div class="row">
            <span>Progress:</span>
            <div class="progress">
              <ProgressBar
                class="attempt"
                v-for="(_, index) in (attempts + 1)"
                :key="index"
                :modelValue="progress[index].progress"
                :color="progress[index].color"
                :max="circuitRef?.duration"
              />
            </div>
          </div>
          <div class="row">
            <ProgressBar class="internal" :modelValue="retryDelayProgress" :max="currentRetryDelay" label="Interval:"/>
          </div>
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
          > .mode {
            margin-left: 5px;
            font-size: inherit;
            padding: 0 5px;
            background-color: var(--vp-c-gray-soft);
            color: var(--vp-c-neutral);
            border-radius: 8px;
            border: 1px solid transparent;
            &:hover {
              border-color: var(--vp-c-brand-1);
            }
            &:focus-visible {
              border-color: var(--vp-c-brand-1);
            }
            > option {
              background-color: var(--vp-c-gray-soft);
              color: var(--vp-c-neutral);
            }
          }
          > .fast-first {
            margin-left: 5px;
          }
        }
      }
      > div.visualization {
        flex-grow: 1;
        padding: 5px 10px;
        display: flex;
        flex-direction: column;
        > div.row {
          display: flex;
          flex-direction: row;
          align-items: center;
          margin: 5px 0;
          > div.progress {
            display: flex;
            flex-direction: row;
            align-items: center;
            margin-left: 5px;
            flex-grow: 1;
            > .attempt {
              margin-left: 5px;
            }
          }
        }
      }
    }
	}
</style>
