// @flow

import React, {Component} from 'react'
import {Image, StyleSheet, Text, View} from 'react-native'

import LocationForm from '../containers/location-form'
import ResultsList from '../containers/results-list'
import ResultsMap from '../containers/results-map'
import headerStyles from '../util/header-styles'

type Props = {
  appState: string;
  navigation: any;
}

type State = {
  appState: string;
}

export default class App extends Component {
  props: Props
  state: State

  constructor (props: Props) {
    super(props)
    this.state = {
      appState: props.appState
    }
  }

  componentWillReceiveProps (nextProps: Props) {
    this.setState({ appState: nextProps.appState })
  }

  static navigationOptions = {
    header: ({ state, setParams }) => {
      console.log(state)
      return ({
        style: headerStyles.nav,
        title: state.appState === 'home'
          ? <Image
              source={require('../../assets/nav-logo.png')}
              style={headerStyles.homeLogo}
              />
          : <Text style={headerStyles.title}>PLAN YOUR TRIP DETAILS</Text>
      })
    }
  }

  _renderLocationSelection () {
    switch (this.props.appState) {
      case 'home':
      case 'location-selection':
        return (
          <LocationForm
            navigation={this.props.navigation}
            />
        )
      default:
        return null
    }
  }

  _renderResultsList () {
    switch (this.props.appState) {
      case 'results-list':
        return (
          <ResultsList
            navigation={this.props.navigation}
            />
        )
      default:
        return null
    }
  }

  _renderResultsMap () {
    switch (this.props.appState) {
      case 'home':
        return (
          <ResultsMap
            navigation={this.props.navigation}
            />
        )
      default:
        return null
    }
  }

  render () {
    const {appState} = this.props
    return (
      <View style={styles.app}>
        {this._renderLocationSelection()}
        {this._renderResultsMap()}
        {this._renderResultsList()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  app: {
    backgroundColor: '#fff',
    flex: 1
  }
})
