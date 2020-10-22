<template>
  <div class="mollitia-module-sliding-count-breaker">
    <div class="mollitia-module-sliding-count-breaker-header">
      <div>{{ name }}</div>
    </div>

    <div class="mollitia-module-sliding-count-breaker-content">
      <div class="mollitia-module-sliding-count-breaker-config">
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
      <div class="mollitia-module-sliding-count-breaker-visual">
        <label for="circuitStatus">Circuit Status</label>
        <div id="circuitStatus" class="circle" :class="circuitStateClass"></div>
        <div id="circuitStatusText">{{circuitStatusMessage}}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SlidingCountBreakerModule',
  props: {
    name: {
      type: String,
      default: 'Sliding Count Breaker'
    }
  },
  data () {
    return {
      circuitStateClass: '',
      slidingCountBreaker: null,
      slidingWindowSize: 4,
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
      switch(this.slidingCountBreaker.state) {
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
      if (this.slidingCountBreaker) {
        this.slidingCountBreaker.slidingWindowSize = this.slidingWindowSize;
        this.slidingCountBreaker.minimumNumberOfCalls = this.minimumNumberOfCalls;
        this.slidingCountBreaker.failureRateThreshold = this.failureRateThreshold;
        this.slidingCountBreaker.slowCallDurationThreshold = this.slowCallDurationThreshold;
        this.slidingCountBreaker.slowCallRateThreshold = this.slowCallRateThreshold;
        this.slidingCountBreaker.permittedNumberOfCallsInHalfOpenState = this.permittedNumberOfCallsInHalfOpenState;
        this.slidingCountBreaker.openStateDelay = this.openStateDelay;
        this.slidingCountBreaker.halfOpenStateMaxDelay = this.halfOpenStateMaxDelay;
      }
    }
  },
  created () {
    this.slidingCountBreaker = new window.Mollitia.SlidingCountBreaker({
      slidingWindowSize: this.slidingWindowSize,
      minimumNumberOfCalls: this.minimumNumberOfCalls,
      failureRateThreshold: this.failureRateThreshold,
      slowCallDurationThreshold: this.slowCallDurationThreshold,
      slowCallRateThreshold: this.slowCallRateThreshold,
      permittedNumberOfCallsInHalfOpenState: this.permittedNumberOfCallsInHalfOpenState,
      openStateDelay: this.openStateDelay,
      halfOpenStateMaxDelay: this.halfOpenStateMaxDelay
    });
    this.slidingCountBreaker.on('stateChanged', this.onCircuitStateChanged);
  }
}
</script>

<style lang="scss" scoped>
.mollitia-module-sliding-count-breaker {
  padding: 10px;
  border: 1px solid var(--madoc-heading-underline-color);
}

.mollitia-module-sliding-count-breaker-header {
  padding: 10px;
  border-bottom: 1px solid var(--madoc-heading-underline-color);
}

.mollitia-module-sliding-count-breaker-content {
  display: flex;
  .mollitia-module-sliding-count-breaker-config {
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
  .mollitia-module-sliding-count-breaker-visual {
    margin-top: auto;
    margin-bottom: auto;
    display: flex;
    margin-left:5px;
    .circle {
      width: 20px;
      height: 20px;
      border-radius: 10px;
      background: green;
      margin-left: 5px;
      margin-right: 5px;
    }
    .circle.halfopened {
      background: orange;
    }
    .circle.opened {
      background: red;
    }
  }
}  
</style>