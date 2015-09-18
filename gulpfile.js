'use strict';

var gulp = require('gulp'),
useref = require('gulp-useref');


var options = {
  src: 'src',
  dist: 'dist'
}

gulp.task('html',function(){
  var assets = useref.assets();
  gulp.src(options.src + '/index.html')
  .pipe(assets)
  .pipe(assets.restore())
  .pipe(useref())
  .pipe(gulp.dest(options.dist))
});


gulp.task('html', function(){
  var assets = useref.assets()

});

gulp.task('watchFiles',function(){})

gulp.task('serve',['watchFiles']);
