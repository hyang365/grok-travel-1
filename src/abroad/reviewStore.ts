import { useSyncExternalStore } from "react";

export type ProgramReview = {
  id: string;
  programId: string;
  netid: string;
  author: string;
  term: string;
  year: number;
  overall: number;
  academics: number;
  housing: number;
  value: number;
  text: string;
  createdAt: string;
};

// Reviews live in this browser until the site has a shared backend.
const KEY = "triptable-abroad-reviews-v1";

function load(): ProgramReview[] {
  try {
    const raw = localStorage.getItem(KEY);
    const data = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(data) ? (data as ProgramReview[]).filter((r) => r && typeof r.programId === "string") : [];
  } catch {
    return [];
  }
}

let reviews = load();
const listeners = new Set<() => void>();

function save(next: ProgramReview[]) {
  reviews = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(reviews));
  } catch {
    /* storage blocked */
  }
  listeners.forEach((fn) => fn());
}

export const reviewStore = {
  add(review: ProgramReview) {
    save([review, ...reviews.filter((r) => !(r.programId === review.programId && r.netid === review.netid))]);
  },
  remove(id: string) {
    save(reviews.filter((r) => r.id !== id));
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  get: () => reviews,
};

export function useReviews(): ProgramReview[] {
  return useSyncExternalStore(reviewStore.subscribe, reviewStore.get, reviewStore.get);
}

export function average(list: ProgramReview[], key: "overall" | "academics" | "housing" | "value"): number | null {
  if (!list.length) return null;
  return list.reduce((sum, r) => sum + r[key], 0) / list.length;
}
