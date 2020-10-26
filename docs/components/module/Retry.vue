<template>
  <div class="mollitia-module-retry">
    <div class="mollitia-module-retry-header">
      <div>{{ name }}</div>
    </div>
    <div class="mollitia-module-retry-content">
      <div class="mollitia-module-retry-config">
        <div>Attempts: <input v-model.number="retries" @input="update" type="number"/></div>
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
    },
    time: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      retry: null,
      retries: 2,
      index: 0,
      interval: null,
      requests: []
    };
  },
  computed: {
    attempts () {
      return this.retries + 1;
    }
  },
  methods: {
    cleanup () {
      this.requests = new Array(this.retries).fill(0, 0, this.retries);
      for (const ref in this.$refs) {
        this.$refs[ref][0].style.width = 0;
      }
    },
    update () {
      this.retry.attempts = this.retries;
    },
    onExecute () {
      this.index = 0;
      this.cleanup();
      this.interval = setInterval(() => {
        this.requests[this.index] += (100 * 100 / this.time);
        this.$refs[`progress-${this.index}`][0].style.width = `${this.requests[this.index]}%`;
        this.$refs[`progress-${this.index}`][0].style.backgroundColor = 'var(--mollitia-info-color)';
        if (this.requests[this.index] >= 100) {
          clearInterval(this.interval);
        }
      }, 100);
    },
    onRetry () {
      this.$refs[`progress-${this.index}`][0].style.backgroundColor = 'var(--mollitia-error-color)';
      this.index++;
      this.requests[this.index] = 0;
      this.interval = setInterval(() => {
        this.requests[this.index] += (100 * 100 / this.time);
        this.$refs[`progress-${this.index}`][0].style.width = `${this.requests[this.index]}%`;
        this.$refs[`progress-${this.index}`][0].style.backgroundColor = 'var(--mollitia-info-color)';
        if (this.requests[this.index] >= 100) {
          this.$refs[`progress-${this.index}`][0].style.backgroundColor = 'var(--mollitia-error-color)';
          clearInterval(this.interval);
        }
      }, 100);
    }
  },
  created () {
    this.requests = new Array(this.attempts).fill(0, 0, this.attempts);
    this.retry = new this.$mollitia.Retry({
      attempts: this.retries
    });
    this.retry.on('execute', this.onExecute);
    this.retry.on('retry', this.onRetry);
  },
  destroyed () {
    this.retry.off('execute', this.onExecute);
    this.retry.off('retry', this.onRetry);
  }
}
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
