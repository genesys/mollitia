<template>
  <nav class="madoc-sidebar">
    <template v-for="(group, index) in groups">
      <span class="madoc-sidebar-title" v-if="group.name" :key="`title-${index}`">{{ group.name }}</span>
      <ul class="madoc-sidebar-list" :key="`list-${index}`">
        <li
          class="madoc-sidebar-list-item"
          v-for="link in group"
          :key="link.title">
          <router-link :to="link.path">
            {{ link.title }}
          </router-link>
        </li>
      </ul>
    </template>
  </nav>
</template>

<script>
export default {
  name: 'Sidebar',
  props: {
    sidebar: {
      type: Object,
      default: {}
    }
  },
  data () {
    return {};
  },
  computed: {
    groups () {
      const groups = {};
      let group = 0;
      for (const link of this.sidebar.links) {
        if (link.group) {
          group++;
          groups[group] = groups[group] || [];
          groups[group].name = link.group;
          groups[group].push(...link.links);
          group++;
        } else {
          groups[group] = groups[group] || [];
          groups[group].push(link);
        }
      }
      return groups;
    }
  }
};
</script>

<style lang="scss" scoped>
nav.madoc-sidebar {
  padding: 20px 0;
  min-width: 250px;
  border-right: 1px solid var(--madoc-grey-5);
  overflow: auto;
  > span.madoc-sidebar-title {
    display: block;
    font-weight: bold;
    padding: 0 1em;
  }
  > ul.madoc-sidebar-list {
    margin: 0;
    padding: 0 1em;
    list-style: none;
    &:first-child {
      padding-top: 1em;
    }
    &:not(:last-child) {
      padding-bottom: 1em;
    }
    > li.madoc-sidebar-list-item {
      border-left: 1px solid var(--madoc-grey-5);
      &:last-child {
        border-bottom: 1px solid var(--madoc-grey-5);
      }
      > a {
        border-top: 1px solid var(--madoc-grey-5);
        border-left: 2px solid transparent;
        border-right: 1px solid var(--madoc-grey-5);
        display: block;
        padding: 1em;
        color: inherit;
        text-decoration: none;
        &.nuxt-link-exact-active {
          border-left: 2px solid var(--madoc-dark-orange);
        }
      }
    }
  }
}
</style>
