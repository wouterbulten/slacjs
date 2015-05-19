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

//@todo Sometimes html build task breaks style build task
gulp.task('build', ['clean'], function() {
	gulp.start('build-js', 'build-vendor', 'build-polyfill', 'build-styles', 'build-html');
});
gulp.task('build-html', getTask('html'));
gulp.task('build-js', getTask('transpile'));
gulp.task('build-styles', getTask('styles'));
gulp.task('build-vendor', getTask('vendor'));
gulp.task('build-polyfill', getTask('polyfill'));


// /*
// Reload browser
//  */
// gulp.task('reload-styles', ['styles'], browserSync.reload);
// gulp.task('reload-scripts', ['lint', 'modules'], browserSync.reload);
// gulp.task('reload-index', ['index'], browserSync.reload);

// /*
// Default task running all sub task in the right order
//  */
// gulp.task('default', ['clean'], function() {
// 	gulp.start('lint', 'modules', 'vendor', 'polyfill', 'styles', 'index');
// });

// /*
// Test task used by Travis
//  */
// gulp.task('test', function() {
// 	return gulp.src(scripts)
// 		.pipe(cached(scripts))
// 		.pipe(jshint())
// 		.pipe(jscs())
// });

// /*
// Watch for changes and rebuild when necessary
//  */
// gulp.task('serve', ['default'], function() {

// 	// Watch .css files
// 	gulp.watch(styles, ['reload-styles']);

// 	// Watch .js files
// 	gulp.watch(scripts, ['reload-scripts']);
// 	gulp.watch(tests, ['reload-scripts']);
	
// 	gulp.watch(index, ['reload-index']);

// 	browserSync({
// 		server: "./dist"
// 	});
// });