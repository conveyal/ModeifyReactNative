// @flow

import React, {Component} from 'react'
import {Image, ScrollView, StyleSheet, Text, View} from 'react-native'
import Auth0Lock from 'react-native-lock'

const config = require('../../config.json')

const lock = new Auth0Lock(config.auth0)

export default class Login extends Component {
  props: {
    setAuth0User: Object => void
  }

  componentDidMount() {
    const {setAuth0User} = this.props

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
      setAuth0User({
        ...profile,
        ...token
      })
    })
  }

  render () {
    return null
  }
}
