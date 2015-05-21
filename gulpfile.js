/*jshint undef:true */

var gulp = require('gulp');
var taskListing = require('gulp-task-listing');
var config = require('./config');

//Define variables for reloading of the browser using browser sync
var browserSync = require('browser-sync');
var reload = browserSync.reload;

//Add a list of all tasks in this gulpfile
gulp.task('help', taskListing);
gulp.task('default', ['help']);

//var none = function () { this.emit('end'); };
//var reload = browserSync.reload;

function getTask(task) {
    return require('./tasks/' + task)(gulp);
}

gulp.task('lint', getTask('lint'));
gulp.task('clean', getTask('clean'));
gulp.task('test', ['lint']); //Used by Travis

gulp.task('build', ['build-js', 'build-vendor', 'build-polyfill', 'build-html', 'build-styles']);

gulp.task('build-html', getTask('html'));
gulp.task('build-js', getTask('transpile'));
gulp.task('build-styles', getTask('styles'));
gulp.task('build-vendor', getTask('vendor'));
gulp.task('build-polyfill', getTask('polyfill'));

gulp.task('reload-styles', ['build-styles'], browserSync.reload);
gulp.task('reload-scripts', ['lint', 'build-js'], browserSync.reload);
gulp.task('reload-index', ['build-html'], browserSync.reload);

// Main task for serving the non-mobile local version of SlacJS
gulp.task('serve', ['build'], function() {

	// Watch .css files
	gulp.watch(config.dir.src.styles, ['reload-styles']);

	// Watch .js files
	gulp.watch(config.dir.src.scripts, ['reload-scripts']);
	gulp.watch(config.dir.src.tests, ['reload-scripts']);
	
	gulp.watch(config.dir.src.html, ['reload-index']);

	browserSync({
		server: './dist'
	});
});