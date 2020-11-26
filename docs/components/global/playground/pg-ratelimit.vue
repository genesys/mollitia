<template>
  <div class="mollitia-playground">
    <Circuit ref="c1" :modules="modules" @end="onCircuitEnd" :can-fail="false">
      <Ratelimit ref="rl1"></Ratelimit>
    </Circuit>
  </div>
</template>

<script>
import Circuit from '../../Circuit';
import Ratelimit from '../../module/Ratelimit';
export default {
  name: 'pg-ratelimit',
  components: {
    Circuit,
    Ratelimit
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
    this.modules.push(this.$refs.rl1.ratelimit);
  }
}
</script>

<style lang="scss" scoped>
div.mollitia-playground {
  height: 100%;
}
</style>
