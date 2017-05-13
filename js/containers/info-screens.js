// @flow

import { connect } from 'react-redux'

import AboutComponent from '../components/about'
import LegalComponent from '../components/legal'

const mapStateToProps = () => ({})

export const About = connect(mapStateToProps)(AboutComponent)
export const Legal = connect(mapStateToProps)(LegalComponent)
