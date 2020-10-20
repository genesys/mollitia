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
      <div>Time: <input v-model="time" type="number"/></div>
      <div>
        <button @click="triggerSuccess">Success</button>
        <button @click="triggerFailure">Failure</button>
      </div>
    </div>
    <div ref="logs" class="mollitia-circuit-logs">
      <div v-html="logs"></div>
    </div>
  </div>
</template>

<script>
import { successAsync, failureAsync } from '../utils';
export default {
  name: 'Circuit',
  props: {
    name: {
      type: String,
      default: 'Circuit'
    },
    modules: {
      type: Array,
      default: []
    }
  },
  data () {
    return {
      circuit: null,
      time: 2000,
      logs: ''
    };
  },
  methods: {
    triggerSuccess () {
      this.circuit.fn(successAsync).execute('Normal Success', this.time)
        .then((res) => {
          this.logs += `<span>${res}</span><br/>`;
          this.triggerUpdate();
        })
        .catch((err) => {
          this.logs += `<span>${err.message}</span><br/>`;
          this.triggerUpdate();
        });
    },
    triggerFailure () {
      this.circuit.fn(failureAsync).execute('Normal Failure', this.time)
        .catch((err) => {
          this.logs += `<span>${err.message}</span><br/>`;
          this.triggerUpdate();
        });
    },
    triggerUpdate () {
      this.$emit('end');
      setTimeout(() => {
        this.$refs.logs.scrollTop = this.$refs.logs.scrollHeight;
      }, 1);
    }
  },
  created () {
    this.circuit = new window.Mollitia.Circuit();
  },
  updated () {
    this.circuit.modules = this.modules;
  }
}
</script>

<style lang="scss" scoped>
div.mollitia-circuit {
  margin: 10px;
  border: 1px solid var(--madoc-heading-underline-color);
  > div.mollitia-circuit-header {
    padding: 10px;
    border-bottom: 1px solid var(--madoc-heading-underline-color);
  }
  > div.mollitia-circuit-content {
    padding: 10px;
    border-bottom: 1px solid var(--madoc-heading-underline-color);
  }
  > div.mollitia-circuit-request {
    padding: 10px;
    border-bottom: 1px solid var(--madoc-heading-underline-color);
  }
  > div.mollitia-circuit-logs {
    height: 4em;
    max-height: 4em;
    overflow: auto;
  }
}
</style>
