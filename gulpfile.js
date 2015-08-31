'use strict';
// GULP here just enable browsersync

// w/watch function now... and it works!!!!!
var gulp         = require('gulp');
var browserSync  = require('browser-sync');
var reload       = browserSync.reload;


// Static Server + watching scss/html files
gulp.task('serve', function() {

    browserSync({
        proxy: "0.0.0.0:4000/speak"
    });

    gulp.watch("_site/*.css").on('change', reload);
    gulp.watch("_site/*.html").on('change', reload);
});


gulp.task('default', ['serve']);

