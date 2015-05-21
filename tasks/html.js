var config = require('../config');
var changed = require('gulp-changed');

module.exports = function(gulp) {
	return function() {
	    return gulp.src(config.dir.src.html)
			.pipe(changed(config.dir.dist.public))
			.pipe(gulp.dest(config.dir.dist.public));
	};
};