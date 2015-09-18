'use strict';


module.exports = function (grunt) {

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);



    grunt.initConfig({
        //run the grunt server
       	express: {
       		all: {
       			options: {
       				port: 9000,
       				hostname: "0.0.0.0",
       				bases: ['app'],
       				livereload: true,
              		debug: true
       			}
       		}
       	}

       	//open the browser
       	,open: {
       		all: {
       			path: 'http://localhost:<%= express.all.options.port%>',
            app: 'Google Chrome'
       		}
       	}

        ,clean: {
            options: { force: true },
            dist: ['.tmp','html/public/dist/**'],
            server: '.tmp',
            mainjs : '<%= env.dist %>/main.js'
        }

       	// grunt-watch will monitor the projects files
       	,watch: {
       		options: {
       		livereload: true,
              reload: true,
              livereloadOnError: false,
              spawn: false
       		},
          gruntfile: {
            files: ['Gruntfile.js']
          },
       		html: {
       			files: ['app/*.html']
       		},
       		javascript: {
       			files: ['app/js/**/*.js']
       		},
       		css: {
       			files: 'app/css/*.css'
       		}
       	}


    });





    //Grunt Tasks
    grunt.registerTask('server',[
    	'express',
    	'open',
    	'watch'
    ]);


  //});

};
