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
	gutil = require('gulp-util');

var reload = browserSync.reload;

var entry = "./src/app/app.js";
var scripts = "src/app/**/*.js";
var styles = "src/styles/**/*.css";
var index = "src/public/index.html";

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
		entries: entry,
		debug: true,
		transform: [babelify]
	});

	return b.bundle()
		.pipe(source('slacjs-app.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps: true}))
		// Add transformation tasks to the pipeline here.
		.pipe(uglify())
		.on('error', gutil.log)
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(distJs));
});

/*
Performs jshint on all script files
 */
gulp.task("jshint", function() {
	return gulp.src(scripts)
		.pipe(changed(scripts))
		.pipe(jshint())
		.pipe(jshint.reporter(stylish));
});

/*
Pack vendor in one js file
 */
gulp.task("vendor", function() {
	return gulp.src(mainBowerFiles())
		.pipe(changed(distVendor))
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

/*
Clean up dist directory
 */
gulp.task('clean', function(cb) {
	return gulp.src(dist, {read: false})
		.pipe(clean());
});

/*
Default task running all sub task in the right order
 */
gulp.task('default', ['clean'], function() {
	gulp.start('jshint', 'modules', 'vendor', 'styles', 'index');
});

/*
Watch for changes and rebuild when necessary
 */
gulp.task('serve', ['default'], function() {

	browserSync({
		server: "./dist"
	});

	// Watch .css files
	gulp.watch(styles, ['styles']);

	// Watch .js files
	gulp.watch(scripts, ['jshint', 'modules']);

	gulp.watch(index, ['index']);

	gulp.watch(['dist/**']).on('change', function() {
		console.log('reload')
	});
});