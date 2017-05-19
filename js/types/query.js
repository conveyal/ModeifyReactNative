export type Location = {
  currentLocation?: boolean,
  lat?: number,
  lon?: number,
  name: string
}

export type ModeifyModeSettings = {
  bike: boolean,
  bus: boolean,
  cabi: boolean,
  car: boolean,
  rail: boolean,
  settings: {
    bikeSpeed: number,
    bikeTrafficStress: number,
    maxBikeTime: number,
    maxWalkTime: number,
    maxCarTime: number,
    walkSpeed: number
  },
  walk: boolean
}

export type ModeifyTiming = {
  end: string,
  start: string
}

export type CurrentQuery = {
  departArrive: string,
  date: string,
  from: ?Location,
  mode: ModeifyModeSettings,
  to: ?Location,
  time: ModeifyTiming
}
