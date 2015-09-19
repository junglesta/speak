'use strict';
// code that SPEAKs
// GULP here just enable browsersync
// WHY: K.I.S.S. just serve jekyll on lan 
// HOW: just works... almost everywhere!
// WHAT: BroSync across lan. Let's call it SIP cos u not gulp expressos, lah!
// SCSS?: woory not, let Jekyll handle it.
var gulp         = require('gulp');
var browserSync  = require('browser-sync');
var reload       = browserSync.reload;


// Static Server + watching scss/html files
gulp.task('serve', function() {
  browserSync({
    // • JEKYLL GITHUB USER|ORGANIZATION PAGES (user.github.io)
    // ```jekyll s``` uses "0.0.0.0:4000" so use it 4 brosync too.
    // using jekyll (3.0.0.pre.beta8) w/ Incremental build!
    // proxy: "http://0.0.0.0:4000"

    // • JEKYLL GITHUB PROJECT PAGES (user.github.io/user)
    // ```bundle exec jekyll serve --baseurl ''```
    // uses "0.0.0.0:4000/baseurl" 
    // using jekyll (2.4.0)
    proxy: "0.0.0.0:4000/speak"
  });

  gulp.watch("_site/*.css").on('change', reload);
  gulp.watch("_site/*.html").on('change', reload);
});


gulp.task('default', ['serve']);

// QUICKSTART:
// 0. open 2 terminal windows:
// 1. ```bundle exec jekyll serve --baseurl ''``` to run jekyll (cos this repo uses jekyll 3.0.0.pre.beta8)
// 2. ```gulp``` to process styles + new terminal window
// optional
// A. ```gulp svg``` to clean SVGs...
