/*global angular, trim, isFile, isString, isArray, path, lowercase, isDefinedAndNotNull: true*/

var nuFileChooser = angular.module('nu.FileChooser', ['nu.List', 'nu.Event', 'nu.Media']);

nuFileChooser.filter('basename', function() {
  'use strict';
  return function(blob) {
    if( isFile(blob) ) { blob = blob.name; }
    if( isString(blob) ) { return path.basename(blob); }
    return blob;
  };
});

nuFileChooser.filter('pathExt', function() {
  'use strict';
  return function(blob) {
    if( isFile(blob) ) { blob = blob.name; }
    if( isString(blob) ) { return lowercase(path.splitext(blob)[1]).substr(1); }
    return blob;
  };
});

nuFileChooser.directive('nuFileChooser', ['$compile', 'listBuffers', 'nuEvent',
  function($compile, listBuffers) {
    'use strict';
    var item_tmpl = '<span class="list item" ext="{{item|pathExt}}" ng-click="$erase()">' +
          '{{item|basename}}' + /*<div ng-show="hasPreview" nu-button-view="fcbox" ng-model="item"></div> +*/ '</span>';
    var buffer_tmpl = '<label class="buffer" type="file"><span class="action">Browse<input type="file"></span></label>';

    return {
      restrict: 'AC',
      require: 'nuList',
      priority: 99,
      link: function(scope, element, attrs, nuList) {
        // Setup the Template & Buffer
        var rawElemenet = element[0],
            children = rawElemenet.children,
            bufferScope = nuList.$bufferDefaults.$new(),
            bufferNode,
            isMultiple = element.hasClass('multiple'),
            itemRawNode = angular.element(item_tmpl);
        
        if(nuList.$buffers.length === 0) {
          bufferNode = $compile( listBuffers.compile(
              trim(buffer_tmpl), bufferScope ) )(bufferScope);
          nuList.$buffers.push(bufferNode[0]);
        } else { bufferNode = angular.element(nuList.$buffers[0]); }

        nuList.$itemCompiler = $compile(itemRawNode);
        element.append(nuList.$buffers).addClass('file');

        nuList.$getItems = function() {
          return Array.prototype.slice.call(children, 0, -1);
        };

        var input = bufferNode.find('input');

        if( !isMultiple ) {
          element.addClass('single');
          element.on('click', function() {
            input[0].click();
          });

          nuList.$formatters.push(function(value) {
            if( value && !isArray(value) ) { return [value]; }
            return value;
          });

          nuList.$parsers.push(function(value) { return value[0]; });
        } else {
          itemRawNode.addClass('erase');
          input.attr('multiple', 'multiple');
        }

        bufferNode.on('click', function() {
          event.stopPropagation();
        });

        var appendItem = nuList.$bufferDefaults.$append;
        nuList.$bufferDefaults.$append = function(item) {
          if(isMultiple || !isMultiple && (nuList.$viewValue.length === 0)) {
            appendItem(item);
          } else if(!isMultiple) { nuList.$bufferDefaults.$update(0, item); }
        };
      }
    };
  }
]);
