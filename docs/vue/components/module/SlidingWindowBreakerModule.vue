<template>
  <div class="mollitia-module-sliding-window-breaker">
    <div class="mollitia-module-sliding-window-breaker-header">
      <div>{{ name }}</div>
    </div>

    <div class="mollitia-module-sliding-window-breaker-content">
      <div class="mollitia-module-sliding-window-breaker-config">
        <div class="form-control">
          <label for="windowSize">Window Size</label>
          <input v-model="slidingWindowSize" id="windowSize" @input="update" type="number"/>
        </div>
        <div class="form-control">
          <label for="minNumberOfCalls">Min nb calls</label>
          <input v-model="minimumNumberOfCalls" id="minNumberOfCalls" @input="update" type="number"/>
        </div>
        <div class="form-control">
          <label for="failureRateThreshold">Failure Rate Threshold</label>
          <input v-model="failureRateThreshold" id="failureRateThreshold" @input="update" type="number"/>
        </div>
        <div class="form-control">
          <label for="slowCallDurationThreshold">Slow Call Duration Threshold (in ms)</label>
          <input v-model="slowCallDurationThreshold" id="slowCallDurationThreshold" @input="update" type="number"/>
        </div>
        <div class="form-control">
          <label for="slowCallRateThreshold">Slow Call Rate Threshold</label>
          <input v-model="slowCallRateThreshold" id="slowCallRateThreshold" @input="update" type="number"/>
        </div>
        <div class="form-control">
          <label for="permittedNumberOfCallsInHalfOpenState">Number Of Calls in Half Open State</label>
          <input v-model="permittedNumberOfCallsInHalfOpenState" id="permittedNumberOfCallsInHalfOpenState" @input="update" type="number"/>
        </div>
        <div class="form-control">
          <label for="openStateDelay">Delay to stay in Open State</label>
          <input v-model="openStateDelay" id="openStateDelay" @input="update" type="number"/>
        </div>
        <div class="form-control">
          <label for="halfOpenStateMaxDelay">Max Delay to stay in Half Open State</label>
          <input v-model="halfOpenStateMaxDelay" id="halfOpenStateMaxDelay" @input="update" type="number"/>
        </div>      
      </div>
      <div class="mollitia-module-sliding-window-breaker-visual">
        <label for="circuitStatus">Circuit Status</label>
        <div id="circuitStatus" class="circle" :class="circuitStateClass"></div>
        <div id="circuitStatusText">{{circuitStatusMessage}}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'slidingWindowBreakerModule',
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
      minimumNumberOfCalls: 2,
      failureRateThreshold: 60,
      slowCallDurationThreshold: 500,
      slowCallRateThreshold: 50,
      permittedNumberOfCallsInHalfOpenState: 2,
      openStateDelay: 1000,
      halfOpenStateMaxDelay: 30000,
      circuitStatusMessage: 'Closed'
    }
  },
  methods: {
    onCircuitStateChanged () {
      switch(this.slidingWindowBreaker.state) {
        case window.Mollitia.BreakerState.HALF_OPENED:
          this.circuitStateClass = 'halfopened';
          this.circuitStatusMessage = 'Half Opened';
          break;
        case window.Mollitia.BreakerState.OPENED:
          this.circuitStateClass = 'opened';
          this.circuitStatusMessage = 'Opened';
          break;
        default:
          this.circuitStatusMessage = 'Closed';
          this.circuitStateClass = '';
          break;
      } 
    },
    update() {
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
      this.slidingWindowBreaker = new window.Mollitia.SlidingCountBreaker({
        slidingWindowSize: this.slidingWindowSize,
        minimumNumberOfCalls: this.minimumNumberOfCalls,
        failureRateThreshold: this.failureRateThreshold,
        slowCallDurationThreshold: this.slowCallDurationThreshold,
        slowCallRateThreshold: this.slowCallRateThreshold,
        permittedNumberOfCallsInHalfOpenState: this.permittedNumberOfCallsInHalfOpenState,
        openStateDelay: this.openStateDelay,
        halfOpenStateMaxDelay: this.halfOpenStateMaxDelay
      });
    } else {
      this.slidingWindowBreaker = new window.Mollitia.SlidingTimeBreaker({
        slidingWindowSize: this.slidingWindowSize,
        minimumNumberOfCalls: this.minimumNumberOfCalls,
        failureRateThreshold: this.failureRateThreshold,
        slowCallDurationThreshold: this.slowCallDurationThreshold,
        slowCallRateThreshold: this.slowCallRateThreshold,
        permittedNumberOfCallsInHalfOpenState: this.permittedNumberOfCallsInHalfOpenState,
        openStateDelay: this.openStateDelay,
        halfOpenStateMaxDelay: this.halfOpenStateMaxDelay
      });
    }
    this.slidingWindowBreaker.on('stateChanged', this.onCircuitStateChanged);
  }
}
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
    margin-top: auto;
    margin-bottom: auto;
    display: flex;
    margin-left:5px;
    .circle {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: green;
      margin-left: 5px;
      margin-right: 5px;
      // background-image: linear-gradient(to right, transparent 50%, currentColor 0);
      // color: white
    }
    .circle.halfopened {
      background: orange;
    }
    .circle.opened {
      background: red;
    }

    // .circle::before {
    //   content: '';
    //   display: block;
    //   margin-left: 50%;
    //   height: 100%;
    //   border-radius: 0 100% 100% 0 / 50%;
    //   background-color: inherit;
    //   transform-origin: left;
    //   animation: spin 5s linear infinite, bg 10s step-end infinite;
    // }

    // @keyframes spin {
    //   to { transform: rotate(.5turn); }
    // }
    // @keyframes bg {
    //   50% { background: currentColor; }
    // }
  }
}  
</style>