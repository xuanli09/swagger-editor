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
    foldState: {
      info: {$folded: false},
      securityDefinitions: {$folded: false},
      tags: {$folded: false},
      paths: {$folded: false},
      definitions: {$folded: false}
    }
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

  /*
   * Returns a node from the foldState tree with a given path
   * if key is not found, it will create the key in foldState tree.
   *
   * @param {array<string>} path - the path to the specific node
  */
  function walkToNode(path) {
    var current = foldState;
    var previus = current;
    var key;

    while (path.length) {
      previus = current;
      key = path.shift();

      if (key === '*') {
        throw new Error('key can not be a wildcard.');
      }

      current = current[key];

      if (!current) {
        previus[key] = {$folded: false};
        current = previus;
      }
    }
    return current;
  }

  /**
   * visit nodes addressed with a path and execute fn function on them
   * @param  {array<string>}   path - array of keys/wildcards to node(s)
   * @param  {Function} fn   function to invoke on node(s)
   */
  function visit(path, fn) {
    if (!_.isArray(path)) {
      throw new TypeError('path should be an array.');
    }

    // if path is not pointing to multiple nodes, simply use walkToNode
    if (_.last(path) !== '*') {
      var node = walkToNode(path);
      if (node) {
        fn(node);
      }
      return;
    }

    // otherwise, split the path between explict paths and wildcards
    var pathToRoot = path.slice(0, path.indexOf('*'));
    var restOfPath = path.slice(path.indexOf('*'));

    // get the root node that has all of our desired nodes in it
    var root = walkToNode(pathToRoot);

    // if the root node doesn't exist, return
    if (!_.isObject(root)) {
      return;
    }

    // for each direct child, change the fold status
    Object.keys(root).forEach(function (nodeName) {

      // ignore the "$folded" key
      if (nodeName === '$folded') {
        return;
      }

      // construct the path to this node and get the node from the foldState
      var node = walkToNode(path.splice(0, -1).concat([nodeName]));

      // if it's the last wildcard, invoke fn with current node
      if (_.isEqual(restOfPath, ['*'])) {
        fn(node);
      } else {

        // replace current nodeName with current wildcard to construct a new
        // path
        var newPath = pathToRoot.concat([nodeName].concat(restOfPath.slice(1)));
        visit(newPath, fn);
      }
    });
  }

  /**
   * Folds node(s)
   * @param  {array<string>} path - an array of keys to rach to the node
  */
  function fold(path) {
    visit(path, function (node) {
      node.$folded = true;
    });
  }

  /**
   * Unfolds node(s)
   * @param  {array<string>} path - an array of keys to rach to the node
  */
  function unfold(path) {
    visit(path, function (node) {
      node.$folded = false;
    });
  }

  /**
   * Toggles the fold state node(s)
   * @param {array<string>} path - array of keys to rach to the node
  */
  function toggleFold(path) {
    visit(path, function (node) {
      node.$folded = !node.$folded;
    });
  }

  /**
   * Determines if a node is folded
   * @param {array<string>} path - array of keys/wildcards to rach to the node
   * @return {Boolean} true if node is folded, false otherwise
   *
  */
  function isFolded(path) {
    var result = false;

    visit(path, function (node) {
      if (node.$folded) {
        result = true;
      }
    });

    return result;
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
