<template>
  <div class="mollitia-module-retry">
    <div class="mollitia-module-retry-header">
      <div>{{ name }}</div>
    </div>
    <div class="mollitia-module-retry-content">
      <div class="mollitia-module-retry-config">
        <div class="form-control">
          <label>Attempts:</label>
          <input v-model.number="retries" @input="update" type="number"/>
        </div>
        <div class="form-control">
          <label>Interval (in ms):</label>
          <input v-model.number="retryInterval" @input="update" type="number"/>
        </div>
        <div class="form-control">
          <label>Max Interval (in ms):</label>
          <input v-model.number="retryMaxInterval" @input="update" type="number"/>
        </div>
        <div class="form-control">
          <label>Mode:</label>
          <select v-model="mode" @change="updateMode">
            <option value="constant">Constant</option>
            <option value="linear">Linear</option>
            <option value="exponential">Exponential</option>
            <option value="jitter">Jitter</option>
          </select>
        </div>
        <div class="form-control">
          <label>Factor:</label>
          <input v-model.number="factor" @input="update" type="number"/>
        </div>
        <div class="form-control">
          <label>Fast First:</label>
          <input v-model="fastFirst" @change="update" type="checkbox"/>
        </div>
        <div class="form-control">
          <label>Jitter Adjustment:</label>
          <input
            class="jitter-adjustment"
            v-model.number="jitterAdjustment"
            @change="update"
            type="number"
            step="0.1"
            min="0"
            max="1"/>
        </div>
      </div>
      <div class="mollitia-module-retry-visual">
        <div class="mollitia-module-retry-attempts">
          <div v-for="i in attempts" :key="i" class="mollitia-module-retry-attempt">
            <div class="mollitia-module-retry-percentage">
              <div :ref="`progress-${i - 1}`" class="mollitia-module-retry-percentage-progress"></div>
            </div>
          </div>
        </div>
          <div class="mollitia-module-retry-delay">
            <div class="mollitia-module-retry-delay-percentage">
              <div class="mollitia-module-retry-delay-title">{{ delayBeforeNextRetryTitle }}</div>
              <div class="mollitia-module-retry-delay-percentage-progress" :style="retryDelayStyle"></div>
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
      retryMaxInterval: null,
      retryDelayPercent: 0,
      retryDelayInterval: null,
      delayBeforeNextRetry: null,
      fastFirst: false,
      factor: null,
      jitterAdjustment: 0.1,
      mode: this.$mollitia.RetryMode.CONSTANT,
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
    },
    retryDelayStyle () {
      return {
        'width': `${this.retryDelayPercent}%`,
        'background-color': 'var(--mollitia-info-color)'
      };
    },
    delayBeforeNextRetryTitle () {
      if (this.delayBeforeNextRetry) {
        return `Delay before next retry: ${this.delayBeforeNextRetry} ms`;
      }
      return '';
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
    isValid (attr) {
      return attr !== null && attr !== '';
    },
    update () {
      this.retry.attempts = this.retries;
      if (this.isValid(this.retryInterval)) {
        this.retry.interval = this.retryInterval;
      }
      if (this.isValid(this.retryMaxInterval)) {
        this.retry.maxInterval = this.retryMaxInterval;
      }
      if (this.isValid(this.factor)) {
        this.retry.factor = this.factor;
      }
      if (this.isValid(this.jitterAdjustment)) {
        this.retry.jitterAdjustment = this.jitterAdjustment;
      }
    },
    updateMode () {
      switch (this.mode) {
        case 'linear':
          this.retry.mode = this.$mollitia.RetryMode.LINEAR;
          this.factor = 1;
          this.retry.factor = 1;
          break;
        case 'exponential':
          this.retry.mode = this.$mollitia.RetryMode.EXPONENTIAL;
          this.factor = 2;
          this.retry.factor = 2;
          break;
        case 'jitter':
          this.retry.mode = this.$mollitia.RetryMode.JITTER;
          this.factor = 2;
          this.retry.factor = 2;
          break;
        case 'constant':
        default:
          this.retry.mode = this.$mollitia.RetryMode.CONSTANT;
          this.factor = null;
          break;
      }
    },
    onExecute () {
      this.delayBeforeNextRetry = '';
      this.retryDelayPercent = 0;
      this.timeRequestStarted = new Date().getTime();
      this.cleanup();
      this.interval = setInterval(() => {
        this.computeStyle();
      }, this.checkStyleDelay);
    },
    onRetry () {
      this.delayBeforeNextRetry = '';
      this.retryDelayPercent = 0;
      clearInterval(this.retryDelayInterval);
      this.$refs[`progress-${this.index}`][0].style.backgroundColor = 'var(--mollitia-error-color)';
      this.index++;
      this.timeRequestStarted = new Date().getTime();
    },
    onDelayBeforeNextRetry (_, delay) {
      this.$refs[`progress-${this.index}`][0].style.backgroundColor = 'var(--mollitia-error-color)';
      this.delayBeforeNextRetry = delay;
      clearInterval(this.retryDelayInterval);
      if (delay === 0) {
        this.retryDelayPercent = 100;
      } else {
        this.retryDelayPercent = 0;
        this.retryDelayInterval = setInterval(() => {
          this.retryDelayPercent += (100 * this.checkStyleDelay / delay);
          if (this.retryDelayPercent >= 100) {
            clearInterval(this.retryDelayInterval);
          }
        }, this.checkStyleDelay);
      }
    },
    onEnd (success) {
      clearInterval(this.interval);
      clearInterval(this.retryDelayInterval);
      this.setErrorStyleForPreviousTry();
      this.delayBeforeNextRetry = '';
      this.retryDelayPercent = 0;
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
      fastFirst: this.fastFirst,
      attempts: this.retries,
      interval: this.retryInterval,
      maxInterval: this.retryMaxInterval,
      mode: this.$mollitia.RetryMode.CONSTANT
    });
    this.retry.on('execute', this.onExecute);
    this.retry.on('retry', this.onRetry);
    this.retry.on('delay-before-next-retry', this.onDelayBeforeNextRetry);
  },
  destroyed () {
    clearInterval(this.interval);
    clearInterval(this.retryDelayInterval);
    this.retry.off('execute', this.onExecute);
    this.retry.off('retry', this.onRetry);
    this.retry.off('delay-before-next-retry', this.onDelayBeforeNextRetry);
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
      > div.form-control {
        display: flex;
        flex-direction: row;
        &:not(:last-child) {
          margin-bottom: 5px;
        }
        > label {
          margin-right: 10px;
        }
        > input {
          margin-left: auto;
        }
        > select {
          margin-left: auto;
          width: 146px;
        }
      }
    }
    > div.mollitia-module-retry-visual {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      > div.mollitia-module-retry-attempts {
        display: flex;
        flex-direction: row;
        flex-grow: 1;
        > div.mollitia-module-retry-attempt {
          height: 100%;
          flex-grow: 1;
          border-right: 1px solid var(--madoc-grey-5);
          border-bottom: 1px solid var(--madoc-grey-5);
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
      > div.mollitia-module-retry-delay {
        flex-grow: 1;
        > div.mollitia-module-retry-delay-percentage {
          height: 100%;
          position: relative;
          > div.mollitia-module-retry-delay-percentage-progress {
            width: 0;
            height: 100%;
            transition:
              width .25s ease,
              background-color .25s ease;
          }
          > div.mollitia-module-retry-delay-title {
            position: absolute;
            display: flex;
            justify-content: center;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            align-items: center;
          }
        }
      }
    }
  }
}
</style>
