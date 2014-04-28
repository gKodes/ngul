/*global module, require, process: true*/
module.exports = function(grunt) {
  'use strict';
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    merge: {
      nu: {
        options : {
          banner: 'js/banner',
          footer: 'js/footer'
        },
        src : [
          'js/nu.js',
          'js/nu.list.js',
          'js/nu.pb.js',
          'js/nu.switch.js',
          'js/nu.file.chooser.js',
          'js/nu.show.js',
          'js/nu.slider.js',
          'js/nu.event.js',
          'js/nu.src.js',
          'js/nu.wrap.js',
          'js/nu.wrap.bs.js',
          'js/mime.types.js',
          'js/nu.media.js',
          'js/nu.button.view.js'
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
          angular: true
        }
      },
      code: ['js/*.js'],
      test: ['test/protractor/*.js', 'test/unit/*.js'],
      dist: ['dist/nu.js']
    },
    less: {
      dev: {
        files: {
          'dist/nu.css': 'less/nu.less',
          'dist/mime.fugue.css': 'less/mime.fugue.less',
          'dist/theme.default.css': 'less/themes/default.less',
          'dist/theme.bootstrap.css': 'less/themes/bootstrap.less'
        }
      },
      dist: {
        options: {
          cleancss: true,
          compress: true
        },
        files: {
          'dist/nu.min.css': 'less/nu.less',
          'dist/mime.fugue.min.css': 'less/mime.fugue.less',
          'dist/theme.default.min.css': 'less/themes/default.less',
          'dist/theme.bootstrap.min.css': 'less/themes/bootstrap.less'
        }
      }
    },
    protractor: {
      ga: {
        options: {
          configFile: 'config/protractor.ga.conf'
        }
      },
      dev: {
        options: {
          //debug: true,
          configFile: 'config/protractor.dev.conf'
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
    },
    wget: {
      bs: {
        files: {
          'less/themes/bs.variables.less': 'https://raw.githubusercontent.com/twbs/bootstrap/master/less/variables.less'
        }
      },
      mime: {
        files: {
          'mime.types': 'https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types'
        }
      }
    }
  });

  // Load the plugin that provides the 'uglify' task.
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  // grunt.loadNpmTasks('grunt-conventional-changelog');
  //grunt.loadNpmTasks('grunt-ngdocs');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-protractor-runner');
  grunt.loadNpmTasks('grunt-wget');

  // Default task(s).
  grunt.registerTask('default', ['jshint:code', 'jshint:test', 'localweb', 'protractor:dev']);
  grunt.registerTask('localweb', ['connect:ga', 'selenium']);
  grunt.registerTask('build', ['jshint:code', 'jshint:test', 'wget:bs', 'less', 'merge:nu', 'jshint:dist', 'uglify:nu']);
  grunt.registerTask('test', ['localweb', 'protractor:ga']);
  grunt.registerTask('ga', ['build', 'test']);

  grunt.registerTask('selenium', 'Task to initialize selenium-webdriver', function() {
    var selenium = require('selenium-standalone');
    
    var spawnOptions = { stdio: 'pipe' }; // spawnOptions || 
    var server = selenium(spawnOptions, []);
    var done = this.async();

    var seleniumIsUp = false;
    server.stdout.on('data', function(output) {
      if(output.toString().trim().indexOf('HttpContext[/wd,/wd]') > -1) {
        grunt.log.writeln('Selenium is up at http://127.0.0.1:4444/wd/hub');
        process.on('exit', function () {
          server.kill();
        });
        done();
      }
      if(seleniumIsUp) {
        grunt.log.writeln(output);
      }
    });
  });

  grunt.registerTask('mimetypes', 'Convert apache mime types to an javascript array', function() {
    this.requires('wget:mime');

    var done = this.async(),
        fs = require('fs'),
        mimes = {},
        mimeRegx = /(audio|image|video)\//;
    fs.readFile('mime.types', 'ascii', function (err, data) {
      if (err) { return done(grunt.fail.fatal('Failed to access mime.types')); }
      var lines = data.split(/[\r\n]+/);
      fs.writeFileSync('js/mime.types.js', 'var mimetypes = {};\r\n');

      for (var i = 0; i < lines.length; i++) {
        if( lines[i][0] !== '#' ) {
          var mime = lines[i].split(/[\t]+/);
          if(mime[0] && mime[1]) {
            var type = mimeRegx.exec(mime[0]);
            if (type) {
              mimes[type[1]] = (mimes[type[1]] || '') + '.' + mime[1].replace(/ /g, ' .') + ' ';
            }
          }
        }
      }

      var mtype;
      for(mtype in mimes) {
        fs.appendFileSync('js/mime.types.js',
          'mimetypes[\'' + mtype + '\'] = \'' + mimes[mtype].trim() + '\';\r\n');
      }

      fs.appendFileSync('js/mime.types.js',
        '\r\nfunction typeOfExt(type) {\r\n' +
        '  return function isTypeOf(ext) {\r\n' +
        '    return (ext[0] === \'.\' && mimetypes[type].indexOf(ext) !== -1);\r\n' +
        '  }\r\n' +
        '}\r\n\r\n');

      for(mtype in mimes) {
        fs.appendFileSync('js/mime.types.js',
          'var is' + mtype[0].toUpperCase() + mtype.substr(1) + 'ByExt = typeOfExt(\'' + mtype + '\');\r\n');
      }

      done();
    });
  });

  /* based of grunt-contrib-concat */
  grunt.registerMultiTask('merge', 'Merge files.', function() {
    var chalk = require('chalk');

    var options = this.options({
      separator: grunt.util.linefeed,
      banner: '',
      footer: ''
      //stripBanners: false // support later if needed
    });

    this.files.forEach(function(group) {
      var banner = '', footer = '';

      if(options.banner) {
        banner = grunt.template.process(options.banner, group);
        if(grunt.file.isFile(options.banner)) {
          banner = grunt.template.process(
            grunt.file.read(options.banner), group);
        }
      }

      if(options.footer) {
        footer = grunt.template.process(options.footer, group);
        if(grunt.file.isFile(options.footer)) {
          footer = grunt.template.process(
            grunt.file.read(options.footer), group);
        }
      }

      var strips = [];
      // Strip // ... leading banners.
      strips.push('//[^\\r\\n]*');
      // Strips all /* ... */ block comment banners.
      strips.push('/\\*[^\\*]+\\*/');
      strips.push('\'use strict\';');
      
      var re = new RegExp('([ \t]*' + strips.join('|') + '[\\r\\n]*)', 'gm');
      
      var merged = banner + grunt.file.expand(group.src).filter(function(path) {
        if (!grunt.file.exists(path)) {
          grunt.log.warn('Source file "' + path + '" not found.');
          return false;
        }
        return true;
      }).map(function(path){
        var src = grunt.file.read(path);
        return src.replace(re, '');
      }).join(options.separator) + footer;

      grunt.file.write(group.dest, merged);

      grunt.log.writeln('File ' + chalk.cyan(group.dest) + ' created.');
    });
  });
};