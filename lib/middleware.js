'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.conventionalReduxMiddleware = exports.performedActions = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _index = require('./index');

var performedActions = exports.performedActions = {};

var conventionalReduxMiddleware = exports.conventionalReduxMiddleware = function conventionalReduxMiddleware(store) {
  return function (next) {
    return function (action) {
      if (isStringOrArray(action)) {
        var _parseAction = parseAction(action),
            _parseAction2 = _slicedToArray(_parseAction, 4),
            interactorSymbol = _parseAction2[0],
            interactorMethodName = _parseAction2[1],
            actionName = _parseAction2[2],
            args = _parseAction2[3];

        var interactor = getInteractor(interactorSymbol);
        interactor.dispatch = store.dispatch;

        var actionHash = { type: 'CONV_REDUX/' + actionName, args: args };
        performedActions[actionHash.type] = actionHash;
        var nextResult = next(actionHash);

        if (interactor[interactorMethodName]) {
          var actionResult = interactor[interactorMethodName].apply(interactor, args);

          if (isPromise(actionResult)) {
            addAutoDispatchToPromise(actionResult, store, actionName);
            return actionResult;
          }
        }

        return nextResult;
      }

      return next(action);
    };
  };
};

function addAutoDispatchToPromise(promise, store, actionName) {
  promise.then(function (data) {
    try {
      store.dispatch([actionName + 'Success', data]);
    } catch (err) {
      console.error(err.stack);
    }
  }).catch(function (error) {
    try {
      store.dispatch([actionName + 'Error', error]);
    } catch (err) {
      console.error(err.stack);
    }
  });
}

function getInteractor(symbol) {
  var interactor = _index.interactors[symbol];

  if (!interactor) {
    throw new Error('No interactor registered as ' + symbol + '!');
  }

  return interactor;
}

function parseAction(action) {
  var actionName, args;

  if (action instanceof Array) {
    actionName = action[0];
    args = action.slice(1);
  } else {
    actionName = action;
    args = null;
  }

  return actionName.split(':').concat([actionName, args]);
}

function isStringOrArray(action) {
  return typeof action === 'string' || action instanceof String || action instanceof Array;
}

function isPromise(object) {
  return object && 'function' === typeof object.then;
}