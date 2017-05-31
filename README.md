# Desk.com Theme Generator

> [Desk.com](http://desk.com) generator that builds out Desk themes locally using Gulp. Originally forked from [Gulp Webapp](https://github.com/yeoman/generator-webap) by the [Yeoman Team](http://yeoman.io/)

![](logo.png)


## Features


* enable [ES2015 features](https://babeljs.io/docs/learn-es2015/) using [Babel](https://babeljs.io)
* CSS Autoprefixing
* Built-in preview server with BrowserSync
* Automagically compile Sass with [libsass](http://libsass.org)
* Automagically lint your scripts
* Map compiled CSS to source stylesheets with source maps
* Awesome image optimization
* Automagically wire-up dependencies installed with [Bower](http://bower.io)

*For more information on what this generator can do for you, take a look at the [gulp plugins](app/templates/_package.json) used in our `package.json`.*

## Liquid
Generator uses [gulp-liquify](https://github.com/fchasen/gulp-liquify) to render liquid during the `serve` process. It's built off of [tinyliquid](https://github.com/leizongmin/tinyliquid) and doesn't support 100% of liquid. However it now supports custom filters, which can be added or edited in the gulp file.

## libsass

Keep in mind that libsass is feature-wise not fully compatible with Ruby Sass. Check out [this](http://sass-compatibility.github.io) curated list of incompatibilities to find out which features are missing.

If your favorite feature is missing and you really need Ruby Sass, you can always switch to [gulp-ruby-sass](https://github.com/sindresorhus/gulp-ruby-sass) and update the `styles` task in gulpfile accordingly.


## Getting Started

- Install dependencies: `npm install --global yo gulp-cli bower`
- Install the generator: `npm install --global generator-desk`
- Run `yo desk` to scaffold your Desk.com theme/widget
- Run `gulp serve` to preview and watch for changes
- Run `gulp desk` to prepare your theme for production


## Docs (coming soon)

* [getting started](docs/README.md) with this generator
* [recipes](docs/recipes/README.md) for integrating other popular technologies like CoffeeScript
* [details](docs/bower.md) about our Bower setup
* [contribution](contributing.md) docs and [FAQ](docs/faq.md), good to check before posting an issue


## Options

- `--skip-welcome-message`
  Skips Yeoman's greeting before displaying options.
- `--skip-install-message`
  Skips the the message displayed after scaffolding has finished and before the dependencies are being installed.
- `--skip-install`
  Skips the automatic execution of `bower` and `npm` after scaffolding has finished.
- `--test-framework=<framework>`
  Either `mocha` or `jasmine`. Defaults to `mocha`.
- `--no-babel`
  Scaffolds without [Babel](http://babeljs.io) support. This only applies to `app/scripts`, you can still write ES2015 in the gulpfile, depending on what your version of Node [supports](https://kangax.github.io/compat-table/es6/).


## Contribute

See the [contributing docs](contributing.md).




## License

[BSD license](http://opensource.org/licenses/bsd-license.php)
