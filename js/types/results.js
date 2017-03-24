type Stats = {
  avg: number;
  max: number;
  min: number;
}

type StreetEdge = {
  distance: number;
  geometry: {
    length: number;
    points: string;
  }
}

type Route = {
  id: string;
  shortName: string;
  longName: string;
  mode: string;
  color: string;
}

type NonTransitModeDetails = {
  mode: string;
  streetEdges: Array<StreetEdge>;
  time: number;
}

type TransitModeDetails = {
  fromName: string;
  mode: string;
  rideStats: Stats;
  routes: Array<Route>;
  toName: string;
  waitStats: Stats;
  walkDistance: number;
  walkTime: number;
}

type Fare = {
  low: number;
  peak: number;
  senior: number;
  type: string;
}

type NonTransitProfile = {
  access: Array<NonTransitModeDetails>;
  stats: Stats;
  summary: string;
}

type TransitProfile = {
  access: Array<NonTransitModeDetails>;
  egress: Array<NonTransitModeDetails>;
  fares: Array<Fare>;
  stats: Stats;
  summary: string;
  transit: Array<TransitModeDetails>;
}

export type TripPlanResult = {
  profile: [TransitProfile, NonTransitProfile];
}
