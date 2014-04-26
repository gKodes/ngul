NU
=====================
NU is a collection of angular derivatives
Do check out the [demo][1]'s at https://gkodes.github.io/ngul/ for the following

- `nuWrap` -- an alternative to `xeditable` for an in-place/in-line editor with custom templates
- `nuSwitch` -- an togle switch
- `nuPressButton` -- an two state button
- `nuList` -- List/Tag to be able to add remove items
- `nuFileChooser` -- Built on top of the List an better UI for the `input type='file'`
- `nuShow` -- an image slide show
- `nuSlider` -- helps hide the scroll bar's

[![devDependency Status](https://david-dm.org/gkodes/ngul/dev-status.png)](https://david-dm.org/gkodes/ngul#info=devDependencies)
[![Build Status](https://travis-ci.org/gKodes/ngul.svg?branch=master)](https://travis-ci.org/gKodes/ngul)

### Build
We need node.js and grunt for building and `distribution` of _**nu**_

[Installing grunt](http://gruntjs.com/getting-started)

To build and test the `distribution`
```
grunt ga
```

* `buid` -- create the file under `dist` directory
* `test` -- selenium & protractor with ga config
* `default` -- selenium & protractor with dev config which includes each `module` seperalty and compiles `.less` in the browser at runtime

### Inspired from
[Flat UI][2] by designmodo
[xeditable][3] by vitalets

### Support and Contribution
Your free to contribute code, please run `jshint` on any changes before submitting and link contributions to tickets as related.
Please raise an ticket if find any problem found or need any things else.


[1]: http://gkodes.github.io/ngul/
[2]: http://designmodo.github.io/Flat-UI/
[3]: vitalets.github.io/angular-xeditable
=======
AngularJS directives without any 3rd party JS dependencies
