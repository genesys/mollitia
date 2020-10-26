<template>
  <div class="mollitia-playground">
    <Circuit ref="c1" :modules="modules" @end="onCircuitEnd">
      <RateLimit ref="rl1"></RateLimit>
    </Circuit>
  </div>
</template>

<script>
import Circuit from '../../Circuit';
import RateLimit from '../../module/RateLimit';
export default {
  name: 'pg-ratelimit',
  components: {
    Circuit,
    RateLimit
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
