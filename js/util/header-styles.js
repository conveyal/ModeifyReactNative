// @flow

import {StyleSheet} from 'react-native'

export default StyleSheet.create({
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
    resizeMode: 'contain'
  },
  nav: {
    backgroundColor: '#455a71',
    height: 55,
    marginTop: 20
  },
  statusBarSpacer: {
    backgroundColor: '#5a7491',
    height: 20
  },
  title: {
    color: '#fff',
    fontSize: 17,
    marginTop: 15
  }
})
