# nuSwitch
An toggle switch using CSS3 `:before` & `:after` over an `input` & `label` wraped around using an `div`

    <div class="nu switch">
      <input class="src" type="checkbox" autocomplete="off">
      <label class="label"></label>
    </div>

**HTML structure of an Switch**
The Switch is achived by linking the `label` ***for*** to the `input` ***id***  attribute's

#### A Switch <small>An Default Switch</small>

<nu-switch></nu-switch>

    <nu-switch></nu-switch>
Switch by default does not need any attributs the default label's are `On` and `Off` respectively.

#### Bind an model <small>Using the $scope</small>

<nu-switch ng-model="switchDemo"></nu-switch>
Value of the model in scope : **{{switchDemo}}**

    <nu-switch ng-model="switchDemo"></nu-switch>

#### Customize Labels <small>Have your own lables for each state</small>

<nu-switch on="It On" ng-model="switchDemo2"></nu-switch>
Value of the model in scope : **{{switchDemo2}}**
<nu-switch off="!O" ng-model="switchDemo3"></nu-switch>
Value of the model in scope : **{{switchDemo3}}**

    <nu-switch on="It On" ng-model="switchDemo"></nu-switch>
    <nu-switch off="!O" ng-model="switchDemo"></nu-switch>

Change only an single label for either `On` or `Off`, the following shows change of both the label's.

<nu-switch on="It On" off="!O" ng-model="switchDemo4"></nu-switch>
Value of the model in scope : **{{switchDemo4}}**

    <nu-switch on="It On" off="!O" ng-model="switchDemo"></nu-switch>

#### Binding Values <small>Have an value for each state</small>

<nu-switch on="It On" off="Opss!" value="Do Some thing" value-off="Cant Help" ng-model="switchDemo5"></nu-switch>
Value of the model in scope : **{{switchDemo5}}**

    <nu-switch on="It On" off="Opss!" value="Do Some thing" value-off="Cant Help" ng-model="switchDemo"></nu-switch>


#### Pre Checked / default State<small>Set the button state to ON by Default</small>
There are two ways to achive this as follows

<input nu-switch="" checked="" ng-model="switchDemo6">
Value of the model in scope : **{{switchDemo6}}**

    <input nu-switch="" checked="" ng-model="switchDemo">

<input nu-switch="" checked="" ng-model="switchDemo7">
Value of the model in scope : **{{switchDemo7}}**

    <div ng-init="switchDemo = true">
      <input nu-switch="" checked="" ng-model="switchDemo">
    </div>

<input nu-switch="" checked="" value="Do Some thing" value-off="Cant Help" ng-model="switchDemo8" ng-init="switchDemo8 = 'Do Some thing'">
Value of the model in scope : **{{switchDemo8}}**

    <div ng-init="switchDemo = true">
      <input nu-switch="" checked="" value="Do Some thing" value-off="Cant Help" ng-model="switchDemo" ng-init="switchDemo = 'Do Some thing'">
    </div>

#### Style <small>How to customize Switch using Less/CSS Class</small>
##### Less
    :::less
    .switch {
      #nu > #theme > .switch({ // On Colors
        #nu > #mixin > .color(@background-color-on, @color-on);
      },
      { // Off Colors
        #nu > #mixin > .color(@background-color-off, @color-off);
      });
      #nu > #theme > .switch-handle(@handle-color-on, @handle-color-off);
    }

***switch-handle*** is for the circle/square[TODO] that slides in the switch

Please have a look at following theme files [bootstrap.less](https://github.com/gKodes/ngul/blob/master/less/themes/bootstrap.less) / [default.less](https://github.com/gKodes/ngul/blob/master/less/themes/default.less)

**Bootstrap Theme**
<div class="bs">
  <nu-switch></nu-switch> -- Default
  <nu-switch class="primary"></nu-switch> -- Primary
  <nu-switch class="success"></nu-switch> -- Success
  <nu-switch class="info"></nu-switch> -- Info
  <nu-switch class="warning"></nu-switch> -- Warning
  <nu-switch class="danger"></nu-switch> -- Danger
</div>

    <nu-switch></nu-switch>
    <nu-switch class="primary"></nu-switch>
    <nu-switch class="success"></nu-switch>
    <nu-switch class="info"></nu-switch>
    <nu-switch class="warning"></nu-switch>
    <nu-switch class="danger"></nu-switch>


#### Attributes
The following attributes are consumed by the nuSwitch
`id` -- id to be used for the input inside the switch. **NOTE**: any change at runtime would brake the expected functionality.
`name` -- name of the input inside the switch
`type` -- type of input to be used, cannot be changed at runtime. **NOTE**: use `checkbox` (**default**) or `radio` only
`on` -- Label to be show when the switch is on, default value `On`
`off` -- Label to be show when the switch is off, default value `Off`
`value` -- value to be set to the model when the switch is on. default value `true`.
`value-off` -- value to be set to the model when the switch is off, used in case type is `checkbox` only. default value `false`.
`checked` -- similar to `input` tag checked, will set the button in on state. Presence of the tag would be treated as checked.
`disabled` -- will disable the button in current state, if set to `false` its not disabled any other value its disabled. **INFO**: use `disable="disable"` for it to work on all tag types