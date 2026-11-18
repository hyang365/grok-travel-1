# Demo Video

https://github.com/user-attachments/assets/dbe7f935-b0db-4791-8db4-5b6a8971673f

# Run

https://hyang365.github.io/grok1/

# TripTable

**Yale travel, the way CourseTable treats classes.** See where Yalies go, plan with friends, and find the best way to get there from campus.

## Features

- **Map:** where Yalies travel each break, anonymized. Click a place for ratings, stays and reviews.
- **Catalog and filters:** sort and filter by affordability, safety, beauty, continent and type of trip.
- **Friends:** add by NetID to see their plans and overlapping dates. Everyone else is just a count.
- **Yale travel rules:** flags countries Yale won't sponsor (State Dept Level 4) and blocks flights there.
- **Flights:** plan the trip from Old Campus, then search and book on Google Flights. There's no in-app flight data.
  - Every airport (Tweed, Bradley, JFK, LGA, Newark, Logan) with the ride from campus, split Uber cost, and when to leave, plus a one-click Google Flights search for that route and your dates.
  - Trains and buses for nearby trips, with transit directions from Old Campus.
  - **Lock the group flight:** enter the flight numbers someone picked on Google Flights. They're saved on the trip with a copyable group-chat message, an exact-flight search link, flight status, and a "who's booked" checklist.
  - **Boycott Avelo** with one switch (hides Tweed, and reminds you to untick Avelo on Google Flights).
- **Itinerary:** your trips, flights and friends in one place.
- **Study Abroad:** Yale Summer Session Abroad, Yale in London and approved programs, each with the grants you can apply for (Summer Experience Grant, Light, Gilman, Boren and more) and student reviews. The map has a **Travel / Study abroad** switch.
- **Real reviews:** places and programs are rated only by real student reviews. There are no seeded reviews. Posting requires an @yale.edu email.

## Turning on shared reviews (one-time, ~10 minutes)

Until this is done, reviews are saved only in each visitor's browser.

1. Create a free project at [supabase.com](https://supabase.com).
2. In the project's SQL editor, run `supabase/schema.sql`.
3. Authentication → URL Configuration: set Site URL to `https://hyang365.github.io/grok1/` and add it under Redirect URLs.
4. Project Settings → API: copy the Project URL and the `anon` public key.
5. In this repo: Settings → Secrets and variables → Actions → **Variables**: add `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
6. Re-run the "Publish GitHub Pages" workflow. For the branch-served fallback, also run
   `VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... npm run publish:fallback` and commit `published/` and `assets/`.

Reported reviews land in the `review_reports` table for you to moderate in the Supabase dashboard.

## Still sample data

- Yalie counts, cohorts and history on the map and catalog (labeled "sample counts").
- The friends directory and their trips (the NetIDs in Friends are fictional).
- Ground-transport times and costs in `src/flights/engine.ts` are rough planning estimates.
- The group flight and booked checklist are saved on your device. Friends see them via the copied message until accounts are shared.
- Stays: hotel names and rough prices, with no ratings.

# Grok Proof

<img width="2298" height="1862" alt="Screenshot 2026-11-17 at 6 12 31 PM" src="https://github.com/user-attachments/assets/4e63dda2-74c5-42bc-bff3-20586f07d9cc" />
