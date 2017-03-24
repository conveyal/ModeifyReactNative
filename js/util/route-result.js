// @flow

import ProfileScorer from 'otp-profile-score'

import type TripPlanResult from '../types/results'

const scorer = new ProfileScorer()

type RouteResultConfig = {

}

export default class RouteResult {
  results: TripPlanResult;

  constructor (config?: RouteResultConfig) {

  }

  getResults () {
    return this.results
  }

  /**
   * parse a new profile response
   * @param  {Object} response A trip plan profile data
   * @return {boolean}         True if the response should cause an update
   */
  parseResponse (response: TripPlanResult) {
    this.results = scorer.processOptions(response.profile)

    console.log(this.results)

    return true
  }
}
