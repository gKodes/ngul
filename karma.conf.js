module.exports = function(config) {
  config.set({
    basePath: '.',
    frameworks: ['jasmine'],
    files: [
		'deps/angular/angular.js',
		'deps/angular/angular-mocks.js',
    	'src/*.js',
    	'tests/*.js',
    ],
    // reporters: ['progress', 'junit'],
    logLevel: config.LOG_INFO,
    singleRun: false,
    colors: true,
    port: 9876,
    plugins: [
      'karma-jasmine',
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-junit-reporter'
    ]
  });
};
