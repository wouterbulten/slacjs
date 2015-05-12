# SLACjs

[![Build Status](https://travis-ci.org/wouterbulten/slacjs.svg)](https://travis-ci.org/wouterbulten/slacjs)

Simultaneous Localisation and Configuration for Wireless Sensor Networks in indoor environments using FastSLAM.

## Installation

SLACjs uses *bower* and *gulp* to manage dependencies and build the project. Make sure that you have *npm* installed and then run:

`npm install --global gulp` (Only required if you do not have gulp installed)

`npm install`

`bower install`

`gulp serve`

This will install all dependencies and start a development server on localhost:3000. All ES6 modules are compiled to a single ES5 compatible javascript file (including sourcemaps for development).

## Libraries & Third-party software

1. *Babeljs:* SLACjs uses ES6 and uses Babel to compile all javascript to ES5 compatible code.
2. *JSHint & JSCS:* For static code analysis and checking code guidelines. Runs automatically when using the gulp _watch_ command.
3. *Browser-sync:* For live reloading of the development server
4. *MathJS:* For the update and resample steps in the SLAM algorithm.

## Browser/device support

SLACjs utilises the Babel ES6 polyfill to support older browsers. 
