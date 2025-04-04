<script lang="ts" setup>
  // Helpers
  import * as Mollitia from 'mollitia';
  import { onMounted, onUnmounted, ref, watch } from 'vue';
  import * as MollitiaPrometheus from '@mollitia/prometheus';
  // Components
  import Circuit from '../../circuit.vue';
	import Number from '../../../form/number.vue';
  import ProgressBar from '../../progress-bar.vue';
  // Refs
  const circuitRef = ref<InstanceType<typeof Circuit>|null>(null);
  const cbWindowSize = ref<number>(4);
  const cbMinimumNumberOfCalls = ref<number>(2);
  const cbFailureRateThreshold = ref<number>(60);
  const cbSlowCallDurationThreshold = ref<number>(1000);
  const cbSlowCallRateThreshold = ref<number>(50);
  const cbPermittedNumberOfCallsInHalfOpenState = ref<number>(2);
  const cbOpenStateDelay = ref<number>(3000);
  const cbHalfOpenStateMaxDelay = ref<number>(6000);
  const cbProgress = ref<number>(0);
  const cbMaxProgress = ref<number>(cbOpenStateDelay.value);
  const startTime = ref<number>(0);
  const cbInterval = ref<number>(0);
  const cbColor = ref<string>('var(--vp-c-green-2)');
  const cbState = ref<Mollitia.BreakerState>(Mollitia.BreakerState.CLOSED);
  // Constants
  const slidingCount = new Mollitia.SlidingCountBreaker({
    slidingWindowSize: cbWindowSize.value,
    minimumNumberOfCalls: cbMinimumNumberOfCalls.value,
    failureRateThreshold: cbFailureRateThreshold.value,
    slowCallDurationThreshold: cbSlowCallDurationThreshold.value,
    slowCallRateThreshold: cbSlowCallRateThreshold.value,
    permittedNumberOfCallsInHalfOpenState: cbPermittedNumberOfCallsInHalfOpenState.value,
    openStateDelay: cbOpenStateDelay.value,
    halfOpenStateMaxDelay: cbHalfOpenStateMaxDelay.value,
    prometheus: {
      name: 'sliding_count_module'
    }
  });
  const circuit = new Mollitia.Circuit({
    options: {
      modules: [
        slidingCount
      ],
      prometheus: {
        name: 'sliding_count_circuit'
      }
    }
  });
  // Handlers
  watch([cbWindowSize], () => {
    slidingCount.slidingWindowSize = cbWindowSize.value;
  });
  watch([cbMinimumNumberOfCalls], () => {
    slidingCount.minimumNumberOfCalls = cbMinimumNumberOfCalls.value;
  });
  watch([cbFailureRateThreshold], () => {
    slidingCount.failureRateThreshold = cbFailureRateThreshold.value;
  });
  watch([cbSlowCallDurationThreshold], () => {
    slidingCount.slowCallDurationThreshold = cbSlowCallDurationThreshold.value;
  });
  watch([cbSlowCallRateThreshold], () => {
    slidingCount.slowCallRateThreshold = cbSlowCallRateThreshold.value;
  });
  watch([cbPermittedNumberOfCallsInHalfOpenState], () => {
    slidingCount.permittedNumberOfCallsInHalfOpenState = cbPermittedNumberOfCallsInHalfOpenState.value;
  });
  watch([cbOpenStateDelay], () => {
    slidingCount.openStateDelay = cbOpenStateDelay.value;
  });
  watch([cbHalfOpenStateMaxDelay], () => {
    slidingCount.halfOpenStateMaxDelay = cbHalfOpenStateMaxDelay.value;
  });
  function handleStateChange (state: Mollitia.BreakerState) {
    clearInterval(cbInterval.value);
    cbProgress.value = 0;
    cbState.value = state;
    switch (state) {
      case Mollitia.BreakerState.CLOSED: {
        cbColor.value = 'var(--vp-c-green-2)';
        break;
      }
      case Mollitia.BreakerState.HALF_OPENED: {
        cbMaxProgress.value = cbHalfOpenStateMaxDelay.value;
        cbColor.value = 'var(--vp-c-yellow-2)';
        break;
      }
      case Mollitia.BreakerState.OPENED: {
        cbMaxProgress.value = cbOpenStateDelay.value;
        cbColor.value = 'var(--vp-c-red-2)';
        break;
      }
    }
    startTime.value = Date.now();
    if (cbState.value !== Mollitia.BreakerState.CLOSED) {
      cbInterval.value = window.setInterval(() => {
        cbProgress.value = Date.now() - startTime.value;
        if (cbProgress.value >= cbMaxProgress.value) {
          clearInterval(cbInterval.value);
        }
      }, 100);
    } else {
      cbProgress.value = 0;
    }
  }
  // Lifecycle
  onMounted(() => {
    slidingCount.on('state-changed', handleStateChange);
  });
  onUnmounted(() => {
    slidingCount.off('state-changed', handleStateChange);
  });
</script>

<template>
  <div class="sliding-count">
    <Circuit ref="circuitRef" :circuit="circuit">
      <div class="content">
        <div class="form">
          <div class="row">
            <Number v-model="cbWindowSize" label="Window Size:"/>
          </div>
          <div class="row">
            <Number v-model="cbMinimumNumberOfCalls" label="Minimum number of calls:"/>
          </div>
          <div class="row">
            <Number v-model="cbFailureRateThreshold" label="Failure Rate Threshold (in %):"/>
          </div>
          <div class="row">
            <Number v-model="cbSlowCallDurationThreshold" label="Slow Call Duration Threshold (in ms):"/>
          </div>
          <div class="row">
            <Number v-model="cbSlowCallRateThreshold" label="Slow Call Rate Threshold (in %):"/>
          </div>
          <div class="row">
            <Number v-model="cbPermittedNumberOfCallsInHalfOpenState" label="Number of calls in Half Open State:"/>
          </div>
          <div class="row">
            <Number v-model="cbOpenStateDelay" label="Delay to stay in Open State (in ms):"/>
          </div>
          <div class="row">
            <Number v-model="cbHalfOpenStateMaxDelay" label="Max Delay to stay in Half Open State (in ms):"/>
          </div>
        </div>
        <div class="visualization">
          <div class="row state">
            <label>State:</label>
            <div class="bullet" :style="{ backgroundColor: cbColor }"/>
            <span>{{ cbState }}</span>
          </div>
          <div class="row">
            <ProgressBar class="internal" :modelValue="cbProgress" :color="cbColor" :max="cbMaxProgress" label="Breaker Duration:"/>
          </div>
        </div>
      </div>
    </Circuit>
  </div>
</template>

<style lang="scss" scoped>
	div.sliding-count {
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
          &.state {
            > label {
              margin-right: 5px;
            }
            > div.bullet {
              height: 10px;
              width: 10px;
              border-radius: 50%;
              margin-right: 5px;
            }
          }
        }
      }
    }
	}
</style>
