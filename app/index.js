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
      require.resolve(`generator-${this.options['test-framework']}/generators/app`), {
        'skip-install': this.options['skip-install']
      }
    );
  }
  prompting() {
    if (!this.options['skip-welcome-message']) {
      this.log(yosay('Lets get going with Desk.com themes!'));
    }

    const prompts = [{
      type: 'input',
      name: 'name',
      message: 'Whats the project or company name??',
      default: this.appname
    }, {
      type: 'input',
      name: 'urlpath',
      message: 'Path to hosted site files (for site deployment)'
    }, {
      type: 'list',
      name: 'startingPoint',
      message: 'Which version of Bootstrap would you like to include?',
      choices: [{
        name: 'v5 - Respnsive Template (Desk default)',
        value: 'bootStrap'
      }, {
        name: 'Foundation - Starting point based off Foundation v5.3 framework',
        value: 'foundationFive'
      }, {
        name: 'Boot Strap 4 - Not yet available',
        value: 'bootStrapFour'
      }, {
        name: 'Foundation 6 - Not yet available',
        value: 'foundationSix'
      }],
    }];
    return this.prompt(prompts).then(answers => {
      const features = answers.features;
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
  reviewing() {
    this.log('LETS GOOOO!');
    this.log(this.startingPoint);
  }
  writing() {
    this._writingGulpfile();
    this.log('_writingGulpfile');
    this._writingPackageJSON();
    this.log('_writingPackageJSON');
    this._writingBabel();
    this.log('_writingBabel');
    this._writingGit();
    this.log('_writingGit');
    this._writingBower();
    this.log('_writingBower');
    this._writingEditorConfig();
    this.log('_writingEditorConfig');
    this._writingH5bp();
    this.log('_writingH5bp');
    //this._writingStyles();
    //this._writingScripts();
    this._writingTemplate();
    this.log('_writingTemplate');
    this._writingMisc();

  }

  _writingGulpfile() {
    this.fs.copyTpl(
      this.templatePath('gulpfile.js'),
      this.destinationPath('gulpfile.js'), {
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
      this.destinationPath('package.json')
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
    //All Versions
    bowerJson.dependencies['jquery-validation'] = '^1.16.0';
    bowerJson.dependencies['font-awesome'] = '~4.7';
    bowerJson.dependencies['modernizr'] = '~2.8.1';
    bowerJson.dependencies['jquery'] = '~1.9.1';
    // BootStrap startingPoints
    if (this.startingPoint == 'bootStrap') {
      bowerJson.dependencies['bootstrap-sass'] = '~3.3.5';
    }
    if (this.startingPoint == 'bootStrapFour') {
      bowerJson.dependencies['bootstrap'] = 'latest';
    }
    // Foundation startingPoints
    if (this.startingPoint == 'foundationFive') {
      bowerJson.dependencies['foundation'] = '5.5.3';
    }
    if (this.startingPoint == 'foundationSix') {
      bowerJson.dependencies['foundation-sites'] = 'latest';
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

  }
  _writingTemplate() {
    let bsPath, bsPlugins;
    this.fs.copyTpl(
      this.templatePath('data.json'),
      this.destinationPath('app/data.json')
    );
    if (this.startingPoint == 'foundationFive') {
      this.fs.copyTpl(
        this.templatePath('foundation/'),
        this.destinationPath('app/'), {
          appname: this.appname,
          includeSass: this.includeSass,
          startingPoint: this.startingPoint,
          includeModernizr: this.includeModernizr,
          includeJQuery: this.includeJQuery,
          bsPath: bsPath,
          bsPlugins: bsPlugins
        }
      );
    }
    // Foundation
    if (this.startingPoint == 'foundationSix') {
      this.fs.copyTpl(
        this.templatePath('foundation/'),
        this.destinationPath('app/'), {
          appname: this.appname,
          includeFoundation: this.includeFoundation,
          includeFoundationSix: this.includeFoundationSix,
          includeBootstrap: this.includeBootstrap,
          includeModernizr: this.includeModernizr,
          includeJQuery: this.includeJQuery,
        }
      );
    }
    if (this.startingPoint == 'bootStrap') {
      bsPath = '/bower_components/bootstrap-sass/assets/javascripts/bootstrap/';
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
      this.fs.copyTpl(
        this.templatePath('v5/'),
        this.destinationPath('app/'), {
          appname: this.appname,
          includeSass: this.includeSass,
          startingPoint: this.startingPoint,
          includeModernizr: this.includeModernizr,
          includeJQuery: this.includeJQuery,
          bsPath: bsPath,
          bsPlugins: bsPlugins
        }
      );
    }
    //BS FOUR
    if (this.startingPoint == 'bootStrapFour') {
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
      this.fs.copyTpl(
        this.templatePath('v5/'),
        this.destinationPath('app/'), {
          appname: this.appname,
          includeSass: this.includeSass,
          startingPoint: this.startingPoint,
          includeModernizr: this.includeModernizr,
          includeJQuery: this.includeJQuery,
          bsPath: bsPath,
          bsPlugins: bsPlugins
        }
      );
}
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
