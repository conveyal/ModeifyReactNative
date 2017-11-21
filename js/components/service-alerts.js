// @flow

import moment from 'moment'
import React, {Component} from 'react'
import {
  ActivityIndicator,
  Dimensions,
  ListView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import Header from './header'
import HyperLink from './hyperlink'
import {createDataSource} from '../util'
import tracker from '../util/analytics'

import type {
  NavigationAction,
  NavigationRoute,
  NavigationScreenProp
} from 'react-navigation/src/TypeDefinition'

import type {ServiceAlert, ServiceAlertsReducerState} from '../types/reducers'
import type {styleOptions} from '../types/rn-style-config'

type Props = {
  loadAlerts: () => void,
  navigation: NavigationScreenProp<NavigationRoute, NavigationAction>,
  serviceAlerts: ServiceAlertsReducerState
}

export default class ServiceAlerts extends Component {
  props: Props

  static navigationOptions = {
    drawerLabel: 'SERVICE ALERTS',
    drawerIcon: ({ tintColor }) => (
      <MaterialIcon
        name='alert'
        size={24}
        style={{ color: tintColor }}
        />
    )
  }

  componentDidMount () {
    tracker.trackScreenView('Service Alerts')
  }

  componentWillMount () {
    const {loadAlerts, serviceAlerts} = this.props

    if (!serviceAlerts.loaded) {
      loadAlerts()
    }
  }

  render () {
    const {serviceAlerts} = this.props

    const activeAlerts: ServiceAlert[] = serviceAlerts.alerts.filter((alert: ServiceAlert) => {
      const now = moment()
      return moment(alert.fromDate).isBefore(now) &&
        moment(alert.toDate).isAfter(now)
    })
    let alertsDataSource = createDataSource()
    alertsDataSource = alertsDataSource.cloneWithRows(activeAlerts)

    return (
      <View style={styles.container}>
        <Header
          left={{back: true}}
          navigation={this.props.navigation}
          right={{close: true}}
          title='SERVICE ALERTS'
          />
        <ScrollView>
          <View>
            {!serviceAlerts.loaded &&
              <ActivityIndicator
                animating
                size='large'
                style={styles.loading}
                />
            }
            {serviceAlerts.loaded &&
              !serviceAlerts.success &&
              <Text style={styles.infoText}>
                An error occurred while trying to fetch the alerts!
              </Text>
            }
            {serviceAlerts.loaded &&
              serviceAlerts.success &&
              activeAlerts.length === 0 &&
              <Text style={styles.infoText}>
                No service alerts happening right now!
              </Text>
            }
            {serviceAlerts.loaded &&
              serviceAlerts.success &&
              activeAlerts.length > 0 &&
              <ListView
                dataSource={alertsDataSource}
                renderRow={renderAlert}
                />
            }
          </View>
        </ScrollView>
      </View>
    )
  }
}

function renderAlert (alert: ServiceAlert): React.Element<*> {
  const screenWidth: number = Dimensions.get('window').width

  return (
    <HyperLink
      url={alert.alertUrl}
      >
      <View style={styles.alertContainer}>
        {!!alert.iconCode
          ? <FontAwesomeIcon
              name={alert.iconCode.replace(/^fa-/, '')}
              size={30}
              style={styles.alertIcon}
              />
          : <MaterialIcon
              name='alert'
              size={30}
              style={styles.alertIcon}
              />
        }
        <Text
          style={[
            styles.alertText,
            { width: screenWidth - 60}
          ]}
          >
          {alert.text}
        </Text>
      </View>
    </HyperLink>
  )
}

type ServiceAlertsStyle = {
  alertContainer: styleOptions,
  alertIcon: styleOptions,
  alertText: styleOptions,
  container: styleOptions,
  infoText: styleOptions,
  loading: styleOptions
}

const serviceAlertsStyle: ServiceAlertsStyle = {
  alertContainer: {
    backgroundColor: '#f2dede',
    flexDirection: 'row',
    padding: 10
  },
  alertIcon: {
    color: '#a94442',
    paddingRight: 10
  },
  alertText: {
    color: '#a94442'
  },
  container: Platform.select({
    ios: {},
    android: {
      backgroundColor: '#fff',
      flex: 1
    },
  }),
  infoText: {
    fontSize: 18,
    margin: 20
  },
  loading: {
    margin: 40
  }
}

const styles: ServiceAlertsStyle = StyleSheet.create(serviceAlertsStyle)
