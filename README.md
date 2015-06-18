# SLACjs

[![Build Status](https://travis-ci.org/wouterbulten/slacjs.svg)](https://travis-ci.org/wouterbulten/slacjs) [![devDependency Status](https://david-dm.org/wouterbulten/slacjs/dev-status.svg)](https://david-dm.org/wouterbulten/slacjs#info=devDependencies) [![Code Climate](https://codeclimate.com/github/wouterbulten/slacjs/badges/gpa.svg)](https://codeclimate.com/github/wouterbulten/slacjs) [![bitHound Score](https://www.bithound.io/github/wouterbulten/slacjs/badges/score.svg)](https://www.bithound.io/github/wouterbulten/slacjs)

Simultaneous Localisation and Configuration (SLAC) for Wireless Sensor Networks in indoor environments using FastSLAM.

With SLAC we aim to simultaneously localise both the user and the devices of a system deployed in an indoor environment. The algorithm is privacy-aware and is an online localisation method; i.e. localisation starts whenever a user starts moving inside a building. Moreover, for the SLAC system we focus on a solution that can be deployed in smart spaces without additional hardware requirements besides users’ mobile phones` and the components of the space. By utilising a mobile phone we remove the need for a application-dependent device that the user needs to keep.

SLAC is implemented in Javascript using the ECMAScript 6 standard. See [es6features](https://github.com/lukehoban/es6features) for an overview.

This project is part of a Master Thesis in Artificial Intelligence at the [Radboud University](http://www.ru.nl) and an internship at [DoBots](https://dobots.nl/) and [Almende](http://www.almende.com/).

## Demo's

The following list of demo's are demo's of the local/browser version of SLACjs and use simulated data.

* [Full demonstration with simulated data](https://wouterbulten.nl/slacjs)
* [Landmark initialisation example](https://wouterbulten.nl/slacjs/tests/landmark-init.html)


## Screenshots

Local version of SLACjs running in the browser (with simulated data). Blue path is the ground truth motion of the user. Each grey path is a particle. Black squares are landmarks; red squares their best estimate retrieved from the particle filter.

![Local version of SLACjs](/resources/screenshots/slacjs_local.png?raw=true "Local version of SLACjs.")

A new landmark is initialised using a separate particle filter. On each new measurement the filter is updated to end up with a rough estimate of the landmark position. Note that this is range-only SLAM, so no heading information is present in the measurements.

![Initialising a new landmark](/resources/screenshots/slacjs_local_init.png?raw=true "Initialising a new landmark.")

After initialisation the landmark position is further refined using EKF's.

![Updating landmarks after initialisation (1/2)](/resources/screenshots/slacjs_local_init2.png?raw=true "Updating landmarks after initialisation (2/2).")
![Updating landmarks after initialisation (1/2)](/resources/screenshots/slacjs_local_localisation.png?raw=true "Updating landmarks after initialisation (2/2).")

SLACjs is designed to work on mobile devices utilising the compass and accelerometer data. A first version running on an iPad:

![iPad version of SLACjs](/resources/screenshots/slac-js-1.0.PNG?raw=true "First version of SLACjs running on an iPad.")

The following screenshot shows a replay of live data recorded using the iPad version of SLACjs. All data is real data and is played back in real time (so no simulated movement or beacons). Performance of this particle run, measured in average landmark location error, is 1.87 meters. 'Red blocks' are estimated landmarks, 'black blocks' are their true positions.

![Replay of live data](/resources/screenshots/slacjs_live_lowbroadcast_187.png?raw=true "Replay of live data.")


## Overview of algorithm

All steps of the SLACjs algorithm are displayed in the flow chart below. The chart depicts the process of updating the particle filter based on a single observation. In the case of multiple observations, each observations is processed before resampling takes place.

![Flow chart of SLACjs algorithm](/resources/slacjs-algorithm-overview.png?raw=true "Flow chart of SLACjs algorithm.")


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

This builds a mobile version of the project and adds all plugins and platforms as defined in `config.js`. Make sure that you run this command from the main project directory.

## Running SLACjs locally

A local version of SLACjs with simulated data can be run using:

`gulp serve`

This will start a development server on localhost:3000 using *BrowserSync*. All ES6 modules are compiled to a single ES5 compatible javascript file (including sourcemaps for development).

The main entry point of the local SLACjs version can be found in `src/app/app-local.js`.

## Running SLACjs on a mobile platform

To build a mobile version a combination of both *Gulp* and *Cordova* has to be used. Build the project and export the resources using:

`gulp mobile`

This transpiles all javascript and exports the resources for the app to the `/mobile` directory. The `mobile` directory is a Cordova project and can be used accordingly (i.e. using `cordova run ...` or `cordova prepare`). See the [Cordova docs](https://cordova.apache.org/docs/en/3.0.0/guide_cli_index.md.html) for more information about building.

When you have Phonegap installed you can use the [development app](http://app.phonegap.com/) to quickly test the app by running:

`phonegap serve` (Note: this must be run inside the `mobile` directory!)

To automatically rebuild all resources a specific serve task is available for mobile:

`gulp serve-mobile`

## Building & tools

To just build the files, without running the server, the following can be used:

`gulp build` (for local version)

`gulp mobile` (for mobile version)

The previous build can be cleared using:

`gulp clean` (for local version)

`gulp mobile-clean` (for mobile version)

Individual parts of the project can be built using one of the sub tasks. Run the help task to get a list of functions:

`gulp help`

## Configuration

Two configuration files define most of the behaviour of SLACjs. The *build configuration* file is located in:

`<project root>/config.js`

The build config file contains configuration for the all the Gulp tasks.

The *application configuration*, which contains all settings used by the application, can be found in:

`<project root>/src/app/config.js`

## Libraries & Third-party software

1. *Babeljs:* SLACjs uses ES6 and uses Babel to compile all javascript to ES5 compatible code.
2. *Browserify*: To pack all separate modules.
3. *JSHint & JSCS:* For static code analysis and checking code guidelines. Runs automatically when using the gulp _watch_ command.
4. *BrowserSync:* For live reloading of the development server

## Cordova plugins

The following Cordova plugins are used in the mobile version:

* org.apache.cordova.device-motion
* [com.randdusing.bluetoothle](https://github.com/randdusing/BluetoothLE)
* org.apache.cordova.dialogs
* org.apache.cordova.console
* org.apache.cordova.device-orientation

## Browser/device support

SLACjs utilises the Babel ES6 polyfill to support older browsers and mobile devices.

## Exporting data (iOS)

To use *iTunes File Sharing* to download data files the following needs to be added to the *.plist* file:

	<key>UIFileSharingEnabled</key>
	<true/>
