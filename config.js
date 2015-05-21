/*
General config for all gulp tasks
 */

module.exports = {

	env: 'development',

	entries: [
		"src/app/app.js",
	],

	"tests": [
		"src/tests/voting.js",
		"src/tests/landmark-init.js"
	],

	dir: {
		src: {
			styles: "src/public/styles/**/*.css",
			scripts: "src/app/**/*.js",
			html: "src/public/**/*.html",
			tests: "src/tests/**/*.js",
			polyfill: "node_modules/babelify/node_modules/babel-core/browser-polyfill.js"
		},

		dist: {
			base: "dist/",
			styles: "dist/assets/css/",
			scripts: "dist/assets/js/",
			vendor: "dist/vendor/",
			public: "dist/"
		}
	}
};