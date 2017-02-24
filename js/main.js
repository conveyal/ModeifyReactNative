// @flow

import React from 'react'
// import { createStore, combineReducers, applyMiddleware } from 'redux'
// import { Provider } from 'react-redux'
// import thunk from 'redux-thunk'

import App from './app.js'

// set up the Redux store
// const store = createStore(
//   combineReducers({
//     otp: createOtpReducer(otpConfig) // add optional initial query here
//     // add your own reducers if you want
//   }),
//   applyMiddleware(thunk)
// )

// const Main = () => {
//   return (
//     <Provider store={store}>
//       <App />
//     </Provider>
//   )
// }

const Main = () => {
  return <App />
}

export default Main
