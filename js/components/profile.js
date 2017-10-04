// @flow

import React, { Component } from 'react'
import {
  Dimensions,
  Image,
  ListView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import Button from './button'
import Header from './header'
import {createDataSource} from '../util'
import tracker from '../util/analytics'

import type {
  NavigationAction,
  NavigationRoute,
  NavigationScreenProp
} from 'react-navigation/src/TypeDefinition'

import type {ModeifyPlace, UserReducerState} from '../types/reducers'
import type {styleOptions} from '../types/rn-style-config'

type Props = {
  deleteFavorite: ({
    favoriteIdx: number,
    user: UserReducerState
  }) => void,
  logout: () => void,
  navigation: NavigationScreenProp<NavigationRoute, NavigationAction>,
  user: UserReducerState
}

export default class Profile extends Component<Props, State> {
  props: Props

  componentDidMount () {
    tracker.trackScreenView('Profile')
  }

  // ------------------------------------------------------------------------
  // handlers
  // ------------------------------------------------------------------------

  _onDeleteLocation = (favoriteIdx: string) => {
    const {user} = this.props
    this.props.deleteFavorite({
      favoriteIdx: parseInt(favoriteIdx, 10),
      user
    })
  }

  _onLogout = () => {
    const {logout, navigation} = this.props
    navigation.navigate('Home')
    logout()
  }

  // ------------------------------------------------------------------------
  // renderers
  // ------------------------------------------------------------------------

  _renderLocation = (
    location: ModeifyPlace,
    sectionId: string,
    rowId: string
  ): React.Element<*> => {
    const screenWidth: number = Dimensions.get('window').width

    return (
      <View style={styles.flexRow}>
        <View style={[
            styles.locationNameContainer,
            { width: screenWidth - 70 }
          ]}
          >
          <Text
            numberOfLines={1}
            style={styles.locationNameText}
            >
            {location.address}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => this._onDeleteLocation(rowId)}
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

    // don't show profile if user isn't logged in
    // in theory this screen should be impossible to access in this state
    if (!user.idToken) {
      return (
        <View>
          <Header
            left={{back: true}}
            navigation={this.props.navigation}
            right={{close: true}}
            title='PROFILE'
            />
          <Text style={styles.notLoggedInText}>Not logged in.</Text>
        </View>
      )
    }

    const locations = (
      (user.userMetadata &&
        user.userMetadata.modeify_places &&
        user.userMetadata.modeify_places.length > 0)
      ? user.userMetadata.modeify_places
      : []
    )

    let locationsDataSource = createDataSource()
    locationsDataSource = locationsDataSource.cloneWithRows(locations)

    return (
      <View style={styles.container}>
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
            <Text
              numberOfLines={1}
              style={styles.userInfoText}
              >
              {user.name}
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
          {locations.length > 0
            ? <ListView
                dataSource={locationsDataSource}
                renderRow={this._renderLocation}
                />
            : <Text style={styles.noFavoritesText}>No favorites added yet!</Text>
          }
        </ScrollView>
      </View>
    )
  }
}

type ProfileStyles = {
  container: styleOptions,
  favoriteIcon: styleOptions,
  flexRow: styleOptions,
  headerContainer: styleOptions,
  headerText: styleOptions,
  locationDeleteButton: styleOptions,
  locationNameContainer: styleOptions,
  locationNameText: styleOptions,
  logoutButton: styleOptions,
  logoutButtonContainer: styleOptions,
  noFavoritesText: styleOptions,
  notLoggedInText: styleOptions,
  userAvatar: styleOptions,
  userInfoText: styleOptions
}

const styleConfig: ProfileStyles = {
  container: Platform.select({
    ios: {},
    android: {
      backgroundColor: '#fff',
      flex: 1
    },
  }),
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
  noFavoritesText: {
    fontSize: 18,
    margin: 10
  },
  notLoggedInText: {
    alignItems: 'center',
    margin: 10
  },
  userAvatar: {
    height: 60,
    marginRight: 15,
    resizeMode: 'contain',
    width: 60
  },
  userInfoText: {
    flex: 1,
    fontSize: 18,
    marginRight: 10,
    paddingTop: 18
  }
}

const styles: ProfileStyles = StyleSheet.create(styleConfig)
