<template>
  <div class="mollitia-module-timeout">
    <div class="mollitia-module-timeout-header">
      <div>{{ name }}</div>
    </div>
    <div class="mollitia-module-timeout-content">
      <div class="mollitia-module-timeout-config">
        <div>Delay: <input v-model="delay" @input="update" type="number"/></div>
      </div>
      <div class="mollitia-module-timeout-visual">
        <div class="mollitia-module-timeout-percentage">
          <div class="mollitia-module-timeout-percentage-progress" :style="style"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TimeoutModule',
  props: {
    name: {
      type: String,
      default: 'Timeout'
    }
  },
  data () {
    return {
      hasRes: false,
      active: false,
      timeout: null,
      delay: 1500,
      percent: 0,
      interval: null,
      failed: false
    };
  },
  computed: {
    width () {
      return;
    },
    style () {
      return {
        'width': `${this.percent}%`,
        'background-color': this.failed ? 'var(--mollitia-error-color)' : 'var(--mollitia-info-color)'
      }
    }
  },
  methods: {
    update () {
      this.timeout.delay = this.delay;
    },
    onExecute () {
      this.hasRes = false;
      this.failed = false;
      this.percent = 0;
      this.active = true;
      this.interval = setInterval(() => {
        this.percent += (100 * 100 / this.delay);
      }, 100);
    },
    onEnd () {
      if (!this.hasRes) {
        this.hasRes = true;
        this.failed = false;
        this.active = false;
        clearInterval(this.interval);
      }
    },
    onTimeout () {
      if (!this.hasRes) {
        this.hasRes = true;
        this.failed = true;
        this.active = false;
        clearInterval(this.interval);
      }
    }
  },
  created () {
    this.timeout = new window.Mollitia.Timeout({
      delay: this.delay
    });
    this.timeout.on('execute', this.onExecute);
    this.timeout.on('timeout', this.onTimeout);
  },
  destroyed () {
    this.timeout.off('execute', this.onExecute);
    this.timeout.off('timeout', this.onTimeout);
  }
}
</script>

<style lang="scss" scoped>
div.mollitia-module-timeout {
  border: 1px solid var(--madoc-heading-underline-color);
  > div.mollitia-module-timeout-header {
    padding: 10px;
    border-bottom: 1px solid var(--madoc-heading-underline-color);
  }
  > div.mollitia-module-timeout-content {
    display: flex;
    > div.mollitia-module-timeout-config {
      padding: 10px;
      border-right: 1px solid var(--madoc-heading-underline-color);
    }
    > div.mollitia-module-timeout-visual {
      flex-grow: 1;
      > div.mollitia-module-timeout-percentage {
        height: 100%;
        > div.mollitia-module-timeout-percentage-progress {
          height: 100%;
          transition:
            width .25s ease,
            background-color .25s ease;
        }
      }
    }
  }
}
</style>
