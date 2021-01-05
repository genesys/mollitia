<template>
  <div class="mollitia-playground">
    <Circuit ref="c1" :modules="modules" @end="onCircuitEnd">
      <Retry ref="r1" :time="time"></Retry>
    </Circuit>
  </div>
</template>

<script>
import Circuit from '../../Circuit';
import Retry from '../../module/Retry';
export default {
  name: 'pg-retry',
  components: {
    Circuit,
    Retry
  },
  data () {
    return {
      time: 0,
      modules: []
    };
  },
  methods: {
    onCircuitEnd (result) {
      this.$refs.r1.onEnd(result.success);
    }
  },
  mounted () {
    this.modules.push(this.$refs.r1.retry);
  }
};
</script>

<style lang="scss" scoped>
div.mollitia-playground {
  height: 100%;
}
</style>
