import React from 'react'
import PropTypes from 'prop-types'
import {matchRoutes} from 'react-router-config'

export default class AsyncRoutes extends React.Component {
  static propTypes = {
    routes: PropTypes.array.isRequired,
    store: PropTypes.shape({
      getState: PropTypes.func.isRequired
    })
  };

  static contextTypes = {
    router: PropTypes.shape({
      history: PropTypes.object.isRequired,
      route: PropTypes.object.isRequired
    }).isRequired
  };

  state = {
    branch: []
  };

  componentDidMount() {
    this._isMounted = true
    const {history} = this.context.router
    this.loadComponents(history.location)
    this.unlisten = history.listen((location) => {
      this.loadComponents(location)
    })
  }

  targgerOnEnter(branch) {
    const {store} = this.props
    return branch.every(({route}) => {
      let result
      if (typeof route.onEnter === 'function') {
        if (store) {
          const getState = () => store.getState()
          result = route.onEnter(getState)
        } else {
          result = route.onEnter()
        }
      }
      return typeof result === 'undefined'
    })
  }

  targgerOnLeave(branch) {
    const {store} = this.props
    return branch.every(({route}) => {
      let result
      if (typeof route.onEnter === 'function') {
        if (store) {
          const getState = () => store.getState()
          result = route.onEnter(getState)
        } else {
          result = route.onEnter()
        }
      }
      return typeof result === 'undefined'
    })
  }

  loadAsyncComponents(branch) {
    const promises = branch.map(({route, match}) => {
      if (route.asyncComponent) {
        return route.asyncComponent(match)
          .then(Comp => {
            const component = Comp.default ? Comp.default : Comp
            return {match, route: {...route, component}}
          })
      }
      return {route, match}
    })

    return Promise.all(promises)
  }

  loadComponents(location) {
    const isLeave = this.targgerOnLeave(this.state.branch)
    if (!isLeave) {
      console.log('can\'t leave this component')
      return
    }
    const branch = matchRoutes(this.props.routes, location.pathname)
    const isEnter = this.targgerOnEnter(branch)
    if (!isEnter) {
      console.log('can\'t enter this component')
      return
    }

    this.loadAsyncComponents(branch)
      .then(branch => {
        if (this._isMounted) {
          this.setState({branch, location})
        }
      })
      .catch(err => {
        console.error('load asyncComponent error')
        console.error(err)
      })
  }

  componentWillUnmount() {
    this._isMounted = false
    this.unlisten()
  }

  // Recursive rendering
  renderBranch(branch) {
    if (!branch.length) {
      return null
    }

    const {history} = this.context.router
    const [{route, match}, ...childBranch] = branch
    const Component = route.component

    return <Component history={history} match={match} children={this.renderBranch(childBranch)} />
  }

  render() {
    return this.renderBranch(this.state.branch)
  }
}
