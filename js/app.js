// @flow

import lonlat from '@conveyal/lonlat'
import moment from 'moment'
import polyline from 'polyline'
import qs from 'qs'
import React, { Component } from 'react'
import { StyleSheet, View } from 'react-native'
import MapView from 'react-native-maps'

import Geocoder from './components/geocoder'
import type {GeocodeResult} from './types'

const config = require('../config.json')
const {api} = config

const planEndpoint = `${api.host}:${api.port}${api.path}`

type Stats = {
  avg: number;
  max: number;
  min: number;
}

type StreetEdge = {
  distance: number;
  geometry: {
    length: number;
    points: string;
  }
}

type Route = {
  id: string;
  shortName: string;
  longName: string;
  mode: string;
  color: string;
}

type NonTransitModeDetails = {
  mode: string;
  streetEdges: Array<StreetEdge>;
  time: number;
}

type TransitModeDetails = {
  fromName: string;
  mode: string;
  rideStats: Stats;
  routes: Array<Route>;
  toName: string;
  waitStats: Stats;
  walkDistance: number;
  walkTime: number;
}

type Fare = {
  low: number;
  peak: number;
  senior: number;
  type: string;
}

type NonTransitProfile = {
  access: Array<NonTransitModeDetails>;
  stats: Stats;
  summary: string;
}

type TransitProfile = {
  access: Array<NonTransitModeDetails>;
  egress: Array<NonTransitModeDetails>;
  fares: Array<Fare>;
  stats: Stats;
  summary: string;
  transit: Array<TransitModeDetails>;
}

type TripPlanResult = {
  profile: [TransitProfile, NonTransitProfile];
}

type TripPlanCache = {
  [key: string]: TripPlanResult
}

type State = {
  fromLocation?: GeocodeResult;
  toLocation?: GeocodeResult;
  tripPlanQueryString? : string;
  tripPlanResult?: TripPlanResult;
}
type Props = {}

const tripPlanCache: TripPlanCache = {}

export default class App extends Component {
  state: State

  constructor(props: Props) {
    super(props)

    this.state = {}
  }

  _handleFromSelect = (value: GeocodeResult) => {
    this.setState({fromLocation: value})
    this._planTripIfNeeded(value, this.state.toLocation)
  }

  _handleToSelect = (value: GeocodeResult) => {
    this.setState({toLocation: value})
    this._planTripIfNeeded(this.state.fromLocation, value)
  }

  _planTripIfNeeded (nextFrom: ?GeocodeResult, nextTo: ?GeocodeResult) {
    console.log(nextFrom, nextTo)
    if (nextFrom && nextTo) {
      const params = {
        accessModes: 'WALK,BICYCLE,BICYCLE_RENT,CAR_PARK',
        date: moment().format('YYYY-MM-DD'),
        directModes: 'WALK,BICYCLE,BICYCLE_RENT,CAR',
        egressModes: 'WALK,BICYCLE_RENT',
        endTime: '9:00',
        from: toOtpCoords(nextFrom),
        startTime: '7:00',
        to: toOtpCoords(nextTo),
        transitModes: 'BUS,TRAINISH'
      }
      const queryString = qs.stringify(params)
      const updatedState: State = { tripPlanQueryString: queryString }

      if (tripPlanCache[queryString]) {
        updatedState.tripPlanResult = tripPlanCache[queryString]
        return this.setState(updatedState)
      }
      console.log('fetch it', `${planEndpoint}?${queryString}`)
      fetch(`${planEndpoint}?${queryString}`)
        .then(res => res.json())
        .then((json) => {
          console.log('successful plan')
          updatedState.tripPlanResult = json
          this.setState(updatedState)
        })
        .catch((err) => {
          console.error(err)
        })
    }
  }

  _renderTripPlanResult = () => {
    const {tripPlanQueryString, tripPlanResult} = this.state

    if (!tripPlanResult) {
      return
    }

    const itemsToRender = []

    tripPlanResult.profile.forEach((profile) => {
      if (profile.summary === 'Non-transit options') {
        // non-transit
        profile.access.forEach((accessMode) => {
          if (!polylineStyles[accessMode.mode]) return
          const combinedLineCoordinates = []
          accessMode.streetEdges.forEach((edge) => {
            polyline.decode(edge.geometry.points).forEach((point) => {
              combinedLineCoordinates.push({
                latitude: point[0],
                longitude: point[1]
              })
            })
          })
          itemsToRender.push(
            <MapView.Polyline
              key={`${tripPlanQueryString}-${accessMode.mode}`}
              coordinates={combinedLineCoordinates}
              {...polylineStyles[accessMode.mode]}
              />
          )
        })
      }
    })

    return itemsToRender
  }

  render() {
    const {fromLocation, toLocation, tripPlanResult} = this.state

    return (
      <View>
        <View>
          <Geocoder
            onResultSelect={this._handleFromSelect}
            placeholder='Enter starting address'
            topOffset={0}
            />
        </View>
        <View>
          <Geocoder
            onResultSelect={this._handleToSelect}
            placeholder='Enter destination address'
            topOffset={50}
            />
        </View>
        <View style ={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={config.map.initialRegion}
            >
            {fromLocation &&
              <MapView.Marker
                coordinate={toLatLng(fromLocation)}
                title={fromLocation.properties.label}
                />
            }
            {toLocation &&
              <MapView.Marker
                coordinate={toLatLng(toLocation)}
                title={toLocation.properties.label}
                />
            }
            {this._renderTripPlanResult()}
          </MapView>
         </View>
      </View>
    )
  }
}

const polylineStyles = {
  BICYCLE: {
    strokeColor: '#ef3026'
  },
  CAR: {
    strokeColor: '#888'
  },
  WALK: {
    strokeColor: '#0BC8F4'
  }
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    height: 400,
    justifyContent: 'flex-end',
    top: 100,
    alignItems: 'center',
  }
})

function toLatLng (geocoderResult: GeocodeResult) {
  const coords = lonlat(geocoderResult.geometry.coordinates)
  return {
    latitude: coords.lat,
    longitude: coords.lon
  }
}

function toOtpCoords (geocoderResult: GeocodeResult) {
  const coords = lonlat(geocoderResult.geometry.coordinates)
  return `${coords.lat},${coords.lon}`
}
