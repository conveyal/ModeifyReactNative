// @flow

// As of 8 June 2017 this following code is basically deprecated.
// Auth0 made the grant types that this depends on "legacy".
// Customers cannot add any of the legacy grant types to their Clients.
// This will need to be rewritten with https://github.com/auth0/react-native-auth0

import Auth0Lock from 'react-native-lock'

import type {AppConfig} from '../types'

const config: AppConfig = require('../../config.json')

const lock = new Auth0Lock(config.auth0)

export default lock
