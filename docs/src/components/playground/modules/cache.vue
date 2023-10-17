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
  const cacheTTL = ref<number>(3000);
  const cacheClearInterval = ref<number>(5000);
  const progress = ref<number>(0);
  const ttlProgress = ref<number>(0);
  const startTime = ref<number>(0);
  const interval = ref<number>(0);
  const cacheInterval = ref<number>(0);
  const cacheColor = ref<string>('var(--vp-c-green-2)');
  // Constants
  const cache = new Mollitia.Cache({
    ttl: cacheTTL.value,
    cacheClearInterval: cacheClearInterval.value,
    adjustCacheParams: () => [] 
  });
  const circuit = new Mollitia.Circuit({
    options: {
      modules: [
        cache
      ]
    }
  });
  // Handlers
  watch([cacheTTL], () => {
    cache.ttl = cacheTTL.value;
  });
  watch([cacheClearInterval], () => {
    cache.cacheClearInterval = cacheClearInterval.value;
  });
  function handleExecute () {
    if (ttlProgress.value && ttlProgress.value < cacheTTL.value) {
      return;
    }
    cacheColor.value = 'var(--vp-c-green-2)';
    startTime.value = Date.now();
    interval.value = window.setInterval(() => {
      progress.value = Date.now() - startTime.value;
      if (progress.value >= circuitRef.value.duration) {
        clearInterval(interval.value);
      }
    }, 100);
    cacheInterval.value = window.setInterval(() => {
      ttlProgress.value = Date.now() - startTime.value;
      if (ttlProgress.value >= cacheTTL.value) {
        cacheColor.value = 'var(--vp-c-yellow-2)';
        clearInterval(cacheInterval.value);
      }
    }, 100);
  }
  function handleCacheHit () {
    circuitRef.value.logs.push('Hitting cache.');
  }
  function handleCacheHitOld () {
    circuitRef.value.logs.push('Hitting old cache on failure.');
  }
  // Lifecycle
  onMounted(() => {
    cache.on('execute', handleExecute);
    cache.on('cache-hit', handleCacheHit);
    cache.on('cache-hit-old', handleCacheHitOld);
  });
  onUnmounted(() => {
    cache.off('execute', handleExecute);
    cache.off('cache-hit', handleCacheHit);
    cache.off('cache-hit-old', handleCacheHitOld);
  });
</script>

<template>
  <div class="cache">
    <Circuit ref="circuitRef" :circuit="circuit">
      <div class="content">
        <div class="form">
          <div class="row">
            <Number v-model="cacheTTL" label="TTL (in ms):"/>
          </div>
          <div class="row">
            <Number v-model="cacheClearInterval" label="Clear Interval (in ms):"/>
          </div>
        </div>
        <div class="visualization">
          <div class="row">
            <ProgressBar class="progress" :modelValue="progress" :max="circuitRef?.duration" label="Progress:"/>
          </div>
          <div class="row">
            <ProgressBar class="internal" :modelValue="ttlProgress" :color="cacheColor" :max="cacheTTL" label="Cache Duration:"/>
          </div>
        </div>
      </div>
    </Circuit>
  </div>
</template>

<style lang="scss" scoped>
	div.cache {
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
        display: flex;
        flex-direction: column;
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
