// @flow

import createStore from '@conveyal/woonerf/store'
import createOtpReducer from 'otp-react-redux/lib/reducers/create-otp-reducer'
import React from 'react'
import {addNavigationHelpers, StackNavigator} from 'react-navigation'
import {connect, Provider} from 'react-redux'

import App from './containers/app.js'
import LocationSelection from './containers/location-selection'
import reducers from './reducers'
import headerStyles from './util/header-styles'

const AppNavigator = StackNavigator({
  Home: { screen: App },
  LocationSelection: {
    path: 'location-selection/:type',
    screen: LocationSelection
  }
})

const navReducer = (state, action) => {
  const newState = AppNavigator.router.getStateForAction(action, state)
  return (newState ? newState : state)
}

reducers.nav = navReducer

//set up the Redux store
const store = createStore(reducers)

class AppWithNavigationState extends React.Component {
  render() {
    return (
      <AppNavigator
        navigation={addNavigationHelpers({
          dispatch: this.props.dispatch,
          state: this.props.nav,
        })}
        style={headerStyles.statusBarSpacer}
        />
    );
  }
}

const ConnectedAppWithNavigationState = connect(
  state => ({ nav: state.nav }),
  dispatch => ({ dispatch })
)(AppWithNavigationState)

const Main = () => {
  return (
    <Provider store={store}>
      <ConnectedAppWithNavigationState />
    </Provider>
  )
}

export default Main
