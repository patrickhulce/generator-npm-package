var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('generator-npm-package:app', function () {
  before(function () {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts({
        name: 'sample-app',
        description: 'sample description',
        initGitHub: false,
        initSemanticRelease: false,
      })
      .toPromise();
  });

  it('creates files', function () {
    assert.file([
      '.eslintrc',
      '.gitignore',
      '.travis.yml',
      'package.json',
      'README.md',
      'LICENSE',
      'lib/index.js',
      'test/bootstrap.js',
    ]);
  });
});
