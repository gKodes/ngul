exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    '../test/protractor/*.js'
  ],

  capabilities: {
    'phantomjs.binary.path': 'node_modules/phantomjs/lib/phantom/bin/phantomjs',
    'browserName': 'firefox'
  },

  seleniumAddress: 'http://localhost:4444/wd/hub',
  baseUrl: 'http://localhost:8981/test/protractor/html/nu.ga.html',
  
  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
