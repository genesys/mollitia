<script lang="ts" setup>
  // Helpers
  import * as Mollitia from 'mollitia';
  import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
  // Components
  import Circuit from '../circuit.vue';
	import Number from '../../form/number.vue';
  import Bullets from '../bullets.vue';
  // Refs
  const circuitRef = ref<InstanceType<typeof Circuit>|null>(null);
  const bulkheadConcurrent = ref<number>(5);
  const bulkheadQueue = ref<number>(4);
  const bulkheadMaxWait = ref<number>(3000);
  const concurrentBullets = ref<string[]>([]);
  const queueBullets = ref<string[]>([]);
  // Constants
  const bulkhead = new Mollitia.Bulkhead({
    concurrentSize: bulkheadConcurrent.value,
    queueSize: bulkheadQueue.value,
    maxQueueWait: bulkheadMaxWait.value
  });
  const circuit = new Mollitia.Circuit({
    options: {
      modules: [
        bulkhead
      ]
    }
  });
  // Handlers
  watch([bulkheadConcurrent], () => {
    bulkhead.concurrentSize = bulkheadConcurrent.value;
  });
  watch([bulkheadConcurrent], () => {
    bulkhead.queueSize = bulkheadConcurrent.value;
  });
  watch([bulkheadMaxWait], () => {
    bulkhead.maxQueueWait = bulkheadMaxWait.value;
  });
  function handleUpdate () {
    concurrentBullets.value = bulkhead.concurrentBuffer.map(() => 'var(--vp-c-brand-2)');
    queueBullets.value = bulkhead.queueBuffer.map(() => 'var(--vp-c-green-2)');
  }
  // Lifecycle
  onMounted(() => {
    bulkhead.on('update-concurrent-buffer', handleUpdate);
    bulkhead.on('update-queue-buffer', handleUpdate);
  });
  onUnmounted(() => {
    bulkhead.off('update-concurrent-buffer', handleUpdate);
    bulkhead.off('update-queue-buffer', handleUpdate);
  });
</script>

<template>
  <div class="bulkhead">
    <Circuit ref="circuitRef" :circuit="circuit" :duration="2000">
      <div class="content">
        <div class="form">
          <div class="row">
            <Number v-model="bulkheadConcurrent" label="Concurrent Size:"/>
          </div>
          <div class="row">
            <Number v-model="bulkheadQueue" label="Queue Size:"/>
          </div>
          <div class="row">
            <Number v-model="bulkheadMaxWait" label="Max Wait (in ms):"/>
          </div>
        </div>
        <div class="visualization">
          <div class="row">
            <Bullets class="concurrent" :modelValue="concurrentBullets" label="Concurrent:"/>
          </div>
          <div class="row">
            <Bullets class="queue" :modelValue="queueBullets" label="Queue:"/>
          </div>
        </div>
      </div>
    </Circuit>
  </div>
</template>

<style lang="scss" scoped>
	div.bulkhead {
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
