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

//Function passes on all arguments to a separate component
function getTask(task) {
	var argArray = [].slice.call(arguments);
	argArray[0] = gulp; //Replace first element with a gulp reference

    return require('./tasks/' + task).apply(this, argArray);
}

gulp.task('lint', getTask('lint'));
gulp.task('clean', getTask('clean'));
gulp.task('test', ['lint']); //Used by Travis

gulp.task('build', ['lint', 'build-js', 'build-vendor', 'build-polyfill', 'build-html', 'build-styles']);

gulp.task('build-html', getTask('html'));
gulp.task('build-js', getTask(
	'transpile', config.entries.local, config.dir.dist.scripts, (config.env == 'development'))
);
gulp.task('build-styles', getTask('styles'));
gulp.task('build-vendor', getTask('vendor', config.dir.dist.vendor));
gulp.task('build-polyfill', getTask('polyfill'));

gulp.task('mobile', ['lint', 'mobile-vendor', 'mobile-build-js', 'mobile-resources']);

//Mobile build tasks
gulp.task('mobile-build-js', getTask(
	'transpile', config.entries.mobile, config.dir.mobile.scripts, false
));
gulp.task('mobile-clean', getTask('mobile-clean'));
gulp.task('mobile-resources', getTask('mobile-resources'));
gulp.task('mobile-setup', ['mobile-resources'], getTask('cordova-setup'));
gulp.task('mobile-vendor', getTask('vendor', config.dir.mobile.vendor));

//Tasks for local testing and reloading the browser
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

// Main task for serving the mobile version of SlacJS
gulp.task('serve-mobile', ['mobile'], function() {

	// Watch .css files and other resources
	gulp.watch(config.dir.src.mobile, ['mobile-resources']);

	// Watch .js files
	gulp.watch(config.dir.src.scripts, ['lint', 'mobile-build-js']);

});