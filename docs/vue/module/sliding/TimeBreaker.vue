<template>
  <div class="mollitia-playground">
    <Circuit ref="c1" :modules="modules" @end="onCircuitEnd">
      <TimeBreakerModule ref="tb1"></TimeBreakerModule>
    </Circuit>
  </div>
</template>

<script>
import Circuit from '../../components/Circuit';
import TimeBreakerModule from '../../components/module/sliding/TimeBreakerModule';
export default {
  name: 'SlidingTimeBreaker',
  components: {
    Circuit,
    TimeBreakerModule
  },
  data () {
    return {
      circuit: null,
      modules: []
    };
  },
  mounted () {
    this.circuit = this.$refs.c1.circuit;
    this.modules.push(this.$refs.tb1.slidingTimeBreaker);
  }
}
</script>

<style lang="scss" scoped>
div.mollitia-playground {
  height: 100%;
}
</style>