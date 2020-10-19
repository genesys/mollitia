const pkg = require('./package.json');

module.exports = {
  title: 'Mollitia',
  description: pkg.description,
  distPath: '.docs',
  assets: [
    {
      src: './dist/mollitia.umd.js'
    },
    {
      src: './docs/assets'
    }
  ],
  head: [
    '<script src="/assets/mollitia.umd.js"></script>'
  ],
  watch: [
    './dist'
  ],
  components: [
    require('./docs/vue/index.js')
  ]
};
