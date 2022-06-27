const { dest, series, src, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const rimraf = require('rimraf');
const rename = require('gulp-rename');

// source and destination paths
const docsSrc = './docs/**/*.html';
const docsDest = './_docs/';
const scssSrc = './scss/**/*.scss';
const cssDest = './_docs/css';
const cssDist = './dist/css'
const assetsSrc = './assets/**/*';
const assetsDest = './_docs/assets/';
const componentScssSrc = './scss/components/*.scss';
const coreScssSrc = './scss/canopy-ui.scss';

const scssPlugins = [
  autoprefixer(),
  cssnano(),
];

/**
 * Reloads the running browser sync instance to reflect new changes.
 * @param callback
 */
function reloadTask(callback) {
  browserSync.reload();
  callback();
}

function componentsScssTask() {
  return src(componentScssSrc, { sourcemaps: true })
    .pipe(sass())
    .pipe(postcss(scssPlugins))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(`${cssDest}/components/`, { sourcemaps: '.' }));
}

function coreScssTask() {
  return src(coreScssSrc, { sourcemaps: true })
    .pipe(sass())
    .pipe(postcss(scssPlugins))
    .pipe(rename({ suffix: '.min' }))
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
  watch(scssSrc, series(coreScssTask, componentsScssTask));
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

exports.default = series(cleanTask, docsTask, assetsTask, coreScssTask, componentsScssTask, serveTask);
