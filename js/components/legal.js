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

import type {styleOptions} from '../types/rn-style-config'

type Props = {
  navigation: NavigationScreenProp<NavigationRoute, NavigationAction>
}

type LegalSection = {
  paragraphs: string[],
  section: string
}

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
          <Markdown style={markdownStyles}>
            ## Terms & Conditions{'\n\n'}

            ### Intent{'\n\n'}

            Through the website CarFreeAtoZ provides information for traveling around Arlington and the surrounding areas.{'\n\n'}

            ### Terms and Conditions{'\n\n'}

            Any person is hereby authorized to browse CarFreeAtoZ for informational purposes. In addition, any person, subject to the specifically stated guidelines and restrictions, may participate in the interactive and opt-in functions of the website.{'\n\n'}

            Information may be printed or downloaded from the website for non commercial, personal use only, provided all copyrights, licenses and other proprietary notices contained on the material are retained. The CarFreeAtoZ logo with accompanying wording is copyrighted. The policies on the CarFreeAtoZ are subject to change, without notice, upon public posting in a timely fashion.{'\n\n'}

            ### Warranties & Disclaimers{'\n\n'}

            Information on this website is provided “as is” and to the extent permitted by relevant law without warranty of any kind, expressed or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, or non-infringement. CarFreeAtoZ assumes no responsibility for the timeliness, deletion, missed delivery or failure to store any user communications or personalization settings.{'\n\n'}

            In no event shall CarFreeAtoZ be liable for any special, incidental, indirect, or consequential damages of any kind (including but not limited to lost data or profits), or any other damages whatsoever whether or not advised of the possible damage, under any theory of liability, arising out of or in connection with the use or performance of this information.{'\n\n'}

            ### Personal Information{'\n\n'}

            Under the following conditions CarFreeAtoZ is committed to ensuring the security of personal information voluntarily submitted to the website and the privacy of information collected through website logs.{'\n\n'}

            #### Browsing{'\n\n'}

            No personally identifiable information (any information by which you can be identified) is required to browse the website.{'\n\n'}

            #### Contact Us{'\n\n'}

            “Contact us” is the primary means of communication with staff for a website visitor. Questions, comments and suggestions voluntarily submitted to the County website through electronic mail may be treated as non-confidential and non-proprietary. Email communication is directed to appropriate staff. The information will only be maintained as an active file as long as needed to respond to the request. However, information may be archived for historical purposes, but will not be used beyond the stated purpose of the communication and will not be shared or distributed to third parties with any identifiable personal information.{'\n\n'}

            #### Website Logs{'\n\n'}

            Website logs are used to provide use data for analysis. The logs do not contain personally identifiable information and no attempt is made to link the logged information with the individuals who actually browse the site. By using CarFreeAtoZ, browsers give CarFreeAtoZ permission to collect such information about them as an anonymous user for the purpose of calculating aggregate site statistics.{'\n\n'}

            #### Cookies{'\n\n'}

            Cookies, a piece of text placed on the customer’s computer hard drive to help analyze web traffic or customer visits to a particular site, may be used in portions of the website. In addition, cookies allow a web application to respond to the customer as an individual by remembering information about preferences likes and dislikes.{'\n\n'}

            Accepting a cookie in no way gives access to your computer or any personal information about you, other than the data you chose to share. This practice is strictly enforced. You may set your web browser to notify you of cookie placement requests or decline cookies completely. You can delete the files that contain cookies. The files are stored as part of your internet browser.{'\n\n'}

            #### Interactive Services{'\n\n'}

            Personal information required to use some online services will be treated as confidential. Information that may be collected includes name, address, and email address. Such interactive services are entirely voluntary. Once a customer provides personally identifiable information the data is secured through state of the art technology. The data will be kept for as long as either required by law, or is relevant for the purposes for which it was collected.{'\n\n'}

            #### Privacy{'\n\n'}

            CarFreeAtoZ will not sell, rent or lease or otherwise disclose your personally identifiable information. Information may be shared with entities who are contractually acting on behalf of CarFreeAtoZ. Such entities are governed by this privacy policy with respect to the use of this data and are bound by the appropriate confidentiality agreements.{'\n\n'}

            #### Legal Access to Personal Information{'\n\n'}

            Federal law enforcement officials may under certain circumstances obtain access to subscriber databases and archived information under the federal Patriot Act (Public Law 107-56). Federal law prohibits CarFreeAtoZ from informing you if federal law enforcement officials have obtained these records.{'\n\n'}
          </Markdown>
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
    padding: 10,
    marginBottom: 80
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
