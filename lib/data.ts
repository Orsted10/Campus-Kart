export type ServiceId = "food" | "rides" | "essentials";

export const SERVICE_META: Record<
  ServiceId,
  { label: string; accent: string; ink: string; line: string; blurb: string }
> = {
  food: {
    label: "Food",
    accent: "var(--food)",
    ink: "var(--food-ink)",
    line: "Terracotta route",
    blurb: "Top outside restaurants & eateries, delivered straight to your block.",
  },
  rides: {
    label: "Rides",
    accent: "var(--rides)",
    ink: "var(--rides-ink)",
    line: "Blue road",
    blurb: "Outside cabs, autos & rides from the gate directly to your destination.",
  },
  essentials: {
    label: "Essentials",
    accent: "var(--essentials)",
    ink: "var(--essentials-ink)",
    line: "Olive supply path",
    blurb: "The thing you forgot, before you need it.",
  },
};

export type Campus = {
  id: string;
  name: string;
  city: string;
  zones: [string, string, string, string];
  note: string;
};

export const CAMPUSES: Campus[] = [
  {
    id: "chandigarh-unnao",
    name: "Chandigarh University",
    city: "Unnao, UP",
    zones: ["Hostels 1 & 2", "University Block F & E", "Food & Resto Hub", "Outside Gate"],
    note: "Chandigarh University, Unnao (Uttar Pradesh) Campus · Official Blueprint",
  },
];

/* ------------------------------------------------------------ hero nodes */

export type NodeKind = "food" | "rides" | "essentials" | "campus";

export type PulseNode = {
  id: string;
  label: string;
  sub: string;
  kind: NodeKind;
  x: number;
  y: number;
};

export const PULSE_NODES: PulseNode[] = [
  { id: "n3", label: "Outside Gate", sub: "Cab & Auto Pickup Stand", kind: "rides", x: 400, y: 105 },
  { id: "n8", label: "Spine Junction", sub: "Ride & Cab Route", kind: "rides", x: 400, y: 175 },
  { id: "n5", label: "Block F", sub: "University Academic Wing", kind: "campus", x: 572, y: 175 },
  { id: "n6", label: "Block E Food", sub: "Outside Food Hub", kind: "food", x: 436, y: 285 },
  { id: "n7", label: "Block E Lab", sub: "Science & Innovation", kind: "campus", x: 400, y: 285 },
  { id: "n2", label: "Hostel 1 Gate", sub: "Residential Zone 01", kind: "campus", x: 320, y: 375 },
  { id: "n4", label: "Hostel 2 Store", sub: "Essentials & Stationery", kind: "essentials", x: 480, y: 375 },
  { id: "n1", label: "Central Mart", sub: "Campus Supply Store", kind: "essentials", x: 400, y: 375 },
];

/* --------------------------------------------------------------- chaos */

export type Moment = {
  time: string;
  line: string;
  service: ServiceId | "none";
  scene: string;
  x: number;
  y: number;
  rot: number;
};

export const MOMENTS: Moment[] = [
  {
    time: "08:12",
    line: "Early trip.",
    service: "rides",
    scene: "Heading off-campus. Need a cab waiting at Outside Gate for an early train.",
    x: 4,
    y: 0,
    rot: -1.5,
  },
  {
    time: "13:18",
    line: "Need lunch.",
    service: "food",
    scene: "Craving food from outside. Order delivered right to your campus block.",
    x: 68,
    y: 0,
    rot: 1.5,
  },
  {
    time: "17:47",
    line: "Outside ride.",
    service: "rides",
    scene: "Heading out for town or market. Need an auto waiting at Outside Gate.",
    x: 36,
    y: 26,
    rot: -1,
  },
  {
    time: "21:09",
    line: "Forgot stationery.",
    service: "essentials",
    scene: "Submission tomorrow. The shop downstairs closed at eight.",
    x: 68,
    y: 52,
    rot: 1.5,
  },
  {
    time: "23:14",
    line: "Need something. Urgently.",
    service: "essentials",
    scene: "A fever, an empty shelf, and no open counter on campus.",
    x: 4,
    y: 52,
    rot: -1.5,
  },
];

export const FRAGMENTS = [
  { id: "f1", label: "Food", color: "var(--food)", x: 12, y: 26, w: 200, rot: -8 },
  { id: "f2", label: "Taxi", color: "var(--rides)", x: 66, y: 16, w: 170, rot: 6 },
  { id: "f3", label: "Store", color: "var(--essentials)", x: 40, y: 62, w: 150, rot: -3 },
  { id: "f4", label: "Stationery", color: "var(--muted)", x: 78, y: 68, w: 190, rot: 4 },
  { id: "f5", label: "Hostel", color: "var(--muted)", x: 8, y: 76, w: 160, rot: -6 },
  { id: "f6", label: "Campus gate", color: "var(--muted)", x: 52, y: 32, w: 210, rot: 2 },
];

/* ------------------------------------------------------------- scenarios */

export const SCENARIOS = [
  {
    time: "8:10 AM",
    title: "Heading off campus.",
    service: "rides" as ServiceId,
    action: "Outside Cab.",
    detail: "Book an outside cab to be ready at Outside Gate when you arrive at the exit.",
  },
  {
    time: "1:30 PM",
    title: "Hungry between lectures.",
    service: "food" as ServiceId,
    action: "Food.",
    detail: "Outside restaurant food, ordered from your phone, delivered to your block.",
  },
  {
    time: "7:15 PM",
    title: "Need supplies.",
    service: "essentials" as ServiceId,
    action: "Essentials.",
    detail: "Printing sheets, a charger, a notebook — from the store that's still open.",
  },
  {
    time: "11:20 PM",
    title: "Something came up.",
    service: "food" as ServiceId,
    action: "Campus ecosystem.",
    detail: "Night warden, pharmacy, a ride to the gate. The campus is still awake.",
  },
];

/* ------------------------------------------------------------- essentials */

export const SHELF = [
  { id: "charger", name: "USB-C Charger", price: "₹499", note: "20W · hostel wall socket friendly", aisle: "A1" },
  { id: "notebook", name: "Ruled Notebook", price: "₹120", note: "200 pages · lies flat", aisle: "A2" },
  { id: "pen", name: "Gel Pens ×3", price: "₹90", note: "0.5mm · exam approved", aisle: "A2" },
  { id: "toiletries", name: "Toiletry Kit", price: "₹340", note: "Travel size · washroom ready", aisle: "B1" },
  { id: "snacks", name: "Midnight Snacks", price: "₹180", note: "Study fuel · 4:00 AM capable", aisle: "B2" },
  { id: "print", name: "Print Supplies", price: "₹60", note: "A4 ream · submission week", aisle: "C1" },
  { id: "study", name: "Study Kit", price: "₹250", note: "Highlighters, sticky notes, ruler", aisle: "C2" },
];

export const DISHES = [
  { id: "biryani", name: "Veg Dum Biryani", vendor: "Annapoorna", price: "₹140", mins: 14 },
  { id: "pohe", name: "Kanda Poha", vendor: "Chai Point", price: "₹70", mins: 8 },
  { id: "roll", name: "Paneer Roll", vendor: "Roll House", price: "₹110", mins: 11 },
];

export const RIDE_POINTS = ["Outside Gate", "Unnao Railway Station", "City Market", "Lucknow Airport", "Mall Road"];

export const SEARCH_SUGGESTIONS = [
  { text: "Food near hostel", target: "ecosystem", service: "food" as ServiceId },
  { text: "Cab to the gate", target: "ecosystem", service: "rides" as ServiceId },
  { text: "Need a charger", target: "ecosystem", service: "essentials" as ServiceId },
  { text: "How ordering works", target: "how", service: "food" as ServiceId },
  { text: "Bring CampusKart to my campus", target: "partner", service: "rides" as ServiceId },
];

export const NAV_LINKS = [
  { label: "Explore", href: "#top" },
  { label: "Food", href: "#ecosystem", service: "food" as ServiceId },
  { label: "Rides", href: "#ecosystem", service: "rides" as ServiceId },
  { label: "Essentials", href: "#ecosystem", service: "essentials" as ServiceId },
  { label: "How it Works", href: "#how" },
  { label: "For Partners", href: "#partner" },
  { label: "About", href: "#people" },
];

export const FOOTER_GROUPS = [
  {
    title: "Explore",
    links: ["Food", "Rides", "Essentials", "Campus map", "How it works"],
    hrefs: ["#ecosystem", "#ecosystem", "#ecosystem", "#map", "#how"],
  },
  {
    title: "Company",
    links: ["About", "Partners", "Contact", "Careers", "Press"],
    hrefs: ["#people", "#partner", "#partner", "#partner", "#partner"],
  },
  {
    title: "Support",
    links: ["Help centre", "Order issue", "Ride issue", "Payment issue", "Safety"],
    hrefs: ["#support", "#support", "#support", "#support", "#legal:safety"],
  },
];

export const LEGAL_DOCS: Record<string, { title: string; body: string[] }> = {
  privacy: {
    title: "Privacy Policy",
    body: [
      "Placeholder copy — to be replaced by CampusKart's reviewed legal text before launch.",
      "We collect only what a campus service needs to work: the campus you choose, the orders and rides you request, and the minimum device information required to keep the session secure.",
      "Location data is used while a request is active and is not sold to third parties. Campus partners receive the information required to fulfil your request and nothing more.",
      "You can request a copy of your data, or ask us to delete your account, from the support drawer.",
    ],
  },
  terms: {
    title: "Terms of Service",
    body: [
      "Placeholder copy — to be replaced by CampusKart's reviewed legal text before launch.",
      "CampusKart is a campus-first service. Availability depends on your institution, its operating hours, and the partners registered with it.",
      "Demonstrations on this website are illustrative. Product behaviour in the live application is governed by the terms accepted at signup.",
      "By using the service you agree to behave with respect toward riders, vendors, and campus staff.",
    ],
  },
  cookies: {
    title: "Cookie Policy",
    body: [
      "Placeholder copy — to be replaced by CampusKart's reviewed legal text before launch.",
      "We store one preference token so the site remembers your light or dark theme and your selected campus.",
      "Analytics cookies, if enabled at launch, will be opt-in and documented here.",
    ],
  },
  safety: {
    title: "Safety",
    body: [
      "Placeholder copy — to be replaced by CampusKart's reviewed legal text before launch.",
      "Rides are limited to verified campus zones. Night trips are shared with your campus security contact.",
      "Riders and vendors are verified against institutional records before they appear on the network.",
      "Every request can be escalated to human support from the support drawer.",
    ],
  },
  refunds: {
    title: "Refunds & Cancellations",
    body: [
      "Placeholder copy — to be replaced by CampusKart's reviewed legal text before launch.",
      "Cancelled before preparation begins: full refund to the original payment method.",
      "Late or incorrect fulfilment: raise a request within 24 hours from the support drawer and a human reviews it.",
    ],
  },
};
