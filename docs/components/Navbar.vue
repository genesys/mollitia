<template>
  <nav class="madoc-navbar">
    <ul class="madoc-navbar-list left">
      <li
        v-for="(link, index) in navbar.links"
        :key="index">
        <router-link v-if="!link.path.startsWith('http')" :to="link.path">
          {{ link.title }}
        </router-link>
        <a v-else :href="link.path" target="_blank">
          {{ link.title }}
        </a>
      </li>
    </ul>
    <ul class="madoc-navbar-list right">
      <li v-if="navbar.github" class="icon">
				<a :href="navbar.github.link" target='_blank'>
          <Github/>
				</a>
			</li>
    </ul>
  </nav>
</template>

<script>
import Github from './svg/Github';
export default {
  components: {
    Github
  },
  name: 'Navbar',
  props: {
    navbar: {
      type: Object,
      default: {}
    }
  },
  data () {
    return {};
  }
};
</script>

<style lang="scss" scoped>
nav.madoc-navbar {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--madoc-grey-5);
  > ul.madoc-navbar-list {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 0;
    list-style: none;
    height: 50px;
    line-height: 50px;
    &:first-child {
      margin-left: 10px;
    }
    &.right {
      margin-left: auto;
    }
    > li {
      height: 50px;
      &:last-child {
        margin-right: 10px;
      }
      > a {
        height: 50px;
        color: inherit;
        text-decoration: none;
        display: flex;
        align-items: center;
        padding: 0 1em;
        &.nuxt-link-exact-active {
          border-bottom: 2px solid var(--madoc-dark-orange);
        }
      }
    }
  }
}
</style>
