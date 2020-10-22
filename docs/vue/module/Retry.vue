<template>
  <div class="mollitia-playground">
    <Circuit ref="c1" :modules="modules">
      <RetryModule ref="r1" :time="time"></RetryModule>
    </Circuit>
  </div>
</template>

<script>
import Circuit from '../components/Circuit';
import RetryModule from '../components/module/RetryModule';
export default {
  name: 'Retry',
  components: {
    Circuit,
    RetryModule
  },
  data () {
    return {
      time: 0,
      modules: []
    };
  },
  mounted () {
    this.time = this.$refs.c1.time;
    this.modules.push(this.$refs.r1.retry);
  }
}
</script>

<style lang="scss" scoped>
div.mollitia-playground {
  height: 100%;
}
</style>
