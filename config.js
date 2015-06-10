/**
 * Build config for SLACjs
 * @type {Object}
 */
module.exports = {

	env: 'development',

	entries: {
		local: ['src/app/app-local.js'],
		mobile: ['src/app/app-mobile.js']
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
			mobile: 'src/mobile/**/*.*',
			tests: 'src/tests/**/*.js',
			polyfill: 'node_modules/babelify/node_modules/babel-core/browser-polyfill.js'
		},

		dist: {
			base: 'dist/',
			styles: 'dist/assets/css/',
			scripts: 'dist/assets/js/',
			vendor: 'dist/vendor/',
			public: 'dist/'
		},

		mobile: {
			base: 'mobile/',
			scripts: 'mobile/www/js/',
			www: 'mobile/www/',
			vendor: 'mobile/www/vendor/'
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
			'cordova-plugin-device'
		],

		platforms: [
			'ios',
			'android'
		]
	}
};
