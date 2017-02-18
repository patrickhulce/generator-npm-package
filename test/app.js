var fs = require('fs')
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('generator-npm-package:app', function () {
  var tmpDir = ''
  before(function () {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts({
        name: 'sample-app',
        description: 'sample description',
        initGitHub: false,
        initSemanticRelease: false,
        includeBrowserPackaging: true,
      })
      .inTmpDir(function (dir) {
        tmpDir = dir;
      })
      .toPromise();
  });

  it('creates files', function () {
    assert.file([
      '.babelrc',
      '.gitignore',
      '.travis.yml',
      'package.json',
      'rollup.config.js',
      'README.md',
      'LICENSE',
      'lib/index.js',
      'test/bootstrap.js',
    ]);
  });

  it('creates valid json', function () {
    JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf8'))
  });
});
