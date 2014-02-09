NU
=====================
NU is a collection of angular derivatives [demo][1]

<<<<<<< HEAD
####Switch
A simple switch with two lables for on and off
```
<nu-switch on="Yes" off="No" ng-model="testSwitch"></nu-switch>
```

#####attrbutes
**on** -- label and value of the model when the switch is on
**off** -- label and value of the model when the switch is off 

####Press Button
An simple press button which can change icon (by using different style) for the state its in

Single icon
```
<nu-press-button icon="fa fa-anchor" ng-model="testButton"></nu-press-button>
```

Change icon on state change
```
<nu-press-button icon="fa" iconOn="fa-flag" iconOff="fa-flag-o" ng-model="testButton"></nu-press-button>
```

#####attrbutes
**on** ***[optional optional]*** -- value of the model when the switch is on
**off** ***[optional]*** -- value of the model when the switch is off
**icon** -- default * css class* (icon) to be set in all states of the switch
**iconOn** ***[optional]*** -- *css class* on switch *on* state
**iconOff** ***[optional]*** -- *css class* on switch *off* state

Change icon using CSS
```
.custom_button {
	input[type='checkbox']:checked + .icon:before {
		content: '\f024';
	}

    .icon:before {
		content: '\f11d';
		font-size: 24px;
		font-family: FontAwesome;
	}
}
```

```
<nu-press-button icon="custom_button" ng-model="testButton"></nu-press-button>
```

####List
```
<nu-list src="tags" nu-list-removable="" nu-list-addable="" nu-list-type=""></nu-list>
```
An list using an array of strings (Text)

```
<nu-list src="imgs" nu-list-removable="" nu-list-addable="" nu-list-type="img"></nu-list>
```
An list using an array of image url's of which each image is displayed in a 64px thumbnail

#####attrbutes
**src** -- the list for which we display the items
**nu-list-type** ***[default='text']*** -- it helps determine what the list is for is it `img` or `text`
**nu-list-removable**  ***[optional]*** -- if present removes an list *item* on click on it
**nu-list-addable** ***[optional]*** -- -- if present provieds an user interface to add new *items* to the list


### Inspired from
[Flat UI][2] by designmodo

### Support and Contribution
Your free to contribute code, please run `jshint` on any changes before submitting and link contributions to tickets as related.
Please raise an ticket if find any problem found or need any things else.


  [1]: http://gkodes.github.io/ngul/
  [2]: http://designmodo.github.io/Flat-UI/
=======
AngularJS directives without any 3rd party JS dependencies


Sample - http://gkodes.github.io/ngul/example.html
>>>>>>> f4eecccee86e39f95f739afd59c5ec784b14b087
