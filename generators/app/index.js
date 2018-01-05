var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var envScripts = require('./env-scripts.json');

module.exports = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the funkadelic ' + chalk.red('generator-npm-package') + ' generator!'
    ));

    var defaultAppName = this.appname.replace(/\s+/g, '-');
    var prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'What is the module\'s name?',
        default: defaultAppName,
      },
      {
        type: 'input',
        name: 'description',
        message: 'How would you describe it?',
        default: `The best ${defaultAppName} around.`,
      },
      {
        type: 'confirm',
        name: 'useTypescript',
        message: 'Use TypeScript?',
      },
      {
        type: 'confirm',
        name: 'includeBrowserPackaging',
        message: 'Include browser packaging?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'initGitHub',
        message: 'Create the repo on GitHub?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'initSemanticRelease',
        message: 'Setup npm releases?',
        default: false,
      }
    ];

    return this.prompt(prompts).then(function (props) {
      this.props = props;
    }.bind(this));
  },

  writing: function () {
    var includeBuildProcess = this.props.includeBrowserPackaging || this.props.useTypescript;
    [
      ['LICENSE', 'LICENSE'],
      ['README.md', 'README.md'],
      ['gitignore', '.gitignore'],
      ['npmignore', '.npmignore'],
      ['travis.yml', '.travis.yml'],
      ['package.json', 'package.json'],
      ['index.js', this.props.useTypescript ? 'lib/index.ts' : 'lib/index.js'],
      ['index.test.js', 'test/index.test.js'],
      ['tsconfig.json', 'tsconfig.json', this.props.useTypescript],
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
        includeBuildProcess: includeBuildProcess,
        includeBrowserPackaging: this.props.includeBrowserPackaging,
        includeTypescript: this.props.useTypescript,
      });
    });

    var package = this.fs.readJSON('package.json');
    package.scripts = {};
    Object.assign(package.scripts, envScripts.default);
    if (this.props.useTypescript && this.props.includeBrowserPackaging) {
      Object.assign(package.scripts, envScripts.buildProcess);
      Object.assign(package.scripts, envScripts.ts);
      Object.assign(package.scripts, envScripts.rollup);
      Object.assign(package.scripts, envScripts.tsRollup);
    } else if (this.props.useTypescript) {
      Object.assign(package.scripts, envScripts.buildProcess);
      Object.assign(package.scripts, envScripts.ts);
    } else if (this.props.includeBrowserPackaging) {
      Object.assign(package.scripts, envScripts.buildProcess);
      Object.assign(package.scripts, envScripts.rollup);
    }

    this.fs.writeJSON('package.json', package);
  },

  install: function () {
    var yo = this;
    var done = this.async();

    var dependencies = [
      'mocha', 'sinon', 'sinon-chai', 'chai', '@patrickhulce/lint',
      'cz-conventional-changelog', 'nyc', 'semantic-release'
    ];

    if (yo.props.useTypescript) {
      dependencies.push('typescript', 'tslint');
    }

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
