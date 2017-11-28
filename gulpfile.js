/**
 * @author dancdx
 * @date 2017-11-28
 * @desc gulp构建脚本
 */
const gulp = require('gulp')
const connect = require('gulp-connect')
const fileinclude = require('gulp-file-include')
const uglify = require('gulp-uglify')
const clean = require('gulp-clean')
const sass = require('gulp-sass')
const cleanCSS = require('gulp-clean-css')
const autoprefixer = require('gulp-autoprefixer')
const sourcemaps = require('gulp-sourcemaps')
const htmlmin = require('gulp-htmlmin')
const imagemin = require('gulp-imagemin')
const gulpSequence = require('gulp-sequence')
const babel = require('gulp-babel')
const rev = require('gulp-rev')
const revCollector = require('gulp-rev-collector')
const replace = require('gulp-replace')

// 图片资源地址
const imgDomain = ''

// 静态资源目录
// const staticDir = '/home-static'

// let staticDomain = devDomain + staticDir

// let about = '/about'
// let mabout = '/mabout'
// let mindex = '/mindex'


// const type = process.argv[4] || 'dev'
// switch (type) {
//   case 'test': staticDomain = testDomain + staticDir; domain = testDomain; break
//   case 'check': staticDomain = checkDomain + staticDir; domain = checkDomain; break
//   case 'release': staticDomain = releaseDomain + staticDir; domain = releaseDomain; break
//   // default:
//   //   about = '/about.html'
//   //   mabout = '/mabout.html'
//   //   mindex = '/mindex.html'
// }

// about += domain
// mabout += domain
// mindex += domain

const staticDomain = 'home-static'

const domain = ''


// 本地服务
gulp.task('server', () => {
  connect.server({
    name: 'development',
    port: 8001,
    root: '.tmp',
    livereload: true
  })
})

// 发布后预览服务
gulp.task('server-release', () => {
  connect.server({
    name: 'production',
    port: 8000,
    root: 'dist',
    livereload: true
  })
})

// 清除任务
gulp.task('clean', () => {
  return gulp.src(['./.tmp', './dist'])
    .pipe(clean({force: true}))
})

// html处理
gulp.task('html', () => {
  return gulp.src(['./src/**/*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(replace('{{imgDomain}}', imgDomain))
    .pipe(replace('{{staticDomain}}', staticDomain))
    .pipe(replace('{{domain}}', domain))
    .pipe(gulp.dest('./.tmp'))
    .pipe(connect.reload())
})

// html 发布处理
gulp.task('html-release', () => {
  return gulp.src(['./.tmp/**/*.json', './src/*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(replace('{{imgDomain}}', imgDomain))
    .pipe(replace('{{staticDomain}}', staticDomain))
    .pipe(replace('{{domain}}', domain))
    .pipe(revCollector())
    // .pipe(htmlmin({
    //   removeComments: true,  //清除HTML注释
    //   collapseWhitespace: true,  //压缩HTML
    //   collapseBooleanAttributes: true,  //省略布尔属性的值 <input checked="true"/> ==> <input checked />
    //   removeEmptyAttributes: true,  //删除所有空格作属性值 <input id="" /> ==> <input />
    //   removeScriptTypeAttributes: true,  //删除<script>的type="text/javascript"
    //   removeStyleLinkTypeAttributes: true,  //删除<style>和<link>的type="text/css"
    //   minifyJS: true,  //压缩页面JS
    //   minifyCSS: true  //压缩页面CSS
    // }))
    .pipe(gulp.dest('./dist'))
})

// sass 处理
gulp.task('sass', () => {
  return gulp.src(['./src/home-static/styles/*.scss', './src/home-static/styles/*.css'])
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(replace('{{imgDomain}}', imgDomain))
    .pipe(gulp.dest('./.tmp/home-static/styles'))
    .pipe(connect.reload())
})

// sass 发布处理
gulp.task('sass-release', () => {
  return gulp.src(['./src/home-static/styles/*.scss', './src/home-static/styles/*.css'])
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.init())
    .pipe(autoprefixer())
    .pipe(cleanCSS({compatibility: 'ie11'}))
    .pipe(sourcemaps.write())
    .pipe(rev())
    .pipe(replace('{{imgDomain}}', imgDomain))
    .pipe(gulp.dest('./dist/home-static/styles'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('./.tmp/rev-style'))
})

// js处理
gulp.task('js', () => {
  return gulp.src('./src/home-static/js/*.js')
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(replace('{{imgDomain}}', imgDomain))
    .pipe(gulp.dest('./.tmp/home-static/js'))
    .pipe(connect.reload())
})

// js 发布处理
gulp.task('js-release', () => {
  return gulp.src('./src/home-static/js/*.js')
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(uglify())
    .pipe(rev())
    .pipe(replace('{{imgDomain}}', imgDomain))
    .pipe(gulp.dest('./dist/home-static/js'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('./.tmp/rev-js'))
})

// 开发时copy img
gulp.task('img', () => {
  return gulp.src(['./src/home-static/images/*.*'])
    .pipe(gulp.dest('./.tmp/home-static/images'))
    .pipe(connect.reload())
})

// img release
gulp.task('img-release', () => {
  return gulp.src(['./src/home-static/images/*.*'])
    // .pipe(imagemin({ progressive: true }))
    .pipe(gulp.dest('./dist/home-static/images'))
})

// 监听文件变化
gulp.task('watch', () => {
  gulp.watch(['./src/**/*.html'], ['html'])
  gulp.watch(['./src/home-static/styles/*.scss', './src/home-static/styles/*.css'], ['sass'])
  gulp.watch(['./src/home-static/js/*.js'], ['js'])
  gulp.watch(['./src/home-static/images/*.*'], ['img'])
})

// 开发默认任务 执行 gulp start
gulp.task('start', gulpSequence('clean', 'server', 'html', 'sass', 'js', 'img', 'watch'))

// 发布指令 gulp release
gulp.task('release', gulpSequence('clean', 'server-release', 'sass-release', 'js-release', 'img-release', 'html-release'))

// 发布指令 gulp release
gulp.task('build', gulpSequence('clean', 'sass-release', 'js-release', 'html-release'))

// 参考
// https://github.com/avevlad/gulp-connect
// https://github.com/coderhaoxin/gulp-file-include
// https://www.npmjs.com/package/gulp-clean
// https://www.npmjs.com/package/gulp-clean-css