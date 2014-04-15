# nuList

The `nuList` directive instantiates a template once per item from a collection. Each template instance gets its own scope, where the given loop variable is set to the current collection item, `$index` is set to the item index or key, and `$erase` is a function on invocation would remove the item from the collection and update the view respectively.

#### A Simple List <small>Text Tag's</small>

<nu-list src="tags" ng-init="tags=['This', 'is', 'a', 'Tag', 'List']"></nu-list>

    <nu-list src="tags"></nu-list>

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

<nu-list src="tags2" ng-init="tags2=['This', 'is', 'a', 'Tag', 'List']"><buffer type="txt"/></nu-list>

    <nu-list src="tags"><buffer type="txt"/></nu-list>



#### Customize Item View <small>Present your it in your own way</small>

<nu-list src="tags3" ng-init="tags3 = [
    {fname: 'Marquetta',lname: 'Bartell'},
    {fname: 'Alethia', lname: 'Marvin'},
    {fname: 'Roxanna',lname: 'Runolfsson'}
  ]
"><span class="label label-info" ng-click="$erase()">{{item.fname}}&nbsp;{{item.lname}}</span></nu-list>

    <nu-list src="tags"><span class="label label-info">{{item.fname}}&nbsp;{{item.lname}}</span></nu-list>

Model

    [
      {
          fname: 'Marquetta',
          lname: 'Bartell'
      },
      {
          fname: 'Alethia',
          lname: 'Marvin'
      },
      {
          fname: 'Roxanna',
          lname: 'Runolfsson'
      },
    ]

#### Customize View <small>Have your own tags</small>

<nu-list src="tags4" ng-init="tags4 = [
    'http://farm4.staticflickr.com/3690/12852625125_849b3164cc_h.jpg',
    'http://farm9.staticflickr.com/8042/7918423710_e6dd168d7c_b.jpg',
    'http://farm9.staticflickr.com/8449/7918424278_4835c85e7a_b.jpg',
    'http://farm9.staticflickr.com/8457/7918424412_bb641455c7_b.jpg',
    'http://farm9.staticflickr.com/8179/7918424842_c79f7e345c_b.jpg',
    'http://farm9.staticflickr.com/8315/7918425138_b739f0df53_b.jpg',
    'http://farm9.staticflickr.com/8461/7918425364_fe6753aa75_b.jpg'
  ]"><img class="list item" nu-src="item"/></nu-list>

    <nu-list nu-src="tags"><img class="list item" src="item"/></nu-list>

Model

    function demoCtrl($scope) {
      $scope.tags = [
        'http://farm4.staticflickr.com/3690/12852625125_849b3164cc_h.jpg',
        'http://farm9.staticflickr.com/8042/7918423710_e6dd168d7c_b.jpg',
        'http://farm9.staticflickr.com/8449/7918424278_4835c85e7a_b.jpg',
        'http://farm9.staticflickr.com/8457/7918424412_bb641455c7_b.jpg',
        'http://farm9.staticflickr.com/8179/7918424842_c79f7e345c_b.jpg',
        'http://farm9.staticflickr.com/8315/7918425138_b739f0df53_b.jpg',
        'http://farm9.staticflickr.com/8461/7918425364_fe6753aa75_b.jpg'
      ];
    }
