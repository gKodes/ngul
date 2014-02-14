module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      nu: {
        src : [
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
      tests: ['tests/*.js'],
    },
    less: {
      dev: {
        options: {
          paths: ["assets/css"]
        },
        files: {
          "dist/nu.css": "less/nu.less",
          "dist/mime.fugue.css": "less/mime.fugue.less"
        }
      },
      dist: {
        options: {
          paths: ["assets/css"],
          cleancss: true,
          compress: true
        },
        files: {
          "dist/nu.min.css": "less/nu.less",
          "dist/mime.fugue.min.css": "less/mime.fugue.less"
        }
      }
    },
    karma: {
      dev : {
        configFile: 'karma.conf.js',
        singleRun: true,
        browsers: ['PhantomJS', 'Chrome', 'Firefox']
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-karma');
  // grunt.loadNpmTasks('grunt-conventional-changelog');
  //grunt.loadNpmTasks('grunt-ngdocs');
  grunt.loadNpmTasks('grunt-contrib-less');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'less:dev', 'concat:nu']);
  grunt.registerTask('dist', ['jshint', 'less', 'concat:nu', 'uglify:nu']);
  grunt.registerTask('ut', ['jshint', 'less:dev', 'karma']); 
};