/**
 * Grunt task to run targets of the world-atlas makefile.
 */
'use strict';

var exec = require('child_process').exec;

var path = './node_modules/world-atlas/';

module.exports = function (grunt) {

	var make = function (target, callback) {
		var cmd = 'make ' + (target || '');
		grunt.log.writeln('Running ' + cmd + '...');

		exec(cmd, {
			cwd: path
		}, function (error, stdout, stderr) {
			grunt.verbose.writeln(stdout);
			grunt.log.writeln(stderr);
			grunt.log.ok('`' + cmd + '` done.');
			callback(error);
		});
	};

	grunt.registerTask(
		'world-atlas',
		function (target) {
			var options = this.options({
				target: 'topo/world-50m.json'
			});
			if (target) {
				options.target = target;
			}

			var done = this.async();
			make(options.target, function (error) {

				if (options.dest && options.target !== 'clean') {
					grunt.file.copy(path + options.target, options.dest);
				}
				done(error);
			});
		}
	);

	grunt.registerTask(
		'world-atlas-clean',
		'Remove stuff downloaded by world-atlas task',
		['world-atlas:clean']
	);
};