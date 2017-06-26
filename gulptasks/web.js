'use strict';

(function () {

  module.exports = {
    init: RegisterTasks
  };

  function RegisterTasks(gulp) {

    var config = require('./web.config'),
      del = require('del'),
      zip = require('gulp-zip'),
      runSequence = require('run-sequence');

    gulp.task('web.clean', function () {
      return del([
        config.target.folders.dev,
        config.target.folders.zip
      ]);
    });

    gulp.task('web.copy.app', function () {
      return gulp.src(config.source.folders.app + '/**/*')
        .pipe(gulp.dest(config.target.folders.dev));
    });

    gulp.task('web.copy.assets', function () {
      return gulp.src(config.source.folders.assets, { "base": 'src' })
        .pipe(gulp.dest(config.target.folders.dev));
    });

    gulp.task('web.zip', function () {
      return gulp.src(config.source.folders.app + '/**/*')
        .pipe(zip('DocMLWebApp.zip'))
        .pipe(gulp.dest(config.target.folders.zip));
    });

    gulp.task('web', function (done) {
      return runSequence(
        'web.clean',
        'web.copy.app',
        'web.copy.assets',
        'web.zip',
        done
      );
    });
  }
})();
