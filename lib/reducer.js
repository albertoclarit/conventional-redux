'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.conventionalReducers = conventionalReducers;
exports.conventionalReducer = conventionalReducer;

var _index = require('./index');

var _middleware = require('./middleware');

function conventionalReducers() {
  var conventionalReducersHash = {};

  for (var name in _index.interactors) {
    conventionalReducersHash[name] = conventionalReducer(name);
  }

  return conventionalReducersHash;
}

function conventionalReducer(name) {
  var interactor = _index.interactors[name];

  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : interactor.state;
    var action = arguments[1];

    interactor.state = state;

    if (action.type.startsWith("CONV_REDUX/" + name + ':')) {
      var reduceMethodName = getReduceMethodName(action);

      if (interactor[reduceMethodName]) {
        interactor.state = interactor[reduceMethodName].apply(interactor, action.args);
      }
    }

    handleExternalDependencies(interactor, action);
    handleComputedReducers(interactor, action);

    return interactor.state;
  };
}

function handleExternalDependencies(interactor, action) {
  if (interactor.externalDependencies && interactor.externalDependencies[action.type]) {
    interactor.state = interactor.externalDependencies[action.type].apply(interactor, action.args);
  }
}

function handleComputedReducers(interactor, action) {
  if (interactor.computedReducers) {
    Object.keys(interactor.computedReducers).forEach(function (computedReducer) {
      var actionNames = interactor.computedReducers[computedReducer];

      if (actionNames.includes(action.type)) {
        callCombineReducerIfFed(interactor, actionNames, computedReducer);
      }
    });
  }
}

function callCombineReducerIfFed(interactor, actionNames, computedReducer) {
  var actions = actionNames.map(function (action) {
    return _middleware.performedActions[action];
  });

  if (!actions.includes(undefined)) {
    var reducerArguments = [];
    actions.forEach(function (action) {
      return action.args.forEach(function (value) {
        return reducerArguments.push(value);
      });
    });
    interactor.state = interactor[computedReducer].apply(interactor, reducerArguments);
  }
}

function getReduceMethodName(action) {
  var methodName = action.type.replace('CONV_REDUX/', '').split(':').pop();
  return 'on' + methodName.charAt(0).toUpperCase() + methodName.slice(1);
}