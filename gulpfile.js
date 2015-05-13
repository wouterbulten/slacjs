var gulp = require("gulp"),
	sourcemaps = require("gulp-sourcemaps"),
	concat = require("gulp-concat"),
	changed = require('gulp-changed'),
	uglify = require('gulp-uglify'),
	jshint = require('gulp-jshint'),
	minifycss = require('gulp-minify-css'),
	stylish = require('jshint-stylish'),
	browserSync = require('browser-sync')
	clean = require('gulp-clean')
	mainBowerFiles = require('main-bower-files'),
	babelify = require('babelify'),
	browserify = require('browserify'),
	source = require('vinyl-source-stream'),
	buffer = require('vinyl-buffer'),
	gutil = require('gulp-util'),
	cached = require('gulp-cached'),
	jscs = require('gulp-jscs'),
	jscsStylish = require('gulp-jscs-stylish');

var none = function () { this.emit('end'); };
var reload = browserSync.reload;

var entry = "./src/app/app.js";
var entries = ["./src/app/app.js", "./src/tests/voting.js", "./src/tests/landmark-init.js"];
var scripts = "src/app/**/*.js";
var tests = "src/tests/*.js";
var styles = "src/styles/**/*.css";
var index = "src/public/**/*.html";
var polyfill = "node_modules/babelify/node_modules/babel-core/browser-polyfill.js";

var dist = "dist/";
var distStyles = dist + "assets/css/";
var distJs = dist + "assets/js/";
var distVendor = dist + "vendor/";

gulp.task("styles", function() {
	return gulp.src(styles)
		.pipe(minifycss())
		.pipe(gulp.dest(distStyles))
});

/*
Builds and transforms all scripts
 */
gulp.task("modules", function() {
	
	// set up the browserify instance on a task basis
	var b = browserify({
		entries: entries,
		debug: true,
		transform: [babelify]
	});

	return b.bundle()
		.pipe(source('slacjs-app.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps: true}))
		// Add transformation tasks to the pipeline here.
		//.pipe(uglify())
		.on('error', gutil.log)
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(distJs));
});

/*
Performs lint on all script files
 */
gulp.task("lint", function() {
	return gulp.src(scripts)
		.pipe(cached(scripts))
		.pipe(jshint())
		.pipe(jscs())
		.on('error', function () {})              // don't stop on error 
        .pipe(jscsStylish.combineWithHintResults())   // combine with jshint results 
        .pipe(jshint.reporter(stylish)); 
});

/*
Pack vendor in one js file
 */
gulp.task("vendor", function() {
	return gulp.src(mainBowerFiles())
		.pipe(cached(distVendor))
		.pipe(sourcemaps.init())
		.pipe(concat("vendor.js"))
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest(distVendor));
});

/*
Move the index file to the dist directory
 */
gulp.task("index", function() {
	return gulp.src(index)
		.pipe(changed(dist))
		.pipe(gulp.dest(dist))
});

gulp.task("polyfill", function() {
	return gulp.src(polyfill)
		.pipe(changed(distJs))
		.pipe(gulp.dest(distJs))
})

/*
Clean up dist directory
 */
gulp.task('clean', function(cb) {
	return gulp.src(dist, {read: false})
		.pipe(clean());
});

/*
Reload browser
 */
gulp.task('reload-styles', ['styles'], browserSync.reload);
gulp.task('reload-scripts', ['lint', 'modules'], browserSync.reload);
gulp.task('reload-index', ['index'], browserSync.reload);

/*
Default task running all sub task in the right order
 */
gulp.task('default', ['clean'], function() {
	gulp.start('lint', 'modules', 'vendor', 'polyfill', 'styles', 'index');
});

/*
Test task used by Travis
 */
gulp.task('test', function() {
	return gulp.src(scripts)
		.pipe(cached(scripts))
		.pipe(jshint())
		.pipe(jscs())
});

/*
Watch for changes and rebuild when necessary
 */
gulp.task('serve', ['default'], function() {

	// Watch .css files
	gulp.watch(styles, ['reload-styles']);

	// Watch .js files
	gulp.watch(scripts, ['reload-scripts']);
	gulp.watch(tests, ['reload-scripts']);
	
	gulp.watch(index, ['reload-index']);

	browserSync({
		server: "./dist"
	});
});