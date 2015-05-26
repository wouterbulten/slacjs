var config = require('../config');
var changed = require('gulp-changed');

module.exports = function(gulp, dest) {
	return function() {
	    return gulp.src(config.dir.src.polyfill)
			.pipe(changed(dest))
			.pipe(gulp.dest(dest));
	};
};