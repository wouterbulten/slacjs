var config = require('../config');
var changed = require('gulp-changed');

module.exports = function(gulp) {
	return function() {
	    return gulp.src(config.dir.src.mobile)
			.pipe(changed(config.dir.mobile.www))
			.pipe(gulp.dest(config.dir.mobile.www));
	};
};