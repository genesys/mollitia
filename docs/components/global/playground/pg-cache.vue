<template>
  <div class="mollitia-playground">
    <Circuit ref="c1" :modules="modules" @end="onCircuitEnd" :can-fail="false">
      <Cache ref="ca1"></Cache>
    </Circuit>
  </div>
</template>

<script>
import Circuit from '../../Circuit';
import Cache from '../../module/Cache';
export default {
  name: 'pg-cache',
  components: {
    Circuit,
    Cache
  },
  data () {
    return {
      modules: []
    };
  },
  methods: {
    onCircuitEnd () {
      this.$refs.ca1.onEnd();
    }
  },
  mounted () {
    this.modules.push(this.$refs.ca1.cache);
  }
}
</script>

<style lang="scss" scoped>
div.mollitia-playground {
  height: 100%;
}
</style>
