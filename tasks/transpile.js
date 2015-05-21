var browserify = require('browserify');
var babelify = require('babelify');
var uglify = require('gulp-uglify');
var config = require('../config');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require("gulp-sourcemaps");
var gutil = require('gulp-util');

var development = (config.env == 'development');

module.exports = function (gulp, entries, outputDir, includeTests) {
	return function () {

		if(includeTests) {
			entries = entries.concat(config.tests);
		}

		// set up the browserify instance on a task basis
		var b = browserify({
			entries: entries,
			debug: development,
			transform: [babelify]
		});

		var pipe = b.bundle()
			.pipe(source('slacjs-app.js'))
			.pipe(buffer());

		if(development) {
			pipe = pipe.pipe(sourcemaps.init({loadMaps: true}))
					.on('error', gutil.log)
					.pipe(sourcemaps.write('.'));
		}
		else {
			pipe = pipe.pipe(uglify());
		}
			
		return pipe.pipe(gulp.dest(outputDir));
	};
};