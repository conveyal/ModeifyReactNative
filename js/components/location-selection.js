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
  TouchableHighlight,
  TouchableOpacity,
  View
} from 'react-native'
import MapView from 'react-native-maps'
import {GiftedForm} from 'react-native-gifted-form'

import type {GeocodeResult} from '../types'

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
  currentFocus: string;
  fromValue: string;
  geocodeResults: ListView.DataSource;
  markerLocation: MarkerLocation;
  noGeocodeResultsFound?: boolean;
  selectingOnMap?: boolean;
  toValue: string;
}

export default class LocationSelection extends Component {
  currentAutocompleteQuery: string
  currentReverseQuery: MarkerLocation
  state: State

  constructor(props: Props) {
    super(props)
  }

  componentWillMount () {
    const {currentQuery} = this.props

    // check if from location needs to be geocoded
    if (currentQuery.from &&
      currentQuery.from.currentLocation &&
      !currentQuery.from.lat &&
      currentQuery.from.lat !== 0) {
      this._geolocateLocation('from')
    }

    this.state = {
      currentFocus: 'none',
      fromValue: parseLocation(currentQuery.from),
      geocodeResults: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
      markerLocation: config.map.initialRegion,
      toValue: parseLocation(currentQuery.to)
    }
  }

  componentWillReceiveProps (nextProps: Props) {
    const updatedState = {}
    const locationTypes = ['from', 'to']
    // update location text
    locationTypes.forEach((locationType: string) => {
      const nextLocation: LocationType = nextProps.currentQuery[locationType]
      if (!isEqual(
        nextLocation,
        this.props.currentQuery[locationType]
      )) {
        // location has changed
        updatedState[`${locationType}Value`] = parseLocation(
          nextLocation
        )

        if (updatedState[`${locationType}Value`] === undefined) {
          this.refs[`${locationType}Input`].refs.input.clear()
        }

        // redo geolocation if necessary
        if (nextLocation && nextLocation.name === 'Current Location') {
          this._geolocateLocation(locationType)
        }
      }
    })

    // blur location selection upon navigating away from location-selection
    const {currentFocus} = this.state
    if (!isEqual(nextProps.appState, this.props.appState) &&
      nextProps.appState !== 'location-selection' &&
      currentFocus !== 'none') {
      this.refs[`${currentFocus}Input`].refs.input.clear()
      this.refs[`${currentFocus}Input`].refs.input.blur()
    }
    if (Object.keys(updatedState).length > 0) {
      this.setState(updatedState)
    }
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

  _geolocateLocation = (locationType) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.props.setLocation({
          type: locationType,
          location: {
            currentLocation: true,
            name: 'Current Location',
            ...lonlat(position.coords)
          }
        })
      },
      (error) => alert(`Your location could not be determined.
        Please search for an address.`),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    )
  }

  _getInputStyles (type) {
    if (isCurrentLocation(this.props.currentQuery, type)) {
      return {
        textInputInline: styles.currentLocationTextInput
      }
    } else {
      return {
        textInputInline: styles.regularTextInput
      }
    }
  }

  _onBlur = () => {
    this.setState({
      currentFocus: 'none',
      geocodeResults: this.state.geocodeResults.cloneWithRows([])
    })
    this.props.blurLocationField()
  }

  _onConfirmMapLocation = () => {
    const {currentFocus, markerLocation} = this.state

    this.props.setLocation({
      type: currentFocus,
      location: {
        name: this.state[`${currentFocus}Value`],
        ...lonlat(markerLocation)
      }
    })

    this._postSelectLocation({
      selectingOnMap: false
    })
  }

  _onFromFocus = () => {
    this.setState({
      currentFocus: 'from',
      geocodeResults: this.state.geocodeResults.cloneWithRows([]),
      noGeocodeResultsFound: false
    })
    this.props.clearLocation({ type: 'from' })
    this.props.focusToLocationSelection()
  }

  _onFromTextChange = (text) => {
    this.setState({ fromValue: text })
    this._autocompleteText(text)
  }

  _onGeocodeResultSelect = (value: GeocodeResult) => {
    const {currentFocus, geocodeResults} = this.state
    this._postSelectLocation({
      [`${currentFocus}Value`]: value.properties.label,
    })
    this.props.setLocation({
      type: currentFocus,
      location: {
        ...lonlat(value.geometry.coordinates),
        name: value.properties.label
      }
    })
  }

  _onMapRegionChange = (region: MarkerLocation) => {
    this.setState({ markerLocation: region })
  }

  _onMapRegionChangeComplete = (region: MarkerLocation) => {
    const {currentFocus} = this.state

    this.setState({
      [`${currentFocus}Value`]: lonlat.print(region)
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
            [`${currentFocus}Value`]: geojson.features[0].properties.label
          })
        }
      })
      .catch((err) => {
        // do nothing, simply use gps coordinates
      })
  }

  _onSwitch = () => {
    this.props.switchLocations()
  }

  _onToFocus = () => {
    this.setState({
      currentFocus: 'to',
      geocodeResults: this.state.geocodeResults.cloneWithRows([]),
      noGeocodeResultsFound: false
    })
    this.props.clearLocation({ type: 'to' })
    this.props.focusToLocationSelection()
  }

  _onToTextChange = (text) => {
    this.setState({ toValue: text })
    this._autocompleteText(text)
  }

  _postSelectLocation (nextState?: Object) {
    nextState = nextState || {}
    const {currentFocus, geocodeResults} = this.state
    nextState.geocodeResults = geocodeResults.cloneWithRows([])
    const otherField = currentFocus === 'from' ? 'to' : 'from'
    if (!this.state[`${otherField}Value`]) {
      // other value hasn't been set yet, focus to it
      this.refs[`${otherField}Input`].refs.input.focus()
    } else {
      // other value set, blur field
      this.refs[`${currentFocus}Input`].refs.input.blur()
      this.props.blurLocationField()
      nextState.currentFocus = 'none'
    }
    this.setState(nextState)
  }

  _selectOnMap = () => {
    this.setState({ selectingOnMap: true })
  }

  _setAsCurrentLocation = () => {
    const {currentFocus} = this.state
    this._geolocateLocation(currentFocus)
    this._postSelectLocation({
      [`${currentFocus}Value`]: 'Current Location'
    })
  }

  // --------------------------------------------------
  // rendering functions
  // --------------------------------------------------

  _renderInputs () {
    const {appState} = this.props
    const {fromValue, toValue} = this.state
    return (
      <View style={styles[`locationsForm-${appState}`]}>
        <GiftedForm
          formName='tripPlanningForm'
          >
          {appState !== 'home' &&
            <GiftedForm.TextInputWidget
              clearButtonMode='while-editing'
              image={require('../../assets/search.png')}
              name='from-location'
              onBlur={this._onBlur}
              onChangeText={this._onFromTextChange}
              onTextInputFocus={this._onFromFocus}
              placeholder='Enter starting location'
              ref='fromInput'
              underlined
              value={fromValue || ''}
              widgetStyles={this._getInputStyles('from')}
              />
          }
          <GiftedForm.TextInputWidget
            clearButtonMode='while-editing'
            image={require('../../assets/search.png')}
            name='to-location'
            onBlur={this._onBlur}
            onChangeText={this._onToTextChange}
            onTextInputFocus={this._onToFocus}
            placeholder='Where do you want to go?'
            ref='toInput'
            underlined
            value={toValue || ''}
            widgetStyles={this._getInputStyles('to')}
            />
        </GiftedForm>
        {appState !== 'home' &&
          <TouchableHighlight
            onPress={this._onSwitch}
            style={styles.switchButtonContainer}
            underlayColor='#fff'
            >
            <Image
              source={require('../../assets/switch.png')}
              style={styles.switchButton}
              />
          </TouchableHighlight>
        }
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
    const {
      currentFocus,
      fromValue,
      noGeocodeResultsFound,
      geocodeResults,
      selectingOnMap,
      toValue
    } = this.state

    let currentFocusValue
    let otherFieldValue
    switch (currentFocus) {
      case 'from':
        currentFocusValue = fromValue
        otherFieldValue = toValue
        break
      case 'to':
        currentFocusValue = toValue
        otherFieldValue = fromValue
        break
    }

    if (currentFocus === 'none' || selectingOnMap) return null

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
        {currentFocusValue !== 'Current Location' &&
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
                (currentFocusValue === undefined
                  || currentFocusValue.length < 4)
                  ? 'Type to search for an address'
                  : (noGeocodeResultsFound
                    ? `No addresses found for: "{${currentFocusValue}}"`
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
      <View style={{flex: 1}}>
        {this._renderInputs()}
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
  currentLocationTextInput: {
    color: '#15b3ff',
    fontWeight: 'bold'
  },
  geocodeResult: {
    fontSize: 16,
    marginVertical: 10
  },
  'locationsForm-home': {
    height: 50
  },
  'locationsForm-location-selection': {
    height: 100
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
    fontWeight: 'normal'
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
  },
  switchButton: {
    height: 30,
    resizeMode: 'contain',
    width: 30
  },
  switchButtonContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    position: 'absolute',
    right: 20,
    top: 30
  }
})

function isCurrentLocation (query, type) {
  const location = query[type]
  return location && location.currentLocation
}

function parseLocation (location): any {
  return location ? location.name : undefined
}
