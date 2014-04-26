/*global angular, trim: true*/

var nuFileChooser = angular.module('nu.FileChooser', ['nu.List', 'nu.Event']);

nuFileChooser.directive('nuFileChooser', ['$compile', 'listBuffers', 'nuEvent',
  function($compile, listBuffers, nuEvent) {
    'use strict';
    var item_tmpl = '<span class="list item" ext="{{ext(item.name || item)}}" ng-click="$erase()">{{item.name || item}}</span>';
    var buffer_tmpl = '<buffer class="buffer" type="file"><span class="action">Browse<input type="file"></span></buffer>';

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

        if( !isMultiple ) {
          element.addClass('single');
          var input = bufferNode.find('input');
          element.on('click', function() {
            input[0].click();
          });
        } else {
          itemRawNode.addClass('erase');
          bufferNode.find('input').attr('multiple', 'multiple');
        }

        nuList.$defaults.ext = function(path) {
          if(path) {
            var segments = path.split(/\.([\w\d]+)$/i);
            if( segments[1] ) { return segments[1].toLowerCase(); }
          }
        };

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
