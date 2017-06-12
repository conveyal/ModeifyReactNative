// @flow

import {fetchAction} from '@conveyal/woonerf/fetch'
import {setAuth0User} from '@conveyal/woonerf/actions/user'

import type {AppConfig} from '../types'
import type {
  ModeifyOpts,
  UserMetadata,
  UserReducerState
} from '../types/reducers'

const config: AppConfig = require('../../config.json')

export function deleteLocation ({
  locationIdx, user
}: {
  locationIdx: number,
  user: UserReducerState
}) {
  const newMetadata = {...user.userMetadata}
  newMetadata.modeify_places.splice(locationIdx, 1)
  return saveUserMetadata(user, newMetadata)
}

function saveUserMetadata (
  user: UserReducerState,
  newMetadata: UserMetadata
) {
  console.log(newMetadata)
  return fetchAction({
    next: (err, res) => {
      if (err) {
        console.error(err)
        alert('An error occurred while trying to save user data.  Try again later')
      } else {
        // camel casize raw response
        const newUserData = res.value
        newUserData.userMetadata = newUserData.user_metadata
        delete newUserData.user_metadata
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
