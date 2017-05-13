// @flow

import React, { Component } from 'react';
import {
  Button,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import HeaderBackButton from 'react-navigation/src/views/HeaderBackButton'


export default class Header extends Component {
  _renderLeft () {
    const {left, navigation} = this.props
    if (left) {
      if (left.back) {
        return (
          <View style={styles.leftBackButton}>
            <HeaderBackButton
              onPress={() => navigation.goBack(null)}
              tintColor='#fff'
              />
          </View>
        )
      } else if (left.menu) {
        return (
          <TouchableOpacity
            onPress={() => navigation.navigate('DrawerOpen')}
            >
            <MaterialIcon
              color='#fff'
              name='menu'
              size={24}
              style={styles.menuButton}
              />
          </TouchableOpacity>
        )
      }
    }
  }

  _renderRight () {
    const {right, navigation} = this.props
    if (right && right.close) {
      return (
        <TouchableOpacity
          onPress={() => navigation.goBack(null)}
          style={styles.rightCloseButton}
          >
          <MaterialIcon
            color='#fff'
            name='close'
            size={24}
            />
        </TouchableOpacity>
      )
    }
  }

  _renderTitle () {
    const {title} = this.props
    if (typeof title === 'string') {
      return <Text style={styles.title}>{title}</Text>
    } else {
      return title
    }
  }

  render () {
    return (
      <View style={styles.nav}>
        {this._renderLeft()}
        {this._renderTitle()}
        {this._renderRight()}
      </View>
    )
  }
}

type stylesType = {
  backContainer: Object,
  backImage: Object,
  closeContainer: Object,
  closeImage: Object,
  homeLogo: Object,
  leftBackButton: Object,
  menuButton: Object,
  nav: Object,
  rightCloseButton: Object,
  statusBarSpacer: Object,
  title: Object
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
  leftBackButton: {
    ...Platform.select({
      android: {},
      ios: {
        marginLeft: 10,
        marginTop: 6
      }
    })
  },
  menuButton: {
    margin: 16
  },
  nav: {
    backgroundColor: '#455a71',
    height: 56,
    ...Platform.select({
      android: {},
      ios: {
        marginTop: 20,
        paddingBottom: 15
      }
    })
  },
  rightCloseButton: {
    position: 'absolute',
    right: 16,
    top: 16
  },
  statusBarSpacer: {
    backgroundColor: '#5a7491',
    height: 20
  },
  title: {
    bottom: 0,
    color: '#fff',
    fontSize: 17,
    left: 40,
    position: 'absolute',
    right: 40,
    textAlign: 'center',
    top: 16
  }
})
