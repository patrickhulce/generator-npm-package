var fs = require('fs')
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('generator-npm-package:app', function () {
  var tmpDir = ''
  before(function () {
    this.timeout(60000);
    return helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts({
        name: 'sample-app',
        description: 'sample description',
        initGitHub: false,
        initSemanticRelease: false,
        useTypescript: true,
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
      'yarn.lock',
      'rollup.config.js',
      'tsconfig.json',
      'README.md',
      'LICENSE',
      'lib/index.ts',
    ]);
  });

  it('creates valid json', function () {
    JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf8'))
  });
});
