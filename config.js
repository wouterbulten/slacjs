/**
 * Build config for SLACjs
 * @type {Object}
 */
module.exports = {

	env: 'development',

	entries: {
		local: ['src/app/app-local.js'],
		mobile: ['src/app/app-mobile.js'],
		replay: ['src/app/app-replay.js'],
		demo: ['src/app/app-demo.js']
	},

	'tests': [
		'src/tests/voting.js',
		'src/tests/landmark-init.js',
		'src/tests/rssi-filter.js'
	],

	dir: {
		src: {
			styles: 'src/local/styles/**/*.css',
			scripts: 'src/app/**/*.js',
			html: 'src/local/**/*.html',
			replayHtml: 'src/replay/**/*.html',
			replayData: 'src/replay/data/*.js',
			mobile: 'src/mobile/**/*.*',
			demo: 'src/demo/**/*.*',
			tests: 'src/tests/**/*.js',
			polyfill: 'node_modules/babelify/node_modules/babel-core/browser-polyfill.js'
		},

		dist: {
			base: 'dist/',
			styles: 'dist/assets/css/',
			scripts: 'dist/assets/js/',
			vendor: 'dist/vendor/',
			public: 'dist/',
			replayData: 'dist/data/'
		},

		mobile: {
			base: 'mobile/',
			scripts: 'mobile/www/js/',
			www: 'mobile/www/',
			vendor: 'mobile/www/vendor/'
		},

		demo: {
			base: 'dist/',
			styles: 'dist/assets/css/',
			scripts: 'dist/assets/js/',
			vendor: 'dist/vendor/',
			public: 'dist/',
			replayData: 'dist/data/'
		}
	},

	cordova: {
		plugins: [
			'cordova-plugin-device-motion',
			'com.randdusing.bluetoothle',
			'cordova-plugin-dialogs',
			'cordova-plugin-console',
			'cordova-plugin-device-orientation',
			'cordova-plugin-file',
			'cordova-plugin-device',
			'cordova-plugin-screen-orientation',
			'de.appplant.cordova.plugin.background-mode'
		],

		platforms: [
			'ios',
			'android'
		]
	}
};
