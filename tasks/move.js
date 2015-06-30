var config = require('../config');
var changed = require('gulp-changed');

module.exports = function(gulp, src, dest) {
	return function() {
	    return gulp.src(src)
			.pipe(gulp.dest(dest));
	};
};
