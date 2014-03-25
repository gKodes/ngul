NU List is divided into multiple directives, nuList being the base for all

**Text List**
```html
<nu-list src="tags" nu-list-type=""></nu-list>
```

The one mandatory attribute for the list is `src` which is mapped to the variable (model) in the current scope. It shares an controller with the following functions
* `$indexOf` -- returns the index of an list item
* `$add` -- appends an given item to the list
* `$remove` -- removes an given item from the list
* `$empty` -- empty the view-only (DOM), wont impact the list in scope `src` attribute
* `$draw` -- draw/update the view
* `$render` and `$link` which need to be overridden to draw the list items (see the below directives.

#### ngListType
This is an attribute only directives which is the core render of the list (overrides $render function), it can render two types of lists _**txt**_ (Text) & _**img**_ (Picture), were _**txt**_ being the default. 
* `$formatters` array is exposed over the controller which is similar to [ngModel.NgModelController#$formatters](http://docs.angularjs.org/api/ng/type/ngModel.NgModelController#$formatters)

**Picture List**
```html
<nu-list src="tags" nu-list-type="img"></nu-list>
```

#### nuListAddable
This is an attribute only directives which helps users added items to the list using an buffer. Existence of the buffer can be manipulated at runtime also, with value set to `false` the buffer is removed any other value the buffer is shown.

* `$parsers` array is exposed over the controller which is similar to [ngModel.NgModelController#$parsers](http://docs.angularjs.org/api/ng/type/ngModel.NgModelController#$parsers)

**List with an buffer**
```html
<nu-list src="tags" nu-list-type="" nu-list-addable=""></nu-list>
```

**Control the existence of buffer at runtime**
```html
<nu-list src="tags" nu-list-type="" nu-list-addable="{{addable}}"></nu-list>
```

#### nuListRemovable
This is an attribute only directives which helps users to remove an list item when clicked on it. This can be manipulated at runtime also, with value set to `false` which prevents elements from being removed any other value allow them to be removed.

**List for which items can be removed on click**
```html
<nu-list src="tags" nu-list-type="" nu-list-removable=""></nu-list>
```

**Control the items to be removed at runtime**
```html
<nu-list src="tags" nu-list-type="" nu-list-removable="{{removable}}"></nu-list>
```

### Other Example

An List for which items can be added and removed at runtime.
```html
<nu-list src="tags" nu-list-type="" nu-list-addable="" nu-list-removable=""></nu-list>
```
