const babel = require('rollup-plugin-babel')

module.exports = {
  input: '<%= includeTypescript ? "dist" : "lib" %>/index.js',
  plugins: [babel()],
  output: [
    {file: 'dist/bundle.js', format: 'umd', name: '<%= name %>'},
    {file: 'dist/bundle.cjs.js', format: 'cjs', name: '<%= name %>'},
  ],
}
