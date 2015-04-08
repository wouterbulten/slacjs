var gulp = require("gulp"),
	sourcemaps = require("gulp-sourcemaps"),
	babel = require("gulp-babel"),
	concat = require("gulp-concat"),
	changed = require('gulp-changed'),
	uglify = require('gulp-uglify'),
	jshint = require('gulp-jshint'),
	minifycss = require('gulp-minify-css'),
	stylish = require('jshint-stylish'),
	browserSync = require('browser-sync')
	filter = require('gulp-filter'),
	clean = require('gulp-clean')
	mainBowerFiles = require('main-bower-files');

var reload = browserSync.reload;

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

gulp.task("scripts", function () {
	return gulp.src(scripts)
		.pipe(changed(distJs))
		.pipe(jshint())
		.pipe(jshint.reporter(stylish))
		.pipe(sourcemaps.write("."))
		.pipe(babel())
		.pipe(sourcemaps.init())
		.pipe(concat("slacjs-app.js"))
		//.pipe(uglify())
		.pipe(gulp.dest(distJs))
		//Prevent sourcemaps interfering with BS
});

gulp.task("vendor", function() {
	return gulp.src(mainBowerFiles())
		.pipe(changed(distVendor))
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest(distVendor));
});

gulp.task("index", function() {
	return gulp.src(index)
		.pipe(changed(dist))
		.pipe(gulp.dest(dist))
});

gulp.task('clean', function(cb) {
    return gulp.src(dist, {read: false})
        .pipe(clean());
});

gulp.task('default', ['clean'], function() {
    gulp.start('scripts', 'vendor', 'styles', 'index');
});

gulp.task('serve', ['default'], function() {

	browserSync({
		server: "./dist"
	});

	// Watch .css files
	gulp.watch(styles, ['styles']);

	// Watch .js files
	gulp.watch(scripts, ['scripts']);

	gulp.watch(index, ['index']);

	gulp.watch(['dist/**']).on('change', reload);
});