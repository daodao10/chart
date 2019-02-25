const { src, dest, series } = require("gulp");
const uglify = require("gulp-uglify"),
  cleanCSS = require("gulp-clean-css"),
  htmlMin = require("gulp-html-minifier");

function clean() {
  // do some clean...
  console.log("go ==>");
  return Promise.resolve("...");
}

function minifyJs() {
  return src("dao/*.js")
    .pipe(uglify())
    .pipe(dest("dist"));
}

function minifyTmpl() {
  return src("dao/tmpl/*.html")
    .pipe(
      htmlMin({
        collapseWhitespace: true,
        removeComments: true,
        ignoreCustomFragments: [/\{\{\?[\s\S]*?\}\}/]
        // trimCustomFragments: true
      })
    )
    .pipe(dest("dist/tmpl"));
}

function minifyCss() {
  return src("dao/css/*.css")
    .pipe(cleanCSS({ compatibility: "ie8" }))
    .pipe(dest("dist/css"));
}

// gulp.task('watch', function(){
//     gulp.watch('dao/tmpl/*.html',['minify-tmpl']);
// });

exports.build = series(clean, minifyJs, minifyTmpl, minifyCss);
exports.default = clean
