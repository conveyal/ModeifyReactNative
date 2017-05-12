// @flow

import React, {Component} from 'react'
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import {addNavigationHelpers, DrawerItems, DrawerNavigator} from 'react-navigation'


type Props = {

}

export default class DrawerContent extends Component {
  props: Props

  render () {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/cfaz-drawer-logo.png')}
            style={styles.cfazLogo}
            />
        </View>
        <DrawerItems {...this.props} />
        <TouchableOpacity
          onPress={() => Linking.openURL('http://carfreenearme.com/')}
          >
          <View style={styles.cfnmContainer}>
            <MaterialIcon
              color='#fff'
              name='clippy'
              size={24}
              style={styles.cfnmLogo}
              />
            <Text style={styles.cfnmText}>CAR FREE NEAR ME</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  cfazLogo: {
    flex: 1,
    resizeMode: 'contain',
    width: 300,
    ...Platform.select({
      android: {
        marginLeft: 25
      },
      ios: {
        marginLeft: 5,
        marginTop: 30
      }
    })
  },
  cfnmContainer: {
    backgroundColor: '#97D52A',
    flexDirection: 'row',
    alignItems: 'center'
  },
  cfnmLogo: {
    marginHorizontal: 16
  },
  cfnmText: {
    color: '#fff',
    margin: 16,
    fontWeight: 'bold'
  },
  container: {
    flex: 1
  },
  logoContainer: {
    height: 100,
    width: 300
  }
})
