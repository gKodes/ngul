exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    '../test/protractor/nu.file.chooser.js'
  ],

  capabilities: {
    'phantomjs.binary.path': 'node_modules/phantomjs/lib/phantom/bin/phantomjs',
    'browserName': 'chrome'
  },

/*  chromeOnly: false,
  multiCapabilities: [
    { 'browserName': 'chrome'}, 
    { 'browserName': 'firefox'}
  ],*/

  seleniumAddress: 'http://localhost:4444/wd/hub',
  baseUrl: 'http://localhost:8888/test/protractor/html/nu.dev.html',
  
  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
