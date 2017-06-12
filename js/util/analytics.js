// @flow

import {GoogleAnalyticsTracker} from 'react-native-google-analytics-bridge'

import type {AppConfig} from '../types/index'

const config: AppConfig = require('../../config.json')


const tracker = new GoogleAnalyticsTracker(config.analyticsKey)

export default tracker
