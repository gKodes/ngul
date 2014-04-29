/*global exports, process: true*/
exports.config = {
  specs: [
    '../test/protractor/nu*.js'
  ],

  chromeOnly: false,
  multiCapabilities: [
    {
      'browserName': 'chrome',
      'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
      build: process.env.TRAVIS_BUILD_NUMBER,
      name: 'gKodes.Nu build Chrome ' + process.env.TRAVIS_BUILD_NUMBER
    }, 
    {
      'browserName': 'firefox',
      'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
      build: process.env.TRAVIS_BUILD_NUMBER,
      name: 'gKodes.Nu build FF ' + process.env.TRAVIS_BUILD_NUMBER
/*    'capture-html': true,
    'max-duration': 350*/
    }
  ],

  baseUrl: 'http://localhost:8000/test/protractor/html/nu.ga.html',
  
  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 3000
  }
};

if(process.env.TRAVIS) {
  exports.config.sauceUser = process.env.SAUCE_USERNAME;
  exports.config.sauceKey = process.env.SAUCE_ACCESS_KEY;
  exports.config.specs = [
    '../test/protractor/util.js',
    '../test/protractor/nu.switch.js',
    '../test/protractor/nu.pb.js',
    '../test/protractor/nu.show.js',
    '../test/protractor/nu.list.js'
  ];
} else {
  exports.config.seleniumAddress = 'http://localhost:4444/wd/hub';
}