// flow-typed signature: 801d87d0bccd96d1e1a9c0fd6a351c79
// flow-typed version: <<STUB>>/@conveyal/lonlat_v^1.3.0/flow_v0.37.0

/**
 * This is an autogenerated libdef stub for:
 *
 *   '@conveyal/lonlat'
 *
 * Fill this stub out by replacing all the `any` types.
 *
 * Once filled out, we encourage you to share your work with the
 * community by sending a pull request to:
 * https://github.com/flowtype/flow-typed
 */

declare module '@conveyal/lonlat' {
  declare type standardizedLonLat = {
    lat: number,
    lon: number
  }

  declare type coordinatesInput = [number, number]
  declare type pointInput = {x: number, y: number}
  declare type objectInput = {
    lat?: number,
    latitude?: number,
    lon?: number,
    lng?: number,
    longitude?: number
  }

  declare export default function normalize(mixed): standardizedLonLat

  declare export function print(mixed): string
  declare export function isEqual(mixed, mixed): boolean
}
