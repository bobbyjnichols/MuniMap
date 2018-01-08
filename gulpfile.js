'use strict';
// -----[ Modules ]-------------------------------------------------------------
const fs = require('fs');
const os = require('os');

const gulp = require('gulp');
const clean = require('gulp-clean');
const minimist = require('minimist');
const merge = require('merge-stream');
const streamqueue = require('streamqueue');
const connect = require('gulp-connect');
const sequence = require('run-sequence');

const concat = require('gulp-concat');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const ngConstant = require('gulp-ng-constant');

const sass = require('gulp-sass');
const cssmin = require('gulp-cssmin');
const noCssComments = require('gulp-strip-css-comments');

const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const flexbugs = require('postcss-flexbugs-fixes');

const jshint = require('gulp-jshint');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');

// -----[ Files ]---------------------------------------------------------------
const js = [
  'node_modules/angular/angular.js',
  'node_modules/angular-resource/angular-resource.js',
  'node_modules/@uirouter/angularjs/release/angular-ui-router.js'
  // 'node_modules/d3/build/d3.js',
  // 'node_modules/d3-array/build/d3-array.js',
  // 'node_modules/d3-axis/build/d3-axis.js',
  // 'node_modules/d3-brush/build/d3-brush.js',
  // 'node_modules/d3-chord/build/d3-chord.js',
  // 'node_modules/d3-collection/build/d3-collection.js',
  // 'node_modules/d3-color/build/d3-color.js',
  // 'node_modules/d3-dispatch/build/d3-dispatch.js',
  // 'node_modules/d3-drag/build/d3-drag.js',
  // 'node_modules/d3-dsv/build/d3-dsv.js',
  // 'node_modules/d3-ease/build/d3-ease.js',
  // 'node_modules/d3-force/build/d3-force.js',
  // 'node_modules/d3-format/build/d3-format.js',
  // 'node_modules/d3-geo/build/d3-geo.js',
  // 'node_modules/d3-hierarchy/build/d3-hierarchy.js',
  // 'node_modules/d3-interpolate/build/d3-interpolate.js',
  // 'node_modules/d3-path/build/d3-path.js',
  // 'node_modules/d3-polygon/build/d3-polygon.js',
  // 'node_modules/d3-quadtree/build/d3-quadtree.js',
  // 'node_modules/d3-queue/build/d3-queue.js',
  // 'node_modules/d3-random/build/d3-random.js',
  // 'node_modules/d3-request/build/d3-request.js',
  // 'node_modules/d3-scale/build/d3-scale.js',
  // 'node_modules/d3-selection/build/d3-selection.js',
  // 'node_modules/d3-shape/build/d3-shape.js',
  // 'node_modules/d3-time/build/d3-time.js',
  // 'node_modules/d3-time-format/build/d3-time-format.js',
  // 'node_modules/d3-timer/build/d3-timer.js',
  // 'node_modules/d3-transition/build/d3-transition.js',
  // 'node_modules/d3-voronoi/build/d3-voronoi.js',
  // 'node_modules/d3-zoom/build/d3-zoom.js'
];
const css = [];
const fonts = [
  'src/assets/fonts/Menlo-Regular.woff'
];


// -----[ IP Address ]----------------------------------------------------------
let ifaces = os.networkInterfaces();
let ipAddress = undefined;

Object.keys(ifaces).forEach(function (ifname) {
  let alias = 0;
  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      return;
    }
    if (alias < 1) {
      if (ifname.startsWith('en')) {
        if (iface.address.startsWith('192.168.')) {
          ipAddress = iface.address;
        }
      }
    }
    ++alias;
  });
});

// -----[ JSON Files ]----------------------------------------------------------
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

// -----[ Constants ]-----------------------------------------------------------
const constDebug = {
  version: 'v' + pkg.version,
  baseUrl: 'http://localhost:9019',
  apiServer: 'http://' + (ipAddress || '127.0.0.1') + ':8081',
  debug: true,
  get resourceUrlWhitelist() {
    return [
      'self',
      'http://webservices.nextbus.com/service/**',
      this.apiServer + '/**',
      this.baseUrl + '/**',
    ];
  }
};

// -----[ Options ]-------------------------------------------------------------
const knownOptions = {
  string: 'name',
  default: {
    name: process.env.NODE_ENV || 'template'
  }
};

const options = minimist(process.argv.slice(2), knownOptions);

// -----[ Tasks ]---------------------------------------------------------------

// -----[ Connect Task ]------------
gulp.task('connect', function () {
  return connect.server({
    root: 'target',
    port: 9019,
    livereload: true
  });
});

// -----[ HTML Task ]----------------
gulp.task('html', function () {
  return gulp.src(['src/app/**/*.html'])
    .pipe(gulp.dest('target/html/'));
});

gulp.task('html:reload', function () {
  return gulp.src(['src/app/**/*.html'])
    .pipe(gulp.dest('target/html/'))
    .pipe(connect.reload());
});

// -----[ Scripts Tasks ]-------------
gulp.task('scripts', function () {
  const downloadStream = gulp.src(js)
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(concat('scripts-A.js'));

  const customStream = gulp.src(['src/app.js', 'src/app/**/*.js', '!src/app/**/*[Ss]pec.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ["es2015"]
    }))
    .pipe(concat('scripts-B.js'));

  return streamqueue({ objectMode: true }, downloadStream, customStream)
    .pipe(concat('scripts.js'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('target/js/'))
    .pipe(connect.reload());
});

gulp.task('scripts:uglify', function () {
  const downloadStream = gulp.src(js)
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(concat('scripts-A.js'));

  const customStream = gulp.src(['src/app.js', 'src/app/**/*.js', '!src/app/**/*[Ss]pec.js'])
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ["es2015"]
    }))
    .pipe(concat('scripts-B.js'));

  return merge(downloadStream, customStream)
    .pipe(concat('scripts.min.js'))
    .pipe(uglify({
      mangle: false
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('target/js/'));
});

// -----[ Style Tasks ]---------------
gulp.task('style', function () {
  const plugins = [
    flexbugs,
    autoprefixer({browsers: ['> 1%','Last 2 versions','IE 10','IE 11','not IE 9']})
  ];

  const sassStream = gulp.src(['src/app.sass', 'src/app/**/*.sass'])
    .pipe(concat('style.sass'))
    .pipe(sass())
    .pipe(postcss(plugins));

  const cssStream = gulp.src(css)
    .pipe(sourcemaps.init());

  return merge(cssStream, sassStream)
    .pipe(concat('style.css'))
    .pipe(noCssComments({preserve: false}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('target/css/'));
});

gulp.task('style:min', function () {
  const plugins = [
    flexbugs,
    autoprefixer({browsers: ['> 1%','Last 2 versions','IE 10','IE 11','not IE 9']})
  ];

  const sassStream = gulp.src(['src/app.sass', 'src/app/**/*.sass'])
    .pipe(concat('style.sass'))
    .pipe(sass())
    .pipe(postcss(plugins));

  const cssStream = gulp.src(css);

  return merge(cssStream, sassStream)
    .pipe(noCssComments({preserve: false}))
    .pipe(concat('style.min.css'))
    .pipe(cssmin())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('target/css/'));
});

gulp.task('style:reload', ['style'], function () {
  return gulp.src('src/index.html')
    .pipe(connect.reload());
});

gulp.task('fonts', function () {
  gulp.src(fonts)
    .pipe(gulp.dest('target/css/'));
});

// -----[ Watch Task ]---------------
gulp.task('watch', function () {
  gulp.watch(['src/index.html'], ['index:reload']);
  gulp.watch(['src/app/**/*.html'], ['html:reload']);
  gulp.watch(['src/app.js', 'src/app/**/*.js'], ['scripts']);
  gulp.watch('src/assets/js/compatibility/*', ['compatibility']);
  gulp.watch(['src/app.sass', 'src/app/**/*.sass'], ['style', 'style:reload']);
});

// -----[ Copy Tasks ]----------------
gulp.task('copy:assets', function () {
  return gulp.src(['src/assets/images*/**/*', 'src/assets/favicons*/**/*', 'src/assets/data*/**/*'])
    .pipe(gulp.dest('target/'));
});


// -----[ Index Task ]------------------
gulp.task('index', function () {
  return gulp.src('src/index.html')
    .pipe(replace(/style(\.min)?\.css(\?version=[0-9A-z.]+)?/, 'style.css?version=' + pkg.version))
    .pipe(replace(/scripts(\.min)?\.js(\?version=[0-9A-z.]+)?/, 'scripts.js?version=' + pkg.version))
    .pipe(replace(/compatibility(\.min)?\.js(\?version=[0-9A-z.]+)?/, 'compatibility.js?version=' + pkg.version))
    .pipe(gulp.dest('target/'));
});

gulp.task('index:reload', function () {
  return gulp.src('src/index.html')
    .pipe(replace(/style(\.min)?\.css(\?version=[0-9A-z.]+)?/, 'style.css?version=' + pkg.version))
    .pipe(replace(/scripts(\.min)?\.js(\?version=[0-9A-z.]+)?/, 'scripts.js?version=' + pkg.version))
    .pipe(replace(/compatibility(\.min)?\.js(\?version=[0-9A-z.]+)?/, 'compatibility.js?version=' + pkg.version))
    .pipe(gulp.dest('target/'))
    .pipe(connect.reload());
});


gulp.task('index:min', function () {
  return gulp.src('src/index.html')
    .pipe(replace(/style(\.min)?\.css(\?version=[0-9A-z.]+)?/, 'style.min.css?version=' + pkg.version))
    .pipe(replace(/scripts(\.min)?\.js(\?version=[0-9A-z.]+)?/, 'scripts.min.js?version=' + pkg.version))
    .pipe(replace(/compatibility(\.min)?\.js(\?version=[0-9A-z.]+)?/, 'compatibility.min.js?version=' + pkg.version))
    .pipe(gulp.dest('target/'));
});

// -----[ Constants Tasks ]--------------
gulp.task('constants:debug', function () {
  return constants(constDebug);
});

// -----[ Functional Tasks ]----------------------------------------------------
function constants(config) {
  return gulp.src('src/assets/constants.json')
    .pipe(ngConstant({
      dest: 'conStore.js',
      name: 'config',
      noFile: true,
      constants: {
        ConStore: config
      },
      wrap: '(function() {\n\'use strict\';\n\n<%= __ngModule %>})();'
    }))
    .pipe(gulp.dest('src/app/constants/'));
}

function template(from, to) {
  return gulp.src('src/assets/template/' + from)
    .pipe(rename(to))
    .pipe(replace(/\*\*name\*\*/g, options.name.lowerFirstLetter()))
    .pipe(replace(/\*\*Name\*\*/g, options.name.upperFirstLetter()))
    .pipe(gulp.dest('src/app/modules/' + options.name + '/'));
}

// -----[ Helper Functions ]----------------------------------------------------
String.prototype.upperFirstLetter = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.lowerFirstLetter = function () {
  return this.charAt(0).toLowerCase() + this.slice(1);
};

// -----[ User Tasks ]----------------------------------------------------------
gulp.task('clean', ['clean:debug', 'clean:target']);

gulp.task('debug', function (callback) {
  sequence(
    'constants:debug',
    ['index', 'scripts', 'style', 'fonts', 'copy:assets', 'html'],
    'connect',
    'watch',
    callback
  );
});

gulp.task('default', ['debug']);
