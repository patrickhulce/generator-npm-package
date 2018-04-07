const babel = require('rollup-plugin-babel')

module.exports = {
  entry: '<%= includeTypescript ? "dist" : "lib" %>/index.js',
  moduleName: '<%= name %>',
  plugins: [babel()],
  targets: [
    {dest: 'dist/bundle.js', format: 'umd'},
    {dest: 'dist/bundle.cjs.js', format: 'cjs'},
  ],
}
