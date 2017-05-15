// @flow

import lonlat from '@conveyal/lonlat'
import isEqual from 'lodash.isequal'
import {autocomplete, reverse} from 'isomorphic-mapzen-search'
import throttle from 'lodash.throttle'
import React, {Component} from 'react'
import {
  Image,
  ListView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View
} from 'react-native'
import MapView from 'react-native-maps'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import Header from './header'
import {constructMapboxUrl, geolocateLocation} from '../util'
import headerStyles from '../util/header-styles'

import type {
  AutocompleteParams,
  MapzenResult,
  ReverseParams
} from 'isomorphic-mapzen-search'
import type {
  NavigationAction,
  NavigationRoute,
  NavigationScreenProp
} from 'react-navigation/src/TypeDefinition'

import type {AppConfig, CurrentQuery, MapRegion} from '../types'
import type {styleOptions} from '../types/rn-style-config'

const config: AppConfig = require('../../config.json')

type GeocodeQueryCache = {
  [key: string]: Array<MapzenResult>
}

const geocodeQueries: GeocodeQueryCache = {}

type LocationType = {
  currentLocation?: boolean;
  lat: number;
  lon: number;
  name: string;
}

type Props = {
  clearLocation: () => void,
  currentQuery: CurrentQuery,
  navigation: NavigationScreenProp<NavigationRoute, NavigationAction>,
  searchingOnMap: boolean,
  setLocation: () => void,
  setSearchingOnMap: () => void
}

type State = {
  geocodeResults: ListView.DataSource;
  inputValue?: string;
  markerLocation: MapRegion;
  noGeocodeResultsFound?: boolean;
  selectingOnMap?: boolean;
}

export default class LocationSelection extends Component {
  currentAutocompleteQuery: string
  currentReverseQuery: MapRegion
  props: Props
  state: State

  componentWillMount () {
    const {currentQuery} = this.props

    // check if from location needs to be geocoded
    if (currentQuery.from &&
      currentQuery.from.currentLocation &&
      !currentQuery.from.lat &&
      currentQuery.from.lat !== 0) {
      geolocateLocation('from', this.props.setLocation)
    }

    this.state = {
      geocodeResults: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
      inputValue: '',
      markerLocation: config.map.initialRegion
    }
  }

  componentDidMount () {
    this.refs.input.focus()
  }

  componentWillUnmount () {
    this.props.setSearchingOnMap(false)  // temp fix for https://github.com/airbnb/react-native-maps/issues/453
  }

  _autocompleteText = throttle((text: string) => {
    if (!text) return

    const {geocodeResults, selectingOnMap} = this.state

    if (selectingOnMap) return

    if (text.length < 4) {
      return this.setState({ geocodeResults: geocodeResults.cloneWithRows([]) })
    }

    if (geocodeQueries[text]) {
      return this.setState({
        geocodeResults: geocodeResults.cloneWithRows(geocodeQueries[text]),
        noGeocodeResultsFound: geocodeQueries[text].length === 0
      })
    }

    // going to geocode, set current query
    this.currentAutocompleteQuery = text

    const autocompleteQuery: AutocompleteParams = (Object.assign(
      {},
      config.geocoderSettings,
      {
        text
      }
    ): any)

    autocomplete(autocompleteQuery)
      .then((geojson) => {
        if (geojson.isomorphicMapzenSearchQuery.text !==
          this.currentAutocompleteQuery) return


        const {features} = geojson

        if (features) {
          // console.log(`successful geocode for ${text}`)
          geocodeQueries[text] = features
          this.setState({
            geocodeResults: geocodeResults.cloneWithRows(features),
            noGeocodeResultsFound: features.length === 0
          })
        } else {
          throw geojson
        }
      })
      .catch((err) => {
        this.setState({
          geocodeResults: geocodeResults.cloneWithRows([]),
          noGeocodeResultsFound: true
        })
      })
  }, 500)

  _getInputStyles () {
    return [styles.regularTextInput]
  }

  _onConfirmMapLocation = () => {
    const {navigation, setLocation, setSearchingOnMap} = this.props
    const {inputValue, markerLocation} = this.state
    const {params} = navigation.state

    setSearchingOnMap(false)  // temp fix for https://github.com/airbnb/react-native-maps/issues/453
    if (params) {
      setLocation({
        type: params.type,
        location: {
          name: inputValue,
          ...lonlat(markerLocation)
        }
      })
    } else {
      console.warn('Navigation params not set for this route!')
    }

    navigation.goBack()
  }

  _onGeocodeResultSelect = (value: MapzenResult) => {
    const {navigation, setLocation} = this.props
    const {params} = navigation.state
    if (params) {
      setLocation({
        type: params.type,
        location: {
          ...lonlat(value.geometry.coordinates),
          name: value.properties.label
        }
      })
    } else {
      console.warn('Navigation params not set for this route!')
    }
    navigation.goBack()
  }

  _onMapRegionChange = (region: MapRegion) => {
    this.setState({ markerLocation: region })
  }

  _onMapRegionChangeComplete = (region: MapRegion) => {
    this.setState({
      inputValue: lonlat.print(region)
    })

    this.currentReverseQuery = region

    const reverseQuery: ReverseParams = Object.assign(
      {},
      config.geocoderSettings,
      { point: region }
    )

    reverse(reverseQuery)
      .then((geojson) => {
        const {features} = geojson
        if (
          lonlat.isEqual(
            this.currentReverseQuery,
            {
              lat: geojson.isomorphicMapzenSearchQuery['point.lat'],
              lon: geojson.isomorphicMapzenSearchQuery['point.lon']
            }
          ) &&
          features &&
          features.length > 0
        ) {
          this.setState({
            inputValue: features[0].properties.label
          })
        }
      })
      .catch((err) => {
        // do nothing, simply use gps coordinates
      })
  }

  _onTextChange = (text: string) => {
    this.setState({ inputValue: text})
    this._autocompleteText(text)
  }

  _selectOnMap = () => {
    this.setState({ selectingOnMap: true })
    this.refs.input.blur()
    this.props.setSearchingOnMap(true)  // temp fix for https://github.com/airbnb/react-native-maps/issues/453
  }

  _setAsCurrentLocation = () => {
    const {navigation, setLocation} = this.props
    const {params} = navigation.state

    if (params) {
      geolocateLocation(
        params.type,
        setLocation
      )
    } else {
      console.warn('Navigation params not set for this route!')
    }
    navigation.goBack()
  }

  // --------------------------------------------------
  // rendering functions
  // --------------------------------------------------

  _renderInput () {
    const {inputValue} = this.state
    return (
      <View style={styles.inputContainer}>
        <MaterialIcon
          name='magnify'
          size={30}
          />
        <TextInput
          onChangeText={this._onTextChange}
          placeholder='Search for location'
          ref='input'
          style={this._getInputStyles()}
          value={inputValue || ''}
          />
      </View>
    )
  }

  _renderMapSelection () {
    const {searchingOnMap} = this.props  // bug fix for https://github.com/airbnb/react-native-maps/issues/453
    const {markerLocation, selectingOnMap} = this.state

    if (!searchingOnMap || !selectingOnMap) return null

    return (
      <View style={styles.mapSelectionContainer}>
        <View style={styles.mapInstructions}>
          <Text>Move the map to the desired location</Text>
          <TouchableOpacity
            onPress={this._onConfirmMapLocation}
            style={styles.confirmMapLocationButton}
            >
            <Text
              style={styles.confirmMapLocationButtonText}
              >
              Confirm Location
            </Text>
          </TouchableOpacity>
        </View>
        {searchingOnMap &&
          <View style={styles.mapContainer}>
            <MapView
              initialRegion={config.map.initialRegion}
              onRegionChange={this._onMapRegionChange}
              onRegionChangeComplete={this._onMapRegionChangeComplete}
              style={styles.map}
              >
              {config.map.showMapBoxTiles &&
                <MapView.UrlTile
                  urlTemplate={constructMapboxUrl(config.map.mapbox_base_style)}
                  />
              }
              {config.map.showMapBoxTiles &&
                <MapView.UrlTile
                  urlTemplate={constructMapboxUrl(config.map.mapbox_label_style)}
                  />
              }
              <MapView.Marker
                coordinate={markerLocation}
                />
            </MapView>
          </View>
        }
      </View>
    )
  }

  _renderResults () {
    const {currentQuery, navigation} = this.props
    const {
      inputValue,
      noGeocodeResultsFound,
      geocodeResults,
      selectingOnMap
    } = this.state
    const {params} = navigation.state

    if (!params) throw new Error('Navigation params not set!')

    let otherFieldValue
    switch (params.type) {
      case 'from':
        otherFieldValue = parseLocation(currentQuery.to)
        break
      case 'to':
        otherFieldValue = parseLocation(currentQuery.from)
        break
    }

    if (selectingOnMap) return null

    return (
      <View style={styles.resultContainer}>
        {otherFieldValue !== 'Current Location' &&
          <TouchableOpacity
            onPress={this._setAsCurrentLocation}
            style={styles.resultSelectionButton}
            >
            <Image
              source={require('../../assets/crosshair.png')}
              style={styles.resultSelectionButtonImage}
              />
            <Text style={styles.resultSelectionButtonText}>
              Use Current Location
            </Text>
          </TouchableOpacity>
        }
        <TouchableOpacity
          onPress={this._selectOnMap}
          style={styles.resultSelectionButton}
          >
          <Image
            source={require('../../assets/map.png')}
            style={styles.resultSelectionButtonImage}
            />
          <Text style={styles.resultSelectionButtonText}>
            Selection Location on Map
          </Text>
        </TouchableOpacity>
        {inputValue !== 'Current Location' &&
          <View>
            <View style={styles.resultDividerContainer}>
              <Text style={styles.resultDividerText}>Search Results</Text>
            </View>
            {(geocodeResults.getRowCount() > 0
              ? <ListView
                  dataSource={geocodeResults}
                  renderRow={(geocodeResult: MapzenResult) => (
                    <TouchableOpacity
                      onPress={() => this._onGeocodeResultSelect(geocodeResult)}
                      >
                      <Text style={styles.geocodeResult}>
                        {geocodeResult.properties.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              : <Text>{
                (inputValue === undefined
                  || inputValue.length < 4)
                  ? 'Type to search for an address'
                  : (noGeocodeResultsFound
                    ? `No addresses found for: "{${inputValue}}"`
                    : 'Searching...')}
                </Text>
            )}
          </View>
        }
      </View>
    )
  }

  render () {
    return (
      <View style={styles.container}>
        <Header
          left={{back: true}}
          navigation={this.props.navigation}
          right={{close: true}}
          title='SELECT LOCATION'
          />
        <View style={styles.contentContainer}>
          {this._renderInput()}
          {this._renderResults()}
          {this._renderMapSelection()}
        </View>
      </View>
    )
  }
}

type LocationSelectionStyle = {
  confirmMapLocationButton: styleOptions,
  confirmMapLocationButtonText: styleOptions,
  container: styleOptions,
  contentContainer: styleOptions,
  currentLocationTextInput: styleOptions,
  geocodeResult: styleOptions,
  inputContainer: styleOptions,
  map: styleOptions,
  mapContainer: styleOptions,
  mapInstructions: styleOptions,
  mapSelectionContainer: styleOptions,
  regularTextInput: styleOptions,
  resultContainer: styleOptions,
  resultDividerContainer: styleOptions,
  resultDividerText: styleOptions,
  resultSelectionButton: styleOptions,
  resultSelectionButtonImage: styleOptions,
  resultSelectionButtonText: styleOptions
}

const locationSelectionStyle: LocationSelectionStyle = {
  confirmMapLocationButton: {
    backgroundColor: '#63cc81',
    marginTop: 10,
    padding: 10,
    width: 200
  },
  confirmMapLocationButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center'
  },
  container: {
    backgroundColor: '#fff',
    flex: 1
  },
  contentContainer: {
    flex: 1,
    paddingTop: 10
  },
  currentLocationTextInput: {
    color: '#15b3ff',
    fontWeight: 'bold'
  },
  geocodeResult: {
    fontSize: 16,
    marginVertical: 10
  },
  inputContainer: {
    borderColor: '#C8C8C8',
    borderBottomWidth: 1,
    flexDirection: 'row',
    marginHorizontal: 10
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    top: 85
  },
  mapInstructions: {
    alignItems: 'center',
    padding: 10
  },
  mapSelectionContainer: {
    flex: 1
  },
  regularTextInput: {
    color: '#000',
    flex: 1,
    fontWeight: 'normal',
    marginLeft: 10,
    ...Platform.select({
      android: {
        height: 40
      },
      ios: {}
    })
  },
  resultContainer: {
    flex: 1,
    flexDirection: 'column',
    padding: 10
  },
  resultDividerContainer: {
    borderBottomWidth: 1,
    marginBottom: 10,
    marginTop: 10
  },
  resultDividerText: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  resultSelectionButton: {
    flexDirection: 'row',
    height: 30
  },
  resultSelectionButtonImage: {
    height: 30,
    resizeMode: 'contain',
    width: 30
  },
  resultSelectionButtonText: {
    fontSize: 16,
    marginTop: 4,
    marginLeft: 10
  }
}

const styles: LocationSelectionStyle = StyleSheet.create(locationSelectionStyle)

function parseLocation (location): any {
  return location ? location.name : undefined
}
