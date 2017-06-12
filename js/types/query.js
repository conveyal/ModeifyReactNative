export type Location = {
  currentLocation?: boolean,
  lat?: number,
  lon?: number,
  name: string
}

export type ModeifyAdvancedModeSettings = {
  bikeSpeed: number,
  bikeTrafficStress: number,
  maxBikeTime: number,
  maxWalkTime: number,
  maxCarTime: number,
  walkSpeed: number
}

export type ModeifyModeSettings = {
  bike: boolean,
  bus: boolean,
  cabi: boolean,
  car: boolean,
  rail: boolean,
  settings: ModeifyAdvancedModeSettings,
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
