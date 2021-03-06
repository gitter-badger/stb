/**
 * Analyse JavaScript code for potential errors and problems.
 *
 * @author Stanislav Kalashnik <sk@infomir.eu>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var gulp    = require('gulp'),
	plumber = require('gulp-plumber'),
	//jshint  = require('gulp-jshint'),
	eslint  = require('gulp-eslint');


gulp.task('lint', function () {
	//return gulp
	//	.src('./app/js/**/*.js')
	//	.pipe(plumber())
	//	.pipe(jshint())
	//	.pipe(jshint.reporter('default'));

	return gulp
		.src('./app/js/**/*.js')
		.pipe(plumber())
		//.pipe(eslint(require(process.env.CWD + '/.eslintrc.json')))
		.pipe(eslint())
		.pipe(eslint.format());
});
