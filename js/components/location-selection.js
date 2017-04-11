// @flow

import lonlat from '@conveyal/lonlat'
import isEqual from 'lodash.isequal'
import {autocomplete, reverse} from 'isomorphic-mapzen-search'
import throttle from 'lodash.throttle'
import React, {Component} from 'react'
import {
  Image,
  ListView,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View
} from 'react-native'
import MapView from 'react-native-maps'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import type {GeocodeResult} from '../types'
import {geolocateLocation} from '../util'
import headerStyles from '../util/header-styles'

const config = require('../../config.json')

type GeocodeQueryCache = {
  [key: string]: GeocodeResult
}

const geocodeQueries: GeocodeQueryCache = {}

type LocationType = {
  currentLocation?: boolean;
  lat: number;
  lon: number;
  name: string;
}

type MarkerLocation = {
  latitude: number;
  longitude: number;
}

type Props = {
  appState: string;
  currentQuery: {
    from?: LocationType;
    to?: LocationType;
  }
}
type State = {
  geocodeResults: ListView.DataSource;
  inputValue?: string;
  markerLocation: MarkerLocation;
  noGeocodeResultsFound?: boolean;
  selectingOnMap?: boolean;
}

export default class LocationSelection extends Component {
  currentAutocompleteQuery: string
  currentReverseQuery: MarkerLocation
  state: State

  constructor(props: Props) {
    super(props)
  }

  static navigationOptions = {
    header: ({ state, setParams }) => ({
      style: headerStyles.nav,
      title: (
        <Text style={headerStyles.title}>SELECT LOCATION</Text>
      ),
      tintColor: '#fff'
    })
  }

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

  _autocompleteText = throttle((text) => {
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

    autocomplete(Object.assign(config.geocoderSettings, {
      text
    }))
      .then((geojson) => {
        if (geojson.isomorphicMapzenSearchQuery.text !==
          this.currentAutocompleteQuery) return

        if (!geojson.features) throw geojson
        // console.log(`successful geocode for ${text}`)
        geocodeQueries[text] = geojson.features
        this.setState({
          geocodeResults: geocodeResults.cloneWithRows(geojson.features),
          noGeocodeResultsFound: geojson.features.length === 0
        })
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
    const {navigation, setLocation} = this.props
    const {inputValue, markerLocation} = this.state

    setLocation({
      type: navigation.state.params.type,
      location: {
        name: inputValue,
        ...lonlat(markerLocation)
      }
    })

    navigation.navigate('Home')
  }

  _onGeocodeResultSelect = (value: GeocodeResult) => {
    const {navigation, setLocation} = this.props
    setLocation({
      type: navigation.state.params.type,
      location: {
        ...lonlat(value.geometry.coordinates),
        name: value.properties.label
      }
    })
    navigation.navigate('Home')
  }

  _onMapRegionChange = (region: MarkerLocation) => {
    this.setState({ markerLocation: region })
  }

  _onMapRegionChangeComplete = (region: MarkerLocation) => {
    this.setState({
      inputValue: lonlat.print(region)
    })

    this.currentReverseQuery = region

    reverse(Object.assign(
      config.geocoderSettings,
      { point: region }
    ))
      .then((geojson) => {
        if (
          lonlat.isEqual(
            this.currentReverseQuery,
            {
              lat: geojson.isomorphicMapzenSearchQuery['point.lat'],
              lon: geojson.isomorphicMapzenSearchQuery['point.lon']
            }
          ) &&
          geojson.features.length > 0
        ) {
          this.setState({
            inputValue: geojson.features[0].properties.label
          })
        }
      })
      .catch((err) => {
        // do nothing, simply use gps coordinates
      })
  }

  _onTextChange = (text) => {
    this.setState({ inputValue: text})
    this._autocompleteText(text)
  }

  _selectOnMap = () => {
    this.setState({ selectingOnMap: true })
  }

  _setAsCurrentLocation = () => {
    const {navigation, setLocation} = this.props

    geolocateLocation(
      navigation.state.params.type,
      setLocation
    )
    navigation.navigate('Home')
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
    const {markerLocation, selectingOnMap} = this.state

    if (!selectingOnMap) return null

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
        <View style={styles.mapContainer}>
          <MapView
            initialRegion={config.map.initialRegion}
            onRegionChange={this._onMapRegionChange}
            onRegionChangeComplete={this._onMapRegionChangeComplete}
            style={styles.map}
            >
            <MapView.Marker
              coordinate={markerLocation}
              />
          </MapView>
        </View>
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

    let otherFieldValue
    switch (navigation.state.params.type) {
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
                  renderRow={(geocodeResult: GeocodeResult) => (
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
        {this._renderInput()}
        {this._renderResults()}
        {this._renderMapSelection()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
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
    top: 85,
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
    fontWeight: 'normal',
    marginLeft: 10,
    width: 300
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
})

function isCurrentLocation (query, type) {
  const location = query[type]
  return location && location.currentLocation
}

function parseLocation (location): any {
  return location ? location.name : undefined
}
