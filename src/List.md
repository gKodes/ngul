# nuList

The `nuList` directive instantiates a template once per item from a collection. Each template instance gets its own scope, where the given loop variable is set to the current collection item, `$index` is set to the item index or key, and `$erase` is a function on invocation would remove the item from the collection and update the view respectively.

#### A Simple List <small>Text Tag's</small>

<iframe style="width: 100%; height: 100px" src="http://jsfiddle.net/gKodes/ENz5L/embedded/result,html,js,css,resources" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

The one mandatory attribute for the list is `src` which is mapped to the variable (model) in the current scope.

It shares an controller with the following functions
* `$viewValue` {Object|Array} -- Actual value in the view.
* `$modelValue` {Object|Array} -- The value in the model, that the control is bound to.
* `$itemCompiler` {Function} -- compiled Item Node using `$compile` service. This would be called with a `Scope` and an cloneAttachFn.
* `$itemNodeFactory` {Function} -- fn that takes one argument
* `$removeItem` {Function} -- invoked to remove an item
* `$render` {Function} -- Invoked when there external changes made to the list's model
* `$buffers` {Array} -- An list of `Buffer` Nodes
* `$defaults` {Scope} -- The parent scope for all Item Nodes
* `$bufferDefaults` {Scope} -- The parent scope for all Buffer Nodes
* `$getItems` {Function} -- Return's the list of item nodes only (Excludes buffers)


#### Buffered List <small>Push new tags</small>

<iframe style="width: 100%; height: 100px" src="http://jsfiddle.net/gKodes/JUtP6/embedded/result,html,js,css,resources" allowfullscreen="allowfullscreen" frameborder="0"></iframe>
The above list sample has an customsed template based of bootstrap css lable. Let's see an little more flex in the below one.

##### Customize Item View <small>Present your it in your own way</small>

<iframe style="width: 100%; height: 300px" src="http://jsfiddle.net/gKodes/9Py5p/embedded/result,html,js,css,resources" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

The above list sample has an customsed template based of bootstrap css lable. Let's see an little more flex in the below one

##### **Erasable and Buffer**
<iframe style="width: 100%; height: 300px" src="http://jsfiddle.net/gKodes/xnTrZ/embedded/result,html,js,css,resources" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

After adding `ng-click="$erase()"`, on click off an element it gets erased from the list

There are two inbult buffer types

 * `txt` -- Helps add string item's to the list
 * `file` -- Helps `File` Objects using an `input type="file"`

##### **Have your own tags**

<iframe style="width: 100%; height: 300px" src="http://jsfiddle.net/gKodes/CVr8t/embedded/result,html,js,css,resources" allowfullscreen="allowfullscreen" frameborder="0"></iframe>
