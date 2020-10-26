<template>
  <div class="mollitia-playground">
    <Circuit ref="c1" :modules="modules" @end="onCircuitEnd">
      <Sliding slidingType="time" ref="tb1"></Sliding>
    </Circuit>
  </div>
</template>

<script>
import Circuit from '../../../../Circuit';
import Sliding from '../../../../module/breaker/Sliding';
export default {
  name: 'pg-time',
  components: {
    Circuit,
    Sliding
  },
  data () {
    return {
      circuit: null,
      modules: []
    };
  },
  mounted () {
    this.circuit = this.$refs.c1.circuit;
    this.modules.push(this.$refs.tb1.slidingWindowBreaker);
  }
}
</script>

<style lang="scss" scoped>
div.mollitia-playground {
  height: 100%;
}
</style>