<template>
  <div class="data-circle" :style="style" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false">
    <div v-show="tooltip && showTooltip" class="tooltip" :style="tooltipStyle">{{ tooltip }}</div>
  </div>
</template>

<script>
export default {
  name: 'DataCircle',
  props: {
    size: {
      type: String,
      default: '50px'
    },
    tooltip: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: 'white'
    }
  },
  data () {
    return {
      showTooltip: false
    };
  },
  computed: {
    style () {
      return {
        'width': this.size,
        'height': this.size,
        'background-color': this.color,
      };
    },
    tooltipStyle () {
      return {
        'top': `calc(${this.size} + 5px`
      };
    }
  }
}
</script>

<style lang="scss" scoped>
div.data-circle {
  position: relative;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  margin: 5px;
  border: 2px solid white;
  > div.tooltip {
    position: absolute;
    background-color: rgba(0, 0, 0, .5);
    border-radius: 5px;
    z-index: 1;
  }
}
</style>
