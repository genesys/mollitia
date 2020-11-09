<!-- Prefetch -->
<script>
  import Vue from 'vue';
  const getInheritContent = async ($content, path, name) => {
    return new Promise(async (resolve) => {
      const loc = [name];
      let _dir = '';
      for (const dir of path.split('/')) {
        _dir += `${dir}/`;
        loc.push(`${_dir}${name}`);
      }
      loc.reverse();
      for (const _loc of loc) {
        const content = await $content(name).fetch().catch(() => {});
        if (content) {
          resolve(content);
        }
      }
      resolve();
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
          error({ statusCode: 404, message: 'Oops' });
        });
        if (article) {
          if (!article.hasOwnProperty('navbar')) {
            article.navbar = await getInheritContent($content, path, '_navbar');
          }
          if (!article.hasOwnProperty('sidebar')) {
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
      <Metrics/>
      <Sidebar v-if="article.sidebar && article.sidebar.links" :sidebar="article.sidebar"/>
      <div class="madoc-wrapper">
        <div class="madoc-content">
          <nuxt-content :document="article" />
        </div>
      </div>
    </div>
  </div>
</template>
