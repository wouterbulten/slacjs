var config = require('../config');
var mainBowerFiles = require('main-bower-files');
var cached = require('gulp-cached');
var sourcemaps = require("gulp-sourcemaps");
var concat = require("gulp-concat");

module.exports = function(gulp) {
	return function() {
		gulp.src(mainBowerFiles())
			.pipe(cached(config.dir.dist.vendor))
			.pipe(sourcemaps.init())
			.pipe(concat("vendor.js"))
			.pipe(sourcemaps.write("."))
			.pipe(gulp.dest(config.dir.dist.vendor));
	};
};