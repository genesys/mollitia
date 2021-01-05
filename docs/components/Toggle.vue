<template>
  <div class="toggle">
    <label class="toggle-label" v-if="preLabel">{{ preLabel }}</label>
    <label class="toggle-container">
      <input v-model="value" type="checkbox" @input="onInput">
      <span class="slider"></span>
    </label>
    <label class="toggle-label" v-if="postLabel">{{ postLabel }}</label>
  </div>
</template>

<script>
export default {
  name: 'Toggle',
  props: {
    value: {
      type: Boolean,
      default: true
    },
    preLabel: {
      type: String,
      default: ''
    },
    postLabel: {
      type: String,
      default: ''
    }
  },
  methods: {
    onInput () {
      this.$emit('input', !this.value);
    }
  }
};
</script>

<style lang="scss" scoped>
div.toggle {
  display: inline-block;
  > label.toggle-label {
    font-size: small;
  }
  > label.toggle-container {
    position: relative;
    display: inline-block;
    width: 38px;
    height: 21px;
    > input {
      opacity: 0;
      width: 0;
      height: 0;
      &:checked + span.slider {
        background-color: #2196F3;
        &:before {
          transform: translateX(15px);
        }
      }
      &:focus + span.slider {
        box-shadow: 0 0 1px #2196F3;
      }
    }
    > span.slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 19px;
      &:before {
        position: absolute;
        content: "";
        height: 15px;
        width: 15px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }
    }
  }
}
</style>
