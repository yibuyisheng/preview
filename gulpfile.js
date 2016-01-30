var gulp = require('gulp');
var webserver = require('gulp-webserver');
var sass = require('node-sass');
var autoprefixer = require('autoprefixer');
var postcss = require('postcss');
var gulpSass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var fs = require('fs');

gulp.task('webserver', function () {
    gulp.src('app')
        .pipe(webserver({
            livereload: true,
            directoryListing: true,
            open: true,
            middleware: function (req, res, next) {
                var path = getPathFromRequest(req);
                if (/\.scss$/.test(path)) {
                    compileSass(path)
                        // .then(function (result) {
                        //     var cleaner  = postcss([autoprefixer({cascade: false, browsers: ['last 2 versions']})]);
                        //     return cleaner.process(result.css);
                        // })
                        // .then(function (cleaned) {
                        //     var prefixer = postcss([autoprefixer]);
                        //     return prefixer.process(cleaned.css);
                        // })
                        .then(function (result) {
                            res.end(result.css);
                        })
                        .catch(function (err) {
                            res.end(err.stack);
                        });
                }
                else if (path.indexOf('/src/list.html') + 1) {
                    res.end(require('fs').readFileSync(path));
                }
                else {
                    next();
                }
            }
        }));
});

gulp.task('sass', function () {
    gulp.src('./src/sass/**/*.scss')
        .pipe(gulpSass().on('error', gulpSass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('./dist/css'));
});

gulp.task('html', function () {
    var content = fs.readFileSync('./src/list.html').toString();
    fs.writeFileSync('./dist/list.html', content.replace(
        'href="./sass/list.scss"', 'href="./css/list.css"'
    ));
});

gulp.task('dist', ['sass', 'html']);
gulp.task('dev', ['webserver']);

function getPathFromRequest(req) {
    var url = require('url').parse(req.url);
    return require('path').resolve(__dirname, './' + url.pathname);
}

function compileSass(path) {
    return new Promise(function (resolve, reject) {
        sass.render({
            file: path
        }, function (err, result) {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
}
