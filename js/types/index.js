// @flow

export type GeocodeResult = {
  geometry: {
    coordinates: Array<number>
  },
  properties: {
    address: string;
    label: string
  }
}
