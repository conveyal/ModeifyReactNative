// @flow

import React, {Component} from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import Autocomplete from 'react-native-autocomplete-input'
import {search} from 'isomorphic-mapzen-search'

import type {GeocodeResult} from '../types'

const config = require('../../config.json')

type Props = {
  onResultSelect: (GeocodeResult) => void;
  placeholder: string;
  topOffset: number;
}
type GeocodeQueryCache = {
  [key: string]: GeocodeResult
}

const geocodeQueries: GeocodeQueryCache = {}

export default class Geocoder extends Component {
  props: Props
  state: {
    geocodeResults: Array<GeocodeResult>;
    query: string
  }
  static defaultProps: { placeholder: string }

  constructor(props: Props) {
    super(props)

    this.state = {
      geocodeResults: [],
      query: ''
    }
  }

  _handleGeocodeResultSelect = (value: GeocodeResult) => {
    this.setState({
      geocodeResults: [],
      query: value.properties.label
    })
    this.props.onResultSelect(value)
  }

  _onChangeText = (text) => {
    if (text.length < 4) {
      return this.setState({ geocodeResults: [] })
    }

    if (geocodeQueries[text]) {
      return this.setState({ geocodeResults: geocodeQueries[text] })
    }

    search(Object.assign(config.geocoderSettings, {
      text
    }))
      .then((geojson) => {
        if (!geojson.features) throw geojson
        // console.log(`successful geocode for ${text}`)
        geocodeQueries[text] = geojson.features
        this.setState({ geocodeResults: geojson.features })
      })
      .catch((err) => {
        this.setState({ geocodeResults: [] })
      })
  }

  render () {
    const {placeholder, topOffset} = this.props
    const {geocodeResults, query} = this.state

    return (
      <Autocomplete
        data={geocodeResults}
        defaultValue={query}
        containerStyle={{
          left: 0,
          position: 'absolute',
          right: 0,
          top: topOffset
        }}
        listContainerStyle={{
          zIndex: 2
        }}
        onChangeText={this._onChangeText}
        placeholder={placeholder}
        renderItem={(geocodeResult: GeocodeResult) => (
          <TouchableOpacity
            onPress={() => this._handleGeocodeResultSelect(geocodeResult)}
            >
            <Text>{geocodeResult.properties.label}</Text>
          </TouchableOpacity>
          )}
        />
    )
  }
}
Geocoder.defaultProps = { placeholder: "Enter address" }
