(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(global, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded chunks
/******/ 	// "0" means "already loaded"
/******/ 	var installedChunks = {
/******/ 		0: 0
/******/ 	};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/ 	// The chunk loading function for additional chunks
/******/ 	// Since all referenced chunks are already included
/******/ 	// in this file, this function is empty here.
/******/ 	__webpack_require__.e = function requireEnsure() {
/******/ 		return Promise.resolve();
/******/ 	};
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// uncaught error handler for webpack runtime
/******/ 	__webpack_require__.oe = function(err) {
/******/ 		process.nextTick(function() {
/******/ 			throw err; // catch this error by using import().catch()
/******/ 		});
/******/ 	};
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 56);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("react");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("date-fns/format");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/helpers/classCallCheck");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/helpers/createClass");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/helpers/possibleConstructorReturn");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/helpers/getPrototypeOf");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/helpers/inherits");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("@reach/router");

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("react-static");

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("date-fns/startOfDay");

/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = ({
  'status.investigating': 'Investigating',
  'status.identified': 'Identified',
  'status.monitoring': 'Monitoring',
  'status.resolved': 'Resolved',
  'status.operational': 'Operational',
  'status.up': 'Up',
  'status.down': 'Down',
  'status.unconfirmed_down': 'Unconfirmed Down',
  'status.unknown': 'Unknown',
  'status.paused': 'Paused',
  'status.under-maintenance': 'Under maintenance',
  'status.degraded-performance': 'Degraded performance',
  'status.partial-outage': 'Partial outage',
  'status.major-outage': 'Major outage',
  'status.scheduled': 'Scheduled',
  'status.in-progress': 'In progress',
  'status.verifying': 'Verifying',
  'status.completed': 'Completed',
  'region.asia': 'Asia',
  'region.latinAmerica': 'Latin America',
  'region.northAmerica': 'North America',
  'region.europe': 'Europe',
  'component.cda': 'Content Delivery API',
  'component.cma': 'Content Management API',
  'component.assets': 'Assets CDN (Imgix)',
  'component.administrativeAreas': 'Projects administrative interface',
  'component.dashboard': 'Account dashboard interface',
  'component.site': 'Website'
});

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("babel-plugin-universal-import/universalImport");

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = require("react-markdown");

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {

var _typeof = __webpack_require__(30);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setHasBabelPlugin = exports.ReportChunks = exports.MODULE_IDS = exports.CHUNK_NAMES = undefined;

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var _requireUniversalModule = __webpack_require__(59);

Object.defineProperty(exports, 'CHUNK_NAMES', {
  enumerable: true,
  get: function get() {
    return _requireUniversalModule.CHUNK_NAMES;
  }
});
Object.defineProperty(exports, 'MODULE_IDS', {
  enumerable: true,
  get: function get() {
    return _requireUniversalModule.MODULE_IDS;
  }
});

var _reportChunks = __webpack_require__(61);

Object.defineProperty(exports, 'ReportChunks', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_reportChunks)["default"];
  }
});
exports["default"] = universal;

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(40);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _hoistNonReactStatics = __webpack_require__(41);

var _hoistNonReactStatics2 = _interopRequireDefault(_hoistNonReactStatics);

var _vm = __webpack_require__(62);

var _requireUniversalModule2 = _interopRequireDefault(_requireUniversalModule);

var _utils = __webpack_require__(31);

var _helpers = __webpack_require__(63);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (_typeof(call) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + _typeof(superClass));
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

function _objectWithoutProperties(obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
}

var hasBabelPlugin = false;

var isHMR = function isHMR() {
  return (// $FlowIgnore
    module.hot && (false)
  );
};

var setHasBabelPlugin = exports.setHasBabelPlugin = function setHasBabelPlugin() {
  hasBabelPlugin = true;
};

function universal(asyncModule) {
  var _class, _temp;

  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var userRender = opts.render,
      _opts$loading = opts.loading,
      Loading = _opts$loading === undefined ? _utils.DefaultLoading : _opts$loading,
      _opts$error = opts.error,
      Err = _opts$error === undefined ? _utils.DefaultError : _opts$error,
      _opts$minDelay = opts.minDelay,
      minDelay = _opts$minDelay === undefined ? 0 : _opts$minDelay,
      _opts$alwaysDelay = opts.alwaysDelay,
      alwaysDelay = _opts$alwaysDelay === undefined ? false : _opts$alwaysDelay,
      _opts$testBabelPlugin = opts.testBabelPlugin,
      testBabelPlugin = _opts$testBabelPlugin === undefined ? false : _opts$testBabelPlugin,
      _opts$loadingTransiti = opts.loadingTransition,
      loadingTransition = _opts$loadingTransiti === undefined ? true : _opts$loadingTransiti,
      options = _objectWithoutProperties(opts, ['render', 'loading', 'error', 'minDelay', 'alwaysDelay', 'testBabelPlugin', 'loadingTransition']);

  var renderFunc = userRender || (0, _utils.createDefaultRender)(Loading, Err);
  var isDynamic = hasBabelPlugin || testBabelPlugin;
  options.isDynamic = isDynamic;
  options.usesBabelPlugin = hasBabelPlugin;
  options.modCache = {};
  options.promCache = {};
  return _temp = _class = function (_React$Component) {
    _inherits(UniversalComponent, _React$Component);

    _createClass(UniversalComponent, [{
      key: 'requireAsyncInner',
      value: function requireAsyncInner(requireAsync, props, state, context, isMount) {
        var _this2 = this;

        if (!state.mod && loadingTransition) {
          this.update({
            mod: null,
            props: props
          }); // display `loading` during componentWillReceiveProps
        }

        var time = new Date();
        requireAsync(props, context).then(function (mod) {
          var state = {
            mod: mod,
            props: props,
            context: context
          };
          var timeLapsed = new Date() - time;

          if (timeLapsed < minDelay) {
            var extraDelay = minDelay - timeLapsed;
            return setTimeout(function () {
              return _this2.update(state, isMount);
            }, extraDelay);
          }

          _this2.update(state, isMount);
        })["catch"](function (error) {
          return _this2.update({
            error: error,
            props: props,
            context: context
          });
        });
      }
    }, {
      key: 'handleBefore',
      value: function handleBefore(isMount, isSync) {
        var isServer = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        if (this.props.onBefore) {
          var onBefore = this.props.onBefore;
          var info = {
            isMount: isMount,
            isSync: isSync,
            isServer: isServer
          };
          onBefore(info);
        }
      }
    }, {
      key: 'handleAfter',
      value: function handleAfter(state, isMount, isSync, isServer) {
        var mod = state.mod,
            error = state.error;

        if (mod && !error) {
          (0, _hoistNonReactStatics2["default"])(UniversalComponent, mod, {
            preload: true,
            preloadWeak: true
          });

          if (this.props.onAfter) {
            var onAfter = this.props.onAfter;
            var info = {
              isMount: isMount,
              isSync: isSync,
              isServer: isServer
            };
            onAfter(info, mod);
          }
        } else if (error && this.props.onError) {
          this.props.onError(error);
        }

        this.setState(state);
      } // $FlowFixMe

    }, {
      key: 'init',
      value: function init(props, context) {
        var _req = (0, _requireUniversalModule2["default"])(asyncModule, options, props),
            addModule = _req.addModule,
            requireSync = _req.requireSync,
            requireAsync = _req.requireAsync,
            asyncOnly = _req.asyncOnly;

        var mod = void 0;

        try {
          mod = requireSync(props, context);
        } catch (error) {
          return (0, _helpers.__update)(props, {
            error: error,
            props: props,
            context: context
          }, this._initialized);
        }

        this._asyncOnly = asyncOnly;
        var chunkName = addModule(props); // record the module for SSR flushing :)

        if (context.report) {
          context.report(chunkName);
        }

        if (mod || _utils.isServer) {
          this.handleBefore(true, true, _utils.isServer);
          return (0, _helpers.__update)(props, {
            asyncOnly: asyncOnly,
            props: props,
            mod: mod,
            context: context
          }, this._initialized, true, true, _utils.isServer);
        }

        this.handleBefore(true, false);
        this.requireAsyncInner(requireAsync, props, {
          props: props,
          asyncOnly: asyncOnly,
          mod: mod,
          context: context
        }, context, true);
        return {
          mod: mod,
          asyncOnly: asyncOnly,
          context: context,
          props: props
        };
      }
    }], [{
      key: 'preload',

      /* eslint-enable react/sort-comp */
      value: function preload(props) {
        var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        props = props || {};

        var _req2 = (0, _requireUniversalModule2["default"])(asyncModule, options, props),
            requireAsync = _req2.requireAsync,
            requireSync = _req2.requireSync;

        var mod = void 0;

        try {
          mod = requireSync(props, context);
        } catch (error) {
          return Promise.reject(error);
        }

        return Promise.resolve().then(function () {
          if (mod) return mod;
          return requireAsync(props, context);
        }).then(function (mod) {
          (0, _hoistNonReactStatics2["default"])(UniversalComponent, mod, {
            preload: true,
            preloadWeak: true
          });
          return mod;
        });
      }
      /* eslint-disable react/sort-comp */

    }, {
      key: 'preloadWeak',
      value: function preloadWeak(props) {
        var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        props = props || {};

        var _req3 = (0, _requireUniversalModule2["default"])(asyncModule, options, props),
            requireSync = _req3.requireSync;

        var mod = requireSync(props, context);

        if (mod) {
          (0, _hoistNonReactStatics2["default"])(UniversalComponent, mod, {
            preload: true,
            preloadWeak: true
          });
        }

        return mod;
      }
    }]);

    function UniversalComponent(props, context) {
      _classCallCheck(this, UniversalComponent);

      var _this = _possibleConstructorReturn(this, (UniversalComponent.__proto__ || Object.getPrototypeOf(UniversalComponent)).call(this, props, context));

      _this.update = function (state) {
        var isMount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var isSync = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        var isServer = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
        if (!_this._initialized) return;
        if (!state.error) state.error = null;

        _this.handleAfter(state, isMount, isSync, isServer);
      };

      _this.state = _this.init(_this.props, _this.context); // $FlowFixMe

      _this.state.error = null;
      return _this;
    }

    _createClass(UniversalComponent, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        this._initialized = true;
      }
    }, {
      key: 'componentDidUpdate',
      value: function componentDidUpdate(prevProps) {
        var _this3 = this;

        if (isDynamic || this._asyncOnly) {
          var _req4 = (0, _requireUniversalModule2["default"])(asyncModule, options, this.props, prevProps),
              requireSync = _req4.requireSync,
              requireAsync = _req4.requireAsync,
              shouldUpdate = _req4.shouldUpdate;

          if (shouldUpdate(this.props, prevProps)) {
            var mod = void 0;

            try {
              mod = requireSync(this.props, this.context);
            } catch (error) {
              return this.update({
                error: error
              });
            }

            this.handleBefore(false, !!mod);

            if (!mod) {
              return this.requireAsyncInner(requireAsync, this.props, {
                mod: mod
              });
            }

            var state = {
              mod: mod
            };

            if (alwaysDelay) {
              if (loadingTransition) this.update({
                mod: null
              }); // display `loading` during componentWillReceiveProps

              setTimeout(function () {
                return _this3.update(state, false, true);
              }, minDelay);
              return;
            }

            this.update(state, false, true);
          }
        }
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        this._initialized = false;
      }
    }, {
      key: 'render',
      value: function render() {
        var _props = this.props,
            isLoading = _props.isLoading,
            userError = _props.error,
            props = _objectWithoutProperties(_props, ['isLoading', 'error']);

        var _state = this.state,
            mod = _state.mod,
            error = _state.error;
        return renderFunc(props, mod, isLoading, userError || error);
      }
    }], [{
      key: 'getDerivedStateFromProps',
      value: function getDerivedStateFromProps(nextProps, currentState) {
        var _req5 = (0, _requireUniversalModule2["default"])(asyncModule, options, nextProps, currentState.props),
            requireSync = _req5.requireSync,
            shouldUpdate = _req5.shouldUpdate;

        if (isHMR() && shouldUpdate(currentState.props, nextProps)) {
          var mod = requireSync(nextProps, currentState.context);
          return _extends({}, currentState, {
            mod: mod
          });
        }

        return null;
      }
    }]);

    return UniversalComponent;
  }(_react2["default"].Component), _class.contextTypes = {
    store: _propTypes2["default"].object,
    report: _propTypes2["default"].func
  }, _temp;
}
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(29)(module)))

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = __webpack_require__(31);

var requireById = function requireById(id) {
  if (!(0, _utils.isWebpack)() && typeof id === 'string') {
    return __webpack_require__(60)("" + id);
  }

  return __webpack_require__('' + id);
};

exports["default"] = requireById;

/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = require("date-fns/subDays");

/***/ }),
/* 17 */
/***/ (function(module, exports) {

module.exports = require("chartist");

/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports = require("date-fns/isEqual");

/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/helpers/assertThisInitialized");

/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/helpers/defineProperty");

/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = require("axios");

/***/ }),
/* 22 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return IncidentsRepo; });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var sort_by__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(23);
/* harmony import */ var sort_by__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(sort_by__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var date_fns_startOfDay__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(9);
/* harmony import */ var date_fns_startOfDay__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(date_fns_startOfDay__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var date_fns_isEqual__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(18);
/* harmony import */ var date_fns_isEqual__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(date_fns_isEqual__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var date_fns_startOfMonth__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(34);
/* harmony import */ var date_fns_startOfMonth__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(date_fns_startOfMonth__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _Incident__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(26);








var IncidentsRepo =
/*#__PURE__*/
function () {
  function IncidentsRepo(data) {
    _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0___default()(this, IncidentsRepo);

    this.data = data;
  }

  _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1___default()(IncidentsRepo, [{
    key: "allSince",
    value: function allSince(date) {
      return this.all.filter(function (incident) {
        return incident.date > date;
      });
    }
  }, {
    key: "ofMonth",
    value: function ofMonth(date) {
      return this.all.filter(function (incident) {
        return date_fns_isEqual__WEBPACK_IMPORTED_MODULE_4___default()(date_fns_startOfMonth__WEBPACK_IMPORTED_MODULE_5___default()(incident.date), date_fns_startOfMonth__WEBPACK_IMPORTED_MODULE_5___default()(date));
      });
    }
  }, {
    key: "ofDay",
    value: function ofDay(date) {
      return this.all.filter(function (incident) {
        if (date_fns_isEqual__WEBPACK_IMPORTED_MODULE_4___default()(date_fns_startOfDay__WEBPACK_IMPORTED_MODULE_3___default()(incident.date), date_fns_startOfDay__WEBPACK_IMPORTED_MODULE_3___default()(new Date()))) {
          return !incident.isMaintenance && date_fns_isEqual__WEBPACK_IMPORTED_MODULE_4___default()(date_fns_startOfDay__WEBPACK_IMPORTED_MODULE_3___default()(incident.date), date_fns_startOfDay__WEBPACK_IMPORTED_MODULE_3___default()(date));
        }

        return date_fns_isEqual__WEBPACK_IMPORTED_MODULE_4___default()(date_fns_startOfDay__WEBPACK_IMPORTED_MODULE_3___default()(incident.date), date_fns_startOfDay__WEBPACK_IMPORTED_MODULE_3___default()(date));
      });
    }
  }, {
    key: "unresolved",
    get: function get() {
      return this.all.filter(function (incident) {
        return incident.isUnresolved;
      });
    }
  }, {
    key: "first",
    get: function get() {
      return this.all[this.all.length - 1];
    }
  }, {
    key: "futureMaintenances",
    get: function get() {
      return this.all.filter(function (incident) {
        return incident.isMaintenance && incident.status === 'scheduled';
      });
    }
  }, {
    key: "past",
    get: function get() {
      return this.all.filter(function (incident) {
        return incident.date < new Date();
      });
    }
  }, {
    key: "all",
    get: function get() {
      return this.data.map(function (incidentData) {
        return new _Incident__WEBPACK_IMPORTED_MODULE_6__[/* default */ "a"](incidentData);
      }).sort(sort_by__WEBPACK_IMPORTED_MODULE_2___default()('date')).reverse();
    }
  }]);

  return IncidentsRepo;
}();



/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = require("sort-by");

/***/ }),
/* 24 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4);
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5);
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _babel_runtime_helpers_assertThisInitialized__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(19);
/* harmony import */ var _babel_runtime_helpers_assertThisInitialized__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_assertThisInitialized__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(6);
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(20);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(0);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _reach_router__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(7);
/* harmony import */ var _reach_router__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_reach_router__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _images_logo_svg__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(51);
/* harmony import */ var _images_logo_svg__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(_images_logo_svg__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var _images_rss_svg__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(52);
/* harmony import */ var _images_rss_svg__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(_images_rss_svg__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var react_click_outside__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(53);
/* harmony import */ var react_click_outside__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(react_click_outside__WEBPACK_IMPORTED_MODULE_11__);













var SubscribeToUpdates =
/*#__PURE__*/
function (_React$Component) {
  _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5___default()(SubscribeToUpdates, _React$Component);

  function SubscribeToUpdates() {
    var _getPrototypeOf2;

    var _this;

    _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0___default()(this, SubscribeToUpdates);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2___default()(this, (_getPrototypeOf2 = _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3___default()(SubscribeToUpdates)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_6___default()(_babel_runtime_helpers_assertThisInitialized__WEBPACK_IMPORTED_MODULE_4___default()(_this), "state", {
      isOpen: false
    });

    return _this;
  }

  _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1___default()(SubscribeToUpdates, [{
    key: "handleToggle",
    value: function handleToggle(isOpen) {
      this.setState({
        isOpen: isOpen
      });
    }
  }, {
    key: "render",
    value: function render() {
      var isOpen = this.state.isOpen;
      return react__WEBPACK_IMPORTED_MODULE_7___default.a.createElement("div", {
        className: "subscribe"
      }, react__WEBPACK_IMPORTED_MODULE_7___default.a.createElement("button", {
        onClick: this.handleToggle.bind(this, true),
        className: "subscribe__button"
      }, react__WEBPACK_IMPORTED_MODULE_7___default.a.createElement("img", {
        src: _images_rss_svg__WEBPACK_IMPORTED_MODULE_10___default.a
      }), "Subscribe to Updates"), isOpen && react__WEBPACK_IMPORTED_MODULE_7___default.a.createElement(react_click_outside__WEBPACK_IMPORTED_MODULE_11___default.a, {
        onClickOutside: this.handleToggle.bind(this, false)
      }, react__WEBPACK_IMPORTED_MODULE_7___default.a.createElement("ul", {
        className: "subscribe__modal"
      }, react__WEBPACK_IMPORTED_MODULE_7___default.a.createElement("li", null, react__WEBPACK_IMPORTED_MODULE_7___default.a.createElement("a", {
        href: "/history.atom",
        target: "_blank"
      }, "Atom Feed")), react__WEBPACK_IMPORTED_MODULE_7___default.a.createElement("li", null, react__WEBPACK_IMPORTED_MODULE_7___default.a.createElement("a", {
        href: "/history.rss",
        target: "_blank"
      }, "RSS Feed")), react__WEBPACK_IMPORTED_MODULE_7___default.a.createElement("li", null, react__WEBPACK_IMPORTED_MODULE_7___default.a.createElement("a", {
        href: "/history.json",
        target: "_blank"
      }, "JSON Feed")))));
    }
  }]);

  return SubscribeToUpdates;
}(react__WEBPACK_IMPORTED_MODULE_7___default.a.Component);

/* harmony default export */ __webpack_exports__["a"] = (function () {
  return react__WEBPACK_IMPORTED_MODULE_7___default.a.createElement("div", {
    className: "page-header"
  }, react__WEBPACK_IMPORTED_MODULE_7___default.a.createElement(_reach_router__WEBPACK_IMPORTED_MODULE_8__["Link"], {
    to: "/",
    className: "page-header__logo"
  }, react__WEBPACK_IMPORTED_MODULE_7___default.a.createElement("img", {
    src: _images_logo_svg__WEBPACK_IMPORTED_MODULE_9___default.a,
    alt: "DatoCMS"
  })), react__WEBPACK_IMPORTED_MODULE_7___default.a.createElement("div", {
    className: "page-header__subscribe"
  }, react__WEBPACK_IMPORTED_MODULE_7___default.a.createElement(SubscribeToUpdates, null)));
});

/***/ }),
/* 25 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _reach_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7);
/* harmony import */ var _reach_router__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_reach_router__WEBPACK_IMPORTED_MODULE_1__);


/* harmony default export */ __webpack_exports__["a"] = (function (_ref) {
  var linkLabel = _ref.linkLabel,
      linkUrl = _ref.linkUrl;
  return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
    className: "page-footer"
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
    className: "page-footer__link"
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_reach_router__WEBPACK_IMPORTED_MODULE_1__["Link"], {
    to: linkUrl
  }, linkLabel)), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
    className: "page-footer__other"
  }, "Hosted on Netlify"));
});

/***/ }),
/* 26 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// EXTERNAL MODULE: external "@babel/runtime/helpers/classCallCheck"
var classCallCheck_ = __webpack_require__(2);
var classCallCheck_default = /*#__PURE__*/__webpack_require__.n(classCallCheck_);

// EXTERNAL MODULE: external "@babel/runtime/helpers/createClass"
var createClass_ = __webpack_require__(3);
var createClass_default = /*#__PURE__*/__webpack_require__.n(createClass_);

// EXTERNAL MODULE: external "sort-by"
var external_sort_by_ = __webpack_require__(23);
var external_sort_by_default = /*#__PURE__*/__webpack_require__.n(external_sort_by_);

// EXTERNAL MODULE: external "date-fns/addMinutes"
var addMinutes_ = __webpack_require__(48);
var addMinutes_default = /*#__PURE__*/__webpack_require__.n(addMinutes_);

// EXTERNAL MODULE: /Users/steffoz/code/dato/datocms-status/src/i18n.js
var i18n = __webpack_require__(10);

// CONCATENATED MODULE: /Users/steffoz/code/dato/datocms-status/src/models/Update.js




var Update_Update =
/*#__PURE__*/
function () {
  function Update(data) {
    classCallCheck_default()(this, Update);

    this.data = data;
  }

  createClass_default()(Update, [{
    key: "content",
    get: function get() {
      return this.data.content;
    }
  }, {
    key: "contentWithStatus",
    get: function get() {
      return "**".concat(this.statusLabel, "** \u2014 ").concat(this.data.content);
    }
  }, {
    key: "status",
    get: function get() {
      return this.data.status;
    }
  }, {
    key: "statusLabel",
    get: function get() {
      return i18n["a" /* default */]["status.".concat(this.status)];
    }
  }, {
    key: "date",
    get: function get() {
      return new Date(this.data.date);
    }
  }]);

  return Update;
}();


// CONCATENATED MODULE: /Users/steffoz/code/dato/datocms-status/src/models/Incident.js
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Incident_Incident; });







var Incident_Incident =
/*#__PURE__*/
function () {
  function Incident(data) {
    classCallCheck_default()(this, Incident);

    this.data = data;
  }

  createClass_default()(Incident, [{
    key: "id",
    get: function get() {
      return this.data.path;
    }
  }, {
    key: "slug",
    get: function get() {
      return this.data.path.split('/').pop().replace(/\.json$/, '');
    }
  }, {
    key: "date",
    get: function get() {
      return this.firstUpdate.date;
    }
  }, {
    key: "affectedComponents",
    get: function get() {
      return this.data.components.map(function (id) {
        return i18n["a" /* default */]["component.".concat(id)];
      });
    }
  }, {
    key: "scheduledStart",
    get: function get() {
      return this.data.scheduledTime && new Date(this.data.scheduledTime);
    }
  }, {
    key: "scheduledEnd",
    get: function get() {
      return addMinutes_default()(this.scheduledStart, this.data.minutes);
    }
  }, {
    key: "name",
    get: function get() {
      return this.data.name;
    }
  }, {
    key: "isMaintenance",
    get: function get() {
      return !!this.scheduledStart;
    }
  }, {
    key: "impact",
    get: function get() {
      return this.isMaintenance ? 'maintenance' : this.data.impact;
    }
  }, {
    key: "isUnresolved",
    get: function get() {
      if (this.isMaintenance) {
        return this.status !== 'completed' && this.status !== 'scheduled';
      }

      return this.status !== 'resolved';
    }
  }, {
    key: "status",
    get: function get() {
      return this.lastUpdate.status;
    }
  }, {
    key: "firstUpdate",
    get: function get() {
      return this.updates[this.updates.length - 1];
    }
  }, {
    key: "lastUpdate",
    get: function get() {
      return this.updates[0];
    }
  }, {
    key: "updates",
    get: function get() {
      var updates = this.data.updates.map(function (data) {
        return new Update_Update(data);
      }).sort(external_sort_by_default()('date')).reverse();

      if (this.isMaintenance) {
        updates.push(new Update_Update({
          content: this.data.content,
          status: 'scheduled',
          date: this.scheduledStart
        }));
      }

      return updates;
    }
  }]);

  return Incident;
}();



/***/ }),
/* 27 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_static__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8);
/* harmony import */ var react_static__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_static__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _reach_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7);
/* harmony import */ var _reach_router__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_reach_router__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _styles_index_sass__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(72);
/* harmony import */ var _styles_index_sass__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_styles_index_sass__WEBPACK_IMPORTED_MODULE_3__);





function App() {
  return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_static__WEBPACK_IMPORTED_MODULE_1__["Root"], null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_static__WEBPACK_IMPORTED_MODULE_1__["Head"], null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("link", {
    rel: "icon",
    sizes: "16x16",
    href: "https://www.datocms-assets.com/205/1525789775-dato.png?h=16&w=16",
    type: "image/png"
  }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("link", {
    rel: "icon",
    sizes: "32x32",
    href: "https://www.datocms-assets.com/205/1525789775-dato.png?h=32&w=32",
    type: "image/png"
  }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("link", {
    rel: "icon",
    sizes: "96x96",
    href: "https://www.datocms-assets.com/205/1525789775-dato.png?h=96&w=96",
    type: "image/png"
  }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("link", {
    rel: "icon",
    sizes: "192x192",
    href: "https://www.datocms-assets.com/205/1525789775-dato.png?h=192&w=192",
    type: "image/png"
  })), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Suspense, {
    fallback: react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("em", null, "Loading...")
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_reach_router__WEBPACK_IMPORTED_MODULE_2__["Router"], null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_static__WEBPACK_IMPORTED_MODULE_1__["Routes"], {
    path: "*"
  }))));
}

/* harmony default export */ __webpack_exports__["a"] = (App);

/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = require("date-fns/parseISO");

/***/ }),
/* 29 */
/***/ (function(module, exports) {

module.exports = function (module) {
  if (!module.webpackPolyfill) {
    module.deprecate = function () {};

    module.paths = []; // module.parent = undefined by default

    if (!module.children) module.children = [];
    Object.defineProperty(module, "loaded", {
      enumerable: true,
      get: function get() {
        return module.l;
      }
    });
    Object.defineProperty(module, "id", {
      enumerable: true,
      get: function get() {
        return module.i;
      }
    });
    module.webpackPolyfill = 1;
  }

  return module;
};

/***/ }),
/* 30 */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/helpers/typeof");

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof2 = __webpack_require__(30);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cacheProm = exports.loadFromPromiseCache = exports.cacheExport = exports.loadFromCache = exports.callForString = exports.createDefaultRender = exports.createElement = exports.findExport = exports.resolveExport = exports.tryRequire = exports.DefaultError = exports.DefaultLoading = exports.babelInterop = exports.isWebpack = exports.isServer = exports.isTest = undefined;

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
};

var _react = __webpack_require__(0);

var React = _interopRequireWildcard(_react);

var _requireById = __webpack_require__(15);

var _requireById2 = _interopRequireDefault(_requireById);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};

    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
      }
    }

    newObj["default"] = obj;
    return newObj;
  }
}

var isTest = exports.isTest = "production" === 'test';
var isServer = exports.isServer = !(typeof window !== 'undefined' && window.document && window.document.createElement);

var isWebpack = exports.isWebpack = function isWebpack() {
  return typeof __webpack_require__ !== 'undefined';
};

var babelInterop = exports.babelInterop = function babelInterop(mod) {
  return mod && (typeof mod === 'undefined' ? 'undefined' : _typeof(mod)) === 'object' && mod.__esModule ? mod["default"] : mod;
};

var DefaultLoading = exports.DefaultLoading = function DefaultLoading() {
  return React.createElement('div', null, 'Loading...');
};

var DefaultError = exports.DefaultError = function DefaultError(_ref) {
  var error = _ref.error;
  return React.createElement('div', null, 'Error: ', error && error.message);
};

var tryRequire = exports.tryRequire = function tryRequire(id) {
  try {
    return (0, _requireById2["default"])(id);
  } catch (err) {
    // warn if there was an error while requiring the chunk during development
    // this can sometimes lead the server to render the loading component.
    if (false) {}
  }

  return null;
};

var resolveExport = exports.resolveExport = function resolveExport(mod, key, onLoad, chunkName, props, context, modCache) {
  var isSync = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : false;
  var exp = findExport(mod, key);

  if (onLoad && mod) {
    var _isServer = typeof window === 'undefined';

    var info = {
      isServer: _isServer,
      isSync: isSync
    };
    onLoad(mod, info, props, context);
  }

  if (chunkName && exp) cacheExport(exp, chunkName, props, modCache);
  return exp;
};

var findExport = exports.findExport = function findExport(mod, key) {
  if (typeof key === 'function') {
    return key(mod);
  } else if (key === null) {
    return mod;
  }

  return mod && (typeof mod === 'undefined' ? 'undefined' : _typeof(mod)) === 'object' && key ? mod[key] : babelInterop(mod);
};

var createElement = exports.createElement = function createElement(Component, props) {
  return React.isValidElement(Component) ? React.cloneElement(Component, props) : React.createElement(Component, props);
};

var createDefaultRender = exports.createDefaultRender = function createDefaultRender(Loading, Err) {
  return function (props, mod, isLoading, error) {
    if (isLoading) {
      return createElement(Loading, props);
    } else if (error) {
      return createElement(Err, _extends({}, props, {
        error: error
      }));
    } else if (mod) {
      // primary usage (for async import loading + errors):
      return createElement(mod, props);
    }

    return createElement(Loading, props);
  };
};

var callForString = exports.callForString = function callForString(strFun, props) {
  return typeof strFun === 'function' ? strFun(props) : strFun;
};

var loadFromCache = exports.loadFromCache = function loadFromCache(chunkName, props, modCache) {
  return !isServer && modCache[callForString(chunkName, props)];
};

var cacheExport = exports.cacheExport = function cacheExport(exp, chunkName, props, modCache) {
  return modCache[callForString(chunkName, props)] = exp;
};

var loadFromPromiseCache = exports.loadFromPromiseCache = function loadFromPromiseCache(chunkName, props, promisecache) {
  return promisecache[callForString(chunkName, props)];
};

var cacheProm = exports.cacheProm = function cacheProm(pr, chunkName, props, promisecache) {
  return promisecache[callForString(chunkName, props)] = pr;
};

/***/ }),
/* 32 */
/***/ (function(module, exports) {

module.exports = require("react-dom");

/***/ }),
/* 33 */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/regenerator");

/***/ }),
/* 34 */
/***/ (function(module, exports) {

module.exports = require("date-fns/startOfMonth");

/***/ }),
/* 35 */
/***/ (function(module, exports) {

module.exports = require("date-fns/formatDistanceStrict");

/***/ }),
/* 36 */
/***/ (function(module, exports) {

module.exports = require("date-fns/addSeconds");

/***/ }),
/* 37 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// Imports
// Plugins
var plugins = [{
  location: "/Users/steffoz/code/dato/datocms-status/node_modules/react-static-plugin-source-filesystem",
  plugins: [],
  hooks: {}
}, {
  location: "/Users/steffoz/code/dato/datocms-status/node_modules/react-static-plugin-sass",
  plugins: [],
  hooks: {}
}, {
  location: "/Users/steffoz/code/dato/datocms-status",
  plugins: [],
  hooks: {}
}]; // Export em!

/* harmony default export */ __webpack_exports__["default"] = (plugins);

/***/ }),
/* 38 */
/***/ (function(module, exports) {

module.exports = require("/Users/steffoz/code/dato/datocms-status/node_modules/react-static/lib/browser");

/***/ }),
/* 39 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(__dirname) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "notFoundTemplate", function() { return notFoundTemplate; });
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(11);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var babel_plugin_universal_import_universalImport__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(12);
/* harmony import */ var babel_plugin_universal_import_universalImport__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(babel_plugin_universal_import_universalImport__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(0);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _Users_steffoz_code_dato_datocms_status_node_modules_react_universal_component_dist_index_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(14);
/* harmony import */ var _Users_steffoz_code_dato_datocms_status_node_modules_react_universal_component_dist_index_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_Users_steffoz_code_dato_datocms_status_node_modules_react_universal_component_dist_index_js__WEBPACK_IMPORTED_MODULE_3__);










Object(_Users_steffoz_code_dato_datocms_status_node_modules_react_universal_component_dist_index_js__WEBPACK_IMPORTED_MODULE_3__["setHasBabelPlugin"])();
var universalOptions = {
  loading: function loading() {
    return null;
  },
  error: function error(props) {
    console.error(props.error);
    return react__WEBPACK_IMPORTED_MODULE_2___default.a.createElement("div", null, "An error occurred loading this page's template. More information is available in the console.");
  },
  ignoreBabelRename: true
};
var t_0 = _Users_steffoz_code_dato_datocms_status_node_modules_react_universal_component_dist_index_js__WEBPACK_IMPORTED_MODULE_3___default()(babel_plugin_universal_import_universalImport__WEBPACK_IMPORTED_MODULE_1___default()({
  id: "/Users/steffoz/code/dato/datocms-status/src/pages/404.js",
  load: function load() {
    return Promise.all([Promise.resolve(/* import() | Users/steffoz/code/dato/datocms-status/src/pages/404 */).then(__webpack_require__.bind(null, 42))]).then(function (proms) {
      return proms[0];
    });
  },
  path: function path() {
    return path__WEBPACK_IMPORTED_MODULE_0___default.a.join(__dirname, '/Users/steffoz/code/dato/datocms-status/src/pages/404.js');
  },
  resolve: function resolve() {
    return /*require.resolve*/(42);
  },
  chunkName: function chunkName() {
    return "Users/steffoz/code/dato/datocms-status/src/pages/404";
  }
}), universalOptions);
t_0.template = '/Users/steffoz/code/dato/datocms-status/src/pages/404.js';
var t_1 = _Users_steffoz_code_dato_datocms_status_node_modules_react_universal_component_dist_index_js__WEBPACK_IMPORTED_MODULE_3___default()(babel_plugin_universal_import_universalImport__WEBPACK_IMPORTED_MODULE_1___default()({
  id: "/Users/steffoz/code/dato/datocms-status/src/pages/index.js",
  load: function load() {
    return Promise.all([Promise.resolve(/* import() | Users/steffoz/code/dato/datocms-status/src/pages/index */).then(__webpack_require__.bind(null, 45))]).then(function (proms) {
      return proms[0];
    });
  },
  path: function path() {
    return path__WEBPACK_IMPORTED_MODULE_0___default.a.join(__dirname, '/Users/steffoz/code/dato/datocms-status/src/pages/index.js');
  },
  resolve: function resolve() {
    return /*require.resolve*/(45);
  },
  chunkName: function chunkName() {
    return "Users/steffoz/code/dato/datocms-status/src/pages/index";
  }
}), universalOptions);
t_1.template = '/Users/steffoz/code/dato/datocms-status/src/pages/index.js';
var t_2 = _Users_steffoz_code_dato_datocms_status_node_modules_react_universal_component_dist_index_js__WEBPACK_IMPORTED_MODULE_3___default()(babel_plugin_universal_import_universalImport__WEBPACK_IMPORTED_MODULE_1___default()({
  id: "/Users/steffoz/code/dato/datocms-status/src/containers/History",
  load: function load() {
    return Promise.all([Promise.resolve(/* import() | Users/steffoz/code/dato/datocms-status/src/containers/History */).then(__webpack_require__.bind(null, 43))]).then(function (proms) {
      return proms[0];
    });
  },
  path: function path() {
    return path__WEBPACK_IMPORTED_MODULE_0___default.a.join(__dirname, '/Users/steffoz/code/dato/datocms-status/src/containers/History');
  },
  resolve: function resolve() {
    return /*require.resolve*/(43);
  },
  chunkName: function chunkName() {
    return "Users/steffoz/code/dato/datocms-status/src/containers/History";
  }
}), universalOptions);
t_2.template = '/Users/steffoz/code/dato/datocms-status/src/containers/History';
var t_3 = _Users_steffoz_code_dato_datocms_status_node_modules_react_universal_component_dist_index_js__WEBPACK_IMPORTED_MODULE_3___default()(babel_plugin_universal_import_universalImport__WEBPACK_IMPORTED_MODULE_1___default()({
  id: "/Users/steffoz/code/dato/datocms-status/src/containers/Incident",
  load: function load() {
    return Promise.all([Promise.resolve(/* import() | Users/steffoz/code/dato/datocms-status/src/containers/Incident */).then(__webpack_require__.bind(null, 44))]).then(function (proms) {
      return proms[0];
    });
  },
  path: function path() {
    return path__WEBPACK_IMPORTED_MODULE_0___default.a.join(__dirname, '/Users/steffoz/code/dato/datocms-status/src/containers/Incident');
  },
  resolve: function resolve() {
    return /*require.resolve*/(44);
  },
  chunkName: function chunkName() {
    return "Users/steffoz/code/dato/datocms-status/src/containers/Incident";
  }
}), universalOptions);
t_3.template = '/Users/steffoz/code/dato/datocms-status/src/containers/Incident'; // Template Map

/* harmony default export */ __webpack_exports__["default"] = ({
  '/Users/steffoz/code/dato/datocms-status/src/pages/404.js': t_0,
  '/Users/steffoz/code/dato/datocms-status/src/pages/index.js': t_1,
  '/Users/steffoz/code/dato/datocms-status/src/containers/History': t_2,
  '/Users/steffoz/code/dato/datocms-status/src/containers/Incident': t_3
}); // Not Found Template

var notFoundTemplate = "/Users/steffoz/code/dato/datocms-status/src/pages/404.js";
/* WEBPACK VAR INJECTION */}.call(this, "/"))

/***/ }),
/* 40 */
/***/ (function(module, exports) {

module.exports = require("prop-types");

/***/ }),
/* 41 */
/***/ (function(module, exports) {

module.exports = require("hoist-non-react-statics");

/***/ }),
/* 42 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

/* harmony default export */ __webpack_exports__["default"] = (function () {
  return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h1", null, "404 - Oh no's! We couldn't find that page :("));
});

/***/ }),
/* 43 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4);
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5);
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(6);
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(0);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var react_static__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(8);
/* harmony import */ var react_static__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_static__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _reach_router__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(7);
/* harmony import */ var _reach_router__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_reach_router__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _models_IncidentsRepo__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(22);
/* harmony import */ var date_fns_format__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(1);
/* harmony import */ var date_fns_format__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(date_fns_format__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var date_fns_parseISO__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(28);
/* harmony import */ var date_fns_parseISO__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(date_fns_parseISO__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var _components_Header__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(24);
/* harmony import */ var _images_cheveron_left_svg__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(54);
/* harmony import */ var _images_cheveron_left_svg__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(_images_cheveron_left_svg__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var _images_cheveron_right_svg__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(55);
/* harmony import */ var _images_cheveron_right_svg__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(_images_cheveron_right_svg__WEBPACK_IMPORTED_MODULE_13__);















var History =
/*#__PURE__*/
function (_React$Component) {
  _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4___default()(History, _React$Component);

  function History() {
    _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0___default()(this, History);

    return _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2___default()(this, _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3___default()(History).apply(this, arguments));
  }

  _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1___default()(History, [{
    key: "renderIncident",
    value: function renderIncident(incident) {
      return react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
        className: "history__incident history__incident--impact-".concat(incident.impact),
        key: incident.slug
      }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("h6", {
        className: "history__incident__title"
      }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(_reach_router__WEBPACK_IMPORTED_MODULE_7__["Link"], {
        to: "/incidents/".concat(incident.slug, "/")
      }, incident.name)), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
        className: "history__incident__body"
      }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", null, incident.lastUpdate.content), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
        className: "history__incident__timestamp"
      }, date_fns_format__WEBPACK_IMPORTED_MODULE_9___default()(incident.firstUpdate.date, 'MMM d, hh:mm'), " -", ' ', date_fns_format__WEBPACK_IMPORTED_MODULE_9___default()(incident.lastUpdate.date, 'MMM d, hh:mm OOOO'))));
    }
  }, {
    key: "renderMonth",
    value: function renderMonth(_ref) {
      var month = _ref.month,
          incidents = _ref.incidents;
      return react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
        className: "history__month",
        key: month
      }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("h5", {
        className: "history__month__title"
      }, date_fns_format__WEBPACK_IMPORTED_MODULE_9___default()(date_fns_parseISO__WEBPACK_IMPORTED_MODULE_10___default()(month), 'MMMM yyyy')), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", null, incidents.length === 0 ? react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("p", {
        className: "history__month__no-incidents"
      }, "No incidents reported.") : new _models_IncidentsRepo__WEBPACK_IMPORTED_MODULE_8__[/* default */ "a"](incidents).all.map(this.renderIncident.bind(this))));
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
          incidentsByMonth = _this$props.incidentsByMonth,
          nextPath = _this$props.nextPath,
          prevPath = _this$props.prevPath;
      return react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
        className: "page-container"
      }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(react_static__WEBPACK_IMPORTED_MODULE_6__["Head"], null, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("meta", {
        charSet: "UTF-8"
      }), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("title", null, "Incidents History - DatoCMS Status")), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(_components_Header__WEBPACK_IMPORTED_MODULE_11__[/* default */ "a"], null), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
        className: "history"
      }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
        className: "history__header"
      }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
        className: "history__header__title"
      }, "Incidents history"), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("div", {
        className: "history__header__nav"
      }, prevPath && react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(_reach_router__WEBPACK_IMPORTED_MODULE_7__["Link"], {
        to: prevPath,
        className: "history__button history__button--prev"
      }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("img", {
        src: _images_cheveron_left_svg__WEBPACK_IMPORTED_MODULE_12___default.a
      })), react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("span", null, date_fns_format__WEBPACK_IMPORTED_MODULE_9___default()(date_fns_parseISO__WEBPACK_IMPORTED_MODULE_10___default()(incidentsByMonth[0].month), 'MMMM yyyy'), " to", ' ', date_fns_format__WEBPACK_IMPORTED_MODULE_9___default()(date_fns_parseISO__WEBPACK_IMPORTED_MODULE_10___default()(incidentsByMonth[incidentsByMonth.length - 1].month), 'MMMM yyyy')), nextPath && react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement(_reach_router__WEBPACK_IMPORTED_MODULE_7__["Link"], {
        to: nextPath,
        className: "history__button history__button--next"
      }, react__WEBPACK_IMPORTED_MODULE_5___default.a.createElement("img", {
        src: _images_cheveron_right_svg__WEBPACK_IMPORTED_MODULE_13___default.a
      })))), incidentsByMonth.map(this.renderMonth.bind(this))));
    }
  }]);

  return History;
}(react__WEBPACK_IMPORTED_MODULE_5___default.a.Component);

/* harmony default export */ __webpack_exports__["default"] = (Object(react_static__WEBPACK_IMPORTED_MODULE_6__["withRouteData"])(History));

/***/ }),
/* 44 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_static__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8);
/* harmony import */ var react_static__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_static__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _reach_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7);
/* harmony import */ var _reach_router__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_reach_router__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _models_Incident__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(26);
/* harmony import */ var date_fns_format__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1);
/* harmony import */ var date_fns_format__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(date_fns_format__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _components_Footer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(25);
/* harmony import */ var react_markdown__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(13);
/* harmony import */ var react_markdown__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_markdown__WEBPACK_IMPORTED_MODULE_6__);







/* harmony default export */ __webpack_exports__["default"] = (Object(react_static__WEBPACK_IMPORTED_MODULE_1__["withRouteData"])(function (_ref) {
  var incidentData = _ref.incident;
  var incident = new _models_Incident__WEBPACK_IMPORTED_MODULE_3__[/* default */ "a"](incidentData);
  return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
    className: "page-container page-container--incident"
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_static__WEBPACK_IMPORTED_MODULE_1__["Head"], null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("meta", {
    charSet: "UTF-8"
  }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("title", null, incident.name, " - DatoCMS Status")), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
    className: "incident-details incident-details--impact-".concat(incident.impact)
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h3", {
    className: "incident-details__title"
  }, incident.name), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", {
    className: "incident-details__subtitle"
  }, incident.isMaintenance ? 'Scheduled Maintenance Report for DatoCMS' : 'Incident report for DatoCMS'), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
    className: "incident-details__updates"
  }, incident.updates.map(function (update) {
    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
      className: "incident-details__update",
      key: update.date
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("strong", {
      className: "incident-details__update__status"
    }, update.statusLabel), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
      className: "incident-details__update__description"
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
      className: "incident-details__update__message"
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_markdown__WEBPACK_IMPORTED_MODULE_6___default.a, {
      className: "ugc",
      source: update.content
    })), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", {
      className: "incident-details__update__timestamp"
    }, "Posted at ", date_fns_format__WEBPACK_IMPORTED_MODULE_4___default()(update.date, 'MMM d, hh:mm OOOO'))));
  })), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_components_Footer__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"], {
    linkLabel: "Current Status",
    linkUrl: "/"
  })));
}));

/***/ }),
/* 45 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: external "@babel/runtime/regenerator"
var regenerator_ = __webpack_require__(33);
var regenerator_default = /*#__PURE__*/__webpack_require__.n(regenerator_);

// EXTERNAL MODULE: external "@babel/runtime/helpers/asyncToGenerator"
var asyncToGenerator_ = __webpack_require__(47);
var asyncToGenerator_default = /*#__PURE__*/__webpack_require__.n(asyncToGenerator_);

// EXTERNAL MODULE: external "@babel/runtime/helpers/classCallCheck"
var classCallCheck_ = __webpack_require__(2);
var classCallCheck_default = /*#__PURE__*/__webpack_require__.n(classCallCheck_);

// EXTERNAL MODULE: external "@babel/runtime/helpers/createClass"
var createClass_ = __webpack_require__(3);
var createClass_default = /*#__PURE__*/__webpack_require__.n(createClass_);

// EXTERNAL MODULE: external "@babel/runtime/helpers/possibleConstructorReturn"
var possibleConstructorReturn_ = __webpack_require__(4);
var possibleConstructorReturn_default = /*#__PURE__*/__webpack_require__.n(possibleConstructorReturn_);

// EXTERNAL MODULE: external "@babel/runtime/helpers/getPrototypeOf"
var getPrototypeOf_ = __webpack_require__(5);
var getPrototypeOf_default = /*#__PURE__*/__webpack_require__.n(getPrototypeOf_);

// EXTERNAL MODULE: external "@babel/runtime/helpers/assertThisInitialized"
var assertThisInitialized_ = __webpack_require__(19);
var assertThisInitialized_default = /*#__PURE__*/__webpack_require__.n(assertThisInitialized_);

// EXTERNAL MODULE: external "@babel/runtime/helpers/inherits"
var inherits_ = __webpack_require__(6);
var inherits_default = /*#__PURE__*/__webpack_require__.n(inherits_);

// EXTERNAL MODULE: external "@babel/runtime/helpers/defineProperty"
var defineProperty_ = __webpack_require__(20);
var defineProperty_default = /*#__PURE__*/__webpack_require__.n(defineProperty_);

// EXTERNAL MODULE: external "react"
var external_react_ = __webpack_require__(0);
var external_react_default = /*#__PURE__*/__webpack_require__.n(external_react_);

// EXTERNAL MODULE: external "react-static"
var external_react_static_ = __webpack_require__(8);

// EXTERNAL MODULE: external "axios"
var external_axios_ = __webpack_require__(21);
var external_axios_default = /*#__PURE__*/__webpack_require__.n(external_axios_);

// EXTERNAL MODULE: /Users/steffoz/code/dato/datocms-status/src/models/IncidentsRepo.js
var IncidentsRepo = __webpack_require__(22);

// EXTERNAL MODULE: external "@babel/runtime/helpers/slicedToArray"
var slicedToArray_ = __webpack_require__(49);
var slicedToArray_default = /*#__PURE__*/__webpack_require__.n(slicedToArray_);

// EXTERNAL MODULE: external "chartist"
var external_chartist_ = __webpack_require__(17);
var external_chartist_default = /*#__PURE__*/__webpack_require__.n(external_chartist_);

// EXTERNAL MODULE: external "date-fns/format"
var format_ = __webpack_require__(1);
var format_default = /*#__PURE__*/__webpack_require__.n(format_);

// EXTERNAL MODULE: external "chartist-plugin-tooltips"
var external_chartist_plugin_tooltips_ = __webpack_require__(74);

// CONCATENATED MODULE: /Users/steffoz/code/dato/datocms-status/src/components/Chart.js








var Chart_Chart =
/*#__PURE__*/
function (_Component) {
  inherits_default()(Chart, _Component);

  function Chart() {
    classCallCheck_default()(this, Chart);

    return possibleConstructorReturn_default()(this, getPrototypeOf_default()(Chart).apply(this, arguments));
  }

  createClass_default()(Chart, [{
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(newProps) {
      this.updateChart(newProps);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      if (this.chartist) {
        try {
          this.chartist.detach();
        } catch (err) {
          throw new Error('Internal chartist error', err);
        }
      }
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.updateChart(this.props);
    }
  }, {
    key: "updateChart",
    value: function updateChart(config) {
      var type = config.type,
          data = config.data;
      var options = config.options || {};
      var responsiveOptions = config.responsiveOptions || [];
      var event;

      if (this.chartist) {
        this.chartist.update(data, options, responsiveOptions);
      } else {
        this.chartist = new external_chartist_default.a[type](this.chart, data, options, responsiveOptions);

        if (config.listener) {
          for (event in config.listener) {
            if (config.listener.hasOwnProperty(event)) {
              this.chartist.on(event, config.listener[event]);
            }
          }
        }
      }

      return this.chartist;
    }
  }, {
    key: "render",
    value: function render() {
      var _this = this;

      var _this$props = this.props,
          className = _this$props.className,
          style = _this$props.style,
          children = _this$props.children,
          data = _this$props.data,
          type = _this$props.type;
      var childrenWithProps = children && external_react_["Children"].map(children, function (child) {
        return Object(external_react_["cloneElement"])(child, {
          type: type,
          data: data
        });
      });
      return external_react_default.a.createElement("div", {
        className: "ct-chart ".concat(className || ''),
        ref: function ref(_ref) {
          return _this.chart = _ref;
        },
        style: style
      }, childrenWithProps);
    }
  }]);

  return Chart;
}(external_react_["Component"]);


// CONCATENATED MODULE: /Users/steffoz/code/dato/datocms-status/src/components/SystemMetric.js













var SystemMetric_SystemMetric =
/*#__PURE__*/
function (_React$Component) {
  inherits_default()(SystemMetric, _React$Component);

  function SystemMetric() {
    var _getPrototypeOf2;

    var _this;

    classCallCheck_default()(this, SystemMetric);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = possibleConstructorReturn_default()(this, (_getPrototypeOf2 = getPrototypeOf_default()(SystemMetric)).call.apply(_getPrototypeOf2, [this].concat(args)));
    _this.state = {};
    return _this;
  }

  createClass_default()(SystemMetric, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.fetchData(this.props);
    }
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(newProps) {
      this.fetchData(newProps);
    }
  }, {
    key: "fetchData",
    value: function fetchData(_ref) {
      var _this2 = this;

      var graph = _ref.graph,
          time = _ref.time;
      this.setState({
        overTime: null,
        global: null
      });
      external_axios_default.a.get('/.netlify/functions/cloudwatch', {
        params: {
          graph: graph,
          time: time
        }
      }).then(function (response) {
        var _response$data = response.data,
            overTime = _response$data.overTime,
            global = _response$data.global;

        _this2.setState({
          overTime: overTime.map(function (_ref2) {
            var t = _ref2.t,
                v = _ref2.v;
            return {
              x: new Date(t),
              y: v
            };
          }),
          global: global
        });
      })["catch"](function (data) {
        return console.log(data);
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
          name = _this$props.name,
          legend = _this$props.legend,
          unit = _this$props.unit,
          time = _this$props.time;
      var _this$state = this.state,
          overTime = _this$state.overTime,
          global = _this$state.global;
      return external_react_default.a.createElement("div", {
        className: "system-metric"
      }, external_react_default.a.createElement("div", {
        className: "system-metric__header"
      }, external_react_default.a.createElement("div", {
        className: "system-metric__name"
      }, this.props.name), external_react_default.a.createElement("div", {
        className: "system-metric__avg"
      }, global ? "".concat(global).concat(unit) : 'Loading...')), external_react_default.a.createElement("div", {
        className: "system-metric__graph"
      }, overTime && external_react_default.a.createElement(Chart_Chart, {
        type: "Line",
        data: {
          series: [overTime]
        },
        options: {
          height: '150px',
          axisY: {
            showGrid: false,
            showLine: false,
            labelInterpolationFnc: function labelInterpolationFnc(value) {
              return "".concat(value).concat(unit);
            }
          },
          axisX: {
            showGrid: false,
            showLine: false,
            type: external_chartist_default.a.FixedScaleAxis,
            divisor: 5,
            labelInterpolationFnc: function labelInterpolationFnc(value) {
              if (time === 'day') {
                return format_default()(new Date(value), 'HH:mm');
              }

              return format_default()(new Date(value), 'MMM d');
            }
          },
          chartPadding: {
            top: 15,
            right: 0,
            bottom: 0,
            left: 15
          },
          fullWidth: true,
          plugins: [external_chartist_default.a.plugins.tooltip({
            tooltipFnc: function tooltipFnc(_, meta) {
              var _meta$split = meta.split(/,/),
                  _meta$split2 = slicedToArray_default()(_meta$split, 2),
                  timestamp = _meta$split2[0],
                  value = _meta$split2[1];

              return "\n                          <p class='chartist-tooltip-timestamp'>\n                            ".concat(format_default()(new Date(parseInt(timestamp)), 'EEEE, MMM d, HH:mm'), "\n                          </p>\n                          <p class='chartist-tooltip-value'>\n                            ").concat(legend, ": <strong>").concat(value).concat(unit, "</strong>\n                          </p>\n                        ");
            }
          })]
        }
      })));
    }
  }]);

  return SystemMetric;
}(external_react_default.a.Component);


// CONCATENATED MODULE: /Users/steffoz/code/dato/datocms-status/src/components/SystemMetrics.js








var SystemMetrics_SystemMetrics =
/*#__PURE__*/
function (_React$Component) {
  inherits_default()(SystemMetrics, _React$Component);

  function SystemMetrics() {
    var _getPrototypeOf2;

    var _this;

    classCallCheck_default()(this, SystemMetrics);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = possibleConstructorReturn_default()(this, (_getPrototypeOf2 = getPrototypeOf_default()(SystemMetrics)).call.apply(_getPrototypeOf2, [this].concat(args)));
    _this.state = {
      period: 'day'
    };
    return _this;
  }

  createClass_default()(SystemMetrics, [{
    key: "handleChangePeriod",
    value: function handleChangePeriod(period) {
      this.setState({
        period: period
      });
    }
  }, {
    key: "render",
    value: function render() {
      var period = this.state.period;
      return external_react_default.a.createElement("div", {
        className: "system-metrics"
      }, external_react_default.a.createElement("div", {
        className: "system-metrics__header"
      }, external_react_default.a.createElement("div", {
        className: "system-metrics__title"
      }, "System Metrics"), external_react_default.a.createElement("div", {
        className: "system-metrics__period"
      }, external_react_default.a.createElement("button", {
        className: period === 'day' ? 'is-active' : '',
        onClick: this.handleChangePeriod.bind(this, 'day')
      }, "Day"), external_react_default.a.createElement("button", {
        className: period === 'week' ? 'is-active' : '',
        onClick: this.handleChangePeriod.bind(this, 'week')
      }, "Week"), external_react_default.a.createElement("button", {
        className: period === 'month' ? 'is-active' : '',
        onClick: this.handleChangePeriod.bind(this, 'month')
      }, "Month"))), external_react_default.a.createElement(SystemMetric_SystemMetric, {
        name: "Content Delivery API response time",
        legend: "Response time",
        unit: "ms",
        graph: "cda.responseTime",
        time: period
      }), external_react_default.a.createElement(SystemMetric_SystemMetric, {
        name: "API success rate",
        legend: "Success rate",
        graph: "api.successRate",
        time: period,
        unit: "%"
      }));
    }
  }]);

  return SystemMetrics;
}(external_react_default.a.Component);


// EXTERNAL MODULE: external "react-markdown"
var external_react_markdown_ = __webpack_require__(13);
var external_react_markdown_default = /*#__PURE__*/__webpack_require__.n(external_react_markdown_);

// CONCATENATED MODULE: /Users/steffoz/code/dato/datocms-status/src/components/UnresolvedIncidentBody.js



/* harmony default export */ var UnresolvedIncidentBody = (function (_ref) {
  var incident = _ref.incident;
  return external_react_default.a.createElement("div", {
    className: "unresolved-incident__body"
  }, incident.updates.map(function (update) {
    return external_react_default.a.createElement("div", {
      className: "unresolved-incident__update",
      key: update.content
    }, external_react_default.a.createElement("div", {
      className: "unresolved-incident__update__description"
    }, external_react_default.a.createElement(external_react_markdown_default.a, {
      className: "ugc",
      source: update.contentWithStatus
    })), external_react_default.a.createElement("p", {
      className: "unresolved-incident__update__timestamp"
    }, format_default()(update.date, 'MMM d, hh:mm OOOO')));
  }));
});
// CONCATENATED MODULE: /Users/steffoz/code/dato/datocms-status/src/components/UnresolvedIncident.js


/* harmony default export */ var UnresolvedIncident = (function (_ref) {
  var incident = _ref.incident;
  return external_react_default.a.createElement("div", {
    className: "unresolved-incident unresolved-incident--impact-".concat(incident.impact)
  }, external_react_default.a.createElement("div", {
    className: "unresolved-incident__title"
  }, incident.name), external_react_default.a.createElement(UnresolvedIncidentBody, {
    incident: incident
  }));
});
// EXTERNAL MODULE: external "date-fns/subDays"
var subDays_ = __webpack_require__(16);
var subDays_default = /*#__PURE__*/__webpack_require__.n(subDays_);

// EXTERNAL MODULE: external "date-fns/formatDistanceStrict"
var formatDistanceStrict_ = __webpack_require__(35);
var formatDistanceStrict_default = /*#__PURE__*/__webpack_require__.n(formatDistanceStrict_);

// EXTERNAL MODULE: external "date-fns/addSeconds"
var addSeconds_ = __webpack_require__(36);
var addSeconds_default = /*#__PURE__*/__webpack_require__.n(addSeconds_);

// EXTERNAL MODULE: /Users/steffoz/code/dato/datocms-status/src/i18n.js
var i18n = __webpack_require__(10);

// CONCATENATED MODULE: /Users/steffoz/code/dato/datocms-status/src/components/DailyOutage.js







var DailyOutage_generateDatesSince = function generateDatesSince(days) {
  var dates = [];

  for (var i = 0; i < days; i++) {
    dates.push(subDays_default()(new Date(), days - i - 1));
  }

  return dates;
};

/* harmony default export */ var DailyOutage = (function (_ref) {
  var regions = _ref.regions,
      daysSince = _ref.daysSince;
  return external_react_default.a.createElement("div", {
    className: "daily-outage"
  }, external_react_default.a.createElement("svg", {
    preserveAspectRatio: "none",
    height: "34",
    viewBox: "0 0 ".concat(8 * daysSince - 2, " 34")
  }, DailyOutage_generateDatesSince(daysSince).map(function (date, i) {
    var downtimePerRegion = regions.map(function (_ref2) {
      var id = _ref2.id,
          outagesPerDay = _ref2.outagesPerDay;
      var day = outagesPerDay.find(function (_ref3) {
        var d = _ref3.date;
        return d === format_default()(date, 'yyyy-MM-dd');
      });
      return {
        id: id,
        downtime: day ? day.downtime : 0
      };
    });
    var totalDowntime = downtimePerRegion.reduce(function (acc, _ref4) {
      var downtime = _ref4.downtime;
      return acc + downtime;
    }, 0);
    var color = totalDowntime > 0 ? '#f1c40f' : '#2fcc66';
    var message;

    if (totalDowntime === 0) {
      message = 'No downtime reported for this day';
    } else if (regions.length > 1) {
      message = downtimePerRegion.filter(function (_ref5) {
        var downtime = _ref5.downtime;
        return downtime > 0;
      }).map(function (_ref6) {
        var id = _ref6.id,
            downtime = _ref6.downtime;
        return "".concat(formatDistanceStrict_default()(new Date(), addSeconds_default()(new Date(), downtime)), " of outage in ").concat(i18n["a" /* default */]["region.".concat(id)]);
      }).join('</p><p>');
    } else {
      var time = formatDistanceStrict_default()(new Date(), addSeconds_default()(new Date(), downtimePerRegion[0].downtime));
      message = "".concat(time, " of outage");
    }

    return external_react_default.a.createElement("rect", {
      key: date,
      height: "34",
      width: "7",
      x: 8 * i,
      y: "0",
      "data-tip": "\n              <div><strong>".concat(format_default()(date, 'MMMM d'), "</strong></div>\n              <div><p>").concat(message, "</p></div>\n            "),
      fill: color
    });
  })));
});
// EXTERNAL MODULE: external "react-tooltip"
var external_react_tooltip_ = __webpack_require__(50);
var external_react_tooltip_default = /*#__PURE__*/__webpack_require__.n(external_react_tooltip_);

// CONCATENATED MODULE: /Users/steffoz/code/dato/datocms-status/src/components/ComponentStatus.js




/* harmony default export */ var ComponentStatus = (function (_ref) {
  var id = _ref.id,
      daysSince = _ref.daysSince,
      regions = _ref.regions,
      totalDowntime = _ref.totalDowntime;
  var problematicRegions = regions.filter(function (region) {
    return region.status !== 'up';
  });
  var status = problematicRegions.length > 0 ? problematicRegions[0].status : 'operational';
  var periodInMs = daysSince * 60 * 60 * 24;
  return external_react_default.a.createElement("div", {
    className: "component-status component-status--status-".concat(status)
  }, external_react_default.a.createElement("div", {
    className: "component-status__header"
  }, external_react_default.a.createElement("div", {
    className: "component-status__name"
  }, i18n["a" /* default */]["component.".concat(id)]), external_react_default.a.createElement("div", {
    className: "component-status__status"
  }, i18n["a" /* default */]["status.".concat(status)])), external_react_default.a.createElement(DailyOutage, {
    regions: regions,
    daysSince: daysSince
  }), external_react_default.a.createElement("div", {
    className: "component-status__footer"
  }, external_react_default.a.createElement("div", {
    className: "component-status__left"
  }, daysSince, " days ago"), external_react_default.a.createElement("div", {
    className: "component-status__uptime"
  }, Math.round((periodInMs - totalDowntime) / periodInMs * 100000) / 1000, "%\xA0uptime"), external_react_default.a.createElement("div", {
    className: "component-status__right"
  }, "Today")), external_react_default.a.createElement(external_react_tooltip_default.a, {
    html: true,
    delayShow: 100,
    className: "tooltip"
  }));
});
// EXTERNAL MODULE: external "date-fns/startOfDay"
var startOfDay_ = __webpack_require__(9);
var startOfDay_default = /*#__PURE__*/__webpack_require__.n(startOfDay_);

// EXTERNAL MODULE: external "@reach/router"
var router_ = __webpack_require__(7);

// CONCATENATED MODULE: /Users/steffoz/code/dato/datocms-status/src/components/IncidentsDailyOverview.js












var IncidentsDailyOverview_IncidentsDailyOverview =
/*#__PURE__*/
function (_React$Component) {
  inherits_default()(IncidentsDailyOverview, _React$Component);

  function IncidentsDailyOverview() {
    classCallCheck_default()(this, IncidentsDailyOverview);

    return possibleConstructorReturn_default()(this, getPrototypeOf_default()(IncidentsDailyOverview).apply(this, arguments));
  }

  createClass_default()(IncidentsDailyOverview, [{
    key: "renderIncident",
    value: function renderIncident(incident) {
      return external_react_default.a.createElement("div", {
        className: "incidents-daily__incident incidents-daily__incident--impact-".concat(incident.impact),
        key: incident.slug
      }, external_react_default.a.createElement("h6", {
        className: "incidents-daily__incident__title"
      }, external_react_default.a.createElement(router_["Link"], {
        to: "/incidents/".concat(incident.slug, "/")
      }, incident.name)), incident.updates.map(function (update) {
        return external_react_default.a.createElement("div", {
          className: "incidents-daily__incident__update",
          key: update.content
        }, external_react_default.a.createElement("div", {
          className: "incidents-daily__incident__update__description"
        }, external_react_default.a.createElement(external_react_markdown_default.a, {
          className: "ugc",
          source: update.contentWithStatus
        })), external_react_default.a.createElement("p", {
          className: "incidents-daily__incident__update__timestamp"
        }, format_default()(update.date, 'MMM d, hh:mm OOOO')));
      }));
    }
  }, {
    key: "renderDay",
    value: function renderDay(day) {
      var incidents = this.props.incidents;
      var dayIncidents = incidents.ofDay(day);
      return external_react_default.a.createElement("div", {
        className: "incidents-daily__day",
        key: day
      }, external_react_default.a.createElement("h5", {
        className: "incidents-daily__day__title"
      }, format_default()(day, 'MMMM d, yyyy')), external_react_default.a.createElement("div", null, dayIncidents.length === 0 ? external_react_default.a.createElement("p", {
        className: "incidents-daily__day__no-incidents"
      }, "No incidents reported.") : dayIncidents.map(this.renderIncident.bind(this))));
    }
  }, {
    key: "render",
    value: function render() {
      var daysCount = this.props.daysCount;
      var days = [];

      for (var i = 0; i < daysCount; i++) {
        days.push(subDays_default()(startOfDay_default()(new Date()), i));
      }

      return external_react_default.a.createElement("div", {
        className: "incidents-daily"
      }, external_react_default.a.createElement("div", {
        className: "incidents-daily__title"
      }, "Past incidents"), days.map(this.renderDay.bind(this)));
    }
  }]);

  return IncidentsDailyOverview;
}(external_react_default.a.Component);


// CONCATENATED MODULE: /Users/steffoz/code/dato/datocms-status/src/components/FutureMaintenances.js












var FutureMaintenances_FutureMaintenances =
/*#__PURE__*/
function (_React$Component) {
  inherits_default()(FutureMaintenances, _React$Component);

  function FutureMaintenances() {
    classCallCheck_default()(this, FutureMaintenances);

    return possibleConstructorReturn_default()(this, getPrototypeOf_default()(FutureMaintenances).apply(this, arguments));
  }

  createClass_default()(FutureMaintenances, [{
    key: "renderIncident",
    value: function renderIncident(incident) {
      return external_react_default.a.createElement("div", {
        className: "scheduled-maintenances__incident scheduled-maintenances__incident--impact-".concat(incident.impact),
        key: incident.slug
      }, external_react_default.a.createElement("h6", {
        className: "scheduled-maintenances__incident__title"
      }, incident.name), external_react_default.a.createElement("div", {
        className: "scheduled-maintenances__description"
      }, external_react_default.a.createElement(external_react_markdown_default.a, {
        className: "ugc",
        source: incident.firstUpdate.content
      })), external_react_default.a.createElement("div", {
        className: "scheduled-maintenances__components"
      }, "This scheduled maintenance will affect:", ' ', incident.affectedComponents.join(', ')), external_react_default.a.createElement("p", {
        className: "scheduled-maintenances__timestamp"
      }, "Scheduled for ", format_default()(incident.scheduledStart, 'MMM d, hh:mm'), "-", format_default()(incident.scheduledEnd, 'hh:mm OOOO')));
    }
  }, {
    key: "render",
    value: function render() {
      var incidents = this.props.incidents;

      if (incidents.futureMaintenances.length === 0) {
        return null;
      }

      return external_react_default.a.createElement("div", {
        className: "scheduled-maintenances"
      }, external_react_default.a.createElement("div", {
        className: "scheduled-maintenances__title"
      }, "Scheduled Maintenance"), incidents.futureMaintenances.map(this.renderIncident.bind(this)));
    }
  }]);

  return FutureMaintenances;
}(external_react_default.a.Component);


// EXTERNAL MODULE: /Users/steffoz/code/dato/datocms-status/src/components/Header.js
var Header = __webpack_require__(24);

// EXTERNAL MODULE: /Users/steffoz/code/dato/datocms-status/src/components/Footer.js
var Footer = __webpack_require__(25);

// CONCATENATED MODULE: /Users/steffoz/code/dato/datocms-status/src/pages/index.js




















var DAYS = 60;

var pages_Homepage =
/*#__PURE__*/
function (_React$Component) {
  inherits_default()(Homepage, _React$Component);

  function Homepage() {
    var _getPrototypeOf2;

    var _this;

    classCallCheck_default()(this, Homepage);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = possibleConstructorReturn_default()(this, (_getPrototypeOf2 = getPrototypeOf_default()(Homepage)).call.apply(_getPrototypeOf2, [this].concat(args)));

    defineProperty_default()(assertThisInitialized_default()(_this), "state", {
      components: null
    });

    return _this;
  }

  createClass_default()(Homepage, [{
    key: "componentDidMount",
    value: function () {
      var _componentDidMount = asyncToGenerator_default()(
      /*#__PURE__*/
      regenerator_default.a.mark(function _callee() {
        var response;
        return regenerator_default.a.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return external_axios_default.a.get('/.netlify/functions/componentsStatus', {
                  params: {
                    days: DAYS
                  }
                });

              case 2:
                response = _context.sent;
                console.log(response.data);
                this.setState({
                  components: response.data
                });

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function componentDidMount() {
        return _componentDidMount.apply(this, arguments);
      }

      return componentDidMount;
    }()
  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
          incidentsData = _this$props.incidents,
          incidentsOverviewDays = _this$props.incidentsOverviewDays;
      var components = this.state.components;
      var incidents = new IncidentsRepo["a" /* default */](incidentsData);
      return external_react_default.a.createElement("div", {
        className: "page-container"
      }, external_react_default.a.createElement(external_react_static_["Head"], null, external_react_default.a.createElement("meta", {
        charSet: "UTF-8"
      }), external_react_default.a.createElement("title", null, "DatoCMS Status")), external_react_default.a.createElement(Header["a" /* default */], null), external_react_default.a.createElement("div", {
        className: "unresolved-incidents"
      }, incidents.unresolved.map(function (incident) {
        return external_react_default.a.createElement(UnresolvedIncident, {
          key: incident.id,
          incident: incident
        });
      }), incidents.unresolved.length === 0 && external_react_default.a.createElement("div", {
        className: "all-systems-operational"
      }, "All Systems Operational")), external_react_default.a.createElement("div", {
        className: "components-status"
      }, external_react_default.a.createElement("div", {
        className: "components-status__title"
      }, "Components Status"), external_react_default.a.createElement("div", null, components && components.map(function (component) {
        return external_react_default.a.createElement(ComponentStatus, {
          key: component.id,
          id: component.id,
          regions: component.regions,
          totalDowntime: component.totalDowntime,
          daysSince: DAYS
        });
      }))), external_react_default.a.createElement(SystemMetrics_SystemMetrics, null), external_react_default.a.createElement(FutureMaintenances_FutureMaintenances, {
        incidents: incidents
      }), external_react_default.a.createElement(IncidentsDailyOverview_IncidentsDailyOverview, {
        incidents: incidents,
        daysCount: incidentsOverviewDays
      }), external_react_default.a.createElement(Footer["a" /* default */], {
        linkLabel: "Incidents History",
        linkUrl: "/history/"
      }));
    }
  }]);

  return Homepage;
}(external_react_default.a.Component);

/* harmony default export */ var pages = __webpack_exports__["default"] = (Object(external_react_static_["withRouteData"])(pages_Homepage));

/***/ }),
/* 46 */
/***/ (function(module, exports) {

module.exports = require("react-hot-loader");

/***/ }),
/* 47 */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/helpers/asyncToGenerator");

/***/ }),
/* 48 */
/***/ (function(module, exports) {

module.exports = require("date-fns/addMinutes");

/***/ }),
/* 49 */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/helpers/slicedToArray");

/***/ }),
/* 50 */
/***/ (function(module, exports) {

module.exports = require("react-tooltip");

/***/ }),
/* 51 */
/***/ (function(module, exports) {

module.exports = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgMjYxLjI3NCA4MC41NjIiPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iYSIgeTE9IjQwLjQ0IiB4Mj0iNzguNjg3IiB5Mj0iNDAuNDQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNmZjU5M2QiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmZjc3NTEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48dGl0bGU+ZnVsbF9zbWFsbGVyPC90aXRsZT48cGF0aCBkPSJNMzkuMzQ0Ljg0NEgwVjgwLjAzN0gzOS4zNDRjMTkuNjc3LDAsMzkuMzQzLTE3LjcyOSwzOS4zNDMtMzkuNTkxUzU5LjAyMS44NDQsMzkuMzQ0Ljg0NFptMCw1Ny41ODlhMTcuOTkzLDE3Ljk5MywwLDEsMSwxOC0xNy45ODdBMTcuOTg2LDE3Ljk4NiwwLDAsMSwzOS4zNDQsNTguNDMzWiIgZmlsbD0idXJsKCNhKSIvPjxwYXRoIGQ9Ik0xMTkuMDU0Ljg1OGMxMS44NDIsMCwxNy45MTYsNy4xNzksMTcuOTE2LDE3LjA1OHY4LjgzNWMwLDkuODc4LTYuMDc0LDE3LjA1Ny0xNy45MTYsMTcuMDU3SDEwMC4yNzlWLjg1OFptNy4zNjMsMTdjMC01LjQ2LTIuODg0LTguMzQ0LTkuMjY1LTguMzQ0aC02LjM4MVYzNS4xNTZoNi4zODFjNi4zODEsMCw5LjI2NS0yLjg4NCw5LjI2NS04LjM0NFptNDMuMjQxLDE3Ljk3N0gxNTQuMTM1bC0yLjM5Myw3Ljk3N0gxNDEuMTg5TDE1Ni41MjcuODU4aDEwLjhsMTUuMzM5LDQyLjk1SDE3Mi4xMTJabS0xMi45NDYtOC40NjdoMTAuMzY5bC01LjE1NC0xNi45OTVaTTIxNi4wMzMuODU4djguOWgtMTEuNlY0My44MDhIMTkzLjg4M1Y5Ljc1NWgtMTEuNlYuODU4Wm0yNS41NDUsNDMuODA5Yy0xMy4wMDcsMC0xOS42OTUtOC4zNDUtMTkuNjk1LTE5LjU3M1YxOS41NzJDMjIxLjg4Myw4LjM0NCwyMjguNTcxLDAsMjQxLjU3OCwwczE5LjcsOC4zNDQsMTkuNywxOS41NzJ2NS41MjJDMjYxLjI3NCwzNi4zMjIsMjU0LjU4Niw0NC42NjcsMjQxLjU3OCw0NC42NjdabTAtMzUuODk0Yy02LjEzNSwwLTkuMTQyLDQuMTEyLTkuMTQyLDEwLjI0N3Y2LjYyNmMwLDYuMTM2LDMuMDA3LDEwLjI0Nyw5LjE0MiwxMC4yNDdzOS4xNDItNC4xMTEsOS4xNDItMTAuMjQ3VjE5LjAyQzI1MC43MiwxMi44ODUsMjQ3LjcxNCw4Ljc3MywyNDEuNTc4LDguNzczWk0xMDkuNjksNzUuMjQ0YTQuODEzLDQuODEzLDAsMCwwLDUuMi00Ljg2OGg1Ljk1NGMtLjA3NSw1LjU0Mi00LjE1NiwxMC4xODYtMTEuMDg0LDEwLjE4Ni04LjA4OCwwLTExLjk4Mi01LjA5My0xMS45ODItMTEuOTA4VjY1LjIwOWMwLTYuODE1LDMuODk0LTExLjkwNywxMS45ODItMTEuOTA3LDYuOTI4LDAsMTEuMDA5LDQuNjQyLDExLjA4NCwxMC4xODRoLTUuOTU0YTQuODEzLDQuODEzLDAsMCwwLTUuMi00Ljg2OGMtMy44OTUsMC01LjQ2OCwyLjU4NC01LjQ2OCw2LjI5MXY0LjA0NEMxMDQuMjIyLDcyLjY2LDEwNS44LDc1LjI0NCwxMDkuNjksNzUuMjQ0Wm0zNy4wNTUtMjEuNDE5aDUuOTE3VjgwLjAzN2gtNi4xNzhWNjYuMTgzbC00LjEyLDguMDEyaC01LjA5MmwtNC4wODEtOC4wMTJWODAuMDM3aC02LjE3OVY1My44MjVoNS45MTZsNi44OSwxNC4yNjdaTTE2OS41MSw4MC41NjJjLTYuMjkxLDAtMTAuNTIyLTMtMTAuNTIyLTguMjc2di0uNzEyaDYuMTc4VjcyLjFjMCwyLjIwOSwxLjQyMywzLjU1Nyw0LjM4MSwzLjU1NywyLjY1OSwwLDQuNDE5LTEuMDg2LDQuNDE5LTMuMTA4YTIuMTUxLDIuMTUxLDAsMCwwLTEuOC0yLjMyMWwtNi41NTMtMS42NDhjLTQuMDgyLTEuMDExLTYuMTc5LTIuODA4LTYuMTc5LTcuMDc3LDAtNS4yMDUsMy43MDctOC4yLDkuOTIzLTguMiw1Ljg3OSwwLDkuNjI0LDMuMTgyLDkuNjI0LDcuOTc1di42MzdIMTczLjAzdi0uNDQ5YzAtMS43NjEtLjk3NC0zLjIyMS0zLjY3LTMuMjIxLTIuMjQ3LDAtMy42NjkuNzg2LTMuNjY5LDIuNjU4YTEuOTk0LDEuOTk0LDAsMCwwLDEuNjg1LDIuMTM1bDYuOTY0LDEuODcyYzQuMTk0LDEuMTIzLDUuODc5LDMuNDQ1LDUuODc5LDcuMDc3QzE4MC4yMTksNzcuMjI5LDE3NS41NzYsODAuNTYyLDE2OS41MSw4MC41NjJaIiBmaWxsPSIjZmY3NzUxIi8+PC9zdmc+"

/***/ }),
/* 52 */
/***/ (function(module, exports) {

module.exports = "data:image/svg+xml;base64,PCEtLSBHZW5lcmF0ZWQgYnkgSWNvTW9vbi5pbyAtLT4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj4KPHRpdGxlPnJzczwvdGl0bGU+CjxwYXRoIGZpbGw9IndoaXRlIiBkPSJNNjguMTQ3IDM3NS40NjVjLTM3LjU5OCAwLTY4LjE0NiAzMC42NjctNjguMTQ2IDY4LjAzOCAwIDM3LjU3NyAzMC41NSA2Ny45MDEgNjguMTQ2IDY3LjkwMSAzNy43MzMgMCA2OC4yNDctMzAuMzI0IDY4LjI0Ny02Ny45MDEtMC4wMDEtMzcuMzcxLTMwLjUxMi02OC4wMzgtNjguMjQ3LTY4LjAzOHpNMC4wNzggMTczLjk2NXY5OC4xMjljNjMuODkyIDAgMTIzLjk3OSAyNC45ODYgMTY5LjIyOSA3MC4yNTYgNDUuMTkyIDQ1LjE1OSA3MC4xNDEgMTA1LjUxOCA3MC4xNDEgMTY5LjY1aDk4LjU2MWMtMC4wMDEtMTg2LjQxLTE1MS42NDEtMzM4LjAzNS0zMzcuOTMxLTMzOC4wMzV6TTAuMTk0IDB2OTguMTc4YzIyNy44OTEgMCA0MTMuMzc4IDE4NS42NjcgNDEzLjM3OCA0MTMuODIyaDk4LjQyOGMwLTI4Mi4yMzUtMjI5LjYyNy01MTItNTExLjgwNi01MTJ6Ij48L3BhdGg+Cjwvc3ZnPgo="

/***/ }),
/* 53 */
/***/ (function(module, exports) {

module.exports = require("react-click-outside");

/***/ }),
/* 54 */
/***/ (function(module, exports) {

module.exports = "data:image/svg+xml;base64,PCEtLSBHZW5lcmF0ZWQgYnkgSWNvTW9vbi5pbyAtLT4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj4KPHRpdGxlPmNoZXZlcm9uLWxlZnQ8L3RpdGxlPgo8cGF0aCBkPSJNMTgwLjQ4IDIzNy45MDFsLTE4LjA5OSAxOC4wOTkgMTQ0LjgxOSAxNDQuODE5IDM2LjE5OS0zNi4xOTktMTA4LjU5NS0xMDguNjIxIDEwOC41OTUtMTA4LjYyMS0zNi4xOTktMzYuMTk4eiI+PC9wYXRoPgo8L3N2Zz4K"

/***/ }),
/* 55 */
/***/ (function(module, exports) {

module.exports = "data:image/svg+xml;base64,PCEtLSBHZW5lcmF0ZWQgYnkgSWNvTW9vbi5pbyAtLT4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj4KPHRpdGxlPmNoZXZlcm9uLXJpZ2h0PC90aXRsZT4KPHBhdGggZD0iTTMzMS41MiAyNzQuMDk5bDE4LjA5OS0xOC4wOTktMTQ0LjgxOS0xNDQuODE5LTM2LjE5OCAzNi4xOTggMTA4LjU5NSAxMDguNjIxLTEwOC41OTUgMTA4LjYyMSAzNi4xOTggMzYuMTk5IDEyNi43Mi0xMjYuNzJ6Ij48L3BhdGg+Cjwvc3ZnPgo="

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(57);
__webpack_require__(58);
module.exports = __webpack_require__(64);


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {
/* eslint-disable import/no-dynamic-require */

var plugins = __webpack_require__(37)["default"];

var _require = __webpack_require__(38),
    registerPlugins = _require.registerPlugins;

registerPlugins(plugins);

if (typeof document !== 'undefined' && module && module.hot) {
  module.hot.accept("/Users/steffoz/code/dato/datocms-status/artifacts/react-static-browser-plugins.js", function () {
    registerPlugins(__webpack_require__(37)["default"]);
  });
}
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(29)(module)))

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {
/* eslint-disable import/no-dynamic-require */

var _require = __webpack_require__(38),
    registerTemplates = _require.registerTemplates;

var _require2 = __webpack_require__(39),
    templates = _require2["default"],
    notFoundTemplate = _require2.notFoundTemplate;

registerTemplates(templates, notFoundTemplate);

if (typeof document !== 'undefined' && module && module.hot) {
  module.hot.accept("/Users/steffoz/code/dato/datocms-status/artifacts/react-static-templates.js", function () {
    var _require3 = __webpack_require__(39),
        templates = _require3["default"],
        notFoundTemplate = _require3.notFoundTemplate;

    registerTemplates(templates, notFoundTemplate);
  });
}
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(29)(module)))

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clearChunks = exports.flushModuleIds = exports.flushChunkNames = exports.MODULE_IDS = exports.CHUNK_NAMES = undefined;

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

exports["default"] = requireUniversalModule;

var _utils = __webpack_require__(31);

var CHUNK_NAMES = exports.CHUNK_NAMES = new Set();
var MODULE_IDS = exports.MODULE_IDS = new Set();

function requireUniversalModule(universalConfig, options, props, prevProps) {
  var key = options.key,
      _options$timeout = options.timeout,
      timeout = _options$timeout === undefined ? 15000 : _options$timeout,
      onLoad = options.onLoad,
      onError = options.onError,
      isDynamic = options.isDynamic,
      modCache = options.modCache,
      promCache = options.promCache,
      usesBabelPlugin = options.usesBabelPlugin;
  var config = getConfig(isDynamic, universalConfig, options, props);
  var chunkName = config.chunkName,
      path = config.path,
      resolve = config.resolve,
      load = config.load;
  var asyncOnly = !path && !resolve || typeof chunkName === 'function';

  var requireSync = function requireSync(props, context) {
    var exp = (0, _utils.loadFromCache)(chunkName, props, modCache);

    if (!exp) {
      var mod = void 0;

      if (!(0, _utils.isWebpack)() && path) {
        var modulePath = (0, _utils.callForString)(path, props) || '';
        mod = (0, _utils.tryRequire)(modulePath);
      } else if ((0, _utils.isWebpack)() && resolve) {
        var weakId = (0, _utils.callForString)(resolve, props);

        if (__webpack_require__.m[weakId]) {
          mod = (0, _utils.tryRequire)(weakId);
        }
      }

      if (mod) {
        exp = (0, _utils.resolveExport)(mod, key, onLoad, chunkName, props, context, modCache, true);
      }
    }

    return exp;
  };

  var requireAsync = function requireAsync(props, context) {
    var exp = (0, _utils.loadFromCache)(chunkName, props, modCache);
    if (exp) return Promise.resolve(exp);
    var cachedPromise = (0, _utils.loadFromPromiseCache)(chunkName, props, promCache);
    if (cachedPromise) return cachedPromise;
    var prom = new Promise(function (res, rej) {
      var reject = function reject(error) {
        error = error || new Error('timeout exceeded');
        clearTimeout(timer);

        if (onError) {
          var _isServer = typeof window === 'undefined';

          var info = {
            isServer: _isServer
          };
          onError(error, info);
        }

        rej(error);
      }; // const timer = timeout && setTimeout(reject, timeout)


      var timer = timeout && setTimeout(reject, timeout);

      var resolve = function resolve(mod) {
        clearTimeout(timer);
        var exp = (0, _utils.resolveExport)(mod, key, onLoad, chunkName, props, context, modCache);
        if (exp) return res(exp);
        reject(new Error('export not found'));
      };

      var request = load(props, {
        resolve: resolve,
        reject: reject
      }); // if load doesn't return a promise, it must call resolveImport
      // itself. Most common is the promise implementation below.

      if (!request || typeof request.then !== 'function') return;
      request.then(resolve)["catch"](reject);
    });
    (0, _utils.cacheProm)(prom, chunkName, props, promCache);
    return prom;
  };

  var addModule = function addModule(props) {
    if (_utils.isServer || _utils.isTest) {
      if (chunkName) {
        var name = (0, _utils.callForString)(chunkName, props);

        if (usesBabelPlugin) {
          // if ignoreBabelRename is true, don't apply regex
          var shouldKeepName = options && !!options.ignoreBabelRename;

          if (!shouldKeepName) {
            name = name.replace(/\//g, '-');
          }
        }

        if (name) CHUNK_NAMES.add(name);
        if (!_utils.isTest) return name; // makes tests way smaller to run both kinds
      }

      if ((0, _utils.isWebpack)()) {
        var weakId = (0, _utils.callForString)(resolve, props);
        if (weakId) MODULE_IDS.add(weakId);
        return weakId;
      }

      if (!(0, _utils.isWebpack)()) {
        var modulePath = (0, _utils.callForString)(path, props);
        if (modulePath) MODULE_IDS.add(modulePath);
        return modulePath;
      }
    }
  };

  var shouldUpdate = function shouldUpdate(next, prev) {
    var cacheKey = (0, _utils.callForString)(chunkName, next);
    var config = getConfig(isDynamic, universalConfig, options, prev);
    var prevCacheKey = (0, _utils.callForString)(config.chunkName, prev);
    return cacheKey !== prevCacheKey;
  };

  return {
    requireSync: requireSync,
    requireAsync: requireAsync,
    addModule: addModule,
    shouldUpdate: shouldUpdate,
    asyncOnly: asyncOnly
  };
}

var flushChunkNames = exports.flushChunkNames = function flushChunkNames() {
  var chunks = Array.from(CHUNK_NAMES);
  CHUNK_NAMES.clear();
  return chunks;
};

var flushModuleIds = exports.flushModuleIds = function flushModuleIds() {
  var ids = Array.from(MODULE_IDS);
  MODULE_IDS.clear();
  return ids;
};

var clearChunks = exports.clearChunks = function clearChunks() {
  CHUNK_NAMES.clear();
  MODULE_IDS.clear();
};

var getConfig = function getConfig(isDynamic, universalConfig, options, props) {
  if (isDynamic) {
    var resultingConfig = typeof universalConfig === 'function' ? universalConfig(props) : universalConfig;

    if (options) {
      resultingConfig = _extends({}, resultingConfig, options);
    }

    return resultingConfig;
  }

  var load = typeof universalConfig === 'function' ? universalConfig : // $FlowIssue
  function () {
    return universalConfig;
  };
  return {
    file: 'default',
    id: options.id || 'default',
    chunkName: options.chunkName || 'default',
    resolve: options.resolve || '',
    path: options.path || '',
    load: load,
    ignoreBabelRename: true
  };
};

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	".": 15,
	"./": 15,
	"./index": 15,
	"./index.js": 15
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	if(!__webpack_require__.o(map, req)) {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return map[req];
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 60;

/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = __webpack_require__(30);

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(40);

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (_typeof(call) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + _typeof(superClass));
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var ReportChunks = function (_React$Component) {
  _inherits(ReportChunks, _React$Component);

  function ReportChunks() {
    _classCallCheck(this, ReportChunks);

    return _possibleConstructorReturn(this, (ReportChunks.__proto__ || Object.getPrototypeOf(ReportChunks)).apply(this, arguments));
  }

  _createClass(ReportChunks, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        report: this.props.report
      };
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2["default"].Children.only(this.props.children);
    }
  }]);

  return ReportChunks;
}(_react2["default"].Component);

ReportChunks.propTypes = {
  report: _propTypes2["default"].func.isRequired
};
ReportChunks.childContextTypes = {
  report: _propTypes2["default"].func.isRequired
};
exports["default"] = ReportChunks;

/***/ }),
/* 62 */
/***/ (function(module, exports) {

module.exports = require("vm");

/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__handleAfter = exports.__update = undefined;

var _hoistNonReactStatics = __webpack_require__(41);

var _hoistNonReactStatics2 = _interopRequireDefault(_hoistNonReactStatics);

var _index = __webpack_require__(14);

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

var __update = exports.__update = function __update(props, state, isInitialized) {
  var isMount = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  var isSync = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  var isServer = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
  if (!isInitialized) return state;

  if (!state.error) {
    state.error = null;
  }

  return __handleAfter(props, state, isMount, isSync, isServer);
};
/* eslint class-methods-use-this: ["error", { "exceptMethods": ["__handleAfter"] }] */


var __handleAfter = exports.__handleAfter = function __handleAfter(props, state, isMount, isSync, isServer) {
  var mod = state.mod,
      error = state.error;

  if (mod && !error) {
    (0, _hoistNonReactStatics2["default"])(_index2["default"], mod, {
      preload: true,
      preloadWeak: true
    });

    if (props.onAfter) {
      var onAfter = props.onAfter;
      var info = {
        isMount: isMount,
        isSync: isSync,
        isServer: isServer
      };
      onAfter(info, mod);
    }
  } else if (error && props.onError) {
    props.onError(error);
  }

  return state;
};

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireWildcard = __webpack_require__(65);

var _interopRequireDefault = __webpack_require__(66);

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _extends2 = _interopRequireDefault(__webpack_require__(67));

var _objectWithoutProperties2 = _interopRequireDefault(__webpack_require__(68));

var React = _interopRequireWildcard(__webpack_require__(0));

var _useStaticInfo = __webpack_require__(69);
/* eslint-disable import/no-dynamic-require */


var OriginalSuspense = React.Suspense;

function Suspense(_ref) {
  var key = _ref.key,
      children = _ref.children,
      rest = (0, _objectWithoutProperties2["default"])(_ref, ["key", "children"]);
  return typeof document !== 'undefined' ? React.createElement(OriginalSuspense, (0, _extends2["default"])({
    key: key
  }, rest), children) : React.createElement(React.Fragment, {
    key: key
  }, children);
} // Override the suspense module to be our own


React.Suspense = Suspense;
React["default"].Suspense = Suspense;

var App = __webpack_require__(70)["default"];

var _default = function _default(staticInfo) {
  return function (props) {
    return React.createElement(_useStaticInfo.staticInfoContext.Provider, {
      value: staticInfo
    }, React.createElement(App, props));
  };
};

exports["default"] = _default;

/***/ }),
/* 65 */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/helpers/interopRequireWildcard");

/***/ }),
/* 66 */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/helpers/interopRequireDefault");

/***/ }),
/* 67 */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/helpers/extends");

/***/ }),
/* 68 */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/helpers/objectWithoutProperties");

/***/ }),
/* 69 */
/***/ (function(module, exports) {

module.exports = require("/Users/steffoz/code/dato/datocms-status/node_modules/react-static/lib/browser/hooks/useStaticInfo");

/***/ }),
/* 70 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(module) {/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(32);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_hot_loader__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(46);
/* harmony import */ var react_hot_loader__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_hot_loader__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(27);


 // Your top level component

 // Export your top level component as JSX (for static rendering)

/* harmony default export */ __webpack_exports__["default"] = (_App__WEBPACK_IMPORTED_MODULE_3__[/* default */ "a"]); // Render your app

if (typeof document !== 'undefined') {
  var target = document.getElementById('root');
  var renderMethod = target.hasChildNodes() ? react_dom__WEBPACK_IMPORTED_MODULE_1___default.a.hydrate : react_dom__WEBPACK_IMPORTED_MODULE_1___default.a.render;

  var render = function render(Comp) {
    renderMethod(react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_hot_loader__WEBPACK_IMPORTED_MODULE_2__["AppContainer"], null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Comp, null)), target);
  }; // Render!


  render(_App__WEBPACK_IMPORTED_MODULE_3__[/* default */ "a"]); // Hot Module Replacement

  if (module && module.hot) {
    module.hot.accept('./App', function () {
      render(_App__WEBPACK_IMPORTED_MODULE_3__[/* default */ "a"]);
    });
  }
}
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(71)(module)))

/***/ }),
/* 71 */
/***/ (function(module, exports) {

module.exports = function (originalModule) {
  if (!originalModule.webpackPolyfill) {
    var module = Object.create(originalModule); // module.parent = undefined by default

    if (!module.children) module.children = [];
    Object.defineProperty(module, "loaded", {
      enumerable: true,
      get: function get() {
        return module.l;
      }
    });
    Object.defineProperty(module, "id", {
      enumerable: true,
      get: function get() {
        return module.i;
      }
    });
    Object.defineProperty(module, "exports", {
      enumerable: true
    });
    module.webpackPolyfill = 1;
  }

  return module;
};

/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(73)(false);
// Imports
exports.push([module.i, "@import url(https://use.typekit.net/iok7hkr.css);", ""]);

// Module
exports.push([module.i, "html,body,div,span,applet,object,iframe,h1,h2,h3,h4,h5,h6,p,blockquote,pre,a,abbr,acronym,address,big,cite,code,del,dfn,em,img,ins,kbd,q,s,samp,small,strike,strong,sub,sup,tt,var,b,u,i,center,dl,dt,dd,ol,ul,li,fieldset,form,label,legend,table,caption,tbody,tfoot,thead,tr,th,td,article,aside,canvas,details,embed,figure,figcaption,footer,header,hgroup,menu,nav,output,ruby,section,summary,time,mark,audio,video{margin:0;padding:0;border:0;font-size:100%;font-family:inherit;vertical-align:baseline}strong{font-weight:500}article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{display:block}ol,ul{margin-left:1.2em}blockquote,q{quotes:none}blockquote:before,blockquote:after{content:'';content:none}q:before,q:after{content:'';content:none}table{border-collapse:collapse;border-spacing:0}.ct-label{fill:rgba(0,0,0,0.4);color:rgba(0,0,0,0.4);font-size:.75rem;line-height:1}.ct-chart-line .ct-label,.ct-chart-bar .ct-label{display:block;display:flex}.ct-chart-pie .ct-label,.ct-chart-donut .ct-label{dominant-baseline:central}.ct-label.ct-horizontal.ct-start{align-items:flex-end;justify-content:flex-start;text-align:left;text-anchor:start}.ct-label.ct-horizontal.ct-end{align-items:flex-start;justify-content:flex-start;text-align:left;text-anchor:start}.ct-label.ct-vertical.ct-start{align-items:flex-end;justify-content:flex-end;text-align:right;text-anchor:end}.ct-label.ct-vertical.ct-end{align-items:flex-end;justify-content:flex-start;text-align:left;text-anchor:start}.ct-chart-bar .ct-label.ct-horizontal.ct-start{align-items:flex-end;justify-content:center;text-align:center;text-anchor:start}.ct-chart-bar .ct-label.ct-horizontal.ct-end{align-items:flex-start;justify-content:center;text-align:center;text-anchor:start}.ct-chart-bar.ct-horizontal-bars .ct-label.ct-horizontal.ct-start{align-items:flex-end;justify-content:flex-start;text-align:left;text-anchor:start}.ct-chart-bar.ct-horizontal-bars .ct-label.ct-horizontal.ct-end{align-items:flex-start;justify-content:flex-start;text-align:left;text-anchor:start}.ct-chart-bar.ct-horizontal-bars .ct-label.ct-vertical.ct-start{align-items:center;justify-content:flex-end;text-align:right;text-anchor:end}.ct-chart-bar.ct-horizontal-bars .ct-label.ct-vertical.ct-end{align-items:center;justify-content:flex-start;text-align:left;text-anchor:end}.ct-grid{stroke:rgba(0,0,0,0.2);stroke-width:1px;stroke-dasharray:2px}.ct-grid-background{fill:none}.ct-point{stroke-width:10px;stroke-linecap:round}.ct-line{fill:none;stroke-width:4px}.ct-area{stroke:none;fill-opacity:.1}.ct-bar{fill:none;stroke-width:10px}.ct-slice-donut{fill:none;stroke-width:60px}.ct-series-a .ct-point,.ct-series-a .ct-line,.ct-series-a .ct-bar,.ct-series-a .ct-slice-donut{stroke:#d70206}.ct-series-a .ct-slice-pie,.ct-series-a .ct-slice-donut-solid,.ct-series-a .ct-area{fill:#d70206}.ct-series-b .ct-point,.ct-series-b .ct-line,.ct-series-b .ct-bar,.ct-series-b .ct-slice-donut{stroke:#f05b4f}.ct-series-b .ct-slice-pie,.ct-series-b .ct-slice-donut-solid,.ct-series-b .ct-area{fill:#f05b4f}.ct-series-c .ct-point,.ct-series-c .ct-line,.ct-series-c .ct-bar,.ct-series-c .ct-slice-donut{stroke:#f4c63d}.ct-series-c .ct-slice-pie,.ct-series-c .ct-slice-donut-solid,.ct-series-c .ct-area{fill:#f4c63d}.ct-series-d .ct-point,.ct-series-d .ct-line,.ct-series-d .ct-bar,.ct-series-d .ct-slice-donut{stroke:#d17905}.ct-series-d .ct-slice-pie,.ct-series-d .ct-slice-donut-solid,.ct-series-d .ct-area{fill:#d17905}.ct-series-e .ct-point,.ct-series-e .ct-line,.ct-series-e .ct-bar,.ct-series-e .ct-slice-donut{stroke:#453d3f}.ct-series-e .ct-slice-pie,.ct-series-e .ct-slice-donut-solid,.ct-series-e .ct-area{fill:#453d3f}.ct-series-f .ct-point,.ct-series-f .ct-line,.ct-series-f .ct-bar,.ct-series-f .ct-slice-donut{stroke:#59922b}.ct-series-f .ct-slice-pie,.ct-series-f .ct-slice-donut-solid,.ct-series-f .ct-area{fill:#59922b}.ct-series-g .ct-point,.ct-series-g .ct-line,.ct-series-g .ct-bar,.ct-series-g .ct-slice-donut{stroke:#0544d3}.ct-series-g .ct-slice-pie,.ct-series-g .ct-slice-donut-solid,.ct-series-g .ct-area{fill:#0544d3}.ct-series-h .ct-point,.ct-series-h .ct-line,.ct-series-h .ct-bar,.ct-series-h .ct-slice-donut{stroke:#6b0392}.ct-series-h .ct-slice-pie,.ct-series-h .ct-slice-donut-solid,.ct-series-h .ct-area{fill:#6b0392}.ct-series-i .ct-point,.ct-series-i .ct-line,.ct-series-i .ct-bar,.ct-series-i .ct-slice-donut{stroke:#f05b4f}.ct-series-i .ct-slice-pie,.ct-series-i .ct-slice-donut-solid,.ct-series-i .ct-area{fill:#f05b4f}.ct-series-j .ct-point,.ct-series-j .ct-line,.ct-series-j .ct-bar,.ct-series-j .ct-slice-donut{stroke:#dda458}.ct-series-j .ct-slice-pie,.ct-series-j .ct-slice-donut-solid,.ct-series-j .ct-area{fill:#dda458}.ct-series-k .ct-point,.ct-series-k .ct-line,.ct-series-k .ct-bar,.ct-series-k .ct-slice-donut{stroke:#eacf7d}.ct-series-k .ct-slice-pie,.ct-series-k .ct-slice-donut-solid,.ct-series-k .ct-area{fill:#eacf7d}.ct-series-l .ct-point,.ct-series-l .ct-line,.ct-series-l .ct-bar,.ct-series-l .ct-slice-donut{stroke:#86797d}.ct-series-l .ct-slice-pie,.ct-series-l .ct-slice-donut-solid,.ct-series-l .ct-area{fill:#86797d}.ct-series-m .ct-point,.ct-series-m .ct-line,.ct-series-m .ct-bar,.ct-series-m .ct-slice-donut{stroke:#b2c326}.ct-series-m .ct-slice-pie,.ct-series-m .ct-slice-donut-solid,.ct-series-m .ct-area{fill:#b2c326}.ct-series-n .ct-point,.ct-series-n .ct-line,.ct-series-n .ct-bar,.ct-series-n .ct-slice-donut{stroke:#6188e2}.ct-series-n .ct-slice-pie,.ct-series-n .ct-slice-donut-solid,.ct-series-n .ct-area{fill:#6188e2}.ct-series-o .ct-point,.ct-series-o .ct-line,.ct-series-o .ct-bar,.ct-series-o .ct-slice-donut{stroke:#a748ca}.ct-series-o .ct-slice-pie,.ct-series-o .ct-slice-donut-solid,.ct-series-o .ct-area{fill:#a748ca}.ct-square{display:block;position:relative;width:100%}.ct-square:before{display:block;float:left;content:\"\";width:0;height:0;padding-bottom:100%}.ct-square:after{content:\"\";display:table;clear:both}.ct-square>svg{display:block;position:absolute;top:0;left:0}.ct-minor-second{display:block;position:relative;width:100%}.ct-minor-second:before{display:block;float:left;content:\"\";width:0;height:0;padding-bottom:93.75%}.ct-minor-second:after{content:\"\";display:table;clear:both}.ct-minor-second>svg{display:block;position:absolute;top:0;left:0}.ct-major-second{display:block;position:relative;width:100%}.ct-major-second:before{display:block;float:left;content:\"\";width:0;height:0;padding-bottom:88.88889%}.ct-major-second:after{content:\"\";display:table;clear:both}.ct-major-second>svg{display:block;position:absolute;top:0;left:0}.ct-minor-third{display:block;position:relative;width:100%}.ct-minor-third:before{display:block;float:left;content:\"\";width:0;height:0;padding-bottom:83.33333%}.ct-minor-third:after{content:\"\";display:table;clear:both}.ct-minor-third>svg{display:block;position:absolute;top:0;left:0}.ct-major-third{display:block;position:relative;width:100%}.ct-major-third:before{display:block;float:left;content:\"\";width:0;height:0;padding-bottom:80%}.ct-major-third:after{content:\"\";display:table;clear:both}.ct-major-third>svg{display:block;position:absolute;top:0;left:0}.ct-perfect-fourth{display:block;position:relative;width:100%}.ct-perfect-fourth:before{display:block;float:left;content:\"\";width:0;height:0;padding-bottom:75%}.ct-perfect-fourth:after{content:\"\";display:table;clear:both}.ct-perfect-fourth>svg{display:block;position:absolute;top:0;left:0}.ct-perfect-fifth{display:block;position:relative;width:100%}.ct-perfect-fifth:before{display:block;float:left;content:\"\";width:0;height:0;padding-bottom:66.66667%}.ct-perfect-fifth:after{content:\"\";display:table;clear:both}.ct-perfect-fifth>svg{display:block;position:absolute;top:0;left:0}.ct-minor-sixth{display:block;position:relative;width:100%}.ct-minor-sixth:before{display:block;float:left;content:\"\";width:0;height:0;padding-bottom:62.5%}.ct-minor-sixth:after{content:\"\";display:table;clear:both}.ct-minor-sixth>svg{display:block;position:absolute;top:0;left:0}.ct-golden-section{display:block;position:relative;width:100%}.ct-golden-section:before{display:block;float:left;content:\"\";width:0;height:0;padding-bottom:61.8047%}.ct-golden-section:after{content:\"\";display:table;clear:both}.ct-golden-section>svg{display:block;position:absolute;top:0;left:0}.ct-major-sixth{display:block;position:relative;width:100%}.ct-major-sixth:before{display:block;float:left;content:\"\";width:0;height:0;padding-bottom:60%}.ct-major-sixth:after{content:\"\";display:table;clear:both}.ct-major-sixth>svg{display:block;position:absolute;top:0;left:0}.ct-minor-seventh{display:block;position:relative;width:100%}.ct-minor-seventh:before{display:block;float:left;content:\"\";width:0;height:0;padding-bottom:56.25%}.ct-minor-seventh:after{content:\"\";display:table;clear:both}.ct-minor-seventh>svg{display:block;position:absolute;top:0;left:0}.ct-major-seventh{display:block;position:relative;width:100%}.ct-major-seventh:before{display:block;float:left;content:\"\";width:0;height:0;padding-bottom:53.33333%}.ct-major-seventh:after{content:\"\";display:table;clear:both}.ct-major-seventh>svg{display:block;position:absolute;top:0;left:0}.ct-octave{display:block;position:relative;width:100%}.ct-octave:before{display:block;float:left;content:\"\";width:0;height:0;padding-bottom:50%}.ct-octave:after{content:\"\";display:table;clear:both}.ct-octave>svg{display:block;position:absolute;top:0;left:0}.ct-major-tenth{display:block;position:relative;width:100%}.ct-major-tenth:before{display:block;float:left;content:\"\";width:0;height:0;padding-bottom:40%}.ct-major-tenth:after{content:\"\";display:table;clear:both}.ct-major-tenth>svg{display:block;position:absolute;top:0;left:0}.ct-major-eleventh{display:block;position:relative;width:100%}.ct-major-eleventh:before{display:block;float:left;content:\"\";width:0;height:0;padding-bottom:37.5%}.ct-major-eleventh:after{content:\"\";display:table;clear:both}.ct-major-eleventh>svg{display:block;position:absolute;top:0;left:0}.ct-major-twelfth{display:block;position:relative;width:100%}.ct-major-twelfth:before{display:block;float:left;content:\"\";width:0;height:0;padding-bottom:33.33333%}.ct-major-twelfth:after{content:\"\";display:table;clear:both}.ct-major-twelfth>svg{display:block;position:absolute;top:0;left:0}.ct-double-octave{display:block;position:relative;width:100%}.ct-double-octave:before{display:block;float:left;content:\"\";width:0;height:0;padding-bottom:25%}.ct-double-octave:after{content:\"\";display:table;clear:both}.ct-double-octave>svg{display:block;position:absolute;top:0;left:0}body{font-family:\"colfax-web\", \"Roboto\", \"Helvetica Neue\", Helvetica, Roboto, Arial, sans-serif;font-size:15px;color:#30343f;line-height:1.4}.page-container{max-width:850px;margin:0 auto;padding:0 20px}.page-container--incident{max-width:600px;margin:70px auto}.page-header{margin:60px 0;text-align:center}.page-header__logo{display:block;margin-bottom:30px}.page-header__logo img{height:50px}@media screen and (min-width: 600px){.page-header{display:flex;align-items:center;text-align:left}.page-header__logo{flex:1 1}.page-header__subscribe{text-align:right}}.unresolved-incidents{margin:50px 0}.components-status{margin:50px 0}.daily-outage{margin-top:8px}.daily-outage svg{width:100%}.daily-outage svg rect:hover{opacity:0.7}.tooltip{padding:10px 15px !important;text-align:center;font-style:italic}.tooltip strong{font-style:normal;font-weight:500}.system-metrics{margin:50px 0}.system-metrics .system-metric{margin-bottom:30px}.system-metrics .system-metric:last-child{margin-bottom:0}.system-metrics__header{display:flex;align-items:center}.system-metrics__period{flex:1 1;text-align:right}.system-metrics__period button{color:#333;background:transparent;border:0;-moz-appearance:none;-webkit-appearance:none;font-family:inherit;font-size:inherit;cursor:pointer;outline:none}.system-metrics__period button.is-active{font-weight:500}.system-metrics__title,.components-status__title,.scheduled-maintenances__title,.incidents-daily__title{font-size:25px;font-weight:500}.system-metrics__header,.components-status__title{margin-bottom:20px}.all-systems-operational{background-color:#2fcc66;color:white;padding:14px 20px;font-weight:500;font-size:1.3em;text-shadow:0 1px 0px rgba(0,0,0,0.2);border-radius:5px;border:1px solid rgba(0,0,0,0.1)}.ugc p,.ugc ul,.ugc ol{margin-bottom:5px}.ugc p:last-child,.ugc ul:last-child,.ugc ol:last-child{margin-bottom:0}.ugc a{color:inherit}.ugc a:hover{text-decoration:none}.unresolved-incident{margin-bottom:30px}.unresolved-incident:last-child{margin-bottom:0}.unresolved-incident__title{background-color:#3498DB;color:white;padding:14px 20px;font-weight:500;font-size:1.3em;text-shadow:0 1px 0px rgba(0,0,0,0.2);border-radius:5px 5px 0 0}.unresolved-incident--impact-minor .unresolved-incident__title{background-color:#f4af00}.unresolved-incident--impact-major .unresolved-incident__title{background-color:#e96600}.unresolved-incident--impact-critical .unresolved-incident__title{background-color:#e74c3c}.unresolved-incident__body{padding:20px;border:1px solid #3498DB;border-top-width:0;border-radius:0 0 5px 5px}.unresolved-incident--impact-minor .unresolved-incident__body{border-color:#f4af00}.unresolved-incident--impact-major .unresolved-incident__body{border-color:#e96600}.unresolved-incident--impact-critical .unresolved-incident__body{border-color:#e74c3c}.unresolved-incident__update{margin-bottom:20px}.unresolved-incident__update:last-child{margin-bottom:0}.unresolved-incident__update__timestamp{margin-top:5px;font-size:0.9em;color:#999}.component-status{border:1px solid #E0E0E0;border-top-width:0;padding:20px}.component-status:first-child{border-top-width:1px;border-radius:5px 5px 0 0}.component-status:last-child{border-radius:0 0 5px 5px}.component-status__header{display:flex}.component-status__name{font-weight:500;flex:1 1}.component-status--status-operational .component-status__status{color:#2fcc66}.component-status--status-under-maintenance .component-status__status{color:#3498DB}.component-status--status-degraded-performance .component-status__status{color:#f4af00}.component-status--status-partial-outage .component-status__status{color:#e96600}.component-status--status-major-outage .component-status__status{color:#e74c3c}.component-status__footer{display:flex;align-items:center;justify-content:space-between;width:100%;position:relative;margin-top:8px}.component-status__footer:before{content:\"\";height:1px;background-color:#E0E0E0;position:absolute;top:50%;left:0;right:0}.component-status__left,.component-status__uptime,.component-status__right{position:relative;z-index:1;padding:0 20px;background-color:white;font-size:0.9em;color:#999}.component-status__left{padding-left:0}.component-status__right{padding-right:0}.system-metric{border:1px solid #E0E0E0;padding:20px;border-radius:5px}.system-metric .ct-chart{position:relative}.system-metric .ct-chart .chartist-tooltip{position:absolute;display:inline-block;opacity:0;border:1px solid #2fcc66;padding:8px;font-size:13px;background:white;pointer-events:none;z-index:1;transition:opacity .2s linear;border-radius:3px;min-width:150px}.system-metric .ct-chart .chartist-tooltip.tooltip-show{opacity:1}.system-metric .ct-chart .chartist-tooltip-timestamp{color:#999;font-size:12px;margin-bottom:3px}.system-metric .ct-chart .chartist-tooltip-value strong{font-weight:500}.system-metric .ct-chart .ct-area,.system-metric .ct-chart .ct-line{pointer-events:none}.system-metric svg{display:block}.system-metric svg .ct-point{stroke-width:20px;stroke:rgba(47,204,102,0);transition:stroke .2s linear}.system-metric svg .ct-point:hover{stroke:rgba(47,204,102,0.3)}.system-metric svg .ct-line{stroke-width:2px}.system-metric svg .ct-series-a .ct-line{stroke:#2fcc66}.system-metric__header{display:flex;margin-bottom:20px;align-items:center}.system-metric__name{font-weight:500;flex:1 1;font-size:18px}.system-metric__avg{color:#999;font-size:18px;font-weight:500}.system-metric__graph{height:150px}.incidents-daily{margin:50px 0}.incidents-daily__title{margin-bottom:30px}.incidents-daily__day{margin-bottom:30px}.incidents-daily__day__title{border-bottom:1px solid #E0E0E0;font-size:20px;font-weight:500;margin-bottom:20px;padding-bottom:5px}.incidents-daily__day__no-incidents{color:#999}.incidents-daily__incident{padding-bottom:30px;padding-left:30px;position:relative}.incidents-daily__incident:after{content:\"\";width:15px;height:15px;display:inline-block;vertical-align:middle;border-radius:90px;margin-right:9px;background-color:#3498DB;position:absolute;top:3px;left:0}.incidents-daily__incident:before{content:\"\";position:absolute;background-color:#E0E0E0;width:2px;left:6px;top:0;bottom:0}.incidents-daily__incident--impact-minor:after{background-color:#f4af00}.incidents-daily__incident--impact-major:after{background-color:#e96600}.incidents-daily__incident--impact-critical:after{background-color:#e74c3c}.incidents-daily__incident:first-child:before{top:4px}.incidents-daily__incident:last-child:before{top:0;height:10px;bottom:auto}.incidents-daily__incident:first-child:last-child:before{display:none}.incidents-daily__incident__title{font-size:18px;font-weight:500;margin-bottom:15px}.incidents-daily__incident__title a{color:inherit;text-decoration:none}.incidents-daily__incident__title a:hover{text-decoration:underline}.incidents-daily__incident__update{margin-bottom:20px}.incidents-daily__incident__update:last-child{margin-bottom:0}.incidents-daily__incident__update__status{font-weight:500}.incidents-daily__incident__update__timestamp{margin-top:5px;font-size:0.9em;color:#999}.scheduled-maintenances{margin:50px 0}.scheduled-maintenances__title{margin-bottom:30px}.scheduled-maintenances__incident{margin-bottom:30px}.scheduled-maintenances__incident__title{border-bottom:1px solid #E0E0E0;font-size:20px;font-weight:500;margin-bottom:20px;padding-bottom:5px}.scheduled-maintenances__incident__title a{color:inherit;text-decoration:none}.scheduled-maintenances__incident__title a:hover{text-decoration:underline}.scheduled-maintenances__incident__update{margin-bottom:20px}.scheduled-maintenances__timestamp{margin-top:5px;font-size:0.9em;color:#999}.scheduled-maintenances__components{margin:10px 0;font-size:0.9em;color:#999}.incident-details:before{content:\"\";width:30px;height:30px;display:block;margin:0 auto 30px;border-radius:90px;background-color:#3498DB}.incident-details--impact-minor:before{background-color:#f4af00}.incident-details--impact-major:before{background-color:#e96600}.incident-details--impact-critical:before{background-color:#e74c3c}.incident-details__title{font-size:35px;font-weight:500;text-align:center;line-height:1;margin-bottom:8px}.incident-details__subtitle{font-size:25px;color:#999;text-align:center;margin-bottom:70px;line-height:1}.incident-details__update{margin-bottom:30px;padding-bottom:30px;border-bottom:1px solid #E0E0E0;display:flex}.incident-details__update:last-child{margin-bottom:0;padding-bottom:0;border-bottom-width:0}.incident-details__update__status{font-weight:500;width:20%;margin-right:40px;font-size:18px;flex-shrink:0}.incident-details__update__timestamp{margin-top:5px;font-size:0.9em;color:#999}.page-footer{margin:70px 0;padding:20px 0;border-top:1px solid #E0E0E0;display:flex;font-size:13px}.page-footer__link a{text-decoration:none;color:#2fcc66}.page-footer__link a:before{content:\"← \";font-family:Arial}.page-footer__other{text-align:right;color:#999;flex:1 1}.history{margin:70px 0}.history__header{margin-bottom:40px}@media screen and (min-width: 750px){.history__header{display:flex;align-items:center}}.history__header__title{font-size:30px;font-weight:500;margin-bottom:10px}@media screen and (min-width: 750px){.history__header__title{flex:1 1;margin-bottom:0}}.history__button{display:inline-block;border:1px solid #E0E0E0;border-radius:3px;vertical-align:middle;font-family:Arial;margin:0 10px}.history__button:first-child{margin-left:0}.history__button:last-child{margin-right:0}.history__button img{height:30px;display:block}.history__month{border:1px solid #E0E0E0;border-radius:5px;padding:30px;margin-bottom:30px}.history__month:last-child{margin-bottom:0}.history__month__title{font-size:25px;font-weight:500;margin-bottom:20px}.history__month__no-incidents{color:#999}.history__incident{padding-bottom:30px;padding-left:30px;position:relative}.history__incident:after{content:\"\";width:15px;height:15px;display:inline-block;vertical-align:middle;border-radius:90px;margin-right:9px;background-color:#3498DB;position:absolute;top:3px;left:0}.history__incident:before{content:\"\";position:absolute;background-color:#E0E0E0;width:2px;left:6px;top:0;bottom:0}.history__incident--impact-minor:after{background-color:#f4af00}.history__incident--impact-major:after{background-color:#e96600}.history__incident--impact-critical:after{background-color:#e74c3c}.history__incident:first-child:before{top:4px}.history__incident:last-child:before{top:0;height:10px;bottom:auto}.history__incident:first-child:last-child:before{display:none}.history__incident__title{font-size:18px;font-weight:500;margin-bottom:15px}.history__incident__title a{color:inherit;text-decoration:none}.history__incident__title a:hover{text-decoration:underline}.history__incident__timestamp{margin-top:5px;font-size:0.9em;color:#999}.subscribe{position:relative}.subscribe__button{appearance:none;-moz-appearance:none;-webkit-appearance:none;font:inherit;padding:14px 18px 12px;border:0;background-color:#553450;color:white;cursor:pointer;border-radius:4px;outline:none;font-size:16px;transition:background-color 0.2s ease-in-out}.subscribe__button img{height:15px;display:inline-block;vertical-align:middle;margin-right:8px}.subscribe__button:hover{background-color:#452a41}.subscribe__modal{position:absolute;top:100%;left:50%;transform:translateX(-50%);text-align:left;max-width:240px;border:1px solid #E0E0E0;border-radius:4px;z-index:10;background-color:#fafafa;box-shadow:0 2px 4px rgba(0,0,0,0.1);line-height:1.2;list-style-type:none;margin:0;margin-top:-5px}.subscribe__modal:before{position:absolute;bottom:100%;left:50%;margin-left:-3px;content:\"\";width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:6px solid #E0E0E0}.subscribe__modal a{display:block;padding:15px 25px;text-decoration:none;color:inherit;border-bottom:1px solid #E0E0E0;white-space:nowrap}.subscribe__modal a:hover{background-color:rgba(224,224,224,0.5)}\n", ""]);



/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader

module.exports = function (useSourceMap) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item, useSourceMap);

      if (item[2]) {
        return '@media ' + item[2] + '{' + content + '}';
      } else {
        return content;
      }
    }).join('');
  }; // import a list of modules into the list


  list.i = function (modules, mediaQuery) {
    if (typeof modules === 'string') {
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    for (var i = 0; i < this.length; i++) {
      var id = this[i][0];

      if (id != null) {
        alreadyImportedModules[id] = true;
      }
    }

    for (i = 0; i < modules.length; i++) {
      var item = modules[i]; // skip already imported module
      // this implementation is not 100% perfect for weird media query combinations
      // when a module is imported multiple times with different media queries.
      // I hope this will never occur (Hey this way we have smaller bundles)

      if (item[0] == null || !alreadyImportedModules[item[0]]) {
        if (mediaQuery && !item[2]) {
          item[2] = mediaQuery;
        } else if (mediaQuery) {
          item[2] = '(' + item[2] + ') and (' + mediaQuery + ')';
        }

        list.push(item);
      }
    }
  };

  return list;
};

function cssWithMappingToString(item, useSourceMap) {
  var content = item[1] || '';
  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (useSourceMap && typeof btoa === 'function') {
    var sourceMapping = toComment(cssMapping);
    var sourceURLs = cssMapping.sources.map(function (source) {
      return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */';
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
  }

  return [content].join('\n');
} // Adapted from convert-source-map (MIT)


function toComment(sourceMap) {
  // eslint-disable-next-line no-undef
  var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
  var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;
  return '/*# ' + data + ' */';
}

/***/ }),
/* 74 */
/***/ (function(module, exports) {

module.exports = require("chartist-plugin-tooltips");

/***/ })
/******/ ]);
});