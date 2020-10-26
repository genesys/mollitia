<template>
  <div class="mollitia-playground">
    <Circuit ref="c1" :modules="modules" @end="onCircuitEnd">
      <Timeout ref="t1"></Timeout>
    </Circuit>
  </div>
</template>

<script>
import Circuit from '../../Circuit';
import Timeout from '../../module/Timeout';
export default {
  name: 'pg-timeout',
  components: {
    Circuit,
    Timeout
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
