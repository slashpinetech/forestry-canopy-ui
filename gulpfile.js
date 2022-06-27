const { dest, series, src, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const rimraf = require('rimraf');

// source and destination paths
const docsSrc = './docs/**/*.html';
const docsDest = './_docs/';
const scssSrc = './scss/**/*.scss';
const cssDest = './_docs/css';
const cssDist = './dist/css'
const assetsSrc = './assets/**/*';
const assetsDest = './_docs/assets/';

/**
 * Reloads the running browser sync instance to reflect new changes.
 * @param callback
 */
function reloadTask(callback) {
  browserSync.reload();
  callback();
}

/**
 * Builds CSS from SCSS, minify it and auto-prefix.
 */
function scssTask() {
  const plugins = [
    autoprefixer(),
    cssnano(),
  ];

  return src(scssSrc, { sourcemaps: true })
    .pipe(sass())
    .pipe(postcss(plugins))
    .pipe(dest(cssDest, { sourcemaps: '.' }));
}

/**
 * Initialize browser sync instance and watch for file changes.
 * @param callback
 */
function serveTask(callback) {
  browserSync.init({
    server: {
      baseDir: docsDest,
    },
    notify: false,
  });

  watch(docsSrc, series(docsTask));
  watch(scssSrc, series(scssTask));
  watch(`${docsDest}**/*`, series(reloadTask));
  callback();
}

/**
 * Copies docs to destination.
 */
function docsTask() {
  return src(docsSrc)
    .pipe(dest(docsDest));
}

/**
 * Copies assets to destination.
 */
function assetsTask() {
  return src(assetsSrc)
    .pipe(dest(assetsDest));
}

/**
 * Cleans the docs directory.
 * @param callback
 */
function cleanTask(callback) {
  rimraf(docsDest, callback);
}

exports.default = series(cleanTask, docsTask, assetsTask, scssTask, serveTask);
