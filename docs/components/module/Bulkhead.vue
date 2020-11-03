<template>
  <div class="mollitia-module-bulkhead">
    <div class="mollitia-module-bulkhead-header">
      <div>{{ name }}</div>
    </div>
    <div class="mollitia-module-bulkhead-content">
      <div class="mollitia-module-bulkhead-config">
        <div>Concurrent Requests: <input v-model.number="concurrentSize" @input="update" type="number"/></div>
        <div>Queue Size: <input v-model.number="queueSize" @input="update" type="number"/></div>
        <div>Max Queue Wait: <input v-model.number="maxQueueWait" @input="update" type="number"/></div>
      </div>
      <div class="mollitia-module-bulkhead-visual">
        <div class="mollitia-module-bulkhead-visual-concurrent-container">
          <div class="title">Concurrent:</div>
          <DataCircle
            v-for="(p, index) in concurrentBuffer"
            :key="index"
            :color="p.color"
            :tooltip="p.tooltip"
            :size="p.size">
          </DataCircle>
        </div>
        <div class="mollitia-module-bulkhead-visual-queue-container">
          <div class="title">Queue:</div>
          <DataCircle
            v-for="(p, index) in queueBuffer"
            :key="index"
            :color="p.color"
            :tooltip="p.tooltip"
            :size="p.size">
          </DataCircle>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DataCircle from '../DataCircle';
export default {
  name: 'Bulkhead',
  components: {
    DataCircle
  },
  props: {
    name: {
      type: String,
      default: 'Bulkhead'
    }
  },
  data () {
    return {
      bulkhead: null,
      concurrentSize: 6,
      queueSize: 4,
      maxQueueWait: 3000
    };
  },
  computed: {
    concurrentBuffer () {
      const arr = [];
      for (const promise of this.bulkhead.concurrentBuffer) {
        arr.push({
          size: '25px',
          color: promise.params[1].color
        });
      }
      return arr;
    },
    queueBuffer () {
      const arr = [];
      for (const promise of this.bulkhead.queueBuffer) {
        arr.push({
          size: '25px',
          color: promise.params[1].color
        });
      }
      return arr;
    }
  },
  methods: {
    update () {
      this.bulkhead.concurrentSize = this.concurrentSize;
      this.bulkhead.queueSize = this.queueSize;
      this.bulkhead.maxQueueWait = this.maxQueueWait;
    }
  },
  created () {
    this.bulkhead = new this.$mollitia.Bulkhead({
      concurrentSize: this.concurrentSize,
      queueSize: this.queueSize,
      maxQueueWait: this.maxQueueWait
    });
  }
}
</script>

<style lang="scss" scoped>
div.mollitia-module-bulkhead {
  border: 1px solid var(--madoc-grey-5);
  > div.mollitia-module-bulkhead-header {
    padding: 10px;
    border-bottom: 1px solid var(--madoc-grey-5);
  }
  > div.mollitia-module-bulkhead-content {
    display: flex;
    > div.mollitia-module-bulkhead-config {
      padding: 10px;
      border-right: 1px solid var(--madoc-grey-5);
    }
    > div.mollitia-module-bulkhead-visual {
      flex-grow: 1;
      > div.mollitia-module-bulkhead-visual-concurrent-container {
        height: 50%;
        width: 100%;
        display: flex;
        align-items: center;
        > div.title {
          align-items: center;
          display: flex;
          height: 100%;
        }
      }
      > div.mollitia-module-bulkhead-visual-queue-container {
        height: 50%;
        width: 100%;
        display: flex;
        align-items: center;
        > div.title {
          align-items: center;
          display: flex;
          height: 100%;
        }
      }
    }
  }
}
</style>
