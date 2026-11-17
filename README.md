# TripTable

Yale travel, the way CourseTable treats classes. The home page is a Mercator map of de-identified student trips. Open a country for ratings, stays, and how many Yalies overlap your dates. Inside the United States, the pins are the specific places: cities, and the smaller Atlas-style spots.

Friend itineraries are opt-in. Everyone else is a count.

## Run

```bash
npm install
npm run dev
```

Then open http://127.0.0.1:5173.

## Demo path

The signed-in student already has Spring Break in Puerto Rico, March 7–15, with Jordan Alvarez and Chris Park.

1. The map opens on Spring Break. Darker countries are where more Yalies are going. The scale saturates at 180 so one country does not wash out the rest.
2. Use the link in the left rail, or click Puerto Rico. Spring Break 2025 shows 214 students. Your dates overlap the busiest logged week.
3. Drag Affordability or Beauty. Switzerland and the Amalfi Coast fall off when money matters. The Wave, Big Sur, and Acadia stay when you ask for beauty.
4. Choose U.S. to open the domestic layer. Marfa, the Wave, Salvation Mountain, and Big Sur are the micro pins.
5. Friends. Add Maya Chen (`mchen`) and plan Kyoto together.
6. Itinerary is the worksheet: your trips, the anonymized overlap, and the friends on them.

`/` focuses search. Escape closes the place panel. Reset demo data is on the itinerary page.

Public comments keep a residential college and class year, and drop names. 2026 counts are plans already logged. Earlier years are completed trips.

Map tiles and country shapes are © amCharts. The logo on the map stays in place under their free license.
