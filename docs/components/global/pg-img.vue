<template>
  <img :src="`${publicPath}${src}`" :alt="alt" />
</template>

<script>
export default {
  name: 'pg-img',
  props: {
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      required: true
    }
  },
  computed: {
    publicPath () {
      return this.$router.options.base.slice(0, -1);
    }
  }
};
</script>
