<template>
  <div class="mollitia-module-sliding-time-breaker">
    <div class="mollitia-module-sliding-time-breaker-header">
      <div>{{ name }}</div>
    </div>

    <div class="mollitia-module-sliding-time-breaker-content">
      <div class="mollitia-module-sliding-time-breaker-config">
        <div class="form-control">
          <label for="windowSize">Window Size (in ms)</label>
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
      <div class="mollitia-module-sliding-time-breaker-visual">
        <label for="circuitStatus">Circuit Status</label>
        <div id="circuitStatus" class="circle" :class="circuitStateClass"></div>
        <div id="circuitStatusText">{{circuitStatusMessage}}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SlidingTimeBreakerModule',
  props: {
    name: {
      type: String,
      default: 'Sliding Time Breaker'
    }
  },
  data () {
    return {
      circuitStateClass: '',
      slidingTimeBreaker: null,
      slidingWindowSize: 60000,
      minimumNumberOfCalls: 2,
      failureRateThreshold: 60,
      slowCallDurationThreshold: 500,
      slowCallRateThreshold: 50,
      permittedNumberOfCallsInHalfOpenState: 2,
      openStateDelay: 10000,
      halfOpenStateMaxDelay: 30000,
      circuitStatusMessage: 'Closed'
    }
  },
  methods: {
    onCircuitStateChanged () {
      switch(this.slidingTimeBreaker.state) {
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
      if (this.slidingTimeBreaker) {
        this.slidingTimeBreaker.slidingWindowSize = this.slidingWindowSize;
        this.slidingTimeBreaker.minimumNumberOfCalls = this.minimumNumberOfCalls;
        this.slidingTimeBreaker.failureRateThreshold = this.failureRateThreshold;
        this.slidingTimeBreaker.slowCallDurationThreshold = this.slowCallDurationThreshold;
        this.slidingTimeBreaker.slowCallRateThreshold = this.slowCallRateThreshold;
        this.slidingTimeBreaker.permittedNumberOfCallsInHalfOpenState = this.permittedNumberOfCallsInHalfOpenState;
        this.slidingTimeBreaker.openStateDelay = this.openStateDelay;
        this.slidingTimeBreaker.halfOpenStateMaxDelay = this.halfOpenStateMaxDelay;
      }
    }
  },
  created () {
    this.slidingTimeBreaker = new window.Mollitia.SlidingTimeBreaker({
      slidingWindowSize: this.slidingWindowSize,
      minimumNumberOfCalls: this.minimumNumberOfCalls,
      failureRateThreshold: this.failureRateThreshold,
      slowCallDurationThreshold: this.slowCallDurationThreshold,
      slowCallRateThreshold: this.slowCallRateThreshold,
      permittedNumberOfCallsInHalfOpenState: this.permittedNumberOfCallsInHalfOpenState,
      openStateDelay: this.openStateDelay,
      halfOpenStateMaxDelay: this.halfOpenStateMaxDelay
    });
    this.slidingTimeBreaker.on('stateChanged', this.onCircuitStateChanged);
  }
}
</script>

<style lang="scss" scoped>
.mollitia-module-sliding-time-breaker {
  padding: 10px;
  border: 1px solid var(--madoc-heading-underline-color);
}

.mollitia-module-sliding-time-breaker-header {
  padding: 10px;
  border-bottom: 1px solid var(--madoc-heading-underline-color);
}

.mollitia-module-sliding-time-breaker-content {
  display: flex;
  .mollitia-module-sliding-time-breaker-config {
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
  .mollitia-module-sliding-time-breaker-visual {
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