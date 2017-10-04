// @flow

import React, { Component } from 'react'
import {Text, View} from 'react-native'

import type {styleOptions} from '../types/rn-style-config'

type Props = {
  backgroundColor: string,
  color: string,
  containerStyle?: styleOptions,
  text: string
}


export default class DumbTextButton extends Component<Props> {

  render () {
    const {backgroundColor, color, containerStyle, text} = this.props
    return (
      <View
        style={[{
          backgroundColor: backgroundColor,
          borderColor: backgroundColor,
          borderRadius: 5,
          borderWidth: 1,
          padding: 4
        }, containerStyle ? containerStyle : {}]}
        >
        <Text
          style={{
            color,
            fontWeight: 'bold',
            textAlign: 'center'
          }}
          >
          {text}
        </Text>
      </View>
    )
  }
}
