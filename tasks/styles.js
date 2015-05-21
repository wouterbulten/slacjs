var config = require('../config');
var minify = require('gulp-minify-css');

module.exports = function (gulp) {
    return function () {
        return gulp.src(config.dir.src.styles)
            .pipe(minify())
            .pipe(gulp.dest(config.dir.dist.styles));
    };
};