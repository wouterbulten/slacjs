# SLACjs

[![Build Status](https://travis-ci.org/wouterbulten/slacjs.svg)](https://travis-ci.org/wouterbulten/slacjs) [![devDependency Status](https://david-dm.org/wouterbulten/slacjs/dev-status.svg)](https://david-dm.org/wouterbulten/slacjs#info=devDependencies) [![Code Climate](https://codeclimate.com/github/wouterbulten/slacjs/badges/gpa.svg)](https://codeclimate.com/github/wouterbulten/slacjs) [![bitHound Score](https://www.bithound.io/github/wouterbulten/slacjs/badges/score.svg)](https://www.bithound.io/github/wouterbulten/slacjs)

Simultaneous Localisation and Configuration (SLAC) for Wireless Sensor Networks in indoor environments using FastSLAM.

With SLAC we aim to simultaneously localise both the user and the devices of a system deployed in an indoor environment. The algorithm is privacy-aware and is an online localisation method; i.e. localisation starts whenever a user starts moving inside a building. Moreover, for the SLAC system we focus on a solution that can be deployed in smart spaces without additional hardware requirements besides users’ mobile phones`
 and the components of the space. By utilising a mobile phone we remove the need for a application-dependent device that the user needs to keep.

SLAC is implemented in Javascript using the ECMAScript 6 standard. See [es6features](https://github.com/lukehoban/es6features) for an overview.

## Demo's

* [Full demonstration with simulated data](https://wouterbulten.nl/slacjs)
* [Landmark initialisation example](https://wouterbulten.nl/slacjs/tests/landmark-init.html)

## Installation

SLACjs uses *bower* and *gulp* to manage dependencies and build the project; both can be installed using *npm*. Make sure that you have *npm* installed and then run:

1. Install gulp globally (only do this if you do not have gulp installed yet):
		`npm install --global gulp` 
2. Install project dependencies:
		`npm install`
3. Install all bower dependencies:
		`bower install`

For building the mobile version of SLACjs [Cordova](https://cordova.apache.org/) has to be installed including the target platforms. SLACjs is configured to build for *iOS* and *Android*. To prepare the project for mobile development run the following command:

`gulp mobile-setup`

This builds a mobile version of the project and adds all plugins and platforms as defined in `config.js`. Make sure that you run this command from the main project directory.gulpgul

## Running SLACjs locally

A local version of SLACjs with simulated data can be run using:

`gulp serve`

This will start a development server on localhost:3000 using *BrowserSync*. All ES6 modules are compiled to a single ES5 compatible javascript file (including sourcemaps for development).

The main entry point of the local SLACjs version can be found in `src/app/app-local.js`.

## Running SLACjs on a mobile platform

To build a mobile version a combination of both *Gulp* and *Cordova* has to be used. First build the project and export the resources using:

`gulp mobile`

This transpiles all javascript and exports the resources for the app to the `/mobile` directory. The `mobile` directory is a Cordova project and can be used accordingly. When you have Phonegap installed you can use the [development app](http://app.phonegap.com/) to quickly test the app by running:

`phonegap serve` (Note: this must be run inside the `mobile` directory!)

## Building & tools

To just build the files, without running the server, the following can be used:

`gulp build`

The previous build can be cleared using:

`gulp clean`

Individual parts of the project can be built using one of the sub tasks:

`gulp build-html`

`gulp build-js`

`gulp build-polyfill`

`gulp build-styles`

`gulp build-vendor`

`gulp mobile-build-js`

`gulp mobile-clean`

`gulp mobile-resources`

`gulp mobile-setup`

`gulp mobile-vendor`


## Libraries & Third-party software

1. *Babeljs:* SLACjs uses ES6 and uses Babel to compile all javascript to ES5 compatible code.
2. *Browserify*: To pack all separate modules.
3. *JSHint & JSCS:* For static code analysis and checking code guidelines. Runs automatically when using the gulp _watch_ command.
4. *BrowserSync:* For live reloading of the development server

## Browser/device support

SLACjs utilises the Babel ES6 polyfill to support older browsers. 
