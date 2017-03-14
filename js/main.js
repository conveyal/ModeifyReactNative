// @flow

import createStore from '@conveyal/woonerf/store'
import createOtpReducer from 'otp-react-redux/lib/reducers/create-otp-reducer'
import React from 'react'
import {Provider} from 'react-redux'

import App from './containers/app.js'
import reducers from './reducers'

//set up the Redux store
const store = createStore(reducers)

const Main = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}

export default Main
