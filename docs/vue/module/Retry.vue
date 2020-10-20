<template>
  <div class="mollitia-playground">
    <Circuit :modules="modules">
      <RetryModule ref="r1"></RetryModule>
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
      modules: []
    };
  },
  mounted () {
    this.modules.push(this.$refs.r1.retry);
  }
}
</script>

<style lang="scss" scoped>
div.mollitia-playground {
  height: 100%;
}
</style>
