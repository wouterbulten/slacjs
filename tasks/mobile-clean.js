var del = require('del');
var config = require('../config');

module.exports = function(gulp) {
	return function() {

		var dirs = ['plugins', 'platforms', 'hooks', 'www'];

		del(dirs.map(function(dir) { return config.dir.mobile.base + dir; }));
	};
};	