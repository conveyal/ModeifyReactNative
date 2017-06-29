// @flow

import isNumber from 'lodash.isnumber'
import moment from 'moment'
import React, {Component} from 'react'
import {Platform} from 'react-native'

import lock from '../util/auth0'

import type {GetUserData, SetUser} from '../types/actions/user'
import type {
  CurrentQuery,
  ModeifyModeSettings,
  PlanPostprocessSettings,
  UserMetadata,
  UserReducerState
} from '../types/reducers'

type Props = {
  currentQuery: CurrentQuery,
  getUserData: GetUserData,
  onLockDismiss: () => void,
  saveUserMetadata: (UserReducerState, UserMetadata) => void,
  setUser: SetUser
}

export default class Login extends Component {
  props: Props

  componentDidMount() {
    const {
      currentQuery,
      getUserData,
      onLockDismiss,
      saveUserMetadata,
      setUser
    } = this.props

    lock.show({
      authParams: {
        scope: "openid email offline_access",
      },
      closable: true
    }, (err, profile, token) => {
      if (err) {
        if (err === 'Lock was dismissed by the user') {
          return onLockDismiss()
        }
        console.log(err)
        return
      }

      // Authentication worked!
      console.log('Logged in with Auth0!')

      const newUserData = {
        ...profile,
        ...token
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
        userMetadata.createdAtUnix = moment(profile.created_at).unix()

        savingUserMetadata = true
        saveUserMetadata(newUserData, userMetadata)
      }

      // There seems to be a bug with Android lock
      // The array of modeify_places always comes back as empty
      // so if on Android, also perform a getUserData action
      // if we've already initiated a save on the userMetadata then
      // don't perform this action
      if (!savingUserMetadata && Platform.OS === 'android') {
        getUserData({
          currentQuery,
          oldUserData: newUserData
        })
      }
    })
  }

  render () {
    return null
  }
}
