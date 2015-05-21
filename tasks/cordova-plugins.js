var config = require('../config');
var shell = require('gulp-shell');

module.exports = function(gulp) {
	return function() {
		var commands = config.cordova.plugins.map(function(plugin) {
			return 'cordova plugin add ' + plugin;
		});

		var dir = process.cwd() + '/' + config.dir.mobile.base;

		return gulp.src('')
			.pipe(shell(commands, {
				cwd: dir
			}));
	};
};