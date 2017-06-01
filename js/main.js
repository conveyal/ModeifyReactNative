// @flow

import createStore from '@conveyal/woonerf/store'
import createOtpReducer from 'otp-react-redux/lib/reducers/create-otp-reducer'
import React from 'react'
import {addNavigationHelpers, DrawerNavigator} from 'react-navigation'
import {connect, Provider} from 'react-redux'

import DrawerContent from './components/drawer-content'
import App from './containers/app.js'
import {About, Legal} from './containers/info-screens'
import LocationSelection from './containers/location-selection'
import OptionSelected from './containers/option-selected'
import ServiceAlerts from './containers/service-alerts'
import Settings from './containers/settings'
import Timing from './containers/timing'
import reducers from './reducers'

const AppNavigator = DrawerNavigator({
  Home: { screen: App },
  LocationSelection: {
    path: 'location-selection/:type',
    screen: LocationSelection
  },
  OptionSelected: {
    path: 'option-selected/:option',
    screen: OptionSelected
  },
  Timing: { screen: Timing },
  Settings: { screen: Settings },
  ServiceAlerts: { screen: ServiceAlerts },
  About: { screen: About },
  Legal: { screen: Legal }
}, {
  contentComponent: DrawerContent
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
        />
    );
  }
}

const ConnectedAppWithNavigationState = connect(
  state => ({ nav: state.nav })
)(AppWithNavigationState)

const Main = () => {
  return (
    <Provider store={store}>
      <ConnectedAppWithNavigationState />
    </Provider>
  )
}

export default Main
