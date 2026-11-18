// Yale study abroad programs and the grants that can pay for them.
// Program list: Yale Study Abroad, tentative Summer 2027 YSS Programs Abroad roster
// (studyabroad.yale.edu/node/1241), checked Nov 2026. 2027 budgets post in Nov 2026.
// Grants: funding.yale.edu, light.yale.edu, studyabroad.yale.edu, gilmanscholarship.org, borenawards.org.

export type ProgramKind = "yss" | "london" | "nonyale-summer" | "term";

export type Program = {
  id: string;
  name: string;
  city: string;
  country: string;
  iso: string;
  region: "Europe" | "Latin America" | "Africa & Middle East" | "East Asia" | "Southeast Asia";
  kind: ProgramKind;
  terms: string[];
  subject: string;
  language?: string;
  url: string;
  note?: string;
};

const YSS = "https://studyabroad.yale.edu/programs/";

function yss(
  slug: string,
  name: string,
  city: string,
  country: string,
  iso: string,
  region: Program["region"],
  subject: string,
  language?: string,
  note?: string,
): Program {
  return { id: slug, name, city, country, iso, region, kind: "yss", terms: ["Summer"], subject, language, url: YSS + slug, note };
}

export const PROGRAMS: Program[] = [
  yss("yale-summer-session-rio-de-janeiro-immersive", "YSS in Rio de Janeiro: Immersive Portuguese I & II + Culture", "Rio de Janeiro", "Brazil", "BR", "Latin America", "Portuguese language and culture", "Portuguese"),
  yss("yale-summer-session-dubrovnik-history-culture", "YSS in Dubrovnik: History & Culture of Southeastern Europe", "Dubrovnik", "Croatia", "HR", "Europe", "History and culture"),
  yss("yale-summer-session-quito-advanced-spanish", "YSS in Quito: Advanced Spanish Language and Andean Culture", "Quito", "Ecuador", "EC", "Latin America", "Spanish language and Andean culture", "Spanish"),
  yss("yale-summer-session-paris-intermediate-advanced", "YSS in Paris: Intermediate and Advanced French I & II", "Paris", "France", "FR", "Europe", "French language", "French"),
  yss("yale-summer-session-auvillar-personal", "YSS in Auvillar: Personal Geography", "Auvillar", "France", "FR", "Europe", "Creative nonfiction and place"),
  yss("yale-summer-session-batumi-russian-georgia", "YSS in Batumi: First-Year Russian I & II + Culture", "Batumi", "Georgia", "GE", "Europe", "Russian language and culture", "Russian"),
  yss("yale-summer-session-batumi-russian-georgia-0", "YSS in Batumi: Second-Year Russian I & II + Culture", "Batumi", "Georgia", "GE", "Europe", "Russian language and culture", "Russian"),
  yss("yale-summer-session-batumi-russian-georgia-1", "YSS in Batumi: Third-Year Russian I & II + Culture", "Batumi", "Georgia", "GE", "Europe", "Russian language and culture", "Russian"),
  yss("yale-summer-session-batumi-russian-georgia-2", "YSS in Batumi: Advanced Russian I + Culture", "Batumi", "Georgia", "GE", "Europe", "Russian language and culture", "Russian"),
  yss("yale-summer-session-new-haven-berlin", "YSS in Berlin: Intermediate German I & II", "Berlin", "Germany", "DE", "Europe", "German language", "German"),
  yss("yale-summer-session-italy-painting-basics", "YSS in Florence: Painting Basics", "Florence", "Italy", "IT", "Europe", "Studio art"),
  yss("yale-summer-session-siena-elementary-italian-i", "YSS in Siena: Elementary Italian I & II + Culture", "Siena", "Italy", "IT", "Europe", "Italian language and culture", "Italian"),
  yss("yale-summer-session-siena-intermediate-italian", "YSS in Siena: Intermediate Italian I & II + Culture", "Siena", "Italy", "IT", "Europe", "Italian language and culture", "Italian"),
  yss("yale-summer-session-ifrane-rabat-society", "YSS in Ifrane & Rabat: Society and Politics of North Africa", "Ifrane and Rabat", "Morocco", "MA", "Africa & Middle East", "Society and politics", undefined, "Runs in odd years only."),
  yss("yale-summer-session-lima-advanced-spanish", "YSS in Lima: Advanced Spanish and Culture of Peru through Art", "Lima", "Peru", "PE", "Latin America", "Spanish language and art", "Spanish"),
  yss("yale-summer-session-barcelona-catalonia-modern", "YSS in Barcelona: Advanced Spanish", "Barcelona", "Spain", "ES", "Europe", "Spanish language", "Spanish"),
  yss("yale-summer-session-new-haven-bilbao", "YSS in Bilbao: Intermediate Spanish I & II + Culture", "Bilbao", "Spain", "ES", "Europe", "Spanish language and culture", "Spanish"),
  yss("yale-summer-session-valencia-language-culture", "YSS in Valencia: Language, Culture, and Society of Spain", "Valencia", "Spain", "ES", "Europe", "Spanish language and society", "Spanish"),
  yss("yale-summer-session-sweden-writing-stockholm", "YSS in Stockholm: Young Adult Writing", "Stockholm", "Sweden", "SE", "Europe", "Creative writing"),
  yss("yale-summer-session-london-challenges-democracy", "YSS in London: Challenges to Democracy in Central Europe", "London", "United Kingdom", "GB", "Europe", "Politics"),
  {
    id: "darwins-london",
    name: "Evolutionary Biology in Darwin's London",
    city: "London",
    country: "United Kingdom",
    iso: "GB",
    region: "Europe",
    kind: "yss",
    terms: ["Summer"],
    subject: "Evolutionary biology",
    url: "https://studyabroad.yale.edu/node/1241",
    note: "Pending approval by the Yale Course of Study Committee.",
  },
  {
    id: "yale-in-london",
    name: "Yale in London (Paul Mellon Centre)",
    city: "London",
    country: "United Kingdom",
    iso: "GB",
    region: "Europe",
    kind: "london",
    terms: ["Spring", "Summer"],
    subject: "British art, literature, theatre and politics",
    url: "https://studyabroad.yale.edu/programs/yale-london",
    note: "Four courses in spring, two in summer. Courses count as Yale credit, so it works even if you've used up transfer credit.",
  },
  {
    id: "smu-global-summer",
    name: "Singapore Management University Global Summer Program",
    city: "Singapore",
    country: "Singapore",
    iso: "SG",
    region: "Southeast Asia",
    kind: "nonyale-summer",
    terms: ["Summer"],
    subject: "Business, economics and Asian studies",
    url: "https://studyabroad.yale.edu/node/1400",
    note: "Apply directly or through CIEE. Up to two transfer credits per summer.",
  },
  {
    id: "ciee-taipei",
    name: "CIEE in Taipei: Semester in Taipei",
    city: "Taipei",
    country: "Taiwan",
    iso: "TW",
    region: "East Asia",
    kind: "term",
    terms: ["Fall", "Spring", "Academic Year"],
    subject: "Mandarin and East Asian studies",
    language: "Chinese",
    url: "https://studyabroad.yale.edu/node/1397",
  },
  {
    id: "cet-taiwan",
    name: "CET Taiwan",
    city: "Taipei",
    country: "Taiwan",
    iso: "TW",
    region: "East Asia",
    kind: "term",
    terms: ["Fall", "Spring", "Summer"],
    subject: "Intensive Mandarin",
    language: "Chinese",
    url: "https://studyabroad.yale.edu/node/1458",
  },
];

export const KIND_LABEL: Record<ProgramKind, string> = {
  yss: "Yale Summer Session Abroad",
  london: "Yale in London",
  "nonyale-summer": "Non-Yale summer",
  term: "Semester or year",
};

export type Grant = {
  id: string;
  name: string;
  amount: string;
  who: string;
  deadline: string;
  url: string;
  caveat?: string;
};

export const GRANTS: Record<string, Grant> = {
  seg: {
    id: "seg",
    name: "Summer Experience Grant (SEG)",
    amount: "Program budget × your financial aid %",
    who: "Yale College first-years, sophomores and juniors on Yale aid who haven't used the ISA or SEA. One-time and non-competitive.",
    deadline: "Starts Summer 2027. Application details from Yale Fellowships & Funding.",
    url: "https://funding.yale.edu/summer-experience-grant-seg",
    caveat: "Replaces the International Study Award, which ended after Summer 2026. Covers only YSS Abroad and Yale in London.",
  },
  mellon: {
    id: "mellon",
    name: "Mellon Bursary",
    amount: "$2,500",
    who: "Yale in London students on financial aid. Automatic.",
    deadline: "No separate application",
    url: "https://studyabroad.yale.edu/programs/yale-london",
  },
  light: {
    id: "light",
    name: "Richard U. Light Fellowship",
    amount: "Full funding: tuition, room and board, travel, incidentals",
    who: "Any Yale student studying Chinese, Japanese or Korean at a Light-approved program. Yale College students need one year of the language for a letter grade first.",
    deadline: "Early fall competition (spring term); late fall competition (summer, fall, full year)",
    url: "https://light.yale.edu/about/light-fellowship",
    caveat: "Only Light-approved programs qualify. Check the approved list before you apply.",
  },
  oleary: {
    id: "oleary",
    name: "O'Leary Cepeda Summer Fellowship",
    amount: "Up to $2,000",
    who: "First-years, sophomores and juniors doing language study in Latin America.",
    deadline: "Usually March, via the Student Grants Database",
    url: "https://studentgrants.yale.edu",
  },
  class2004: {
    id: "class2004",
    name: "Yale College Class of 2004 Fellowship",
    amount: "Up to $2,000",
    who: "First-years, sophomores and juniors studying in a Spanish-speaking country.",
    deadline: "Usually March, via the Student Grants Database",
    url: "https://studentgrants.yale.edu",
  },
  finaid: {
    id: "finaid",
    name: "Yale financial aid (term-time)",
    amount: "Your regular aid package",
    who: "Students approved for a Year or Term Abroad.",
    deadline: "Apply to Yale Study Abroad by Oct 1 (spring) or Apr 1 (fall / full year)",
    url: "https://studyabroad.yale.edu/year-or-term",
  },
  gilman: {
    id: "gilman",
    name: "Benjamin A. Gilman International Scholarship",
    amount: "Up to $5,000",
    who: "U.S. citizens receiving a Federal Pell Grant on a credit-bearing program.",
    deadline: "Spring 2027 cycle closes late Feb – early Mar 2027 (check the Gilman site)",
    url: "https://www.gilmanscholarship.org/applicants/deadlines-and-timeline/",
  },
  boren: {
    id: "boren",
    name: "Boren Scholarship",
    amount: "Up to $25,000",
    who: "U.S. undergrads studying a language in regions critical to U.S. interests. Carries a year of federal service.",
    deadline: "National deadline late January 2027",
    url: "https://www.borenawards.org/",
    caveat: "Western Europe isn't eligible. Summer-only programs are limited to STEM majors.",
  },
};

const WESTERN_EUROPE = new Set(["FR", "DE", "IT", "ES", "SE", "GB"]);
const SPANISH = new Set(["EC", "PE", "ES"]);
const EAST_ASIA = new Set(["CN", "JP", "KR", "TW"]);

export function grantsFor(program: Program): Grant[] {
  const ids: string[] = [];
  if (program.kind === "yss" || program.kind === "london") ids.push("seg");
  if (program.kind === "london") ids.push("mellon");
  if (EAST_ASIA.has(program.iso)) ids.push("light");
  if (program.region === "Latin America" && program.language) ids.push("oleary");
  if (SPANISH.has(program.iso)) ids.push("class2004");
  if (program.kind === "term" || program.terms.includes("Spring")) ids.push("finaid");
  ids.push("gilman");
  if (!WESTERN_EUROPE.has(program.iso) && program.language) ids.push("boren");
  return ids.map((id) => GRANTS[id]);
}

export const REGIONS: Program["region"][] = ["Europe", "Latin America", "Africa & Middle East", "East Asia", "Southeast Asia"];

const CITY_COORDS: Record<string, [number, number]> = {
  "Rio de Janeiro": [-22.91, -43.17],
  Dubrovnik: [42.65, 18.09],
  Quito: [-0.18, -78.47],
  Paris: [48.86, 2.35],
  Auvillar: [44.07, 0.9],
  Batumi: [41.64, 41.64],
  Berlin: [52.52, 13.4],
  Florence: [43.77, 11.26],
  Siena: [43.32, 11.33],
  "Ifrane and Rabat": [34.02, -6.84],
  Lima: [-12.05, -77.04],
  Barcelona: [41.39, 2.17],
  Bilbao: [43.26, -2.93],
  Valencia: [39.47, -0.38],
  Stockholm: [59.33, 18.07],
  London: [51.51, -0.13],
  Singapore: [1.35, 103.82],
  Taipei: [25.03, 121.56],
};

export function coordsOf(program: Program): [number, number] | null {
  return CITY_COORDS[program.city] ?? null;
}

export type AbroadCity = { key: string; city: string; iso: string; lat: number; lng: number; programs: Program[] };

export const ABROAD_CITIES: AbroadCity[] = (() => {
  const map = new Map<string, AbroadCity>();
  for (const p of PROGRAMS) {
    const c = coordsOf(p);
    if (!c) continue;
    const key = `${p.iso}-${p.city}`;
    const entry = map.get(key) ?? { key, city: p.city, iso: p.iso, lat: c[0], lng: c[1], programs: [] };
    entry.programs.push(p);
    map.set(key, entry);
  }
  return [...map.values()];
})();

export function programsIn(iso: string): Program[] {
  return PROGRAMS.filter((p) => p.iso === iso);
}

export const MAX_PROGRAMS_PER_COUNTRY = Math.max(1, ...[...new Set(PROGRAMS.map((p) => p.iso))].map((iso) => programsIn(iso).length));
