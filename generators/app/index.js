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
        message: 'How would you describe it?',
        default: `The best ${this.appname} around.`,
      },
      {
        type: 'confirm',
        name: 'includeBrowserPackaging',
        message: 'Include browser packaging?',
      },
      {
        type: 'confirm',
        name: 'initGitHub',
        message: 'Create the repo on GitHub?',
      },
      {
        type: 'confirm',
        name: 'initSemanticRelease',
        message: 'Setup npm releases?',
      }
    ];

    return this.prompt(prompts).then(function (props) {
      this.props = props;
    }.bind(this));
  },

  writing: function () {
    [
      ['LICENSE', 'LICENSE'],
      ['README.md', 'README.md'],
      ['gitignore', '.gitignore'],
      ['travis.yml', '.travis.yml'],
      ['package.json', 'package.json'],
      ['index.js', 'lib/index.js'],
      ['index.test.js', 'test/index.test.js'],
      ['bootstrap.test.js', 'test/bootstrap.js'],
      ['babelrc', '.babelrc', this.props.includeBrowserPackaging],
      ['rollup.config.js', 'rollup.config.js', this.props.includeBrowserPackaging],
    ].forEach(item => {
      if (typeof item[2] !== 'undefined' && !item[2]) {
        return;
      }

      var src = this.templatePath(item[0]);
      var dest = this.destinationPath(item[1]);
      this.fs.copyTpl(src, dest, {
        name: this.props.name,
        description: this.props.description,
        includeBrowserPackaging: this.props.includeBrowserPackaging
      });
    });
  },

  install: function () {
    var yo = this;
    var done = this.async();

    var dependencies = [
      'mocha', 'sinon', 'sinon-chai', 'chai', '@patrickhulce/lint',
      'cz-conventional-changelog', 'istanbul', 'semantic-release'
    ];

    if (yo.props.includeBrowserPackaging) {
      dependencies.push('babel', 'babel-cli', 'babel-preset-es2015', 'rollup', 'rollup-plugin-babel');
    }

    var yarnArgs =  ['add', '-D'].concat(dependencies);
    yo.spawnCommand('yarn', yarnArgs).on('exit', function () {
      done();
    });
  },

  end: function () {
    var yo = this;
    var done = this.async();

    var createGitHub = function (otp, cb) {
      if (yo.props.initGitHub) {
        var payload = JSON.stringify({name: yo.props.name});

        yo.spawnCommand('curl', [
          '-u', 'patrick.hulce@gmail.com',
          '-H', `X-GitHub-OTP: ${otp}`,
          'https://api.github.com/user/repos',
          '-d', payload, '-o', '/dev/null',
        ]).on('close', function () {
          yo.spawnCommand('git', [
            'remote', 'add',
            'origin', `git@github.com:patrickhulce/${yo.props.name}.git`
          ]).on('close', cb);
        });
      } else {
        cb();
      }
    };

    var semanticReleaseSetup = function (cb) {
      if (yo.props.initSemanticRelease) {
        yo.spawnCommand('semantic-release-cli', ['setup']).
          on('close', cb);
      } else {
        cb();
      }
    };

    yo.spawnCommand('git', ['init']).on('close', function () {
      const promise = yo.props.initGitHub ?
        yo.prompt([
          {
            type: 'input',
            name: 'otp',
            message: 'GitHub OTP',
          }
        ]) :
        Promise.resolve({});
      promise.then(props => {
        createGitHub(props.otp, function () {
          semanticReleaseSetup(done);
        });
      }).catch(done);
    });
  }
});
