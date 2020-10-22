<template>
  <div class="mollitia-playground">
    <Circuit ref="c1" :modules="modules" @end="onCircuitEnd">
      <TimeoutModule ref="t1"></TimeoutModule>
    </Circuit>
  </div>
</template>

<script>
import Circuit from '../components/Circuit';
import TimeoutModule from '../components/module/TimeoutModule';
export default {
  name: 'Timeout',
  components: {
    Circuit,
    TimeoutModule
  },
  data () {
    return {
      modules: []
    };
  },
  methods: {
    onCircuitEnd () {
      this.$refs.t1.onEnd();
    }
  },
  mounted () {
    this.modules.push(this.$refs.t1.timeout);
  }
}
</script>

<style lang="scss" scoped>
div.mollitia-playground {
  height: 100%;
}
</style>
