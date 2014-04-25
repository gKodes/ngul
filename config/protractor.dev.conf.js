exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    '../test/protractor/nu*.js'
  ],
/*
  capabilities: {
    'phantomjs.binary.path': 'node_modules/phantomjs/lib/phantom/bin/phantomjs',
    'browserName': 'firefox'
  },
*/
  chromeOnly: false,
  multiCapabilities: [
    { 'browserName': 'chrome'}, 
    { 'browserName': 'firefox'}
  ],

  seleniumAddress: 'http://localhost:4444/wd/hub',
  baseUrl: 'http://localhost:8981/test/protractor/html/nu.dev.html',
  
  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
