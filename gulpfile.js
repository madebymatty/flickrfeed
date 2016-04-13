'use strict';

// General
var gulp 		= require('gulp');
var del = require('del');
var glob = require('glob');
var paths = require('./gulp.config.json');
var revReplace = require('gulp-rev-replace');
var filter = require('gulp-filter');
var concat = require('gulp-concat');
var rev = require('gulp-rev');
var dest = require('gulp-dest');
var util = require('gulp-util');
var inject = require('gulp-inject');
var ngAnnotate = require('gulp-ng-annotate');
var bytediff = require('gulp-bytediff');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var minifyCss = require('gulp-minify-css');
var minifyHtml = require('gulp-minify-html');
var jscs = require('gulp-jscs');
var plato = require('plato');
var merge = require('merge-stream');
var angularTemplatecache = require('gulp-angular-templatecache');
var autoprefixer = require('gulp-autoprefixer');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var rename = require('gulp-rename');
var sass 		= require('gulp-sass');

var sassDir = './src/content/scss';
var cssDir = './src/content';

/**
 * Lint the code, create coverage report, and a visualizer
 * @return {Stream}
 */
gulp.task('analyze', function() {
    util.log('Analyzing source with JSHint, and Plato');

    var jshint = analyzejshint([].concat(paths.js, paths.specs, paths.nodejs));

    //startPlatoVisualizer();

    return merge(jshint);
});

/**
 * Create $templateCache from the html templates
 * @return {Stream}
 */
gulp.task('templatecache', function() {
    util.log('Creating an AngularJS $templateCache');

    return gulp
        .src(paths.htmltemplates)
        // .pipe(plug.bytediff.start())
        .pipe(minifyHtml({
            empty: true
        }))
        // .pipe(plug.bytediff.stop(bytediffFormatter))
        .pipe(angularTemplatecache('templates.js', {
            module: 'app.core',
            standalone: false,
            root: 'app/'
        }))
        .pipe(gulp.dest(paths.build));
});

/**
 * Minify and bundle the app's JavaScript
 * @return {Stream}
 */
 gulp.task('js', ['analyze', 'templatecache'], function() {
     util.log('Bundling, minifying, and copying the app\'s JavaScript');

     var source = [].concat(paths.js, paths.build + 'templates.js');
     return gulp
         .src(source)
         // .pipe(plug.sourcemaps.init()) // get screwed up in the file rev process
         .pipe(concat('all.min.js'))
         .pipe(ngAnnotate({
             add: true,
             single_quotes: true
         }))
         .pipe(bytediff.start())
         .pipe(uglify({
             mangle: true
         }))
         .pipe(bytediff.stop(bytediffFormatter))
         // .pipe(plug.sourcemaps.write('./'))
         .pipe(gulp.dest(paths.build));
 });

 /**
 * Copy the Vendor JavaScript
 * @return {Stream}
 */
gulp.task('vendorjs', function() {
    util.log('Bundling, minifying, and copying the Vendor JavaScript');

    return gulp.src(paths.vendorjs)
        .pipe(concat('vendor.min.js'))
        .pipe(bytediff.start())
        .pipe(uglify())
        .pipe(bytediff.stop(bytediffFormatter))
        .pipe(gulp.dest(paths.build));
});


/**
 * Minify and bundle the CSS
 * @return {Stream}
 */
gulp.task('css', function() {
    util.log('Bundling, minifying, and copying the app\'s CSS');

    return gulp.src(paths.css)
        .pipe(concat('all.min.css')) // Before bytediff or after
        .pipe(autoprefixer('last 2 version', '> 5%'))
        .pipe(bytediff.start())
        .pipe(minifyCss({}))
        .pipe(bytediff.stop(bytediffFormatter))
        //        .pipe(plug.concat('all.min.css')) // Before bytediff or after
        .pipe(gulp.dest(paths.build + 'content'));
});

/**
 * Minify and bundle the Vendor CSS
 * @return {Stream}
 */
gulp.task('vendorcss', function() {
    util.log('Compressing, bundling, copying vendor CSS');

    var vendorFilter = filter(['**/*.css']);

    return gulp.src(paths.vendorcss)
        .pipe(vendorFilter)
        .pipe(concat('vendor.min.css'))
        .pipe(bytediff.start())
        .pipe(minifyCss({}))
        .pipe(bytediff.stop(bytediffFormatter))
        .pipe(gulp.dest(paths.build + 'content'));
});

/**
 * Copy fonts
 * @return {Stream}
 */
gulp.task('fonts', function() {
    var dest = paths.build + 'fonts';
    util.log('Copying fonts');
    return gulp
        .src(paths.fonts)
        .pipe(gulp.dest(dest));
});

/**
 * Compress images
 * @return {Stream}
 */
gulp.task('images', function() {
    var dest = paths.build + 'content/images';
    util.log('Compressing, caching, and copying images');
    return gulp
        .src(paths.images)
        .pipe(cache(imagemin({
            optimizationLevel: 3
        })))
        .pipe(gulp.dest(dest));
});


/**
 * Inject all the files into the new index.html
 * rev, but no map
 * @return {Stream}
 */
gulp.task('rev-and-inject', ['js', 'vendorjs', 'css', 'vendorcss'], function() {
  util.log('Rev\'ing files and building index.html');

  var minified = paths.build + '**/*.min.*';
  var index = paths.client + 'index.html';
  var minFilter =filter(['**/*.min.*', '!**/*.map']);
  var indexFilter = filter(['index.html']);

  var jsfiles = gulp.src('./build/all.min.js');
  var cssfiles = gulp.src('./build/content/all.min.css');
  var vendorjsfiles = gulp.src('./build/vendor.min.js', {read: false});
  var vendorcssfiles = gulp.src('./build/content/vendor.min.css', {read: false});
  var stream = gulp
      // Write the revisioned files
      .src([].concat(minified, index)) // add all built min files and index.html
      .pipe(minFilter) // filter the stream to minified css and js
      .pipe(rev()) // create files with rev's
      .pipe(gulp.dest(paths.build)) // write the rev files
      .pipe(minFilter.restore()) // remove filter, back to original stream

  // inject the files into index.html
  .pipe(indexFilter) // filter to index.html
      .pipe(inject(cssfiles))
      .pipe(inject(vendorcssfiles, {name: 'vendorcss'}))
      .pipe(inject(jsfiles))
      .pipe(inject(vendorjsfiles, {name: 'vendorjs'}))
      .pipe(gulp.dest(paths.build)) // write the rev files
  .pipe(indexFilter.restore()) // remove filter, back to original stream

  // replace the files referenced in index.html with the rev'd files
  .pipe(revReplace()) // Substitute in new filenames
  .pipe(gulp.dest(paths.build)) // write the index.html file changes
  .pipe(rev.manifest()) // create the manifest (must happen last or we screw up the injection)
  .pipe(gulp.dest(paths.build)); // write the manifest

});

/**
 * Build the optimized app
 * @return {Stream}
 */
gulp.task('build', ['rev-and-inject', 'images', 'fonts'], function() {
    util.log('Building the optimized app');
});

/**
 * Remove all files from the build folder
 * One way to run clean before all tasks is to run
 * from the cmd line: gulp clean && gulp build
 * @return {Stream}
 */
gulp.task('clean', function(cb) {
    util.log('Cleaning: ' + util.colors.blue(paths.build));

    var delPaths = [].concat(paths.build, paths.report);
    del(delPaths, cb);
});




var sassConfig = {
    includePaths: ['bower_components/foundation/scss'],
    outputStyle: 'expanded',
    errLogToConsole: true
};

// Styles
gulp.task('styles', function () {
    return gulp.src(sassDir + '/*.scss')
        .pipe(sass(sassConfig).on('error', sass.logError))
        .pipe(autoprefixer('> 1%', 'last 3 version'))
        .pipe(minifyCss())
        .pipe(rename('styles.css'))
        .pipe(gulp.dest(cssDir));
});

//gulp.task('default', ['styles']);

gulp.task('default', ['styles'], function () {
  gulp.start('styles', function(err) {
	});
});

gulp.task('watch', ['styles'], function () {
  gulp.watch('./src/content/scss/*.scss', ['styles']);
});



/**
 * Execute JSHint on given source files
 * @param  {Array} sources
 * @param  {String} overrideRcFile
 * @return {Stream}
 */
function analyzejshint(sources, overrideRcFile) {
    var jshintrcFile = overrideRcFile || './.jshintrc';
    util.log('Running JSHint');
    util.log(sources);
    return gulp
        .src(sources)
        .pipe(jshint(jshintrcFile));
}

/**
 * Execute JSCS on given source files
 * @param  {Array} sources
 * @return {Stream}
 */
function analyzejscs(sources) {
    util.log('Running JSCS');
    return gulp
        .src(sources)
        .pipe(jscs('./.jscsrc'));
}


/**
 * Start Plato inspector and visualizer
 */
function startPlatoVisualizer() {
    util.log('Running Plato');

    var files = glob.sync('./src/client/app/**/*.js');
    var excludeFiles = /\/src\/client\/app\/.*\.spec\.js/;

    var options = {
        title: 'Plato Inspections Report',
        exclude: excludeFiles
    };
    var outputDir = './report/plato';

    plato.inspect(files, outputDir, options, platoCompleted);

    function platoCompleted(report) {
        var overview = plato.getOverviewReport(report);
        util.log(overview.summary);
    }
}



/**
 * Formatter for bytediff to display the size changes after processing
 * @param  {Object} data - byte data
 * @return {String}      Difference in bytes, formatted
 */
function bytediffFormatter(data) {
    var difference = (data.savings > 0) ? ' smaller.' : ' larger.';
    return data.fileName + ' went from ' +
        (data.startSize / 1000).toFixed(2) + ' kB to ' + (data.endSize / 1000).toFixed(2) + ' kB' +
        ' and is ' + formatPercent(1 - data.percent, 2) + '%' + difference;
}

/**
 * Format a number as a percentage
 * @param  {Number} num       Number to format as a percent
 * @param  {Number} precision Precision of the decimal
 * @return {String}           Formatted percentage
 */
function formatPercent(num, precision) {
    return (num * 100).toFixed(precision);
}
