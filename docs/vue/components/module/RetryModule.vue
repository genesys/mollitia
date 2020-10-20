<template>
  <div class="mollitia-module-retry">
    <div>
      <div>{{ name }}</div>
      <div>Attempts: <input v-model="attempts" @input="update" type="number"/></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RetryModule',
  props: {
    name: {
      type: String,
      default: 'Retry'
    }
  },
  data () {
    return {
      retry: null,
      attempts: 2
    };
  },
  methods: {
    update () {
      this.retry.attempts = this.attempts;
    }
  },
  created () {
    this.retry = new window.Mollitia.Retry({
      attempts: this.attempts
    });
  }
}
</script>

<style lang="scss" scoped>
div.mollitia-module-retry {
  padding: 10px;
  border: 1px solid var(--madoc-heading-underline-color);
}
</style>
