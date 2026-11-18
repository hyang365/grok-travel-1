export type Season = "spring" | "summer" | "fall" | "winter" | "weekend";

export type Scores = {
  overall: number;
  affordability: number;
  safety: number;
  beauty: number;
};

export type YearCount = { year: number; count: number };

export type History = Record<Season, YearCount[]>;

export type Cohort = {
  season: Season;
  start: string;
  end: string;
  count: number;
};

export type Comment = {
  id: string;
  season: Season;
  year: number;
  college: string;
  classYear: string;
  scores: Scores;
  text: string;
};

export type Stay = {
  name: string;
  area: string;
  nightly: number;
  rating: number;
  note: string;
};

export type Place = {
  id: string;
  name: string;
  kind: "country" | "spot";
  iso: string;
  parentId?: string;
  lat: number;
  lng: number;
  region: string;
  blurb: string;
  guide: string;
  scores: Scores;
  history: History;
  cohorts: Cohort[];
  stays: Stay[];
  comments: Comment[];
  tags: string[];
  aliases: string[];
  atlas?: string;
};

export type PersonTrip = {
  placeId: string;
  season: Season;
  start: string;
  end: string;
  note?: string;
};

export type Person = {
  netid: string;
  name: string;
  college: string;
  year: string;
  trips: PersonTrip[];
};

export type Scope = "all" | "countries" | "us";
export type SortKey = "yalies" | "overall" | "affordability" | "safety" | "beauty";
export type ThemeName = "light" | "dark";
export type ViewName = "map" | "catalog" | "friends" | "itinerary";

export type Filters = {
  overall: number;
  affordability: number;
  safety: number;
  beauty: number;
  minYalies: number;
  features: string[];
  continents: string[];
  query: string;
  scope: Scope;
};

export type Trip = {
  id: string;
  placeId: string;
  season: Season;
  start: string;
  end: string;
  note: string;
  friendNetids: string[];
};
