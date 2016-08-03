var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

module.exports = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the funkadelic ' + chalk.red('generator-npm-package') + ' generator!'
    ));

    var prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'What is the module\'s name?',
        default: this.appname
      },
      {
        type: 'input',
        name: 'description',
        message: 'What is the module\'s name?',
        default: `The best ${this.appname} around.`,
      },
    ];

    return this.prompt(prompts).then(function (props) {
      this.props = props;
    }.bind(this));
  },

  writing: function () {
    [
      ['LICENSE', 'LICENSE'],
      ['README.md', 'README.md'],
      ['eslintrc', '.eslintrc'],
      ['gitignore', '.gitignore'],
      ['travis.yml', '.travis.yml'],
      ['package.json', 'package.json'],
      ['index.js', 'lib/index.js'],
      ['bootstrap.test.js', 'test/bootstrap.js'],
    ].forEach(item => {
      var src = this.templatePath(item[0]);
      var dest = this.destinationPath(item[1]);
      this.fs.copyTpl(src, dest, {
        name: this.props.name,
        description: this.props.description,
      });
    });
  },

  install: function () {
    this.npmInstall(['lodash'], {save: true});
    this.npmInstall([
      'mocha', 'sinon', 'sinon-chai', 'chai', 'xo',
      'cz-conventional-changelog', 'istanbul', 'semantic-release'
    ], {saveDev: true});
  }
});
