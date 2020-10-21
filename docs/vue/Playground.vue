<template>
  <div class="mollitia-playground">
    <component :is="component"></component>
  </div>
</template>

<script>
import Global from './Global';
import Timeout from './module/Timeout';
import Retry from './module/Retry';
export default {
  name: 'Playground',
  props: {
    context: {
      type: String,
      default: 'global'
    }
  },
  computed: {
    component () {
      switch (this.context) {
        case 'timeout' : {
          return Timeout;
        }
        case 'retry' : {
          return Retry;
        }
        default: case 'playground' : {
          return Global;
        }
      }
    }
  }
}
</script>

<style lang="scss">
:root {
  --mollitia-error-color: #EA4F6B;
  --mollitia-warning-color: #F8A740;
  --mollitia-success-color: #4AC764;
  --mollitia-info-color: #2E69DB;
  --mollitia-event-color: #FF8FDD;
}
div.mollitia-playground {
  height: 100%;
}
</style>
