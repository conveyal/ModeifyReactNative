// @flow

import React, {Component} from 'react'
import {View, ScrollView, StyleSheet, Text} from 'react-native'

import Header from './header'

import type {
  NavigationAction,
  NavigationRoute,
  NavigationScreenProp
} from 'react-navigation/src/TypeDefinition'

import type {styleOptions} from '../types/rn-style-config'

type Props = {
  navigation: NavigationScreenProp<NavigationRoute, NavigationAction>
}

type LegalSection = {
  paragraphs: string[],
  section: string
}

const legalContent: LegalSection[] = require('../../legal.json')

export default class Legal extends Component {
  props: Props

  static navigationOptions = {
    drawerLabel: 'LEGAL'
  }

  render () {
    return (
      <View>
        <Header
          left={{back: true}}
          navigation={this.props.navigation}
          right={{close: true}}
          title='LEGAL'
          />
        <ScrollView style={styles.content}>
          <Text style={styles.title}>
            Terms & Conditions
          </Text>
          {legalContent.map((legalSection, sIdx) =>
            <View key={`section-${sIdx}`}>
              <Text style={styles.sectionHeader}>
                {legalSection.section}
              </Text>
              {legalSection.paragraphs.map((paragraph, pIdx) =>
                <Text
                  key={`section-${sIdx}-paragraph-${pIdx}`}
                  style={styles.paragraph}>
                  {paragraph}
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    )
  }
}

type AboutStyle = {
  content: styleOptions,
  paragraph: styleOptions,
  sectionHeader: styleOptions,
  title: styleOptions
}

const aboutStyle: AboutStyle = {
  content: {
    padding: 10
  },
  paragraph: {
    marginBottom: 5
  },
  sectionHeader: {
    fontSize: 18,
    marginVertical: 10
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    marginTop: 10
  }
}

const styles: AboutStyle = StyleSheet.create(aboutStyle)
