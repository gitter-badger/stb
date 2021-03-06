/**
 * Compile all Less files into a set of css files with maps.
 *
 * @author Stanislav Kalashnik <sk@infomir.eu>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

//TODO: fix source maps
//TODO: rework metrics processing

var gulp     = require('gulp'),
	fs       = require('fs'),
	gutil    = require('gulp-util'),
	requirem = require('requirem'),
	cfgBase  = process.env.STB + '/config/metrics.js',
	cfgUser  = process.env.CWD + '/config/metrics.js',
	title    = 'less:',


	// main less options
	defaults = {
		develop: {
			relativeUrls     : true,
			paths            : ['.'],
			rootpath         : './build/develop/',
			outpath          : './build/develop/css/',
			filename         : process.env.STB + '/app/less/develop.less',
			compress         : false,
			cleancss         : false,
			ieCompat         : false,
			sourceMap        : true,
			outputSourceFiles: true,
			sourceMapBasepath: 'build',
			sourceMapRootpath: '.'
		},
		release: {
			relativeUrls: true,
			paths       : ['.'],
			rootpath    : './build/release/',
			outpath     : './build/release/css/',
			filename    : process.env.STB + '/app/less/main.less',
			compress    : true,
			cleancss    : true,
			ieCompat    : false,
			sourceMap   : false
		}
	},
	// config for all modes
	// with all dimensions
	options = {};


function prepare () {
	// prepare options sets for all dimensions
	Object.keys(defaults).forEach(function ( mode ) {
		var metrics = requirem(fs.existsSync(cfgUser) ? cfgUser : cfgBase, {reload: true});

		options[mode] = {};

		Object.keys(metrics).forEach(function ( height ) {
			var conf = options[mode][height] = Object.create(defaults[mode]),
				vars = conf.globalVars = metrics[height];

			// safe zone dimension
			// base dimension minus safe zone margins
			vars.availHeight = vars.height - vars.availTop  - vars.availBottom;
			vars.availWidth  = vars.width  - vars.availLeft - vars.availRight;

			conf.cssFile = conf.outpath + height + '.css';

			if ( conf.sourceMap ) {
				// more preparations
				conf.sourceMapFile  = conf.outpath + height + '.map';
				conf.sourceMapURL   = height + '.map';
				conf.writeSourceMap = function ( map ) {
					fs.writeFileSync(conf.sourceMapFile, map, {encoding:'utf8'});
					gutil.log(title, '\t' + map.length + '\t' + conf.sourceMapFile.replace(/\//g, gutil.colors.grey('/')));
				};
			}
		});
	});
}


/**
 * Generate css files for all dimensions for the given mode.
 *
 * @param {string} mode one of task modes: "develop" or "release"
 * @param {Function} done callback to indicate task finishing
 */
function build ( mode, done ) {
	var less = require('less'),
		data = fs.readFileSync(defaults[mode].filename, {encoding:'utf8'}),
		keys = Object.keys(options[mode]),
		tick = 0;

	gutil.log(title, gutil.colors.grey('\tSize\tName'));

	// dimensions
	keys.forEach(function ( height ) {
		var varsFileBase = process.env.STB + '/app/less/vars/' + height + '.js',
			varsFileUser = process.env.CWD + '/app/less/vars/' + height + '.js',
			vars, name;

		// base
		vars = requirem(varsFileBase, {reload: true});
		// extend with less vars
		for ( name in vars ) {
			if ( vars.hasOwnProperty(name) ) {
				options[mode][height].globalVars[name] = vars[name];
			}
		}

		// user
		vars = requirem(varsFileUser, {reload: true});
		// extend with less vars
		for ( name in vars ) {
			if ( vars.hasOwnProperty(name) ) {
				options[mode][height].globalVars[name] = vars[name];
			}
		}

		less.render(data, options[mode][height], function ( error, data ) {
			var file = options[mode][height].cssFile;

			if ( error ) {
				gutil.log(title, '\t0\t' + gutil.colors.red(file) + '\t(' + error.message + ' in ' + error.filename + ' ' + error.line + ':' + error.column + ')');
			} else {
				fs.writeFileSync(file, data.css, {encoding:'utf8'});
				gutil.log(title, '\t' + data.css.length + '\t' + file.replace(/\//g, gutil.colors.grey('/')));
			}

			tick++;
			// notify gulp
			if ( tick === keys.length ) { done(); }
		});
	});
}


gulp.task('less:develop', function ( done ) {
	prepare();
	build('develop', done);
});


gulp.task('less:release', function ( done ) {
	prepare();
	build('release', done);
});


gulp.task('less', ['less:develop', 'less:release']);
