// @flow

import {Platform, StyleSheet} from 'react-native'

type stylesType = {
  backContainer: {
    position: string,
    height: number,
    left: number,
    top: number,
    width: number
  },
  backImage: {
    height: number,
    resizeMode: string,
    width: number
  },
  closeContainer: {
    position: string,
    height: number,
    right: number,
    top: number,
    width: number
  },
  closeImage: {
    height: number,
    resizeMode: string,
    width: number
  },
  homeLogo: {
    height: number,
    resizeMode: string,
    paddingTop?: number
  },
  nav: {
    backgroundColor: string,
    height: number,
    marginTop?: number,
    paddingBottom?: number
  },
  statusBarSpacer: {
    backgroundColor: string,
    height: number
  },
  title: {
    color: string,
    fontSize: number,
    marginRight?: number,
    position?: string,
    bottom?: number,
    top?: number,
    right?: number,
    left?: number,
    textAlign?: string
  }
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
