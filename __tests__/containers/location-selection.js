import 'react-native'
import React from 'react'
import {Provider} from 'react-redux'
import renderer from 'react-test-renderer'
import {makeMockStore, mockStores} from '../test-utils/mock-store'

import LocationSelection from '../../js/containers/location-selection'

describe('Components > LocationSelection', () => {
  it('renders correctly', () => {
    const mockStore = makeMockStore(mockStores.init)

    const tree = renderer.create(
      <Provider store={mockStore}>
        <LocationSelection />
      </Provider>
    )
  })
})
