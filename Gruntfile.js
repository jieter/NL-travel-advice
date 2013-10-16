module.exports = function (grunt) {
	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			files: ['*.js', 'tasks/*.js', 'map/*.js'],
			options: {
				jshintrc: '.jshintrc'
			}
		},
		connect: {
			server: {
				options: {
					port: 9999,
					open: 'http://localhost:9999/map/',
					base: '.'
				}
			}
		},
		watch: {
			data: {
				files: ['data/*'],
				options: {
					livereload: true
				}
			},
			js: {
				files: [
					'.jshintrc',
					'*.js'
				],
				tasks: ['jshint'],
				options: {
					livereload: true
				}
			}
		},
		'world-atlas': {
			options: {
				'target': 'world-50m-topo.json',
				'dest': 'data/world-50m-topo.json'
			},
		}
	});

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.loadTasks('tasks/grunt-world-atlas.js');

	grunt.registerTask('dev', [
		'jshint',
		'connect:server',
		'watch'
	]);
	grunt.registerTask('default', ['dev']);
};