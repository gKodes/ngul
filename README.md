NU
=====================
NU is a collection of angular derivatives [demo][1]

[![devDependency Status](https://david-dm.org/gkodes/ngul/dev-status.png)](https://david-dm.org/gkodes/ngul#info=devDependencies)
[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/gKodes/ngul/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

####Switch
A simple switch with two lables for on and off
```html
<nu-switch on="Yes" off="No" ng-model="testSwitch"></nu-switch>
```

#####attrbutes
**on** -- label and value of the model when the switch is on

**off** -- label and value of the model when the switch is off

**value** ***[optional]*** -- an value to be set in case the switch is On

**value-off** ***[optional]*** -- an value to be set in case the switch is Off

####Press Button
An simple press button which can change icon (by using different style) for the state its in

Single icon
```html
<nu-press-button icon="fa fa-anchor" ng-model="testButton"></nu-press-button>
```

Change icon on state change
```html
<nu-press-button icon="fa" iconOn="fa-flag" iconOff="fa-flag-o" ng-model="testButton"></nu-press-button>
```

#####attrbutes
**icon** -- default *css class* (icon) to be set in all states of the switch

**iconOn** ***[optional]*** -- *css class* on switch *on* state

**iconOff** ***[optional]*** -- *css class* on switch *off* state

**value** ***[optional]*** -- an value to be set in case the switch is On

**value-off** ***[optional]*** -- an value to be set in case the switch is Off

Change icon using CSS
```css
.custom_button {
[icon='On']:before {
        content: '\f024';
        font-size: 24px;
        font-family: FontAwesome;
    }
}

[icon='Off']:before {
        content: '\f11d';
        font-size: 24px;
        font-family: FontAwesome;
    }
}
```

```html
<nu-press-button icon="custom_button" ng-model="testButton"></nu-press-button>
```

####List
[Wiki Page](https://github.com/gKodes/ngul/wiki/nuList)

#### File Chooser
```html
<nu-file-chooser></nu-file-chooser>
File Name &lt;&gt; {{selectedFile.name}}
```
Using Fugue

```html
<nu-file-chooser class="fugue blue"></nu-file-chooser>
```
An list using an array of image url's of which each image is displayed in a 64px thumbnail

#####attrbutes
**src** -- model to be bound in the given scope

### Inspired from
[Flat UI][2] by designmodo

### Support and Contribution
Your free to contribute code, please run `jshint` on any changes before submitting and link contributions to tickets as related.
Please raise an ticket if find any problem found or need any things else.


[1]: http://gkodes.github.io/ngul/
[2]: http://designmodo.github.io/Flat-UI/
=======
AngularJS directives without any 3rd party JS dependencies
