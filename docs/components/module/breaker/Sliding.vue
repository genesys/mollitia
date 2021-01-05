<template>
  <div class="mollitia-module-sliding-window-breaker">
    <div class="mollitia-module-sliding-window-breaker-header">
      <div>{{ name }}</div>
    </div>
    <div class="mollitia-module-sliding-window-breaker-content">
      <div class="mollitia-module-sliding-window-breaker-config">
        <div class="form-control">
          <label for="windowSize">{{ windowSizeName }}</label>
          <input v-model.number="slidingWindowSize" id="windowSize" @input="update" type="number"/>
        </div>
        <div class="form-control">
          <label for="minNumberOfCalls">Min nb calls</label>
          <input v-model.number="minimumNumberOfCalls" id="minNumberOfCalls" @input="update" type="number"/>
        </div>
        <div class="form-control">
          <label for="failureRateThreshold">Failure Rate Threshold</label>
          <input v-model.number="failureRateThreshold" id="failureRateThreshold" @input="update" type="number"/>
        </div>
        <div class="form-control">
          <label for="slowCallDurationThreshold">Slow Call Duration Threshold (in ms)</label>
          <input v-model.number="slowCallDurationThreshold" id="slowCallDurationThreshold" @input="update" type="number"/>
        </div>
        <div class="form-control">
          <label for="slowCallRateThreshold">Slow Call Rate Threshold</label>
          <input v-model.number="slowCallRateThreshold" id="slowCallRateThreshold" @input="update" type="number"/>
        </div>
        <div class="form-control">
          <label for="permittedNumberOfCallsInHalfOpenState">Number Of Calls in Half Open State</label>
          <input v-model.number="permittedNumberOfCallsInHalfOpenState" id="permittedNumberOfCallsInHalfOpenState" @input="update" type="number"/>
        </div>
        <div class="form-control">
          <label for="openStateDelay">Delay to stay in Open State (in ms)</label>
          <input v-model.number="openStateDelay" id="openStateDelay" @input="update" type="number"/>
        </div>
        <div class="form-control">
          <label for="halfOpenStateMaxDelay">Max Delay to stay in Half Open State (in ms)</label>
          <input v-model.number="halfOpenStateMaxDelay" id="halfOpenStateMaxDelay" @input="update" type="number"/>
        </div>
      </div>
      <div class="mollitia-module-sliding-window-breaker-visual">
        <div class="mollitia-module-sliding-window-breaker-result">
          <label for="circuitStatus">Circuit Status</label>
          <div id="circuitStatus" class="circle" :class="circuitStateClass"></div>
          <div id="circuitStatusText">{{ circuitStatusMessage }}</div>
        </div>
        <div class="mollitia-module-sliding-window-breaker-duration">
          <div class="mollitia-module-sliding-window-breaker-title">{{ circuitDuration }}</div>
          <div class="mollitia-module-sliding-window-breaker-progress" :style="style"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sliding',
  props: {
    name: {
      type: String,
      default: 'Sliding Window Breaker'
    },
    slidingType: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      circuitStateClass: '',
      slidingWindowBreaker: null,
      slidingWindowSize: this.slidingType === 'count' ? 4 : 60000,
      windowSizeName: this.slidingType === 'count' ? 'Window Size' : 'Window Size (in ms)',
      minimumNumberOfCalls: 2,
      failureRateThreshold: 60,
      slowCallDurationThreshold: 500,
      slowCallRateThreshold: 50,
      permittedNumberOfCallsInHalfOpenState: 2,
      openStateDelay: 1000,
      halfOpenStateMaxDelay: 30000,
      circuitStatusMessage: 'Closed',
      circuitDuration: '',
      percent: 0
    };
  },
  computed: {
    style () {
      return {
        'width': `${this.percent}%`,
        'background-color': 'var(--mollitia-info-color)'
      };
    }
  },
  methods: {
    updateStateProgress () {
      if (this.interval) {
        clearInterval(this.interval);
        this.circuitDuration = '';
        this.percent = 0;
      }
      if (this.circuitStateClass === 'halfopened') {
        this.circuitDuration = 'Half Opened Duration';
        this.interval = setInterval(() => {
          const now = new Date().getTime();
          this.percent = ((now - this.timeStateChanged) / this.halfOpenStateMaxDelay) * 100;
          if (this.percent > 100) {
            this.percent = 100;
          }
        }, 150);
      } else if (this.circuitStateClass === 'opened') {
        this.circuitDuration = 'Opened Duration';
        this.interval = setInterval(() => {
          const now = new Date().getTime();
          this.percent = ((now - this.timeStateChanged) / this.openStateDelay) * 100;
          if (this.percent > 100) {
            this.percent = 100;
          }
        }, 150);
      }
    },
    onCircuitStateChanged () {
      switch (this.slidingWindowBreaker.state) {
        case this.$mollitia.BreakerState.HALF_OPENED:
          this.circuitStateClass = 'halfopened';
          this.circuitStatusMessage = 'Half Opened';
          this.timeStateChanged = new Date().getTime();
          this.updateStateProgress();
          break;
        case this.$mollitia.BreakerState.OPENED:
          this.circuitStateClass = 'opened';
          this.circuitStatusMessage = 'Opened';
          this.timeStateChanged = new Date().getTime();
          this.updateStateProgress();
          break;
        default:
          this.circuitStatusMessage = 'Closed';
          this.circuitStateClass = '';
          this.timeStateChanged = new Date().getTime();
          this.updateStateProgress();
          break;
      }
    },
    update () {
      if (this.slidingWindowBreaker) {
        this.slidingWindowBreaker.slidingWindowSize = this.slidingWindowSize;
        this.slidingWindowBreaker.minimumNumberOfCalls = this.minimumNumberOfCalls;
        this.slidingWindowBreaker.failureRateThreshold = this.failureRateThreshold;
        this.slidingWindowBreaker.slowCallDurationThreshold = this.slowCallDurationThreshold;
        this.slidingWindowBreaker.slowCallRateThreshold = this.slowCallRateThreshold;
        this.slidingWindowBreaker.permittedNumberOfCallsInHalfOpenState = this.permittedNumberOfCallsInHalfOpenState;
        this.slidingWindowBreaker.openStateDelay = this.openStateDelay;
        this.slidingWindowBreaker.halfOpenStateMaxDelay = this.halfOpenStateMaxDelay;
      }
    }
  },
  created () {
    if (this.slidingType === 'count') {
      this.slidingWindowBreaker = new this.$mollitia.SlidingCountBreaker({
        slidingWindowSize: this.slidingWindowSize,
        minimumNumberOfCalls: this.minimumNumberOfCalls,
        failureRateThreshold: this.failureRateThreshold,
        slowCallDurationThreshold: this.slowCallDurationThreshold,
        slowCallRateThreshold: this.slowCallRateThreshold,
        permittedNumberOfCallsInHalfOpenState: this.permittedNumberOfCallsInHalfOpenState,
        openStateDelay: this.openStateDelay,
        halfOpenStateMaxDelay: this.halfOpenStateMaxDelay,
        logger: {
          debug: this.$parent.log
        }
      });
    } else {
      this.slidingWindowBreaker = new this.$mollitia.SlidingTimeBreaker({
        slidingWindowSize: this.slidingWindowSize,
        minimumNumberOfCalls: this.minimumNumberOfCalls,
        failureRateThreshold: this.failureRateThreshold,
        slowCallDurationThreshold: this.slowCallDurationThreshold,
        slowCallRateThreshold: this.slowCallRateThreshold,
        permittedNumberOfCallsInHalfOpenState: this.permittedNumberOfCallsInHalfOpenState,
        openStateDelay: this.openStateDelay,
        halfOpenStateMaxDelay: this.halfOpenStateMaxDelay,
        logger: {
          debug: this.$parent.log
        }
      });
    }
    this.slidingWindowBreaker.on('state-changed', this.onCircuitStateChanged);
  }
};
</script>

<style lang="scss" scoped>
.mollitia-module-sliding-window-breaker {
  padding: 10px;
  border: 1px solid var(--madoc-heading-underline-color);
}

.mollitia-module-sliding-window-breaker-header {
  padding: 10px;
  border-bottom: 1px solid var(--madoc-heading-underline-color);
}

.mollitia-module-sliding-window-breaker-content {
  display: flex;
  .mollitia-module-sliding-window-breaker-config {
    padding: 10px;
    border-right: 1px solid var(--madoc-heading-underline-color);
    .form-control {
      display: flex;
      margin-bottom: 5px;
      label {
        width: 300px;
      }
      input {
        width: 200px;
      }
    }
  }
  .mollitia-module-sliding-window-breaker-visual {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    min-height: 50px;
    .mollitia-module-sliding-window-breaker-result {
      height: 50%;
      display: flex;
      margin-top: 10px;
      justify-content: center;
      align-items: center;

      .circle {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--mollitia-success-color);
        margin-left: 5px;
        margin-right: 5px;
      }
      .circle.halfopened {
        background: var(--mollitia-warning-color);
      }
      .circle.opened {
        background: var(--mollitia-error-color);
      }
    }
    .mollitia-module-sliding-window-breaker-duration {
      height: 50%;
      position: relative;
      .mollitia-module-sliding-window-breaker-title {
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 0px;
        bottom: 0px;
        left: 0px;
        right: 0px;
      }
      .mollitia-module-sliding-window-breaker-progress {
        height: 100%;
        transition:
          width .25s ease,
          background-color .25s ease;
      }
    }
  }
}
</style>
