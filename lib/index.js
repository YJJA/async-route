import _toArray from 'babel-runtime/helpers/toArray';
import _Promise from 'babel-runtime/core-js/promise';
import _extends from 'babel-runtime/helpers/extends';
import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import React from 'react';
import PropTypes from 'prop-types';
import { matchRoutes } from 'react-router-config';

var AsyncRoutes = function (_React$Component) {
  _inherits(AsyncRoutes, _React$Component);

  function AsyncRoutes() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, AsyncRoutes);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = AsyncRoutes.__proto__ || _Object$getPrototypeOf(AsyncRoutes)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      branch: []
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(AsyncRoutes, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      this._isMounted = true;
      var history = this.context.router.history;

      this.loadComponents(history.location);
      this.unlisten = history.listen(function (location) {
        _this2.loadComponents(location);
      });
    }
  }, {
    key: 'targgerOnEnter',
    value: function targgerOnEnter(branch) {
      var store = this.props.store;

      return branch.every(function (_ref2) {
        var route = _ref2.route;

        var result = void 0;
        if (typeof route.onEnter === 'function') {
          if (store) {
            var getState = function getState() {
              return store.getState();
            };
            result = route.onEnter(getState);
          } else {
            result = route.onEnter();
          }
        }
        return typeof result === 'undefined';
      });
    }
  }, {
    key: 'targgerOnLeave',
    value: function targgerOnLeave(branch) {
      var store = this.props.store;

      return branch.every(function (_ref3) {
        var route = _ref3.route;

        var result = void 0;
        if (typeof route.onEnter === 'function') {
          if (store) {
            var getState = function getState() {
              return store.getState();
            };
            result = route.onEnter(getState);
          } else {
            result = route.onEnter();
          }
        }
        return typeof result === 'undefined';
      });
    }
  }, {
    key: 'loadAsyncComponents',
    value: function loadAsyncComponents(branch) {
      var promises = branch.map(function (_ref4) {
        var route = _ref4.route,
            match = _ref4.match;

        if (route.asyncComponent) {
          return route.asyncComponent(match).then(function (Comp) {
            var component = Comp.default ? Comp.default : Comp;
            return { match: match, route: _extends({}, route, { component: component }) };
          });
        }
        return { route: route, match: match };
      });

      return _Promise.all(promises);
    }
  }, {
    key: 'loadComponents',
    value: function loadComponents(location) {
      var _this3 = this;

      var isLeave = this.targgerOnLeave(this.state.branch);
      if (!isLeave) {
        console.log('can\'t leave this component');
        return;
      }
      var branch = matchRoutes(this.props.routes, location.pathname);
      var isEnter = this.targgerOnEnter(branch);
      if (!isEnter) {
        console.log('can\'t enter this component');
        return;
      }

      this.loadAsyncComponents(branch).then(function (branch) {
        if (_this3._isMounted) {
          _this3.setState({ branch: branch, location: location });
        }
      }).catch(function (err) {
        console.error('load asyncComponent error');
        console.error(err);
      });
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._isMounted = false;
      this.unlisten();
    }

    // Recursive rendering

  }, {
    key: 'renderBranch',
    value: function renderBranch(branch) {
      if (!branch.length) {
        return null;
      }

      var history = this.context.router.history;

      var _branch = _toArray(branch),
          _branch$ = _branch[0],
          route = _branch$.route,
          match = _branch$.match,
          childBranch = _branch.slice(1);

      var Component = route.component;

      return React.createElement(Component, { history: history, match: match, children: this.renderBranch(childBranch) });
    }
  }, {
    key: 'render',
    value: function render() {
      return this.renderBranch(this.state.branch);
    }
  }]);

  return AsyncRoutes;
}(React.Component);

AsyncRoutes.propTypes = {
  routes: PropTypes.array.isRequired,
  store: PropTypes.shape({
    getState: PropTypes.func.isRequired
  })
};
AsyncRoutes.contextTypes = {
  router: PropTypes.shape({
    history: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired
  }).isRequired
};
export default AsyncRoutes;