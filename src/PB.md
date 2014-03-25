# nuPressButton
An Simple Press button which can change icon (by using different `css class`) for the two states its has

The Press Button is achieved using an two `label` each represents a state and an `input` tag which are warped around by a `div`. It can be applied to any element and bound with an optional model using ngModel directive.

    <div class="nu button press">
      <input class="src" type="checkbox" autocomplete="off" style="display:none;">
      <label icon="Off"></label>
      <label icon="On"></label>
    </div>

**HTML structure of an Press Button**

#### One Icon <small>Using same icon for two states</small>

<nu-press-button icon="fa fa-anchor"></nu-press-button>

    <nu-press-button icon="fa fa-anchor"></nu-press-button>
`icon` -- attribute represents the icon of the **PB**, here we are using `Font Awesome` [anchor](http://fortawesome.github.io/Font-Awesome/anchor/) icon.
The Color of the icon changes using CSS where as keeping the icon same. Check the blow Style Section to know More

#### Bind an model <small>Using the $scope</small>

<nu-press-button icon="fa fa-anchor" ng-model="pbDemo"></nu-press-button>
Value of the model in scope : **{{pbDemo}}**

    <nu-press-button icon="fa fa-anchor" ng-model="pbDemo"></nu-press-button>


#### Custom Values <small>Have your own value for each state of the button</small>
Lets use the attribute `nu-press-button` on `input` tag for the following example.

<input nu-press-button="" icon="fa fa-anchor" value="anchord" ng-model="sngValue"></nu-press-button>
The ships **{{sngValue}}**

    <input nu-press-button="" icon="fa fa-anchor" value="anchord" ng-model="pbDemo">

As only the `value` tag which is set to the model in `ON` state. As there is no value provied for the `OFF` state the model is **null** (which is not rendred on screen)

<input nu-press-button="" icon="fa fa-anchor" value="anchord" value-off="ahoy" ng-model="twoValue"></nu-press-button>
The ships **{{twoValue}}**

    <input nu-press-button="" icon="fa fa-anchor" value="anchord" value-off="ahoy" ng-model="pbDemo">

The above demo add the `value-off` tag the value of which is set to the model on `OFF` state


#### Linked Buttons / Type Radio <small>Have multiple buttons mapped ot same model</small>
Using the `name` and `type='radio'` attribute's we can link the **Press Buttons** similar way as ***input type='rado'***.

<input nu-press-button="" type="radio" name="pbRadio" icon="fa fa-anchor" value="anchord" ng-model="pbRadio"></nu-press-button>&nbsp;&nbsp;<input nu-press-button="" type="radio" name="pbRadio" icon="fa fa-flag" value="ahoy" ng-model="pbRadio"></nu-press-button>
The ships **{{pbRadio}}**

    <input nu-press-button="" type="radio" name="pbRadio" icon="fa fa-anchor" value="anchord" ng-model="pbDemo"></nu-press-button>
    <input nu-press-button="" type="radio" name="pbRadio" icon="fa fa-flag" value="ahoy" ng-model="pbDemo"></nu-press-button>

> **Note:** in this case ___value-off___ is never used as either one of the buttons stay in the **ON** state.

#### Two Icon's <small>Using different icons for each state</small>

<input nu-press-button="" icon="fa" icon-on="fa-flag" icon-off="fa-flag-o" ng-model="twoIconBasic">
Value of the model in scope : **{{twoIconBasic}}**

    <input nu-press-button="" icon="fa" icon-on="fa-flag" icon-off="fa-flag-o" ng-model="pbDemo">


<input nu-press-button="" icon="fa" icon-on="fa-flag" icon-off="fa-flag-o" value="Yes" value-off="No" ng-model="twoIconValued">
The flag is hoisted : **{{twoIconValued}}**

    <input nu-press-button="" icon="fa" icon-on="fa-flag" icon-off="fa-flag-o" value="Yes" value-off="No" ng-model="pbDemo">

#### Pre Checked / default State<small>Set the button state to ON by Default</small>
There are two ways to achive this as follows

<input nu-press-button="" icon="fa fa-flag" checked="" ng-model="checkedTag">
Value of the model in scope : **{{checkedTag}}**

    <input nu-press-button="" icon="fa fa-flag" checked="" ng-model="pbDemo">

<input nu-press-button="" icon="fa" icon-on="fa-flag" icon-off="fa-flag-o" ng-model="checkedScope" ng-init="checkedScope = true">
Value of the model in scope : **{{checkedScope}}**

    <div ng-init="pbDemo = true">
      <input nu-press-button="" icon="fa fa-flag" ng-model="pbDemo">
    </div>

<input nu-press-button="" icon="fa" icon-on="fa-flag" icon-off="fa-flag-o" value="Yes" value-off="No" ng-model="checkedScope2" ng-init="checkedScope2 = 'Yes'">
The flag is hoisted : **{{checkedScope2}}**

    <input nu-press-button="" icon="fa" icon-on="fa-flag" icon-off="fa-flag-o" value="Yes" value-off="No" ng-model="pbDemo" ng-init="pbDemo = 'Yes'">


#### Style <small>How to customize PB using Less/CSS Class</small>
##### Less
    :::less
    #nu > #theme > .pb(@color, @size)
    #nu > #theme > .pb(@color-on, @color-off, @size)

Please have a look at following theme files [bootstrap.less](https://github.com/gKodes/ngul/blob/master/less/themes/bootstrap.less) / [default.less](https://github.com/gKodes/ngul/blob/master/less/themes/default.less)

**Bootstrap Theme**
<div class="bs">
  <nu-press-button icon="fa fa-anchor"></nu-press-button> -- Default
  <nu-press-button class="primary" icon="fa fa-anchor"></nu-press-button> -- Primary
  <nu-press-button class="success" icon="fa fa-anchor"></nu-press-button> -- Success
  <nu-press-button class="info" icon="fa fa-anchor"></nu-press-button> -- Info
  <nu-press-button class="warning" icon="fa fa-anchor"></nu-press-button> -- Warning
  <nu-press-button class="danger" icon="fa fa-anchor"></nu-press-button> -- Danger
</div>

    <nu-press-button icon="fa fa-anchor"></nu-press-button>
    <nu-press-button class="primary" icon="fa fa-anchor"></nu-press-button>
    <nu-press-button class="success" icon="fa fa-anchor"></nu-press-button>
    <nu-press-button class="info" icon="fa fa-anchor"></nu-press-button>
    <nu-press-button class="warning" icon="fa fa-anchor"></nu-press-button>
    <nu-press-button class="danger" icon="fa fa-anchor"></nu-press-button>

#### Attributes
`id` -- id to be used for the input inside the button. NOTE: any change at runtime would brake the expected functionality.
`name` -- name of the input inside the button
`type` -- type of input to be used, cannot be changed at runtime. NOTE: use checkbox (default) or radio only
`icon` -- default css class to be applied to both state labels.
`icon-on` -- css class to be added for ON state.
`icon-off` -- css class to be added for OFF state.
`value` -- value to be set to the model when the button is on. default value true.
`value-off` -- value to be set to the model when the button is off, used in case type is checkbox only. default value false.
`checked` -- similar to input tag checked, will set the button in on state. Presence of the tag would be treated as checked.
`disabled` -- will disable the button in current state, if set to false its not disabled any other value its disabled. INFO: use disable="disable" for it to work on all tag types

#### Events
`nu-change`
`nu-focus`
`nu-blur`

**`$event`** -- `target` and `value`