<template>
  <div class="mollitia-playground">
    <Circuit ref="c1" :modules="modules" @end="onCircuitEnd">
      <RateLimitModule ref="rl1"></RateLimitModule>
    </Circuit>
  </div>
</template>

<script>
import Circuit from '../components/Circuit';
import RateLimitModule from '../components/module/RateLimitModule';
export default {
  name: 'RateLimit',
  components: {
    Circuit,
    RateLimitModule
  },
  data () {
    return {
      circuit: null,
      modules: []
    };
  },
  methods: {
    onCircuitEnd (res) {
      this.$refs.rl1.onEnd(res);
    }
  },
  mounted () {
    this.circuit = this.$refs.c1.circuit;
    this.modules.push(this.$refs.rl1.rateLimit);
  }

}
</script>

<style lang="scss" scoped>
div.mollitia-playground {
  height: 100%;
}
</style>
