/*!
 * Bootstrap's Gruntfile
 * http://getbootstrap.com
 * Copyright 2013-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */
module.exports = function(grunt) {
	'use strict';

	// Force use of Unix newlines
	grunt.util.linefeed = '\n';

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			hapj: {
				src: [
			      'src/hapj.js',
			      'src/ui/hapj.ajaxable.js',
			      'src/ui/hapj.floatable.js',
			      'src/ui/hapj.menuable.js',
			      'src/ui/hapj.switchable.js',
			      'src/ui/hapj.selectable.js',
			      'src/ui/hapj.lazyload.js',
			      'src/ui/hapj.suggestable.js',
			      'src/ui/hapj.verifiable.js',
			      'src/ui/hapj.calendar.js'
				],
				dest: 'dist/<%= pkg.name %>.js'
			}
		},
		jsdoc: {
			hapj: {
				src: '<%= concat.hapj.src %>',
				options: {
					destination: 'docs',
					template: 'templates/default'
				}
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: '<%= concat.hapj.dest %>',
				dest: 'dist/<%= pkg.name %>.min.js'
			}
		},
		// Task configuration.
	    clean: {
	      dist: [
	        'dist',
	        'docs'
	      ]
	    },
	    jshint: {
	        options: {
	          jshintrc: 'src/.jshintrc'
	        },
	        grunt: {
	          options: {
	            jshintrc: 'grunt/.jshintrc'
	          },
	          src: ['Gruntfile.js', 'grunt/*.js']
	        },
	        md5: {
	          src:['src/lib/hapj.md5.js', 'src/test.js'],
	          options: {
	        	  jshintrc: 'src/lib/.jshintrc'
	          }
	        },
	        core: {
	          src: '<%= concat.hapj.src %>'
	        },
	        sample: {
	        	options: {
	        		jshintrc: 'examples/.jshintrc'
	        	},
	        	src: 'examples/js/*.js'
	        },
	        test: {
	          options: {
	            jshintrc: 'src/tests/unit/.jshintrc'
	          },
	          src: 'src/tests/unit/*.js'
	        },
	        assets: {
	          //src: ['docs/assets/js/src/*.js', 'docs/assets/js/*.js', '!docs/assets/js/*.min.js']
	        }
	      }
	});

	// 加载依赖的插件
	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-clean');

	// 默认被执行的任务列表。
	grunt.registerTask('default', ['clean', 'jshint', 'jsdoc']);
//	grunt.registerTask('uglify', ['concat', 'uglify']);

};
