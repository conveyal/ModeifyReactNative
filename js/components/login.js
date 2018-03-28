// @flow

import decodeJwt from 'jwt-decode'
import isNumber from 'lodash.isnumber'
import moment from 'moment'
import React, {Component} from 'react'
import {Platform} from 'react-native'
import uuid from 'uuid/v4'

import auth0 from '../util/auth0'

import type {AppConfig} from '../types'
import type {GetUserData, SetUser} from '../types/actions/user'
import type {
  CurrentQuery,
  ModeifyModeSettings,
  PlanPostprocessSettings,
  UserMetadata,
  UserReducerState
} from '../types/reducers'

const config: AppConfig = require('../../config.json')

type Props = {
  currentQuery: CurrentQuery,
  getUserData: GetUserData,
  onLockDismiss: () => void,
  saveUserMetadata: (UserReducerState, UserMetadata) => void,
  setUser: SetUser,
  signUp?: boolean
}

export default class Login extends Component {
  props: Props

  componentDidMount() {
    const {
      currentQuery,
      getUserData,
      onLockDismiss,
      saveUserMetadata,
      setUser,
      signUp
    } = this.props

    const nonce = uuid()

    const authParams = {}
    authParams.nonce = nonce
    authParams.scope = 'email offline_access openid profile'

    if (signUp) {
      authParams.prompt = 'signup'
    } else if (Platform.OS === 'android') {
      authParams.prompt = 'login'
      authParams.state = '';
    }

    auth0
      .webAuth
      .authorize(authParams)
      .then(response => {
        // Authentication worked!
        console.log('Logged in with Auth0!')
        console.log(response)
        const tokenData = decodeJwt(response.idToken)

        if (tokenData.nonce != nonce) {
          throw new Error('Mismatched nonce found while logging in!')
        }

        // assume response is OIDC-complaint and contains user metadata that
        // is prefixed by the auth0 domain
        const {namespace} = config.auth0
        Object.keys(tokenData).forEach(k => {
          if (k.indexOf(namespace) > -1) {
            tokenData[k.replace(namespace, '')] = tokenData[k]
            delete tokenData[k]
          }
        })

        tokenData.userId = tokenData.sub

        console.log(tokenData)

        const newUserData = {
          ...tokenData,
          ...response
        }

        setUser({
          currentQuery,
          newUserData,
          saveToAsyncStorage: true
        })

        // make sure that user has a createdAtUnix entry
        let savingUserMetadata = false
        const userMetadata = newUserData.user_metadata || newUserData.userMetadata || {}
        if (!userMetadata.createdAtUnix) {
          userMetadata.createdAtUnix = moment(tokenData.created_at).unix()

          savingUserMetadata = true
          saveUserMetadata(newUserData, userMetadata)
        }
      })
      .catch(error => {
        if (error.error === 'a0.session.user_cancelled') {
          return onLockDismiss()
        }
        console.error('error logging in!')
        console.error(error)
        return
      })
  }

  render () {
    return null
  }
}
