// @flow

import {Platform, StyleSheet} from 'react-native'

import type {styleOptions} from '../types/rn-style-config'

type stylesType = {
  backContainer: styleOptions,
  backImage: styleOptions,
  closeContainer: styleOptions,
  closeImage: styleOptions,
  homeLogo: styleOptions,
  nav: styleOptions,
  statusBarSpacer: styleOptions,
  title: styleOptions
}

const styles: stylesType = StyleSheet.create({
  backContainer: {
    position: 'absolute',
    height: 34,
    left: 10,
    top: 10,
    width: 34
  },
  backImage: {
    height: 34,
    resizeMode: 'contain',
    width: 34
  },
  closeContainer: {
    position: 'absolute',
    height: 34,
    right: 10,
    top: 10,
    width: 34
  },
  closeImage: {
    height: 34,
    resizeMode: 'contain',
    width: 34
  },
  homeLogo: {
    height: 35,
    resizeMode: 'contain',
    ...Platform.select({
      android: {
        paddingTop: 10
      },
      ios: {}
    })
  },
  nav: {
    backgroundColor: '#455a71',
    height: 45,
    ...Platform.select({
      android: {},
      ios: {
        marginTop: 20,
        paddingBottom: 15
      }
    })
  },
  statusBarSpacer: {
    backgroundColor: '#5a7491',
    height: 20
  },
  title: {
    color: '#fff',
    fontSize: 17,
    ...Platform.select({
      android: {
        marginRight: 60,
        position: 'absolute',
        bottom: 0,
        top: 10,
        right: 40,
        left: 40,
        textAlign: 'center'
      },
      ios: {}
    })
  }
})

export default styles
