// @flow

import React, { Component } from 'react'
import {
  Dimensions,
  Image,
  ListView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import Button from './button'
import Header from './header'
import {collapseString, createDataSource} from '../util'
import tracker from '../util/analytics'

import type {
  NavigationAction,
  NavigationRoute,
  NavigationScreenProp
} from 'react-navigation/src/TypeDefinition'

import type {UserReducerState} from '../types/reducers'
import type {styleOptions} from '../types/rn-style-config'

type Props = {
  deleteLocation: (Object) => void,
  logout: () => void,
  navigation: NavigationScreenProp<NavigationRoute, NavigationAction>,
  user: UserReducerState
}

export default class Profile extends Component {
  props: Props

  componentDidMount () {
    tracker.trackScreenView('Profile')
  }

  // ------------------------------------------------------------------------
  // handlers
  // ------------------------------------------------------------------------

  _onDeleteLocation = (location) => {
    this.props.deleteLocation(location)
  }

  _onLogout = () => {
    this.props.logout()
  }

  // ------------------------------------------------------------------------
  // renderers
  // ------------------------------------------------------------------------

  _renderLocation = (location): React.Element<*> => {
    const screenWidth: number = Dimensions.get('window').width

    return (
      <View style={styles.flexRow}>
        <View style={[
            styles.locationNameContainer,
            { width: screenWidth - 70 }
          ]}
          >
          <Text style={styles.locationNameText}>
            {collapseString(location.address, 34)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => this._onDeleteLocation(location)}
          style={styles.locationDeleteButton}
          >
          <MaterialIcon
            name='delete'
            size={20}
            />
        </TouchableOpacity>
      </View>
    )
  }

  render (): React.Element<*> {
    const {user} = this.props

    const locations = [
      {
        address: 'Ronald Reagan Washington National Airport, Arlington, VA, USA undefined'
      }, {
        address: '950 Stafford, Arlington, VA'
      }
    ]

    let locationsDataSource = createDataSource()
    locationsDataSource = locationsDataSource.cloneWithRows(locations)

    return (
      <View>
        <Header
          left={{back: true}}
          navigation={this.props.navigation}
          right={{close: true}}
          title='PROFILE'
          />
        <ScrollView>
          <View style={styles.flexRow}>
            <Image
              source={{ uri: user.picture }}
              style={styles.userAvatar}
              />
            <Text style={styles.userInfoText}>
              {collapseString(user.name, 30)}
            </Text>
          </View>
          <View style={styles.logoutButtonContainer}>
            <Button
              containerStyle={styles.logoutButton}
              onPress={this._onLogout}
              text='Logout'
              />
          </View>
          <View style={[styles.flexRow, styles.headerContainer]}>
            <MaterialIcon
              color='#fff'
              name='heart'
              size={30}
              style={styles.favoriteIcon}
              />
            <Text style={styles.headerText}>
              Favorite Places
            </Text>
          </View>
          <ListView
            dataSource={locationsDataSource}
            renderRow={this._renderLocation}
            />
        </ScrollView>
      </View>
    )
  }
}

type ProfileStyles = {
  favoriteIcon: styleOptions,
  flexRow: styleOptions,
  headerContainer: styleOptions,
  headerText: styleOptions,
  locationDeleteButton: styleOptions,
  locationNameContainer: styleOptions,
  locationNameText: styleOptions,
  logoutButton: styleOptions,
  logoutButtonContainer: styleOptions,
  userAvatar: styleOptions,
  userInfoText: styleOptions
}

const styleConfig: ProfileStyles = {
  favoriteIcon: {
    margin: 10
  },
  flexRow: {
    flexDirection: 'row'
  },
  headerContainer: {
    backgroundColor: '#5a7491'
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 10,
    paddingTop: 13
  },
  locationDeleteButton: {
    backgroundColor: '#f5a81c',
    borderColor: '#f5a81c',
    borderRadius: 5,
    borderWidth: 1,
    padding: 3,
    margin: 5
  },
  locationNameContainer: {
    backgroundColor: '#dff0d8',
    borderColor: '#d6e9c6',
    borderRadius: 5,
    borderWidth: 1,
    height: 30,
    marginHorizontal: 10,
    marginTop: 5
  },
  locationNameText: {
    color: '#3c763d',
    fontSize: 16,
    paddingHorizontal: 5,
    paddingTop: 5
  },
  logoutButton: {
    width: 80
  },
  logoutButtonContainer: {
    alignItems: 'center',
    margin: 10
  },
  userAvatar: {
    height: 60,
    marginRight: 20,
    resizeMode: 'contain',
    width: 60
  },
  userInfoText: {
    fontSize: 18,
    paddingTop: 18
  }
}

const styles: ProfileStyles = StyleSheet.create(styleConfig)
