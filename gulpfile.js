var gulp = require('gulp'),
    sequence = require('run-sequence'),
    uglify = require('gulp-uglify'),
    cleanCSS = require('gulp-clean-css'),
    htmlMin = require('gulp-html-minifier');


gulp.task('default', function () {
    console.log('go ==>');
    sequence(['minify-js', 'minify-tmpl', 'minify-css']);
});

gulp.task('minify-js', function () {
    gulp.src('dao/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('minify-tmpl', function () {
    gulp.src('dao/tmpl/*.html')
        .pipe(htmlMin({
            collapseWhitespace: true,
            removeComments: true,
            ignoreCustomFragments: [/\{\{\?[\s\S]*?\}\}/],
            // trimCustomFragments: true
        }))
        .pipe(gulp.dest('dist/tmpl'));
});

gulp.task('minify-css', function () {
    gulp.src('dao/css/*.css')
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(gulp.dest('dist/css'));
});

// gulp.task('watch', function(){
//     gulp.watch('dao/tmpl/*.html',['minify-tmpl']);
// });