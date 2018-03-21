// @flow

import {fetchAction} from '@conveyal/woonerf/fetch'
import {logout as logoutFromStore, setAuth0User} from '@conveyal/woonerf/actions/user'
import camelcase from 'lodash.camelcase'
import isNumber from 'lodash.isnumber'
import {setMode} from 'otp-react-redux/lib/actions/form'
import {AsyncStorage} from 'react-native'

import {defaultModeSettings} from '../util'

import type {AppConfig, Favorite} from '../types'
import type {
  CurrentQuery,
  ModeifyAdvancedModeSettings
} from '../types/query'
import type {
  ModeifyOpts,
  UserMetadata,
  UserReducerState
} from '../types/reducers'

const config: AppConfig = require('../../config.json')

export function addFavorite ({
  location, user
}: {
  location: Favorite,
  user: UserReducerState
}) {
  const newMetadata = {...user.userMetadata}
  if (!newMetadata.modeify_places) {
    newMetadata.modeify_places = []
  }
  newMetadata.modeify_places.push(location)
  return saveUserMetadata(user, newMetadata)
}

function camelCaseObj (obj: Object): Object {
  const newObj = {}
  Object.keys(obj).forEach(k => {
    const val = obj[k]
    let correctedKey: string = camelcase(k)
    // blacklist modeify_places and modeify_opts
    const blacklist = ['modeify_places', 'modeify_opts']
    if (blacklist.indexOf(k) > -1) {
      correctedKey = k
    }
    if (obj[correctedKey]) {
      // don't overwrite data
      newObj[correctedKey] = obj[correctedKey]
      return
    }
    if (typeof val === 'object') {
      newObj[correctedKey] = camelCaseObj(val)
      return
    }
    newObj[correctedKey] = val
  })
  return newObj
}

export function deleteFavorite ({
  favoriteIdx, user
}: {
  favoriteIdx: number,
  user: UserReducerState
}) {
  const newMetadata = {...user.userMetadata}
  newMetadata.modeify_places.splice(favoriteIdx, 1)
  return saveUserMetadata(user, newMetadata)
}

export function getUserData ({
  currentQuery, oldUserData
}: {
  currentQuery: CurrentQuery,
  oldUserData: UserReducerState
}) {
  return fetchAction({
    next: (err, res) => {
      if (err) {
        console.error(err)
        alert('An error occurred while trying to load your profile data.  Please try logging in again.')
        return logout()
      } else {
        console.log('successfully got updated user data')
        // camel casize raw response
        const newUserData = camelCaseObj(res.value)
        newUserData.idToken = oldUserData.idToken
        newUserData.refreshToken = oldUserData.refreshToken
        return setUser({
          currentQuery,
          newUserData,
          saveToAsyncStorage: true
        })
      }
    },
    options: {
      headers: { Authorization: `bearer ${oldUserData.idToken}` },
      method: 'GET'
    },
    url: `https://${config.auth0.domain}/api/v2/users/${oldUserData.userId}`
  })
}

export function loadUserData (currentQuery: CurrentQuery) {
  return (
    AsyncStorage
      .getItem('user')
      .then((result: ?string) => {
        if (!result) return logout(false)
        const actions = []
        try {
          const user: UserReducerState = JSON.parse(result)
          actions.push(setUser({
            currentQuery,
            newUserData: user,
            saveToAsyncStorage: false
          }))

          // try to get user data by using refresh token
          if (user.refreshToken) {
            actions.push(refreshUser({
              currentQuery,
              oldUserData: user
            }))
          }
        } catch (e) {
          // unparseable
          actions.push(logout())
        }

        return actions
      })
      .catch((err) => {
        console.error('error getting user from AsyncStorage')
        return logout()
      })
  )
}

export function logout (removeFromAsyncStorage: boolean = true) {
  if (removeFromAsyncStorage) {
    AsyncStorage
      .removeItem('user')
      .then(() => {
        console.log('user data removed from AsyncStorage')
      })
      .catch((err) => {
        console.error('could not remove user data from AsyncStorage')
        console.error(err)
      })
  }
  return logoutFromStore()
}

/**
 * Refresh the idToken of the user and download the user's info again
 */
function refreshUser ({
  currentQuery, oldUserData
}: {
  currentQuery: CurrentQuery,
  oldUserData: UserReducerState
}) {
  // Refresh the id token
  return
  // authenticationAPI
  //   .refreshToken(oldUserData.refreshToken)
  //   .then((refreshResult: {
  //     expiresIn: number,
  //     idToken: string,
  //     tokenType: string
  //   }) => {
  //     if (!refreshResult.idToken) {
  //       throw new Error('Token refresh failed')
  //     }
  //     console.log('token refreshed successfully')
  //
  //     // Call the management API to get the user data
  //     const newToken = { idToken: refreshResult.idToken }
  //     const newUserData = {
  //       ...oldUserData,
  //       ...newToken
  //     }
  //     return [
  //       setAuth0User(newUserData),
  //       getUserData ({
  //         currentQuery,
  //         oldUserData: newUserData
  //       })
  //     ]
  //   })
  //   .catch((err) => {
  //     if (err.message === 'Token refresh failed') {
  //       console.log('Token refresh failed')
  //       return logout()
  //     }
  //     console.error('error occurred while refreshing token')
  //     console.error(err)
  //     return logout()
  //   })
}

export function saveUserMetadata (
  user: UserReducerState,
  newMetadata: UserMetadata
) {
  console.log('saved new user metadata', newMetadata)
  return fetchAction({
    next: (err, res) => {
      if (err) {
        // Not sure if I need to account for this, but in local development
        // I had the app open for so long that the idToken expired which would
        // cause this call to fail.  I'm not sure how likely this would be in a
        // production setting.  But if it needs to be fixed I could make a call
        // to refreshUser to make sure the saving works.
        console.error(err)
        alert('An error occurred while trying to save user data.  Try again later')
      } else {
        // camel casize raw response
        const newUserData = camelCaseObj(res.value)
        // preserve idToken and refreshToken
        newUserData.idToken = user.idToken
        newUserData.refreshToken = user.refreshToken
        saveUserDataInAsyncStorage(newUserData)
        return setAuth0User(newUserData)
      }
    },
    options: {
      body: { user_metadata: newMetadata },
      method: 'PATCH'
    },
    url: `https://${config.auth0.domain}/api/v2/users/${user.userId}`
  })
}

export function saveUserDataInAsyncStorage (user: UserReducerState) {
  AsyncStorage
    .setItem('user', JSON.stringify(user))
    .then(() => {
      console.log('saved user data in AsyncStorage')
    })
    .catch((err) => {
      console.error('could not save user data in AsyncStorage')
      console.error(err)
    })
}

/**
 * Update the user information upon receiving user data.
 * This should occur in 3 use cases:
 * - User logs in for first time
 * - App loads data from AsyncStorage on first load
 * - User data is obtained from refresh token call
 *
 * Perform the following actions
 * - update user store
 * - update mode settings
 * - update PlanPostprocessSettings
 * - save data to AsyncStorage
 */
export function setUser ({
  currentQuery, newUserData, saveToAsyncStorage
}: {
  currentQuery: CurrentQuery,
  newUserData: UserReducerState,
  saveToAsyncStorage: boolean
}) {

  // update user store
  const actions = [setAuth0User(newUserData)]

  // update mode settings if needed
  if (newUserData.userMetadata && newUserData.userMetadata.modeify_opts) {
    const {modeify_opts} = newUserData.userMetadata

    const settings: ModeifyAdvancedModeSettings = defaultModeSettings

    const settingKeys = [
      'bikeSpeed',
      'bikeTrafficStress',
      'carCostPerMile',
      'carParkingCost',
      'maxBikeTime',
      'maxWalkTime',
      'maxCarTime',
      'walkSpeed'
    ]

    settingKeys.forEach((key: string) => {
      // check if number or non-empty string
      if (isNumber(modeify_opts[key]) || modeify_opts[key]) {
        settings[key] = modeify_opts[key]
      }
    })

    // trip plan settings
    const newMode = Object.assign(
      {},
      currentQuery.mode,
      { settings }
    )
    actions.push(setMode({ mode: newMode }))
  }

  // save user data in async storage
  if (saveToAsyncStorage) {
    saveUserDataInAsyncStorage(newUserData)
  }

  return actions
}

/**
 * Update data of a favoirte location
 */
export function updateFavorite ({
  oldLocationAddress, newLocationData, user
}: {
  oldLocationAddress: string,
  newLocationData: Favorite,
  user: UserReducerState
}) {
  const favoriteIdx: number = user.userMetadata.modeify_places.findIndex(
    (favorite: Favorite) => (
      oldLocationAddress === favorite.address
    )
  )
  const newMetadata = {...user.userMetadata}
  newMetadata.modeify_places[favoriteIdx] = newLocationData
  return saveUserMetadata(user, newMetadata)
}

/**
 * Update user's advanced modeify settings
 */
export function updateSettings ({
  settings, user
}: {
  settings: ModeifyOpts,
  user: UserReducerState
}) {
  const newMetadata = {...user.userMetadata}
  newMetadata.modeify_opts = settings
  return saveUserMetadata(user, newMetadata)
}
