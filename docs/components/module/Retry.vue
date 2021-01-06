<template>
  <div class="mollitia-module-retry">
    <div class="mollitia-module-retry-header">
      <div>{{ name }}</div>
    </div>
    <div class="mollitia-module-retry-content">
      <div class="mollitia-module-retry-config">
        <div>Attempts: <input v-model.number="retries" @input="update" type="number"/></div>
        <div>Interval (in ms): <input v-model.number="retryInterval" @input="update" type="number"/></div>
      </div>
      <div class="mollitia-module-retry-visual">
        <div v-for="i in attempts" :key="i" class="mollitia-module-retry-attempt">
          <div class="mollitia-module-retry-percentage">
            <div :ref="`progress-${i - 1}`" class="mollitia-module-retry-percentage-progress"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Retry',
  props: {
    name: {
      type: String,
      default: 'Retry'
    }
  },
  data () {
    return {
      retry: null,
      retries: 2,
      retryInterval: 0,
      index: 0,
      checkStyleDelay: 100,
      interval: null,
      timeRequestStarted: 0,
      isEnded: false
    };
  },
  computed: {
    attempts () {
      return this.retries + 1;
    },
    time () {
      return this.$parent.time;
    }
  },
  methods: {
    cleanup () {
      this.index = 0;
      this.isEnded = false;
      for (let i = 0; i <= this.retries; i++) {
        this.$refs[`progress-${i}`][0].style.width = 0;
      }
    },
    update () {
      this.retry.attempts = this.retries;
      this.retry.interval = this.retryInterval;
    },
    onExecute () {
      this.timeRequestStarted = new Date().getTime();
      this.cleanup();
      this.interval = setInterval(() => {
        this.computeStyle();
      }, this.checkStyleDelay);
    },
    onRetry () {
      this.$refs[`progress-${this.index}`][0].style.backgroundColor = 'var(--mollitia-error-color)';
      this.index++;
      this.timeRequestStarted = new Date().getTime();
    },
    onEnd (success) {
      clearInterval(this.interval);
      this.setErrorStyleForPreviousTry();
      this.isEnded = true;
      this.$refs[`progress-${this.index}`][0].style.width = '100%';
      if (success) {
        this.$refs[`progress-${this.index}`][0].style.backgroundColor = 'var(--mollitia-info-color)';
      } else {
        this.$refs[`progress-${this.index}`][0].style.backgroundColor = 'var(--mollitia-error-color)';
      }
    },
    computeStyle () {
      if (this.isEnded) {
        return;
      }
      this.setErrorStyleForPreviousTry();
      const currentTime = new Date().getTime();
      const progress = (100 * (currentTime - this.timeRequestStarted) / this.time);
      if (progress >= 100) {
        this.$refs[`progress-${this.index}`][0].style.width = '100%';
      } else {
        this.$refs[`progress-${this.index}`][0].style.width = `${progress}%`;
        this.$refs[`progress-${this.index}`][0].style.backgroundColor = 'var(--mollitia-info-color)';
      }
    },
    setErrorStyleForPreviousTry () {
      for (let i = 0; i < this.index; i++) {
        this.$refs[`progress-${i}`][0].style.backgroundColor = 'var(--mollitia-error-color)';
        this.$refs[`progress-${i}`][0].style.width = '100%';
      }
    }
  },
  created () {
    this.retry = new this.$mollitia.Retry({
      attempts: this.retries,
      interval: this.retryInterval
    });
    this.retry.on('execute', this.onExecute);
    this.retry.on('retry', this.onRetry);
  },
  destroyed () {
    clearInterval(this.interval);
    this.retry.off('execute', this.onExecute);
    this.retry.off('retry', this.onRetry);
  }
};
</script>

<style lang="scss" scoped>
div.mollitia-module-retry {
  border: 1px solid var(--madoc-grey-5);
  > div.mollitia-module-retry-header {
    padding: 10px;
    border-bottom: 1px solid var(--madoc-grey-5);
  }
  > div.mollitia-module-retry-content {
    display: flex;
    > div.mollitia-module-retry-config {
      padding: 10px;
      border-right: 1px solid var(--madoc-grey-5);
    }
    > div.mollitia-module-retry-visual {
      flex-grow: 1;
      display: flex;
      > div.mollitia-module-retry-attempt {
        height: 100%;
        flex-grow: 1;
        border-right: 1px solid var(--madoc-grey-5);
        > div.mollitia-module-retry-percentage {
          height: 100%;
          > div.mollitia-module-retry-percentage-progress {
            width: 0;
            height: 100%;
            transition:
              width .25s ease,
              background-color .25s ease;
          }
        }
      }
    }
  }
}
</style>
