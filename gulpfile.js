const gulp = require('gulp');
const replace = require('gulp-replace');

gulp.task('compile', function() {
  return gulp.src(['webp-decoder.js'])
    .pipe(replace('export', ''))
    .pipe(gulp.dest('classic'));
});