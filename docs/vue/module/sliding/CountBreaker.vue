<template>
  <div class="mollitia-playground">
    <Circuit ref="c1" :modules="modules" @end="onCircuitEnd">
      <CountBreakerModule ref="cb1"></CountBreakerModule>
    </Circuit>
  </div>
</template>

<script>
import Circuit from '../../components/Circuit';
import CountBreakerModule from '../../components/module/sliding/CountBreakerModule';
export default {
  name: 'SlidingCountBreaker',
  components: {
    Circuit,
    CountBreakerModule
  },
  data () {
    return {
      circuit: null,
      modules: []
    };
  },
  mounted () {
    this.circuit = this.$refs.c1.circuit;
    this.modules.push(this.$refs.cb1.slidingCountBreaker);
  }
}
</script>

<style lang="scss" scoped>
div.mollitia-playground {
  height: 100%;
}
</style>
