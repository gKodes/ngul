/*global angular, pipeLine, isDefinedAndNotNull, FileReader: true*/
var list = angular.module('nu.list', []);
list.directive('nuList', [
  function() { // try to rename it to collection or list
    return {
      template: '<div class="nu list"></div>',
      restrict: 'EACM',
      replace: true,
      controller: ['$scope', '$element', '$attrs', function($scope, $element) {
        this.$render = angular.noop; // invokde for rending an element, expected an compiler
        this.$filter = angular.noop; // invokde before render if return false wont render that element
        this.$link = angular.noop; // invokde after render with the element

        this.$indexOf = angular.noop;
        this.$formatters = [];
        this.$parsers = [];
        var nuList = this;

        var render = function(item) {
          var node = nuList.$render(item);
          node.data('src', item);
          nuList.$link(node);
        };

        this.$indexOf = function(node) {
          for(var i = 0; i < nuList.$src.length; i++) {
            if( angular.equals(node, nuList.$src[i]) ) {
              return i;
            }
          }
          return -1;
        };

        this.$add = function(item) {
          if(item) {
            nuList.$src.push(item);
          }
        };

        this.$remove = function(node) {
          nuList.$src.splice(nuList.$indexOf(node), 1);
        };

        this.$empty = function() {
          $element.empty();
        };

        this.$draw = function() {
          nuList.$empty();
          angular.forEach(nuList.$src, function(item) {
            if( isDefinedAndNotNull(item) ) {
              render(item);
            }
          });
        };
      }],
      link: function(scope, element, attrs, nuList) {
        var src = attrs[attrs.nuList? 'nuList' : 'src'];
        scope.$watchCollection(src, function(value) {
          nuList.$src = value? value : [];
          nuList.$draw();
        });
      }
    };
  }
]);

list.directive('nuListType', [
  function() {
    var nodes = {
      'img': angular.element('<span class="item thumb"><img></img></span>'),
      'txt': angular.element('<span class="item"></span>')
    };

    var engines = {
      'img': function(node) {
        return function(value) {
          node.removeClass('async').find('img')
            .attr('src', value);
        };
      },
      'txt': function(node) {
        return function(value) {
          node.removeClass('async').text(value);
        };
      }
    };

    return {
      restrict: 'A',
      require: 'nuList',
      link: function(scope, element, attr, nuList) {
        var engine, baseNode;

        attr.$observe('nuListType', function(value) {
          var isIMG = value == 'img';
          engine = engines[(isIMG)? 'img' : 'txt'];
          baseNode = nodes[(isIMG)? 'img' : 'txt'];
        });

        nuList.$render = function(item) {
          //TODO: Node Pooling
          var node = baseNode.clone();
          pipeLine(nuList.$formatters, engine(node))
            .onAsync(function(){
              node.addClass('async');
            }).next(item);
          nuList.$render.append(node);
          return node;
        };
        nuList.$render.append = function(node) {
          element.append(node); // angular.element(element[0])
        };
      }
    };
  }
]);

list.directive('nuListRemovable', [
  function() { // ClickToRemove
    return {
      restrict: 'A',
      require: 'nuList',
      link: function(scope, element, attr, nuList) {
        var canRemove, remove_event = function(event) {
          var target = angular.element(event.currentTarget);
          nuList.$remove(target.data('src'));
          scope.$digest();
        };
        
        nuList.$link = function(node) {
          if(canRemove === false) { return; }
          node.addClass('remove').on('click', remove_event);
        };
        
        var updateView = function() {
          var nodes = element.find('span');
          if(canRemove) {
            nodes.addClass('remove').on('click', remove_event);
            return;
          }
          nodes.removeClass('remove').off('click');
        };

        attr.$observe('nuListRemovable', function(value) {
          canRemove = value === 'false'? false: true;
          updateView();
        });
      }
    };
  }
]);

list.directive('nuListAddable', [
  function() { // ClickToRemove
    var linkers = {
      'img' : function(scope, element, attr, nuList) {
        var buffer = angular.element('<label class="buffer img">' +
          '<input type="file"></label>');
        var input = buffer.find('input');
        input.on('change', function(event) {
          for(var i = 0; i < event.currentTarget.files.length; i++) {
            nuList.$add(event.currentTarget.files[i]);
            scope.$digest();
          }
        });
        attr.$observe('multiple', function(value) {
          if(angular.isDefined(value) && value) { input.attr('multiple',''); }
            else { input.removeAttr('multiple'); }
        });

        //buffer.doFocus = angular.noop;
        buffer.doFocus = function(event) {
          if(event.srcElement === element[0]) {
            buffer[0].click();
          }
        };

        return buffer;
      },
      'txt' : function(scope, element, attr, nuList) {
        var buffer = angular.element('<span contenteditable="true" class="buffer">&nbsp;</span>');

        buffer.on('keydown', function(event) {
          var keyCode = (event.which || event.keyCode);
          if (keyCode === 13) {
            var input = this.innerHTML.replace('&nbsp;','').trim();
            this.innerHTML = '';
            //this.blur();
            event.preventDefault();
            if (input !== '') {
              if (input) {
                nuList.$add(input);
                scope.$digest();
              }
            }
          }
        }).on('focus', function() {
          this.innerHTML = this.innerHTML.replace('&nbsp;', '');
        }).on('blur', function() { // event
          if(this.innerHTML === '') { this.innerHTML = '&nbsp;'; }
        });

        buffer.doFocus = function(event) {
          event.stopPropagation();
          buffer[0].focus();
        };

        return buffer;
      }
    };

    return {
      restrict: 'A',
      require: 'nuList',
      link: function(scope, element, attr, nuList) {
        var buffer, elementRaw = element[0], hasBuffer, base$add = nuList.$add;

        nuList.$add = function(item) {
          pipeLine(nuList.$parsers, base$add).next(item);
        };
        
        var nuList$empty = nuList.$empty;
        var empty = function() {
          while(elementRaw.firstChild != elementRaw.lastChild) {
            angular.element(elementRaw.firstChild).remove();
          }
        };

        var nuList$render_append = nuList.$render.append;
        var append = function(node) {
          elementRaw.insertBefore(node[0], buffer[0]);
        };

        var picture_push = function() {
          this.done(this.result);
        };

        var picture_formatter = function(value) {
          if(value.name && value.type && value.type.match(/image.*/)) {
            var reader = new FileReader();
            reader.done = this.async();
            reader.onload = picture_push;
            reader.readAsDataURL(value);
          }
          return value;
        };

        var updateBuffer = function() {
          element.off('mouseup');
          if(buffer) {
            if( !hasBuffer && buffer[0].parentNode === element[0]) {
              element[0].removeChild(buffer[0]);
              nuList.$empty = nuList$empty;
              nuList.$render.append = nuList$render_append;
              return;
            }

            element.append(buffer);
            nuList.$empty = empty;
            nuList.$render.append = append;
            element.on('mouseup', buffer.doFocus);
          }
        };

        attr.$observe('nuListAddable', function(value) {
          hasBuffer = value !== 'false'? true: false;
          updateBuffer();
        });

        attr.$observe('nuListType', function(value) {
          var isIMG = value == 'img';
          var get_buffer = linkers[isIMG? 'img' : 'txt'];
          if(buffer) {
            if(buffer[0].parentNode === element[0]) {
              buffer.remove();
            }
            buffer.unbind();
          }

          buffer = get_buffer(scope, element, attr, nuList);
          updateBuffer();

          if(isIMG) { // TODO: remove the formater if type changes
            nuList.$formatters.unshift(picture_formatter);
          }
        });
      }
    };
  }
]);

list.directive('nuListTypeFilter', [
  function() { // ClickToRemove
    return {
      restrict: 'A',
      require: 'nuList', // nuListAddable
      link: function(scope, element, attr, nuList) {
        var type;
        nuList.$parsers.unshift(function(file){
          if( !isDefinedAndNotNull(type) ||
                  file.type.match(type) ) {
            return file;
          }
        });

        attr.$observe('nuListTypeFilter', function(value) {
          type = new RegExp(value);
        });
      }
    };
  }
]);
//TODO: Need to support two events onRemove onAdd
