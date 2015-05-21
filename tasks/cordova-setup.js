var config = require('../config');
var shell = require('gulp-shell');

module.exports = function(gulp) {
	return function() {
		var commands = config.cordova.plugins.map(function(plugin) {
			return 'cordova plugin add ' + plugin;
		});

		commands = commands.concat(config.cordova.platforms.map(function(platform) {
			return 'cordova platform add ' + platform;
		}))

		var dir = process.cwd() + '/' + config.dir.mobile.base;

		return gulp.src('')
			.pipe(shell(commands, {
				cwd: dir
			}));
	};
};