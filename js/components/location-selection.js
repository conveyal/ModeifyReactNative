// @flow

import lonlat from '@conveyal/lonlat'
import {autocomplete} from 'isomorphic-mapzen-search'
import throttle from 'lodash.throttle'
import React, {Component} from 'react'
import {
  ListView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import {GiftedForm} from 'react-native-gifted-form'

import type {GeocodeResult} from '../types'

const config = require('../../config.json')

type GeocodeQueryCache = {
  [key: string]: GeocodeResult
}

const geocodeQueries: GeocodeQueryCache = {}

type Props = {}
type State = {
  currentFocus: string;
  fromValue: string;
  geocodeResults: ListView.DataSource;
  toValue: string;
}

export default class LocationSelection extends Component {
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
      toValue: parseLocation(currentQuery.to)
    }
  }

  _autocompleteText = throttle((text) => {
    if (!text) {
      return
    }

    const {geocodeResults} = this.state

    if (text.length < 4) {
      return this.setState({ geocodeResults: geocodeResults.cloneWithRows([]) })
    }

    if (geocodeQueries[text]) {
      return this.setState({
        geocodeResults: geocodeResults.cloneWithRows(geocodeQueries[text])
      })
    }

    autocomplete(Object.assign(config.geocoderSettings, {
      text
    }))
      .then((geojson) => {
        if (!geojson.features) throw geojson
        // console.log(`successful geocode for ${text}`)
        geocodeQueries[text] = geojson.features
        this.setState({
          geocodeResults: geocodeResults.cloneWithRows(geojson.features)
        })
      })
      .catch((err) => {
        this.setState({ geocodeResults: geocodeResults.cloneWithRows([]) })
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
        textInputInline: styles.currentLocationText
      }
    } else {
      return {}
    }
  }

  _onBlur = () => {
    this.setState({
      currentFocus: 'none',
      geocodeResults: this.state.geocodeResults.cloneWithRows([])
    })
    this.props.blurLocationSelection()
  }

  _onFromFocus = () => {
    this.setState({
      currentFocus: 'from',
      geocodeResults: this.state.geocodeResults.cloneWithRows([])
    })
    this.props.focusToLocationSelection()
  }

  _onFromTextChange = (text) => {
    this.setState({ fromValue: text })
    this._autocompleteText(text)
  }

  _onGeocodeResultSelect = (value: GeocodeResult) => {
    const {currentFocus, geocodeResults} = this.state
    this.setState({
      currentFocus: 'none',
      [`${currentFocus}Value`]: value.properties.label,
      geocodeResults: geocodeResults.cloneWithRows([])
    })
    this.props.blurLocationSelection()
    this.props.setLocation({
      type: currentFocus,
      location: {
        ...lonlat(value.geometry.coordinates),
        name: value.properties.label
      }
    })
  }

  _onToFocus = () => {
    this.setState({
      currentFocus: 'to',
      geocodeResults: this.state.geocodeResults.cloneWithRows([])
    })
    this.props.focusToLocationSelection()
  }

  _onToTextChange = (text) => {
    this.setState({ toValue: text })
    this._autocompleteText(text)
  }

  render () {
    const {appState} = this.props
    const {currentFocus, fromValue, geocodeResults, toValue} = this.state

    return (
      <View style={{flex: 1}}>
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
                underlined
                value={fromValue}
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
              underlined
              value={toValue}
              widgetStyles={this._getInputStyles('to')}
              />
          </GiftedForm>
        </View>
        {currentFocus !== 'none' &&
          <View>
            <Text>{currentFocus}</Text>
            <ListView
              dataSource={geocodeResults}
              renderRow={(geocodeResult: GeocodeResult) => (
                <TouchableOpacity
                  onPress={() => this._onGeocodeResultSelect(geocodeResult)}
                  >
                  <Text>{geocodeResult.properties.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  currentLocationText: {
    color: '#15b3ff',
    fontWeight: 'bold'
  },
  'locationsForm-home': {
    height: 50
  },
  'locationsForm-location-selection': {
    height: 100
  }
})

function isCurrentLocation (query, type) {
  const location = query[type]
  return location && location.currentLocation
}

function parseLocation (location) {
  return location ? location.name : undefined
}
