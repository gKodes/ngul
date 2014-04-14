/*global exports, process: true*/
exports.config = {
  allScriptsTimeout: 11000,
  dir: '../test/protractor/',

  specs: [
    '*.js'
  ],

  capabilities: {
    'phantomjs.binary.path': 'node_modules/phantomjs/lib/phantom/bin/phantomjs',
    'browserName': 'firefox'
  },

  baseUrl: 'http://localhost:8981/test/protractor/html/nu.ga.html',
  
  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};

if(process.env.TRAVIS) {
  exports.config.sauceUser = process.env.SAUCE_USERNAME;
  exports.config.sauceKey = process.env.SAUCE_ACCESS_KEY;
  exports.config.capabilities = {
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    build: process.env.TRAVIS_BUILD_NUMBER,
    name: 'Radian build #{process.env.TRAVIS_BUILD_NUMBER}'
  };
  // exports.config.baseUrl = 'http://localhost:8000/test/protractor/html/nu.ga.html';
} else {
  exports.config.seleniumAddress = 'http://localhost:4444/wd/hub';
}

// jasmine.getEnv().addReporter new jasmine.JUnitXmlReporter dir, true, true