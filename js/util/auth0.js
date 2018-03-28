// @flow

import Auth0 from 'react-native-auth0'

import type {AppConfig} from '../types'

const config: AppConfig = require('../../config.json')

const auth0 = new Auth0(config.auth0)

export default auth0
