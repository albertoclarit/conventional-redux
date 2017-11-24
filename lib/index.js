'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _middleware = require('./middleware');

Object.defineProperty(exports, 'conventionalReduxMiddleware', {
  enumerable: true,
  get: function get() {
    return _middleware.conventionalReduxMiddleware;
  }
});

var _reducer = require('./reducer');

Object.defineProperty(exports, 'conventionalReducers', {
  enumerable: true,
  get: function get() {
    return _reducer.conventionalReducers;
  }
});

var _connect = require('./connect');

Object.defineProperty(exports, 'connectAllInteractors', {
  enumerable: true,
  get: function get() {
    return _connect.connectAllInteractors;
  }
});
Object.defineProperty(exports, 'connectInteractors', {
  enumerable: true,
  get: function get() {
    return _connect.connectInteractors;
  }
});
exports.registerInteractors = registerInteractors;
exports.registerInteractor = registerInteractor;
exports.replaceDynamicInteractors = replaceDynamicInteractors;
exports.removeDynamicInteractors = removeDynamicInteractors;
exports.setRecreateReducerFunction = setRecreateReducerFunction;
var interactors = exports.interactors = {};
var dynamicInteractorKeys = exports.dynamicInteractorKeys = [];
var recreateReducerFunction = exports.recreateReducerFunction = null;

function registerInteractors(interactors) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  for (var name in interactors) {
    registerInteractor(name, interactors[name], options);
  }
}

function registerInteractor(key, interactor) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (options['dynamic']) {
    dynamicInteractorKeys.push(key);
  }

  interactors[key] = interactor;
}

function replaceDynamicInteractors(interactors) {
  removeDynamicInteractors();
  registerInteractors(interactors, { dynamic: true });

  // add error if function is missing
  recreateReducerFunction();
}

function removeDynamicInteractors() {
  dynamicInteractorKeys.forEach(function (key) {
    delete interactors[key];
  });
}

function setRecreateReducerFunction(func) {
  exports.recreateReducerFunction = recreateReducerFunction = func;
}