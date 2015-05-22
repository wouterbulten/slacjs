var config = require('../config');
var mainBowerFiles = require('main-bower-files');
var cached = require('gulp-cached');
var sourcemaps = require("gulp-sourcemaps");
var concat = require("gulp-concat");

module.exports = function(gulp, outputDir) {
	return function() {
		return gulp.src(mainBowerFiles())
			.pipe(cached(outputDir))
			.pipe(sourcemaps.init())
			.pipe(concat("vendor.js"))
			.pipe(sourcemaps.write("."))
			.pipe(gulp.dest(outputDir));
	};
};