<template>
  <div class="mollitia-playground">
    <Circuit ref="c1" :modules="modules" @end="onCircuitEnd">
      <SlidingWindowBreakerModule name="toto" slidingType="count" ref="cb1"></SlidingWindowBreakerModule>
    </Circuit>
  </div>
</template>

<script>
import Circuit from '../../components/Circuit';
import SlidingWindowBreakerModule from '../../components/module/SlidingWindowBreakerModule';
export default {
  name: 'SlidingCountBreaker',
  components: {
    Circuit,
    SlidingWindowBreakerModule
  },
  data () {
    return {
      circuit: null,
      modules: []
    };
  },
  mounted () {
    this.circuit = this.$refs.c1.circuit;
    this.modules.push(this.$refs.cb1.slidingWindowBreaker);
  }
}
</script>

<style lang="scss" scoped>
div.mollitia-playground {
  height: 100%;
}
</style>
