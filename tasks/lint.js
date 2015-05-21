var config = require('../config');
var jscsStylish = require('gulp-jscs-stylish');
var stylish = require('jshint-stylish');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var cached = require('gulp-cached');

module.exports = function(gulp) {
	return function() {
		return gulp.src(config.dir.src.scripts)
			.pipe(cached(config.dir.src.scripts))
			.pipe(jshint())
			.pipe(jscs())
			.on('error', function () {})              // don't stop on error 
        	.pipe(jscsStylish.combineWithHintResults())   // combine with jshint results 
        	.pipe(jshint.reporter(stylish)); 
	};
};