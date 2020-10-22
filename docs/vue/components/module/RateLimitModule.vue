<template>
  <div class="mollitia-module-rate-limit">
    <div class="mollitia-module-rate-limit-header">
      <div>{{ name }}</div>
    
    </div>

    <div class="mollitia-module-rate-limit-content">
      <div class="mollitia-module-rate-limit-config">
        <div class="form-control">
          <label for="limitPeriod">Limit Period</label>
          <input v-model="limitPeriod" id="limitPeriod" @input="update" type="number"/>
        </div>
        <div class="form-control">
          <label for="limitForPeriod">Limit For Period</label>
          <input v-model="limitForPeriod" id="limitForPeriod" @input="update" type="number"/>
        </div>
      </div>
      <div class="mollitia-module-rate-limit-visual">
        <div class="cercle" v-for="result in results" :key="result.id" :class="{'failure': result.value === false}"></div>
      </div>
    </div>
  </div>
</template>

<script>
var index = 0;
export default {
  name: 'RateLimitModule',
  props: {
    name: {
      type: String,
      default: 'Rate Limit'
    }
  },
  data () {
    return {
      rateLimit: null,
      limitPeriod: 10000,
      limitForPeriod: 2,
      results: []
    };
  },
  methods: {
    update () {
      this.rateLimit.limitPeriod = this.limitPeriod;
      this.rateLimit.limitForPeriod = this.limitForPeriod;
    },
    onEnd () {
      if (this.requestInProgress) {
        this.requestInProgress = false;
        if (this.results.length === 10) {
          this.results.shift();
        }
        this.results.push({id: index++, value: true});
      }
    },
    onRateLimit () {
      if (this.requestInProgress) {
        this.requestInProgress = false;
        if (this.results.length === 10) {
          this.results.shift();
        }
        this.results.push({id: index++, value: false});
      }
    },
    onExecute () {
      this.requestInProgress = true;
    }
  },
  created () {
    this.rateLimit = new window.Mollitia.RateLimit({
      limitPeriod: this.limitPeriod,
      limitForPeriod: this.limitForPeriod
    });
    this.rateLimit.on('rateLimit', this.onRateLimit);
    this.rateLimit.on('execute', this.onExecute);
  }
}
</script>

<style lang="scss" scoped>
.mollitia-module-rate-limit {
  padding: 10px;
  border: 1px solid var(--madoc-heading-underline-color);
}

.mollitia-module-rate-limit-header {
  padding: 10px;
  border-bottom: 1px solid var(--madoc-heading-underline-color);
}

.mollitia-module-rate-limit-content {
  display: flex;
  .mollitia-module-rate-limit-config {
    padding: 10px;
    border-right: 1px solid var(--madoc-heading-underline-color);
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
    margin-top: auto;
    margin-bottom: auto;
    margin-left: 5px;
    display: flex;
    .cercle {
      width: 20px;
      height: 20px;
      border-radius: 10px;
      background: green;
      margin-right:5px;
    }
    .cercle.failure {
      background: red;
    }
  }
}  
</style>
