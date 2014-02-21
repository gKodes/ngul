/*global module, require: true*/
module.exports = function(grunt) {
  'use strict';
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      nu: {
        src : [
          'js/nu.js',
          'js/nu.list.js',
          'js/nu.pb.js',
          'js/nu.switch.js',
          'js/nu.file.chooser.js'
        ],
        dest : 'dist/<%= pkg.name %>.js'
      }
    },
    copy: {
      devjs: {
        expand: true,
        src: 'js/*',
        dest: 'dist/js/'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      nu: {
        src: 'dist/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      options: {
        curly: true,
        immed: true,
        newcap: true,
        noarg: true,
        sub: true,
        boss: true,
        eqnull: true,
        globals: {
          angular: true,
          '$script': true
        }
      },
      code: ['js/*.js'],
      test: ['test/protractor/*.js', 'test/unit/*.js'],
    },
    less: {
      dev: {
        files: {
          'dist/nu.css': 'less/nu.less',
          'dist/mime.fugue.css': 'less/mime.fugue.less'
        }
      },
      dist: {
        options: {
          cleancss: true,
          compress: true
        },
        files: {
          'dist/nu.min.css': 'less/nu.less',
          'dist/mime.fugue.min.css': 'less/mime.fugue.less'
        }
      }
    },
    karma: {
      options: {
        configFile: 'karma.conf.js',
        singleRun: true
      },
      dev : {
        browsers: ['PhantomJS']
      },
      ga : {
        options: {
          files: [
            'deps/angular/angular.js',
            'deps/angular/angular-mocks.js',
            'dist/nu.min.js',
            'test/unit/*.js'
          ],
        },
        browsers: ['PhantomJS', 'Chrome', 'Firefox']
      }
    },
    protractor: {
      ga: {
        options: {
          configFile: 'config/protractor.ga.conf',
        }
      },
      dev: {
        options: {
          configFile: 'config/protractor.dev.conf',
        }
      }
    },
    connect : {
      options: {
        port: 8981,
        base: '.'
      },
      ga: {},
      dev: {
        options: {
          keepalive: true
        }
      }
    }
  });

  // Load the plugin that provides the 'uglify' task.
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-karma');
  // grunt.loadNpmTasks('grunt-conventional-changelog');
  //grunt.loadNpmTasks('grunt-ngdocs');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-protractor-runner');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'localweb', 'protractor:dev']);
  grunt.registerTask('localweb', ['connect:ga', 'selenium']);
  grunt.registerTask('build', ['jshint', 'less', 'concat:nu', 'uglify:nu']);
  grunt.registerTask('test', ['localweb', 'protractor:ga']);
  grunt.registerTask('ga', ['build', 'test']);
  //karma:ga

  grunt.registerTask('selenium', 'Task to initialize selenium-webdriver', function() {
    var selenium = require('selenium-standalone');
    
    var spawnOptions = { stdio: 'pipe' }; // spawnOptions || 
    var server = selenium(spawnOptions, []);
    var done = this.async();

    var seleniumIsUp = false;
    server.stdout.on('data', function(output) {
      if(output.toString().trim().indexOf('HttpContext[/wd,/wd]') > -1) {
        grunt.log.writeln('Selenium is up at http://127.0.0.1:4444/wd/hub');
        done();
      }
      if(seleniumIsUp) {
        grunt.log.writeln(output);
      }
    });
  });
};