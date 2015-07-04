var config = require('../config');
var changed = require('gulp-changed');

module.exports = function(gulp) {
	return function() {
	    return gulp.src(config.dir.src.demo)
			.pipe(changed(config.dir.demo.www))
			.pipe(gulp.dest(config.dir.demo.www));
	};
};
