'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.connectAllInteractors = connectAllInteractors;
exports.connectInteractors = connectInteractors;

var _reactRedux = require('react-redux');

var _index = require('./index');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function connectAllInteractors(klass, mapStateToProps, mapDispatchToProps) {
  return connectInteractors(klass, Object.keys(_index.interactors), mapStateToProps, mapDispatchToProps);
}

function connectInteractors(klass, interactorNames, mapStateToProps, mapDispatchToProps) {
  if (isString(interactorNames)) {
    interactorNames = [interactorNames];
  }

  var ConnectedComponent = function (_klass) {
    _inherits(ConnectedComponent, _klass);

    function ConnectedComponent() {
      var _ref;

      var _temp, _this, _ret;

      _classCallCheck(this, ConnectedComponent);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = ConnectedComponent.__proto__ || Object.getPrototypeOf(ConnectedComponent)).call.apply(_ref, [this].concat(args))), _this), _this.connectedInteractors = function () {
        return interactorNames;
      }, _this.__touchedProperties = [], _this.__actionsHash = {}, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(ConnectedComponent, [{
      key: 'p',
      value: function p(propertyKeysChain) {
        if (!this.__touchedProperties.includes(propertyKeysChain)) {
          this.__touchedProperties.push(propertyKeysChain);
        }
        return getProperty(this.props, propertyKeysChain);
      }
    }]);

    return ConnectedComponent;
  }(klass);

  defineActionProperties(ConnectedComponent, interactorNames);

  if (!klass.prototype.shouldComponentUpdate) {
    defineShouldComponentUpdate(ConnectedComponent);
  }

  var stateToPropCreator = function stateToPropCreator(state) {
    if (typeof mapStateToProps === 'function') {

      return _extends({}, connectHash(interactorNames, state), mapStateToProps(state));
    } else {
      return _extends({}, connectHash(interactorNames, state));
    }
  };

  return (0, _reactRedux.connect)(stateToPropCreator, mapDispatchToProps)(ConnectedComponent);
}

function defineActionProperties(klass, interactorNames) {
  interactorNames.forEach(function (interactorName) {
    Object.defineProperty(klass.prototype, interactorName, {
      get: function get() {
        if (!this.__actionsHash[interactorName]) {
          this.__actionsHash[interactorName] = interactorActionHash(interactorName, this);
        }
        return this.__actionsHash[interactorName];
      }
    });
  });
}

function defineShouldComponentUpdate(klass) {
  klass.prototype.shouldComponentUpdate = function (nextProps, nextState) {
    var _this2 = this;

    if (this.connectedInteractors().some(function (interactorName) {
      return typeof nextProps[interactorName] == 'undefined';
    })) {
      return false;
    }

    var result = this.__touchedProperties.some(function (propertyKeyChain) {
      var currentValue = getProperty(_this2.props, propertyKeyChain);
      var newValue = getProperty(nextProps, propertyKeyChain);
      return currentValue != newValue;
    });

    if (result) {
      this.__touchedProperties = [];
    }

    return result;
  };
}

function interactorActionHash(interactorName, component) {
  var actionHash = {};

  actionNames(_index.interactors[interactorName]).forEach(function (methodName) {
    return actionHash[methodName] = function () {
      var args = Array.prototype.slice.call(arguments);
      return component.props.dispatch([interactorName + ':' + methodName].concat(args));
    };
  });

  return actionHash;
}

function actionNames(interactor) {
  var actionNamesList = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  if (!interactor) {
    return [];
  }

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = Object.getOwnPropertyNames(Object.getPrototypeOf(interactor))[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var name = _step.value;

      var method = interactor[name];

      if (!(method instanceof Function) || method === interactor.constructor) continue;

      if (name.startsWith('on')) {
        name = name.replace('on', '');
        name = name.charAt(0).toLowerCase() + name.slice(1);
      }

      if (!actionNamesList.includes(name)) {
        actionNamesList.push(name);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  if (Object.getPrototypeOf(Object.getPrototypeOf(interactor)).constructor.name != 'Object') {
    return actionNames(Object.getPrototypeOf(interactor), actionNamesList);
  } else {
    return actionNamesList;
  }
}

function connectHash(interactorNames, state) {
  var connectHash = {};

  interactorNames.forEach(function (interactorName) {
    return connectHash[interactorName] = state[interactorName];
  });

  return connectHash;
}

function getProperty(object, keyChain) {
  return keyChain.split('.').reduce(function (o, i) {
    if (!o) {
      return null;
    }
    return o[i];
  }, object);
}

function isString(object) {
  return typeof object === 'string' || object instanceof String;
}