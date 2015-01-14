## Coquette Boilerplate

This boilerplate provides a base to build [Coquette](http://coquette.maryrosecook.com/) games off of. It combines:

* [Webpack](http://webpack.github.io/), which handles the build pipeline (including CJS modules & ES6 syntax)
* [Flow](http://flowtype.org/), a static type checker for JavaScript
* [Grunt](http://gruntjs.com/) and [grunt-ssh](https://github.com/chuckmo/grunt-ssh) for deployment

It's based off of one of the [sample games](https://github.com/maryrosecook/coquette/tree/master/demos/simple) in Coquette's GitHub repo. It also includes an asset preloader library that will load your game's images (as `Image` objects) and audio (as data arrays for use with the Web Audio API) before your game starts.

### Get Started

[Download the boilerplate](https://github.com/thomasboyt/coquette-boilerplate/archive/master.zip), unzip where you want to create your game, and begin hacking!

### Commands

#### `npm run-script dev`

Run a webpack dev server (defaults to `http://localhost:8080`) that will automatically rebuild your game when its code is changed.

#### `npm run-script ship`

Deploy your game to a server through sftp. See the Gruntfile for more details.

### Notes

Uses a [custom fork of Coquette](https://github.com/thomasboyt/coquette/tree/commonjs) with CommonJS support.
