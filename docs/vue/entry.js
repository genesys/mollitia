import Vue from 'vue';
import Playground from './Playground.vue';

const Components = {
  Playground
};

Object.keys(Components).forEach((name) => {
  Vue.component(name, Components[name]);
});

export default Components;
