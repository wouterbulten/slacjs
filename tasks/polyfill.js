var config = require('../config');
var changed = require('gulp-changed');

module.exports = function(gulp) {
	return function() {
	    gulp.src(config.dir.src.polyfill)
			.pipe(changed(config.dir.dist.scripts))
			.pipe(gulp.dest(config.dir.dist.scripts));
	};
};