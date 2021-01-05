<template>
  <div class="mollitia-module-rate-limit">
    <div class="mollitia-module-rate-limit-header">
      <div>{{ name }}</div>
    </div>
    <div class="mollitia-module-rate-limit-content">
      <div class="mollitia-module-rate-limit-config">
        <div class="form-control">
          <label for="limitPeriod">Limit Period (in ms)</label>
          <input v-model.number="limitPeriod" id="limitPeriod" @input="update" type="number"/>
        </div>
        <div class="form-control">
          <label for="limitForPeriod">Limit For Period</label>
          <input v-model.number="limitForPeriod" id="limitForPeriod" @input="update" type="number"/>
        </div>
      </div>
      <div class="mollitia-module-rate-limit-visual">
        <div class="mollitia-module-rate-limit-result">
          <div class="circle" v-for="result in results" :key="result.id" :class="{'failure': result.value === false}"></div>
        </div>
        <div class="mollitia-module-rate-limit-duration">
          <div class="mollitia-module-rate-limit-title">Ratelimit Duration</div>
          <div class="mollitia-module-rate-limit-progress" :style="style"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
var index = 0;
export default {
  name: 'Ratelimit',
  props: {
    name: {
      type: String,
      default: 'Ratelimit'
    }
  },
  data () {
    return {
      ratelimit: null,
      limitPeriod: 10000,
      limitForPeriod: 2,
      results: [],
      timeForRequests: [],
      percent: 0
    };
  },
  computed: {
    style () {
      return {
        'width': `${this.percent}%`,
        'background-color': 'var(--mollitia-info-color)'
      }
    }
  },
  methods: {
    update () {
      this.ratelimit.limitPeriod = this.limitPeriod;
      this.ratelimit.limitForPeriod = this.limitForPeriod;
    },
    onEnd () {
      if (!this.requestRateLimited) {
        if (this.results.length === 10) {
          this.results.shift();
        }
        this.results.push({id: index++, value: true});
        this.timeForRequests.push(new Date().getTime());
        if (!this.interval) {
          this.percent = 0;
          this.interval = setInterval(() => {
            const now = new Date().getTime();
            this.timeForRequests = this.timeForRequests.filter(tfr => (now - tfr) < this.limitPeriod);
            if (this.timeForRequests.length < this.limitForPeriod) {
              this.percent = 0;
              return;
            }
            const ratelimitRemainingDuration = this.limitPeriod - (this.timeForRequests[this.timeForRequests.length - 1] - this.timeForRequests[0]);
            const currentSpentDuration = now - this.timeForRequests[this.timeForRequests.length - 1];
            this.percent = (currentSpentDuration / ratelimitRemainingDuration) * 100;
          }, 150);
        }
      }
      this.requestRateLimited = false;
    },
    onRatelimit () {
      this.requestRateLimited = true;
      if (this.results.length === 10) {
        this.results.shift();
      }
      this.results.push({id: index++, value: false});
    }
  },
  created () {
    this.ratelimit = new this.$mollitia.Ratelimit({
      limitPeriod: this.limitPeriod,
      limitForPeriod: this.limitForPeriod,
    });
    this.ratelimit.on('ratelimit', this.onRatelimit);
  }
}
</script>

<style lang="scss" scoped>
.mollitia-module-rate-limit {
  padding: 10px;
  border: 1px solid var(--madoc-grey-5);
}

.mollitia-module-rate-limit-header {
  padding: 10px;
  border-bottom: 1px solid var(--madoc-grey-5);
}

.mollitia-module-rate-limit-content {
  display: flex;
  .mollitia-module-rate-limit-config {
    padding: 10px;
    border-right: 1px solid var(--madoc-grey-5);
    .form-control {
      display: flex;
      margin-bottom: 5px;
      label {
        width: 150px;
      }
      input {
        width: 200px;
      }
    }
  }
  .mollitia-module-rate-limit-visual {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    min-height: 50px;
    .mollitia-module-rate-limit-result {
      height: 50%;
      display: flex;
      margin-top: 10px;

      .circle {
        width: 20px;
        height: 20px;
        border-radius: 10px;
        background: var(--mollitia-success-color);
        margin-left:5px;
      }
      .circle.failure {
        background: var(--mollitia-error-color);
      }
    }
    .mollitia-module-rate-limit-duration {
      height: 50%;
      position: relative;
      .mollitia-module-rate-limit-title {
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 0px;
        bottom: 0px;
        left: 0px;
        right: 0px;
      }
      .mollitia-module-rate-limit-progress {
        height: 100%;
        transition:
          width .25s ease,
          background-color .25s ease;
      }
    }
  }
}  
</style>
