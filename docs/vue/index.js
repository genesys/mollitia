module.exports = {
  tag: 'Playground',
  rootPath: __dirname,
  entry: './dist/Playground.umd.js',
  parse: (line) => {
    return /\(([^)]+)\)/.exec(line)[1];
  }
};
