const babel = require('rollup-plugin-babel')

module.exports = {
  entry: 'lib/index.js',
  moduleName: '<%= name %>',
  plugins: [babel()],
  targets: [
    {dest: 'dist/bundle.js', format: 'umd'},
    {dest: 'dist/bundle.cjs.js', format: 'cjs'},
  ],
}
