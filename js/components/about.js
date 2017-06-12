// @flow

import React, {Component} from 'react'
import {View, ScrollView, StyleSheet, Text} from 'react-native'
import Markdown from 'react-native-simple-markdown'

import Header from './header'
import {markdownStyles} from '../util/styles'

import type {
  NavigationAction,
  NavigationRoute,
  NavigationScreenProp
} from 'react-navigation/src/TypeDefinition'

import tracker from '../util/analytics'

import type {styleOptions} from '../types/rn-style-config'

type Props = {
  navigation: NavigationScreenProp<NavigationRoute, NavigationAction>
}

export default class About extends Component {
  props: Props

  static navigationOptions = {
    drawerLabel: 'ABOUT'
  }

  componentDidMount () {
    tracker.trackScreenView('About')
  }

  render () {
    return (
      <View>
        <Header
          left={{back: true}}
          navigation={this.props.navigation}
          right={{close: true}}
          title='ABOUT'
          />
        <ScrollView style={styles.content}>
          <Markdown styles={markdownStyles}>
            ## What is CarFreeAtoZ?{'\n\n'}

            ### CarFreeAtoZ is the Washington region's first fully multimodal trip planning and comparison tool.{'\n\n'}

            Developed as part of Arlington County Commuter Services [Transit Tech Initiative](http://mobilitylab.org/tech/transit-tech-initiative), CarFreeAtoZ makes it easy to adapt smart transportation choices to your daily life.{'\n\n'}

            We are utilizing open transportation data standards and technologies, including:{'\n\n'}

            * The [OpenTripPlanner](http://www.opentripplanner.org/) multimodal routing engine{'\n\n'}
            * [OpenStreetMap](http://www.openstreetmap.org/){'\n\n'}
            * [GTFS](https://developers.google.com/transit/gtfs/) Transit data feeds from the following providers: *ART, DASH, DC Circulator, Fairfax Connector, MTA, PRTC, Ride-On, VRE, and WMATA.* Additional providers will be added as data is available.{'\n\n'}

            CarFreeAtoZ is currently in **beta.** We are continuing to add features and would love your suggestions. To provide feedback:{'\n\n'}

            * Complete [this survey](https://carfreeatoz.typeform.com/to/gbcagR) about your overall experience using the site.{'\n\n'}
            * Comment on the usefulness of specific trip using the "rate" link within that option's summary.{'\n\n'}
            * Send any general feedback to [feedback@carfreeatoz.com](mailto:feedback@carfreeatoz.com).{'\n\n'}

            ### [Arlington County](http://www.arlingtonva.us/){'\n\n'}

            Arlington County Commuter Services (ACCS) is funded in part by grants from the U.S. Department of Transportation (DOT), the Virginia Department of Transportation (VDOT) and the Virginia Department of Rail and Public Transportation (DRPT).{'\n\n'}

            ### ACCS Family of Sites{'\n\n'}

            * [CommuterPage.com](http://www.commuterpage.com/){'\n\n'}
            * [CommuterDirect.com](https://www.commuterdirect.com/){'\n\n'}
            * [Arlington Transit — ART](http://www.arlingtontransit.com){'\n\n'}
            * [WalkArlington](http://www.walkarlington.com/){'\n\n'}
            * [BikeArlington](http://www.bikearlington.com){'\n\n'}
            * [Arlington Transportation Partners](http://www.arlingtontransportationpartners.com){'\n\n'}
            * [The Commuter Store](http://www.commuterpage.com/pages/tools-resources/commuter-store-commuter-direct/){'\n\n'}
            * [Arlington's Car-Free Diet](http://www.carfreediet.com/){'\n\n'}
            * [Mobility Lab](http://www.mobilitylab.org/){'\n\n'}
            * [Car-Free Near Me](http://www.carfreenearme.com/){'\n\n'}
            * [Capital Bikeshare](http://www.capitalbikeshare.com/){'\n\n'}
            * [Arlington DOT](http://transportation.arlingtonva.us/){'\n\n'}
          </Markdown>
        </ScrollView>
      </View>
    )
  }
}

type AboutStyle = {
  content: styleOptions
}

const aboutStyle: AboutStyle = {
  content: {
    marginBottom: 80,
    padding: 10
  }
}

const styles: AboutStyle = StyleSheet.create(aboutStyle)
