/*global angular, jasmine, beforeEach, document: true*/
beforeEach(function() {
  'use strict';
  jasmine.addMatchers({
    toBeTagName: function() {
      return {
        compare: function(actual, expected) {
          return {
            pass: (actual.length? actual[0] : actual).tagName.toLowerCase() === expected.toLowerCase()
          };
        }
      };
    },
    toHaveClass: function() {
      return {
        compare: function(actual, expected) {
          return {
            pass: angular.element(actual).hasClass(expected)
          };
        }
      };
    },
    toHaveAttr: function() {
      return {
        compare: function(actual, attr) {
          return {
            pass: angular.isDefined(angular.element(actual).attr(attr))
          };
        }
      };
    },
    toNotHaveAttr: function() {
      return {
        compare: function(actual, attr) {
          return {
            pass: !angular.isDefined(angular.element(actual).attr(attr))
          };
        }
      };
    },
    toEqualAttr: function() {
      return {
        compare: function(actual, attr, expected) {
          var nodeAttr = angular.element(actual).attr(attr);
          return {
            pass: nodeAttr === expected,
            message: 'Node attr(' + attr + ') to have ' + expected + ', has ' + nodeAttr
          };
        }
      };
    },
    toHaveData: function() {
      return {
        compare: function(actual, name, expected) {
          var nodeData = angular.element(actual).data(name);
          return {
            pass: nodeData === expected,
            message: ''
          };
        }
      };
    },
    toBeEmpty: function() {
      return {
        compare: function(actual) {
          var nodeChildren = angular.element(actual).children();
          return {
            pass: nodeChildren.length === 0,
            message: 'Node is not empty, has ' + nodeChildren.length + ' children'
          };
        }
      };
    },
    toHaveText: function() {
      return {
        compare: function(actual, expected) {
          var nodeText = angular.element(actual).text();
          return {
            pass: nodeText === expected,
            message: 'Node text is to have ' + expected + ', but is ' + nodeText
          };
        }
      };
    },
    toBeChecked: function() {
      return {
        compare: function(node, expected) {
          return {
            pass: node.checked,
            message: 'Node is to be Checked, but its not'
          };
        }
      };
    },
    toNotBeChecked: function() {
      return {
        compare: function(node, expected) {
          return {
            pass: !node.checked,
            message: 'Node is not to be Checked, but it is'
          };
        }
      };
    }

  });
});

function createEvent(name) {
  'use strict';
  var event = document.createEvent('Event');
  event.initEvent(name, true, true);
  return event;
}

function triggerEvent(node, name) {
  if(node.length) {
    angular.forEach(node, function(value, key){
      value.dispatchEvent(createEvent(name));
    });
  } else { node.dispatchEvent(createEvent(name)); }
}