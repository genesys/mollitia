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
        <button @click="triggerSuccess" :disabled="disabled">Success</button>
        <button v-if="canFail" @click="triggerFailure" :disabled="disabled">Failure</button>
      </div>
    </div>
    <div ref="logs" class="mollitia-circuit-logs">
      <div v-html="logs"></div>
    </div>
  </div>
</template>

<script>
const successAsync = (res, delay = 1) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(res);
    }, delay);
  });
};
const failureAsync = (res, delay = 1) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error(res));
    }, delay);
  });
};
export default {
  name: 'Circuit',
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
      active: false,
      circuit: null,
      time: this.initTime,
      logs: ''
    };
  },
  methods: {
    log (msg) {
      this.logs += `<span>${msg}</span><br/>`;
      this.triggerUpdate();
    },
    triggerSuccess () {
      this.$emit('start');
      this.active = true;
      this.circuit.fn(successAsync).execute('Normal Success', this.time, this.successParams)
        .then((res) => {
          this.logs += `<span>${res}</span><br/>`;
          this.triggerUpdate();
        })
        .catch((err) => {
          this.logs += `<span>${err.message}</span><br/>`;
          this.triggerUpdate();
        })
        .finally(() => {
          this.active = false;
        });
    },
    triggerFailure () {
      this.$emit('start');
      this.active = true;
      this.circuit.fn(failureAsync).execute('Normal Failure', this.time, this.failureParams)
        .catch((err) => {
          this.logs += `<span>${err.message}</span><br/>`;
          this.triggerUpdate();
        })
        .finally(() => {
          this.active = false;
        });
    },
    triggerUpdate () {
      this.$emit('end');
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
