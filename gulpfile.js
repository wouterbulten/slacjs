/*jshint undef:true */

var gulp = require("gulp");
var taskListing = require('gulp-task-listing');

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

//@todo Sometimes html build task breaks style build task
gulp.task('build', ['clean'], function() {
	gulp.start('build-js', 'build-vendor', 'build-polyfill', 'build-styles', 'build-html');
});
gulp.task('build-html', getTask('html'));
gulp.task('build-js', getTask('transpile'));
gulp.task('build-styles', getTask('styles'));
gulp.task('build-vendor', getTask('vendor'));
gulp.task('build-polyfill', getTask('polyfill'));