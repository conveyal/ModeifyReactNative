type Coordinate = [number, number]

declare module 'polyline' {
  declare module.exports: {
    decode(string): Coordinate[],
    encode(Coordinate[]): string
  }
}
