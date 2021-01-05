<!-- Prefetch -->
<script>
  import Vue from 'vue';
  const getInheritContent = ($content, path, name) => {
    return new Promise((resolve) => {
      $content(name).fetch()
        .then((data) => { resolve(data); })
        .catch(() => { resolve(); });
    });
  };
  export default Vue.extend({
    data () {
      return {
        title: 'Mollitia',
        description: 'JavaScript Resilience Library'
      };
    },
    head () {
      return {
        title: this.article.title || this.title,
        meta: [
          {
            hid: 'description',
            name: 'description',
            content: this.article.description || this.description
          }
        ]
      };
    },
    async asyncData ({ $content, params, error }) {
      const path = params.pathMatch || 'index';
      if (path !== '_') {
        const article = await $content(path).fetch().catch((err) => {
          console.error(err);
          error({ statusCode: 404, message: 'Oops' });
        });
        if (article) {
          if (article.navbar === undefined) {
            article.navbar = await getInheritContent($content, path, '_navbar');
          }
          if (article.sidebar === undefined) {
            article.sidebar = await getInheritContent($content, path, '_sidebar');
          }
        }
        return { article };
      } else {
        error({ statusCode: 404, message: 'Oops' });
      }
    }
  });
</script>

<!-- Template -->
<template>
  <div class="madoc-page">
    <Navbar v-if="article.navbar && article.navbar.links" :navbar="article.navbar"/>
    <div class="madoc-container">
      <Sidebar v-if="article.sidebar && article.sidebar.links" :sidebar="article.sidebar"/>
      <div class="madoc-wrapper">
        <div class="madoc-content">
          <nuxt-content :document="article" />
        </div>
      </div>
    </div>
  </div>
</template>
