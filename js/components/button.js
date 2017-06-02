// @flow

import React, {Component} from 'react'
import {StyleSheet, Text, TouchableOpacity} from 'react-native'

import type {styleOptions} from '../types/rn-style-config'

const Button = (props: {
  containerStyle?: styleOptions,
  onPress: () => void,
  text: string,
  textStyle?: styleOptions
}) => (
  <TouchableOpacity
    onPress={props.onPress}
    style={[styles.buttonContainer, props.containerStyle]}
    >
    <Text
      style={[styles.buttonText, props.textStyle]}
      >
      {props.text}
    </Text>
  </TouchableOpacity>
)

type ButtonStyle = {
  buttonContainer: styleOptions,
  buttonText: styleOptions
}

const styleConfig: ButtonStyle = {
  buttonContainer: {
    alignItems: 'center',
    backgroundColor: '#DD9719',
    borderColor: '#DD9719',
    borderRadius: 5,
    borderWidth: 1
  },
  buttonText: {
    margin: 8
  }
}

const styles: ButtonStyle = StyleSheet.create(styleConfig)

export default Button
