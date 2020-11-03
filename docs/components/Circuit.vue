<template>
  <div class="mollitia-circuit">
    <div class="mollitia-circuit-header">
      <div>{{ name }}</div>
    </div>
    <div class="mollitia-circuit-content">
      <slot/>
    </div>
    <div class="mollitia-circuit-request">
      <div>Simulate Request</div>
      <div>Time: <input v-model.number="time" type="number"/></div>
      <div>
        <button @click="triggerRequest" :disabled="disabled">Send Request</button>
        <Toggle v-if="canFail" pre-label="Failure" post-label="Success" v-model="shouldSucceed"/>
      </div>
    </div>
    <div ref="logs" class="mollitia-circuit-logs">
      <div v-html="logs"></div>
    </div>
  </div>
</template>

<script>
import Toggle from './Toggle';
export default {
  name: 'Circuit',
  components: {
    Toggle
  },
  props: {
    name: {
      type: String,
      default: 'Circuit'
    },
    initTime: {
      type: Number,
      default: 2000
    },
    modules: {
      type: Array,
      default: () => []
    },
    concurrent: {
      type: Boolean,
      default: false
    },
    canFail: {
      type: Boolean,
      default: true
    },
    successParams: {
      type: Object,
      default: () => { return {}; }
    },
    failureParams: {
      type: Object,
      default: () => { return {}; }
    }
  },
  computed: {
    disabled () {
      return !this.concurrent && this.active;
    }
  },
  data () {
    return {
      shouldSucceed: true,
      active: false,
      circuit: null,
      time: this.initTime,
      logs: ''
    };
  },
  methods: {
    async request (delay) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (this.shouldSucceed) {
            resolve('Normal Success');
          } else {
            reject(new Error('Normal Failure'));
          }
        }, delay);
      });
    },
    log (msg) {
      this.logs += `<span>${msg}</span><br/>`;
      this.triggerUpdate();
    },
    triggerRequest () {
      this.$emit('start');
      this.active = true;
      this.circuit.fn(this.request).execute(this.time, this.successParams)
        .then((res) => {
          this.logs += `<span>${res}</span><br/>`;
          this.triggerUpdate(true);
        })
        .catch((err) => {
          this.logs += `<span>${err.message}</span><br/>`;
          this.triggerUpdate(false);
        })
        .finally(() => {
          this.active = false;
        });
    },
    triggerUpdate (success) {
      this.$emit('end', success);
      setTimeout(() => {
        if (this.$refs.logs) {
          this.$refs.logs.scrollTop = this.$refs.logs.scrollHeight;
        }
      }, 1);
    }
  },
  created () {
    this.circuit = new this.$mollitia.Circuit();
  },
  updated () {
    this.circuit.modules = this.modules;
  }
}
</script>

<style lang="scss" scoped>
div.mollitia-circuit {
  margin: 10px;
  border: 1px solid var(--madoc-grey-5);
  > div.mollitia-circuit-header {
    padding: 10px;
    border-bottom: 1px solid var(--madoc-grey-5);
  }
  > div.mollitia-circuit-content {
    padding: 10px;
    border-bottom: 1px solid var(--madoc-grey-5);
  }
  > div.mollitia-circuit-request {
    padding: 10px;
    border-bottom: 1px solid var(--madoc-grey-5);
  }
  > div.mollitia-circuit-logs {
    height: 4em;
    max-height: 4em;
    overflow: auto;
  }
}
</style>
