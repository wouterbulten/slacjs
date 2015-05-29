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
		'src/tests/landmark-init.js'
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
			'org.apache.cordova.device-motion',
			'com.randdusing.bluetoothle',
			'org.apache.cordova.dialogs',
			'org.apache.cordova.console',
			'org.apache.cordova.device-orientation'
		],

		platforms: [
			'ios',
			'android'
		]
	}
};