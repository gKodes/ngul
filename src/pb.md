### nuPressButton
An Simple Press button which can change icon (by using different `css class`) for the two states its has

The Press Button is achieved using an two `label` each represntng a state and an `input` tag which are warped around by a `div`. It can be applyed to any element and bound with an optional model using ngModel directive.

    <div class="nu button press">
      <input class="src" type="checkbox" autocomplete="off" style="display:none;">
      <label icon="Off"></label>
      <label icon="On"></label>
    </div>

**HTML structure of an Press Button**

#### <small>Simple One Icon</small>

<nu-press-button icon="fa fa-anchor"></nu-press-button>

    <nu-press-button icon="fa fa-anchor"></nu-press-button>
`icon` -- attribute reprensets the icon of the **PB**, here we are using `Font Awesome` [anchor](http://fortawesome.github.io/Font-Awesome/anchor/) icon.
The Color of the icon changes using CSS where as keeping the icon same. Check the blow Style Section to know More

    .press

#### Style <small>How to customize the PB using CSS Class</small>
    #nu > #theme > .pb(@color, @size)
    #nu > #theme > .pb(@color-on, @color-off, @size)

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