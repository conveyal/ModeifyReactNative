// @flow

import Auth0Lock from 'react-native-lock'

import type {AppConfig} from '../types'

const config: AppConfig = require('../../config.json')

const lock = new Auth0Lock(config.auth0)

export default lock
