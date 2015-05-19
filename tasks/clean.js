var del = require('del');
var config = require('../config');

module.exports = function(gulp) {
	return function() {
		del([config.dir.dist.base + '**/*']);
	};
};