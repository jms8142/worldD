'use strict';

var gulp = require('gulp'),
useref = require('gulp-useref'),
gulpif = require('gulp-if'),
uglify = require('gulp-uglify'),
minifyCss = require('gulp-minify-css'),
webserver = require('gulp-webserver');


var options = {
  src: 'src',
  dist: 'dist'
}

gulp.task('html',function(){
  var assets = useref.assets();
  return gulp.src(options.src + '/index.html')
  .pipe(assets)
  .pipe(gulpif('*.css', minifyCss()))
  .pipe(assets.restore())
  .pipe(useref())
  .pipe(gulp.dest(options.dist))
});

gulp.task('webserver', function() {
  gulp.src('dist/')
    .pipe(webserver({
      livereload: true,
    /*  directoryListing: true,*/
      open: true
    }));
});


gulp.task('watchFiles',function(){})


gulp.task('default',['serve']);
gulp.task('serve',['webserver']);
