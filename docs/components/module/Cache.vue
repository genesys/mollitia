<template>
  <div class="mollitia-module-cache">
    <div class="mollitia-module-cache-header">
      <div>{{ name }}</div>
    </div>
    <div class="mollitia-module-cache-content">
      <div class="mollitia-module-cache-config">
        <div>TTL (in ms): <input v-model.number="ttl" @input="update" type="number"/></div>
        <div>Clear Interval (in ms): <input v-model.number="clearanceInterval" @input="update" type="number"/></div>
      </div>
      <div class="mollitia-module-cache-visual">
        <div class="mollitia-module-cache-time">
          <div class="mollitia-module-cache-time-progress" :style="timeStyle"></div>
        </div>
        <div class="mollitia-module-cache-percentage">
          <div class="mollitia-module-cache-title">Cache Duration</div>
          <div class="mollitia-module-cache-percentage-progress" :style="style"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Cache',
  props: {
    name: {
      type: String,
      default: 'Cache'
    }
  },
  data () {
    return {
      cache: null,
      ttl: 10000,
      clearanceInterval: 20000,
      timePercent: 0,
      percent: 0,
      timeInterval: null,
      interval: null,
      cached: false
    };
  },
  computed: {
    time () {
      return this.$parent.time;
    },
    width () {
      return;
    },
    timeStyle () {
      return {
        'width': `${this.timePercent}%`
      }
    },
    style () {
      return {
        'width': `${this.percent}%`,
        'background-color': this.cached ? 'var(--mollitia-success-color)' : 'var(--mollitia-error-color)'
      }
    }
  },
  methods: {
    update () {
      this.cache.ttl = this.ttl;
      this.cache.cacheClearInterval = this.clearanceInterval;
    },
    onExecute () {
      if (this.percent === 100) {
        this.percent = 0;
      }
      // Time
      this.timePercent = 0;
      this.timeInterval = setInterval(() => {
        this.timePercent += (100 * 100 / this.time);
        if (this.timePercent >= 100) {
          clearInterval(this.timeInterval);
        }
      }, 100);
    },
    onEnd (success) {
      this.failed = false;
      this.timePercent = 100;
      clearInterval(this.timeInterval);
      // Cache
      if (!this.interval) {
        this.percent = 0;
        if (success) {
          this.cached = true;
          this.interval = setInterval(() => {
            this.percent += (100 * 100 / this.ttl);
            if (this.percent >= 100) {
              this.cached = false;
              clearInterval(this.interval);
              this.interval = null;
            }
          }, 100);
        }
      }
    }
  },
  created () {
    this.cache = new this.$mollitia.Cache({
      ttl: this.ttl,
      cacheClearInterval: this.clearanceInterval,
      logger: {
        debug: this.$parent.log
      }
    });
    this.cache.on('execute', this.onExecute);
  },
  destroyed () {
    clearInterval(this.timeInterval);
    clearInterval(this.interval);
    this.cache.off('execute', this.onExecute);
  }
}
</script>

<style lang="scss" scoped>
div.mollitia-module-cache {
  border: 1px solid var(--madoc-grey-5);
  > div.mollitia-module-cache-header {
    padding: 10px;
    border-bottom: 1px solid var(--madoc-grey-5);
  }
  > div.mollitia-module-cache-content {
    display: flex;
    > div.mollitia-module-cache-config {
      padding: 10px;
      border-right: 1px solid var(--madoc-grey-5);
    }
    > div.mollitia-module-cache-visual {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      min-height: 50px;
      > div.mollitia-module-cache-time {
        height: 50%;
        > div.mollitia-module-cache-time-progress {
          background-color: var(--mollitia-info-color);
          height: 100%;
          transition:
            width .25s ease,
            background-color .25s ease;
        }
      }
      > div.mollitia-module-cache-percentage {
        position: relative;
        height: 50%;
        > div.mollitia-module-cache-title {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        > div.mollitia-module-cache-percentage-progress {
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
