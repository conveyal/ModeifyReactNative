// @flow

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

export default class App extends Component {
  state: State

  constructor(props: Props) {
    super(props)

    this.state = {
      currentFocus: 'none',
      fromValue: '',
      geocodeResults: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
      toValue: ''
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

  _onBlur = () => {
    this.setState({
      currentFocus: 'none',
      geocodeResults: this.state.geocodeResults.cloneWithRows([])
    })
  }

  _onFromFocus = () => {
    this.setState({
      currentFocus: 'from',
      geocodeResults: this.state.geocodeResults.cloneWithRows([])
    })
  }

  _onFromTextChange = (text) => {
    this.setState({ fromValue: text })
    this._autocompleteText(text)
  }

  _onGeocodeResultSelect = (value: GeocodeResult) => {
    const {currentFocus} = this.state
    this.setState({
      currentFocus: 'none',
      [`${currentFocus}Value`]: value.properties.label,
      geocodeResults: this.state.geocodeResults.cloneWithRows([])
    })
  }

  _onToFocus = () => {
    this.setState({
      currentFocus: 'to',
      geocodeResults: this.state.geocodeResults.cloneWithRows([])
    })
  }

  _onToTextChange = (text) => {
    this.setState({ toValue: text })
    this._autocompleteText(text)
  }

  render () {
    const {placeholder, type} = this.props
    const {currentFocus, fromValue, geocodeResults, toValue} = this.state

    return (
      <View style={{flex: 1}}>
        <View style={styles.locationsForm}>
          <GiftedForm
            formName='tripPlanningForm'
            >
            <GiftedForm.SeparatorWidget />
            <GiftedForm.TextInputWidget
              clearButtonMode='while-editing'
              name='from-location'
              onBlur={this._onBlur}
              onChangeText={this._onFromTextChange}
              onTextInputFocus={this._onFromFocus}
              placeholder='Enter starting location'
              value={fromValue}
              />
            <GiftedForm.SeparatorWidget />
            <GiftedForm.TextInputWidget
              clearButtonMode='while-editing'
              name='to-location'
              onBlur={this._onBlur}
              onChangeText={this._onToTextChange}
              onTextInputFocus={this._onToFocus}
              placeholder='Enter destination location'
              value={toValue}
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
  locationsForm: {
    height: 120
  }
})
