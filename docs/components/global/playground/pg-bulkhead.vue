<template>
  <div class="mollitia-playground">
    <Circuit ref="c1" @start="randomizeColor" :modules="modules" :concurrent="true" :success-params="successParams" :failure-params="failureParams" :init-time="4000">
      <Bulkhead ref="b1"></Bulkhead>
    </Circuit>
  </div>
</template>

<script>
import Circuit from '../../Circuit';
import Bulkhead from '../../module/Bulkhead';
export default {
  name: 'pg-bulkhead',
  components: {
    Circuit,
    Bulkhead
  },
  data () {
    return {
      color: this.getRandomColor(),
      modules: []
    };
  },
  computed: {
    successParams () {
      return {
        color: this.color
      };
    },
    failureParams () {
      return {
        color: this.color
      };
    }
  },
  methods: {
    randomizeColor () {
      this.color = this.getRandomColor();
    },
    getRandomColor () {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }
  },
  mounted () {
    this.circuit = this.$refs.c1.circuit;
    this.modules.push(this.$refs.b1.bulkhead);
  }
}
</script>

<style lang="scss" scoped>
div.mollitia-playground {
  height: 100%;
}
</style>
