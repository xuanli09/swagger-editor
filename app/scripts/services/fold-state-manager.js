'use strict';

/*
 * Manages the fold state of nodes in the code and preveiw tree
*/
SwaggerEditor.service('FoldStateManager', function FoldStateManager() {
  var localStorage = window.localStorage;

  if (!localStorage) {
    throw new Error('localStorage was not found.');
  }

  var changeListeners = new Set();

  var defaultState = {
    info: {$folded: false},
    securityDefinitions: {$folded: false},
    tags: {$folded: false},
    paths: {$folded: false},
    definitions: {$folded: false}
  };

  // set fold state of all root nodes to false as their default value
  var foldState = JSON.parse(localStorage.getItem('foldState'));

  if (!foldState) {
    foldState = defaultState;
  }

  /**
   * invoke change listeners
   */
  function invokeChangeListeners() {
    var args = arguments;

    localStorage.setItem('foldState', JSON.stringify(foldState));

    changeListeners.forEach(function (fn) {
      fn.apply(null, args);
    });
  }

  /**
   * visit nodes addressed with a path and execute fn function on them
   * @param  {array<string>}    path - array of keys/wildcards to node(s)
   * @param  {Function} fn      function to invoke on node(s)
   * @param  {object} context   the current foldState tree
   */
  function visit(path, fn, context) {
    if (!_.isArray(path)) {
      throw new TypeError('path should be an array.');
    }

    var current = context || foldState;
    var previus = current;
    var key;

    function visitCurrentPath(key) {
      if (key !== '$folded') {
        visit(path, fn, current[key]);
      }
    }

    function filterByRegex(regex) {
      return function filter(item) {
        return regex.test(item);
      };
    }

    while (path.length) {
      previus = current;
      key = path.shift();

      if (_.isRegExp(key)) {
        Object.keys(current)
          .filter(filterByRegex(key))
          .forEach(visitCurrentPath);
        return;
      }

      current = current[key];

      if (!current) {
        previus[key] = {$folded: false};
        current = previus;
      }
    }
    fn(current);
  }

  /**
   * Folds node(s)
   * @param  {array<string>} path - an array of keys to rach to the node
  */
  function fold(path) {
    visit(path, function (node) {
      node.$folded = true;
    });

    invokeChangeListeners();
  }

  /**
   * Unfolds node(s)
   * @param  {array<string>} path - an array of keys to rach to the node
  */
  function unfold(path) {
    visit(path, function (node) {
      node.$folded = false;
    });

    invokeChangeListeners();
  }

  /**
   * Toggles the fold state node(s)
   * @param {array<string>} path - array of keys to rach to the node
  */
  function toggleFold(path) {
    visit(path, function (node) {
      node.$folded = !node.$folded;
    });

    invokeChangeListeners();
  }

  /**
   * Determines if a node is folded
   * @param {array<string>} path - array of keys/wildcards to rach to the node
   * @return {Boolean} true if node is folded, false otherwise
   *
  */
  function isFolded(path) {
    var folded = false;
    var isSingleNode = true;

    visit(path, function (node) {
      if (node.$folded) {
        folded = true;
      }

      if (!isSingleNode & !node.$folded) {
        folded = false;
      }

      isSingleNode = false;
    });

    return folded;
  }

  /**
   * Adds a change listener for when a fold state changes in the foldState tree
   * @param  {Function} fn the callback function
   */
  function onFoldChanged(fn) {
    changeListeners.add(fn);
  }

  /**
   * Reset all fold states to default state
  */
  function reset() {
    localStorage.setItem('foldState', JSON.stringify(defaultState));
  }

  this.fold = fold;
  this.unfold = unfold;
  this.toggleFold = toggleFold;
  this.isFolded = isFolded;
  this.onFoldChanged = onFoldChanged;
  this.reset = reset;
});
