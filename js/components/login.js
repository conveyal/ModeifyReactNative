// @flow

import isNumber from 'lodash.isnumber'
import React, {Component} from 'react'

import lock from '../util/auth0'

import type {SetUser} from '../types/actions/user'
import type {
  CurrentQuery,
  ModeifyModeSettings,
  PlanPostprocessSettings
} from '../types/reducers'

type Props = {
  currentQuery: CurrentQuery,
  setUser: SetUser
}

export default class Login extends Component {
  props: Props

  componentDidMount() {
    const {currentQuery, setUser} = this.props

    lock.show({
      authParams: {
        scope: "openid email offline_access",
      },
      closable: true
    }, (err, profile, token) => {
      if (err) {
        console.log(err)
        return
      }

      // Authentication worked!
      console.log('Logged in with Auth0!')
      setUser({
        currentQuery,
        newUserData: {
          ...profile,
          ...token
        },
        saveToAsyncStorage: true
      })
    })
  }

  render () {
    return null
  }
}
