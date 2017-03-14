import multi from '@conveyal/woonerf/store/multi'
import promise from '@conveyal/woonerf/store/promise'
import configureStore from 'redux-mock-store'

// mock store
export const makeMockStore = configureStore([multi, promise])

export const mockStores = {
  init: {
    otp: {
      config: {},
      currentQuery: {
        type: 'ITINERARY',
        from: null,
        to: null,
        departArrive: 'NOW',
        date: '2017-03-10',
        time: '12:34',
        mode: 'TRANSIT,WALK'
      },
      searches: [],
      activeSearch: 0
    }
  }
}
