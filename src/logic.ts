import type { Filters, Person, PersonTrip, Place, Scores, Season, Trip } from "./types";

export const CURRENT_YEAR = 2026;

export const SEASONS: { id: Season; label: string }[] = [
  { id: "spring", label: "Spring Break" },
  { id: "summer", label: "Summer" },
  { id: "fall", label: "Fall Break" },
  { id: "winter", label: "Winter" },
  { id: "weekend", label: "Weekends" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function seasonLabel(id: Season): string {
  return SEASONS.find((season) => season.id === id)?.label ?? id;
}

export function visitCount(place: Place, season: Season, year = CURRENT_YEAR): number {
  return place.history[season].find((row) => row.year === year)?.count ?? 0;
}

export function parseISODate(iso: string): number {
  const [year, month, day] = iso.split("-").map(Number);
  return Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

export function daysInclusive(start: string, end: string): number {
  const from = parseISODate(start);
  const to = parseISODate(end);
  if (to < from) return 0;
  return Math.round((to - from) / 86_400_000) + 1;
}

export function daysOverlap(a0: string, a1: string, b0: string, b1: string): number {
  const start = Math.max(parseISODate(a0), parseISODate(b0));
  const end = Math.min(parseISODate(a1), parseISODate(b1));
  if (end < start) return 0;
  return Math.round((end - start) / 86_400_000) + 1;
}

export function formatRange(start: string, end: string): string {
  const a = new Date(parseISODate(start));
  const b = new Date(parseISODate(end));
  const left = MONTHS[a.getUTCMonth()] ?? "";
  const right = MONTHS[b.getUTCMonth()] ?? "";
  if (a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth()) {
    return `${left} ${a.getUTCDate()}–${b.getUTCDate()}`;
  }
  if (a.getUTCFullYear() === b.getUTCFullYear()) {
    return `${left} ${a.getUTCDate()} – ${right} ${b.getUTCDate()}`;
  }
  return `${left} ${a.getUTCDate()}, ${a.getUTCFullYear()} – ${right} ${b.getUTCDate()}, ${b.getUTCFullYear()}`;
}

export function formatMoney(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

export function ratingBand(score: number): "great" | "good" | "ok" | "low" {
  if (score >= 4.5) return "great";
  if (score >= 4) return "good";
  if (score >= 3.4) return "ok";
  return "low";
}

export function passesFilters(place: Place, count: number, filters: Filters): boolean {
  if (count <= 0) return false;
  if (count < filters.minYalies) return false;
  if (place.scores.overall + 1e-6 < filters.overall) return false;
  if (place.scores.affordability + 1e-6 < filters.affordability) return false;
  if (place.scores.safety + 1e-6 < filters.safety) return false;
  if (place.scores.beauty + 1e-6 < filters.beauty) return false;
  if (filters.scope === "countries" && place.kind !== "country") return false;
  if (filters.scope === "us" && place.iso !== "US") return false;
  const query = filters.query.trim().toLowerCase();
  if (!query) return true;
  const haystack = [place.name, place.region, place.blurb, place.guide, place.atlas ?? "", ...place.tags, ...place.aliases]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function filtersAreDefault(filters: Filters): boolean {
  return (
    filters.overall <= 1 &&
    filters.affordability <= 1 &&
    filters.safety <= 1 &&
    filters.beauty <= 1 &&
    filters.minYalies <= 0 &&
    filters.scope === "all"
  );
}

export type Overlap = { count: number; label: string; matched: boolean };

export function anonymousOverlap(place: Place, season: Season, trip?: Trip): Overlap {
  const cohorts = place.cohorts.filter((cohort) => cohort.season === season);
  if (cohorts.length === 0) return { count: 0, label: "No week logged", matched: false };
  const peak = cohorts.reduce((best, cohort) => (cohort.count > best.count ? cohort : best));
  if (!trip || trip.placeId !== place.id || trip.season !== season) {
    return { count: peak.count, label: formatRange(peak.start, peak.end), matched: false };
  }
  let count = 0;
  let label = "";
  let best = -1;
  for (const cohort of cohorts) {
    const span = daysInclusive(cohort.start, cohort.end);
    const overlap = daysOverlap(trip.start, trip.end, cohort.start, cohort.end);
    if (overlap <= 0 || span <= 0) continue;
    count += Math.max(1, Math.round(cohort.count * (overlap / span)));
    if (cohort.count > best) {
      best = cohort.count;
      label = formatRange(cohort.start, cohort.end);
    }
  }
  if (count === 0) return { count: 0, label: "No overlap with logged weeks", matched: true };
  return { count, label, matched: true };
}

export type FriendHit = { person: Person; trip: PersonTrip; overlapsYou: boolean };

export function friendsAtPlace(placeId: string, season: Season, friends: Person[], trip?: Trip): FriendHit[] {
  const hits: FriendHit[] = [];
  for (const person of friends) {
    for (const friendTrip of person.trips) {
      if (friendTrip.placeId !== placeId || friendTrip.season !== season) continue;
      const overlapsYou = Boolean(
        trip && trip.season === season && daysOverlap(trip.start, trip.end, friendTrip.start, friendTrip.end) > 0,
      );
      hits.push({ person, trip: friendTrip, overlapsYou });
    }
  }
  return hits;
}

export function heatColor(count: number, max: number, dark: boolean): number {
  const capped = Math.max(40, Math.min(180, max));
  const t = Math.sqrt(Math.min(1, count / capped));
  const low = dark ? 0x1a3f73 : 0xd5e5fb;
  const high = dark ? 0xc5ddff : 0x0b3d91;
  return mix(low, high, t);
}

function mix(a: number, b: number, t: number): number {
  const channel = (shift: number) => {
    const from = (a >> shift) & 255;
    const to = (b >> shift) & 255;
    return Math.round(from + (to - from) * t);
  };
  return (channel(16) << 16) + (channel(8) << 8) + channel(0);
}

export function sortScore(scores: Scores, sort: "overall" | "affordability" | "safety" | "beauty"): number {
  return scores[sort];
}
