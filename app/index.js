'use strict';
const Generator = require('yeoman-generator');
const commandExists = require('command-exists').sync;
const yosay = require('yosay');
const chalk = require('chalk');
const wiredep = require('wiredep');
const mkdirp = require('mkdirp');
const _s = require('underscore.string');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.option('skip-welcome-message', {
      desc: 'Skips the welcome message',
      type: Boolean
    });

    this.option('skip-install-message', {
      desc: 'Skips the message after the installation of dependencies',
      type: Boolean
    });

    this.option('test-framework', {
      desc: 'Test framework to be invoked',
      type: String,
      defaults: 'mocha'
    });

    this.option('babel', {
      desc: 'Use Babel',
      type: Boolean,
      defaults: true
    });
  }

  initializing() {
    this.pkg = require('../package.json');
    this.composeWith(
      require.resolve(`generator-${this.options['test-framework']}/generators/app`),
      { 'skip-install': this.options['skip-install'] }
    );
  }

  prompting() {
    if (!this.options['skip-welcome-message']) {
      this.log(yosay('Lets get going with Desk.com themes!'));
    }

    const prompts = [{
      type    : 'input',
      name    : 'name',
      message : 'Whats the project or company name??',
      default : this.appname
    },{
      type    : 'input',
      name    : 'urlpath',
      message : 'Path to hosted site files (for site deployment)'
    },{
      type: 'list',
      name: 'startingPoint',
      message: 'Which version of Bootstrap would you like to include?',
      choices: [{
        name: 'v5 - Respnsive Template (Desk default)',
        value: 'v5'
      }, {
        name: 'Foundation - Starting point based off Foundation v5.3 framework',
        value: 'foundationFive'
      }, {
        name: 'Boot Strap 4 - Not yet available',
        value: 'bootStrapFour'
      },{
        name: 'Foundation 6 - Not yet available',
        value: 'foundationSix'
      }],
    }];

    return this.prompt(prompts).then(answers => {
      const { features } = answers;
      const hasFeature = feat => features && features.indexOf(feat) !== -1;

      // manually deal with the response, get back and store the results.
      // we change a bit this way of doing to automatically do this in the self.prompt() method.
      this.includeModernizr = true;
      this.includeJQuery = true;
      //this.includeBootstrap = hasFeature('includeBootstrap');
      this.startingPoint = answers.startingPoint;
      this.appname = answers.name;
      this.urlpath = answers.urlpath;
    });
  }

  writing() {
    this._writingGulpfile();
    this._writingPackageJSON();
    this._writingBabel();
    this._writingGit();
    this._writingBower();
    this._writingEditorConfig();
    this._writingH5bp();
    this._writingStyles();
    this._writingScripts();
    this._writingHtml();
    this._writingMisc();
  }

  _writingGulpfile() {
    this.fs.copyTpl(
      this.templatePath('gulpfile.js'),
      this.destinationPath('gulpfile.js'),
      {
        date: (new Date).toISOString().split('T')[0],
        name: this.pkg.name,
        version: this.pkg.version,
        includeBootstrap: this.includeBootstrap,
        startingPoint: this.startingPoint,
        includeBabel: this.options['babel'],
        testFramework: this.options['test-framework']
      }
    );
  }

  _writingPackageJSON() {
    this.fs.copyTpl(
      this.templatePath('_package.json'),
      this.destinationPath('package.json'),
      {
        includeBabel: this.options['babel'],
        includeJQuery: this.includeJQuery,
      }
    );
  }

  _writingBabel() {
    this.fs.copy(
      this.templatePath('babelrc'),
      this.destinationPath('.babelrc')
    );
  }

  _writingGit() {
    this.fs.copy(
      this.templatePath('gitignore'),
      this.destinationPath('.gitignore'));

    this.fs.copy(
      this.templatePath('gitattributes'),
      this.destinationPath('.gitattributes'));
  }

  _writingBower() {
    const bowerJson = {
      name: _s.slugify(this.appname),
      private: true,
      dependencies: {}
    };
    // ALL versions
    bowerJson.dependencies['jquery-validation'] = '^1.16.0';
    bowerJson.dependencies['font-awesome'] = '~4.7';
    bowerJson.dependencies['modernizr'] = '~2.8.1';

    // v5 Responsive (bootstrap 3 based)
    if (this.Startingpoint == 'v5') {
      bowerJson.dependencies = {
        'bootstrap-sass': '~3.3.5'
      };
      bowerJson.overrides = {
        'bootstrap-sass': {
          'main': [
            'assets/stylesheets/_bootstrap.scss',
            'assets/fonts/bootstrap/*',
            'assets/javascripts/bootstrap.js'
          ]
        }
      };
    }
    // Foundation startingPoint
    if(this.startingPoint == 'foundationFive') {
        bowerJson.dependencies = {
          'foundation': '~5.5.3'
        };
    }
    // Foundation 6 (not yet active)
    if(this.startingPoint == 'foundationSix') {
      bowerJson.dependencies = {
        'foundation-sites': 'latest'
      };
    }
    //Bootstrap 4 (not yet active)
    if(this.startingPoint == 'bootStrapFour') {
        bowerJson.dependencies = {
          'bootstrap': '~4.0.0-alpha.6'
        };
    }
    if (this.Startingpoint != 'bootStrapFour' || this.startingPoint != 'foundationSix') {
      bowerJson.dependencies = {
        'jquery': '~1.9.1'
      }
      bowerJson.resolutions = {
        'jquery': '~1.9.1'
      }
    } else {
      //Foundation 6/Bootstrap 4 Support (not yet active)
    }

    // Write it down!
    this.fs.writeJSON('bower.json', bowerJson);
    this.fs.copy(
      this.templatePath('bowerrc'),
      this.destinationPath('.bowerrc')
    );
  }

  _writingEditorConfig() {
    this.fs.copy(
      this.templatePath('editorconfig'),
      this.destinationPath('.editorconfig')
    );
  }

  _writingH5bp() {
    this.fs.copy(
      this.templatePath('favicon.ico'),
      this.destinationPath('app/favicon.ico')
    );

    this.fs.copy(
      this.templatePath('apple-touch-icon.png'),
      this.destinationPath('app/apple-touch-icon.png')
    );

    this.fs.copy(
      this.templatePath('robots.txt'),
      this.destinationPath('app/robots.txt'));
  }

  _writingStyles() {
    let css = 'main';

    if (this.includeSass) {
      css += '.scss';
    } else {
      css += '.css';
    }

    this.fs.copyTpl(
      this.templatePath(css),
      this.destinationPath('app/styles/' + css),
      {
        includeBootstrap: this.includeBootstrap,
        startingPoint: this.startingPoint
      }
    );
  }

  _writingScripts() {
    this.fs.copy(
      this.templatePath('main.js'),
      this.destinationPath('app/scripts/main.js')
    );
  }

  _writingHtml() {
    let bsPath, bsPlugins;

    // path prefix for Bootstrap JS files
    if (this.includeBootstrap) {

      // Bootstrap 4
      bsPath = '/bower_components/bootstrap/js/dist/';
      bsPlugins = [
        'util',
        'alert',
        'button',
        'carousel',
        'collapse',
        'dropdown',
        'modal',
        'scrollspy',
        'tab',
        'tooltip',
        'popover'
      ];

      // Bootstrap 3
      if (this.startingPoint) {
        if (this.includeSass) {
          bsPath = '/bower_components/bootstrap-sass/assets/javascripts/bootstrap/';
        } else {
          bsPath = '/bower_components/bootstrap/js/';
        }
        bsPlugins = [
          'affix',
          'alert',
          'dropdown',
          'tooltip',
          'modal',
          'transition',
          'button',
          'popover',
          'carousel',
          'scrollspy',
          'collapse',
          'tab'
        ];
      }
    }

    this.fs.copyTpl(
      this.templatePath('index.html'),
      this.destinationPath('app/index.html'),
      {
        appname: this.appname,
        includeSass: this.includeSass,
        includeBootstrap: this.includeBootstrap,
        startingPoint: this.startingPoint,
        includeModernizr: this.includeModernizr,
        includeJQuery: this.includeJQuery,
        bsPath: bsPath,
        bsPlugins: bsPlugins
      }
    );
  }

  _writingMisc() {
    mkdirp('app/images');
    mkdirp('app/fonts');
  }

  install() {
    const hasYarn = commandExists('yarn');
    this.installDependencies({
      npm: !hasYarn,
      bower: true,
      yarn: hasYarn,
      skipMessage: this.options['skip-install-message'],
      skipInstall: this.options['skip-install']
    });
  }

  end() {
    const bowerJson = this.fs.readJSON(this.destinationPath('bower.json'));
    const howToInstall = `
After running ${chalk.yellow.bold('npm install & bower install')}, inject your
front end dependencies by running ${chalk.yellow.bold('gulp wiredep')}.`;

    if (this.options['skip-install']) {
      this.log(howToInstall);
      return;
    }

    // wire Bower packages to .html
    wiredep({
      bowerJson: bowerJson,
      directory: 'bower_components',
      exclude: ['bootstrap-sass', 'bootstrap.js'],
      ignorePath: /^(\.\.\/)*\.\./,
      src: 'app/index.html'
    });

    if (this.includeSass) {
      // wire Bower packages to .scss
      wiredep({
        bowerJson: bowerJson,
        directory: 'bower_components',
        ignorePath: /^(\.\.\/)+/,
        src: 'app/styles/*.scss'
      });
    }
  }
}
