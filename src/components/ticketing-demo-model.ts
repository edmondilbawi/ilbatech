export const EVENT_CATEGORIES = [
  "Concerts",
  "Nightlife",
  "Sports",
  "Festivals",
  "Family",
  "Comedy",
  "Theatre",
  "Experiences",
  "Conferences",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];
export type EventStatus = "Draft" | "On Sale" | "Sold Out" | "Completed" | "Cancelled";
export type TicketStatus = "Valid" | "Transferred" | "Used" | "Cancelled";
export type DateFilter = "Any date" | "Today" | "Tomorrow" | "This Weekend" | "This Week" | "This Month";
export type AvailabilityFilter = "Any availability" | "Available" | "Limited" | "Sold Out";

export type Session = {
  id: string;
  label: string;
  date: string;
  time: string;
};

export type TicketType = {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  sold: number;
  maxPerOrder: number;
  salesStart: string;
  salesEnd: string;
};

export type Seat = {
  id: string;
  row: string;
  number: number;
  section: "Front" | "Middle" | "Rear";
  price: number;
  sold: boolean;
  accessible: boolean;
};

export type TicketingEvent = {
  id: string;
  title: string;
  category: EventCategory;
  description: string;
  image: string;
  imageAlt: string;
  venue: string;
  city: string;
  organizer: string;
  ageRestriction: string;
  policies: string[];
  status: EventStatus;
  badge?: "Selling Fast" | "Almost Sold Out" | "New" | "Limited Availability";
  featured: boolean;
  newEvent: boolean;
  popular: boolean;
  dateBuckets: DateFilter[];
  sessions: Session[];
  ticketTypes: TicketType[];
  reservedSeating: boolean;
  seats: Seat[];
  created?: boolean;
};

export type Attendee = {
  firstName: string;
  lastName: string;
  email: string;
};

export type DraftLine = {
  key: string;
  ticketTypeId: string;
  quantity: number;
  seatId?: string;
  attendee?: Attendee;
  giftRecipient?: Attendee;
};

export type PurchaseDraft = {
  eventId: string;
  sessionId: string;
  lines: DraftLine[];
  promoCode: string;
  customerMode: "Guest" | "Account";
  purchaser: Attendee & { phone: string };
};

export type Ticket = {
  id: string;
  orderId: string;
  eventId: string;
  sessionId: string;
  ticketTypeId: string;
  attendee: Attendee;
  seatId?: string;
  qrPayload: string;
  status: TicketStatus;
  checkedInAt?: string;
  ownerName?: string;
  ownerEmail?: string;
  gift: boolean;
};

export type Order = {
  id: string;
  eventId: string;
  sessionId: string;
  ticketIds: string[];
  purchasedAt: string;
  purchaser: Attendee & { phone: string };
  paymentMethod: "Card" | "Digital Wallet";
  paymentStatus: "Paid";
  subtotal: number;
  discount: number;
  serviceFee: number;
  tax: number;
  total: number;
  promoCode: string;
};

export type Transfer = {
  id: string;
  ticketId: string;
  recipientName: string;
  recipientEmail: string;
  transferredAt: string;
};

export type CheckIn = {
  id: string;
  ticketId: string;
  checkedInAt: string;
  gate: string;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

export type WaitlistEntry = {
  id: string;
  eventId: string;
  name: string;
  email: string;
};

export type TicketingState = {
  version: number;
  events: TicketingEvent[];
  favorites: string[];
  recentSearches: string[];
  draft: PurchaseDraft | null;
  orders: Order[];
  tickets: Ticket[];
  transfers: Transfer[];
  checkIns: CheckIn[];
  notifications: Notification[];
  waitlist: WaitlistEntry[];
  nextOrderNumber: number;
  nextCreatedEventNumber: number;
};

export type EventFilters = {
  category: "All" | EventCategory;
  date: DateFilter;
  city: "All" | string;
  maxPrice: number;
  availability: AvailabilityFilter;
};

export type Totals = {
  subtotal: number;
  discount: number;
  serviceFee: number;
  tax: number;
  total: number;
};

export type PurchaseInput = {
  draft: PurchaseDraft;
  paymentMethod: "Card" | "Digital Wallet";
  cardNumber?: string;
};

export type PurchaseResult =
  | { ok: true; state: TicketingState; order: Order; tickets: Ticket[] }
  | { ok: false; state: TicketingState; code: "INVALID_PAYMENT" | "DECLINED" | "UNAVAILABLE"; message: string };

export type ValidationResult =
  | { code: "VALID"; ticket: Ticket }
  | { code: "ALREADY_USED"; ticket: Ticket }
  | { code: "TICKET_CANCELLED"; ticket: Ticket }
  | { code: "WRONG_EVENT"; ticket: Ticket; event: TicketingEvent }
  | { code: "INVALID_TICKET" };

const image = (name: string) => `/images/events/${name}.webp`;

function ticketType(
  id: string,
  name: string,
  price: number,
  capacity: number,
  sold: number,
  description: string,
  maxPerOrder = 6,
): TicketType {
  return {
    id,
    name,
    description,
    price,
    capacity,
    sold,
    maxPerOrder,
    salesStart: "2026-01-15",
    salesEnd: "2026-10-30",
  };
}

function session(id: string, label: string, date: string, time: string): Session {
  return { id, label, date, time };
}

export function createReservedSeats(): Seat[] {
  const rows = ["A", "B", "C", "D", "E"];
  return rows.flatMap((row, rowIndex) =>
    Array.from({ length: 8 }, (_, seatIndex) => {
      const number = seatIndex + 1;
      const section = rowIndex < 2 ? "Front" : rowIndex < 4 ? "Middle" : "Rear";
      return {
        id: `${row}${number}`,
        row,
        number,
        section,
        price: section === "Front" ? 120 : section === "Middle" ? 80 : 50,
        sold: ["A1", "A2", "B3", "C4", "D7", "E2"].includes(`${row}${number}`),
        accessible: ["A7", "A8", "C8"].includes(`${row}${number}`),
      };
    }),
  );
}

const sharedPolicies = [
  "Tickets are valid for the selected session only.",
  "Entry may close 20 minutes after the advertised start time.",
  "Demo tickets are not valid for admission, and no payments are processed.",
];

export const INITIAL_EVENTS: readonly TicketingEvent[] = [
  {
    id: "harbor-lights-live",
    title: "Harbor Lights Live",
    category: "Concerts",
    description: "An immersive night of original indie-pop, layered percussion, and cinematic light in a landmark waterfront hall.",
    image: image("music"), imageAlt: "Live band and audience under coral stage lights",
    venue: "The Lantern Hall", city: "Beirut", organizer: "Northline Productions", ageRestriction: "16+",
    policies: sharedPolicies, status: "On Sale", badge: "Selling Fast", featured: true, newEvent: false, popular: true,
    dateBuckets: ["This Weekend", "This Week", "This Month"],
    sessions: [session("fri-2000", "Friday — 8:00 PM", "Friday, September 4", "8:00 PM"), session("sat-2000", "Saturday — 8:00 PM", "Saturday, September 5", "8:00 PM"), session("sun-1800", "Sunday — 6:00 PM", "Sunday, September 6", "6:00 PM")],
    ticketTypes: [ticketType("general", "General Admission", 35, 300, 184, "Standing floor access"), ticketType("premium", "Premium", 65, 150, 102, "Priority entry and premium viewing zone", 4), ticketType("vip", "VIP", 120, 50, 46, "Balcony lounge access and welcome drink", 4)],
    reservedSeating: false, seats: [],
  },
  {
    id: "lumen-movement",
    title: "Lumen: A Movement Story",
    category: "Theatre",
    description: "Contemporary dance, architectural light, and an original score unfold in an intimate reserved-seat theatre.",
    image: image("theatre"), imageAlt: "Original contemporary dance performance in an elegant theatre",
    venue: "Arc Theatre", city: "Beirut", organizer: "Stillpoint Arts", ageRestriction: "All ages",
    policies: sharedPolicies, status: "On Sale", badge: "Limited Availability", featured: true, newEvent: true, popular: true,
    dateBuckets: ["Tomorrow", "This Week", "This Month"], sessions: [session("thu-1930", "Thursday — 7:30 PM", "Thursday, September 3", "7:30 PM"), session("sat-1930", "Saturday — 7:30 PM", "Saturday, September 5", "7:30 PM")],
    ticketTypes: [ticketType("front", "Front Section", 120, 16, 3, "Rows A–B"), ticketType("middle", "Middle Section", 80, 16, 2, "Rows C–D"), ticketType("rear", "Rear Section", 50, 8, 1, "Row E")], reservedSeating: true, seats: createReservedSeats(),
  },
  {
    id: "courtyard-stories", title: "Courtyard Stories Festival", category: "Festivals", description: "A sunset gathering of food, installation art, and live craft in a restored garden courtyard.", image: image("festival"), imageAlt: "Original sunset arts festival in a garden courtyard", venue: "Cedar Court", city: "Byblos", organizer: "Gather House", ageRestriction: "All ages", policies: sharedPolicies, status: "On Sale", badge: "New", featured: true, newEvent: true, popular: true, dateBuckets: ["This Weekend", "This Month"], sessions: [session("sat-1600", "Saturday — 4:00 PM", "Saturday, September 12", "4:00 PM")], ticketTypes: [ticketType("day", "Festival Pass", 28, 500, 218, "Full-day access"), ticketType("family", "Family Pass", 74, 100, 48, "Entry for two adults and two children", 2)], reservedSeating: false, seats: [],
  },
  {
    id: "coastal-futsal-final", title: "Coastal Futsal Final", category: "Sports", description: "Two city squads meet for a fast-paced indoor championship night.", image: image("sports"), imageAlt: "Indoor futsal match in a contemporary arena", venue: "Pulse Arena", city: "Jounieh", organizer: "Coastal Sports Collective", ageRestriction: "All ages", policies: sharedPolicies, status: "On Sale", badge: "Almost Sold Out", featured: true, newEvent: false, popular: true, dateBuckets: ["This Weekend", "This Month"], sessions: [session("sun-1900", "Sunday — 7:00 PM", "Sunday, September 13", "7:00 PM")], ticketTypes: [ticketType("upper", "Upper Stand", 22, 400, 351, "Unreserved upper seating"), ticketType("courtside", "Courtside", 55, 80, 71, "Closest unreserved viewing area", 4)], reservedSeating: false, seats: [],
  },
  {
    id: "little-orbits", title: "Little Orbits Discovery Day", category: "Family", description: "Hands-on astronomy, light experiments, and guided discovery sessions for curious families.", image: image("family"), imageAlt: "Original family science experience with suspended planet models", venue: "Brightworks Hall", city: "Beirut", organizer: "Curious Days", ageRestriction: "Recommended 5–14", policies: sharedPolicies, status: "On Sale", badge: "New", featured: false, newEvent: true, popular: true, dateBuckets: ["Today", "This Week", "This Month"], sessions: [session("today-1000", "Today — 10:00 AM", "Today", "10:00 AM"), session("today-1400", "Today — 2:00 PM", "Today", "2:00 PM")], ticketTypes: [ticketType("child", "Child", 12, 120, 44, "Ages 5–14"), ticketType("adult", "Adult", 8, 120, 39, "Adult companion")], reservedSeating: false, seats: [],
  },
  {
    id: "brickline-comedy", title: "Brickline Comedy Sessions", category: "Comedy", description: "Four original local comedy sets in an intimate room built for quick wit and warm crowd energy.", image: image("comedy"), imageAlt: "Original stand-up comedy scene in an intimate brick theatre", venue: "The Brick Room", city: "Beirut", organizer: "Side Door Comedy", ageRestriction: "18+", policies: sharedPolicies, status: "On Sale", featured: false, newEvent: false, popular: true, dateBuckets: ["Tomorrow", "This Week", "This Month"], sessions: [session("wed-2030", "Wednesday — 8:30 PM", "Wednesday, September 2", "8:30 PM"), session("sat-2130", "Saturday — 9:30 PM", "Saturday, September 5", "9:30 PM")], ticketTypes: [ticketType("standard", "Standard", 24, 100, 66, "General room seating")], reservedSeating: false, seats: [],
  },
  {
    id: "forward-together", title: "Forward Together Forum", category: "Conferences", description: "A practical one-day forum about resilient teams, thoughtful technology, and better service design.", image: image("conference"), imageAlt: "Original modern business conference with abstract unbranded stage graphics", venue: "Foundry Forum", city: "Beirut", organizer: "Fieldwork Collective", ageRestriction: "18+", policies: sharedPolicies, status: "On Sale", badge: "New", featured: true, newEvent: true, popular: false, dateBuckets: ["This Month"], sessions: [session("mon-0900", "Monday — 9:00 AM", "Monday, September 21", "9:00 AM")], ticketTypes: [ticketType("standard", "Forum Pass", 95, 240, 88, "Sessions, lunch, and networking"), ticketType("team", "Team Pass", 320, 60, 22, "Entry for four colleagues", 3)], reservedSeating: false, seats: [],
  },
  {
    id: "afterglow-rooftop", title: "Afterglow Rooftop", category: "Nightlife", description: "A sunset-to-midnight electronic set above the coastal skyline.", image: image("nightlife"), imageAlt: "Rooftop nightlife event above a coastal city", venue: "Tide Roof", city: "Jounieh", organizer: "Night Current", ageRestriction: "21+", policies: sharedPolicies, status: "Sold Out", featured: true, newEvent: false, popular: true, dateBuckets: ["This Weekend", "This Month"], sessions: [session("sat-1800", "Saturday — 6:00 PM", "Saturday, September 5", "6:00 PM")], ticketTypes: [ticketType("entry", "Entry", 40, 220, 220, "Rooftop access")], reservedSeating: false, seats: [],
  },
  {
    id: "sunrise-reset", title: "Sunrise Reset", category: "Experiences", description: "A guided coastal movement and breakfast experience designed for an unhurried start.", image: image("wellness"), imageAlt: "Original sunrise wellness session on a coastal terrace", venue: "Sea Glass Terrace", city: "Batroun", organizer: "Open Air Studio", ageRestriction: "16+", policies: sharedPolicies, status: "On Sale", badge: "Limited Availability", featured: false, newEvent: true, popular: true, dateBuckets: ["This Weekend", "This Month"], sessions: [session("sun-0630", "Sunday — 6:30 AM", "Sunday, September 6", "6:30 AM")], ticketTypes: [ticketType("mat", "Mat Space", 32, 42, 36, "Session and breakfast bowl", 2)], reservedSeating: false, seats: [],
  },
  {
    id: "analog-sundays", title: "Analog Sundays", category: "Concerts", description: "A relaxed afternoon of original acoustic music and vinyl-inspired sound.", image: image("music"), imageAlt: "Original live music performance in a warm contemporary venue", venue: "Room 27", city: "Beirut", organizer: "Quiet Signal", ageRestriction: "All ages", policies: sharedPolicies, status: "On Sale", featured: false, newEvent: false, popular: false, dateBuckets: ["This Weekend", "This Month"], sessions: [session("sun-1600", "Sunday — 4:00 PM", "Sunday, September 20", "4:00 PM")], ticketTypes: [ticketType("entry", "Entry", 18, 140, 51, "General admission")], reservedSeating: false, seats: [],
  },
  {
    id: "moon-market", title: "Moon Market Nights", category: "Festivals", description: "Independent makers, ambient sound, and seasonal plates in a lantern-lit night market.", image: image("festival"), imageAlt: "Original evening garden festival with artisan stalls", venue: "Olive Yard", city: "Zahle", organizer: "Market Assembly", ageRestriction: "All ages", policies: sharedPolicies, status: "On Sale", featured: false, newEvent: true, popular: false, dateBuckets: ["This Month"], sessions: [session("fri-1700", "Friday — 5:00 PM", "Friday, September 25", "5:00 PM")], ticketTypes: [ticketType("entry", "Entry", 10, 600, 147, "Market and performance access")], reservedSeating: false, seats: [],
  },
  {
    id: "makers-morning", title: "Makers Morning", category: "Experiences", description: "A guided ceramics workshop with materials, firing, and a small shared lunch.", image: image("festival"), imageAlt: "Original arts gathering in a restored garden setting", venue: "Clay House", city: "Byblos", organizer: "Hands On Studio", ageRestriction: "14+", policies: sharedPolicies, status: "On Sale", badge: "Limited Availability", featured: false, newEvent: false, popular: false, dateBuckets: ["Tomorrow", "This Week", "This Month"], sessions: [session("thu-1000", "Thursday — 10:00 AM", "Thursday, September 3", "10:00 AM")], ticketTypes: [ticketType("workshop", "Workshop Place", 48, 18, 16, "Materials, firing, and lunch", 2)], reservedSeating: false, seats: [],
  },
  {
    id: "designing-cities", title: "Designing Better Cities", category: "Conferences", description: "An evening exchange on public space, mobility, and human-scale neighborhoods.", image: image("conference"), imageAlt: "Original design conference in a bright modern auditorium", venue: "Common Ground Auditorium", city: "Tripoli", organizer: "Urban Exchange", ageRestriction: "All ages", policies: sharedPolicies, status: "On Sale", featured: false, newEvent: true, popular: false, dateBuckets: ["This Month"], sessions: [session("tue-1800", "Tuesday — 6:00 PM", "Tuesday, September 29", "6:00 PM")], ticketTypes: [ticketType("standard", "Standard", 30, 300, 118, "Talks and reception"), ticketType("student", "Student", 15, 80, 43, "Valid student identification required")], reservedSeating: false, seats: [],
  },
  {
    id: "junior-court", title: "Junior Court Challenge", category: "Sports", description: "A friendly skills circuit and exhibition designed for young athletes and families.", image: image("sports"), imageAlt: "Original unbranded indoor sports event", venue: "North Court", city: "Tripoli", organizer: "Play Forward", ageRestriction: "Ages 8–16 with guardian", policies: sharedPolicies, status: "Draft", featured: false, newEvent: true, popular: false, dateBuckets: ["This Month"], sessions: [session("sat-1100", "Saturday — 11:00 AM", "Saturday, October 3", "11:00 AM")], ticketTypes: [ticketType("participant", "Participant", 20, 80, 0, "Skills circuit entry")], reservedSeating: false, seats: [],
  },
  {
    id: "midnight-monologues", title: "Midnight Monologues", category: "Theatre", description: "An original late-night collection of short dramatic works performed in the round.", image: image("theatre"), imageAlt: "Original stage performance under dramatic architectural lighting", venue: "Studio Nine", city: "Beirut", organizer: "Open Scene", ageRestriction: "16+", policies: sharedPolicies, status: "Completed", featured: false, newEvent: false, popular: false, dateBuckets: ["This Month"], sessions: [session("past-2100", "Friday — 9:00 PM", "Friday, August 14", "9:00 PM")], ticketTypes: [ticketType("standard", "Standard", 26, 90, 74, "In-the-round seating")], reservedSeating: false, seats: [],
  },
  {
    id: "river-lantern-night", title: "River Lantern Night", category: "Family", description: "A lantern walk and family performance that has been cancelled.", image: image("family"), imageAlt: "Family discovery event in a bright exhibition hall", venue: "River Garden", city: "Zahle", organizer: "Kindred Events", ageRestriction: "All ages", policies: sharedPolicies, status: "Cancelled", featured: false, newEvent: false, popular: false, dateBuckets: ["This Month"], sessions: [session("sat-1730", "Saturday — 5:30 PM", "Saturday, September 19", "5:30 PM")], ticketTypes: [ticketType("family", "Family Entry", 25, 200, 61, "Family admission")], reservedSeating: false, seats: [],
  },
];

export const DEFAULT_FILTERS: EventFilters = {
  category: "All",
  date: "Any date",
  city: "All",
  maxPrice: 150,
  availability: "Any availability",
};

const cloneEvents = () => JSON.parse(JSON.stringify(INITIAL_EVENTS)) as TicketingEvent[];
const round = (value: number) => Math.round(value * 100) / 100;

export function createInitialTicketingState(): TicketingState {
  return {
    version: 2,
    events: cloneEvents(),
    favorites: [],
    recentSearches: [],
    draft: null,
    orders: [],
    tickets: [
      { id: "TKT-EV10710-01", orderId: "#EV-10710", eventId: "river-lantern-night", sessionId: "sat-1730", ticketTypeId: "family", attendee: { firstName: "Maya", lastName: "Farah", email: "maya@example.test" }, qrPayload: "ILBATECH|TKT-EV10710-01|river-lantern-night|sat-1730", status: "Cancelled", gift: false },
      { id: "TKT-EV10711-01", orderId: "#EV-10711", eventId: "lumen-movement", sessionId: "thu-1930", ticketTypeId: "middle", attendee: { firstName: "Rami", lastName: "Nader", email: "rami@example.test" }, seatId: "C5", qrPayload: "ILBATECH|TKT-EV10711-01|lumen-movement|thu-1930", status: "Valid", gift: false },
    ],
    transfers: [],
    checkIns: [],
    notifications: [
      { id: "note-welcome", title: "Welcome to ILBATECH", message: "Browse events, book a test ticket, and switch to Organizer to check it in.", createdAt: "Today", read: false },
      { id: "note-reminder", title: "Event reminder", message: "Harbor Lights Live has a Saturday session at 8:00 PM.", createdAt: "Today", read: false },
    ],
    waitlist: [],
    nextOrderNumber: 10842,
    nextCreatedEventNumber: 1,
  };
}

export function eventById(state: TicketingState, eventId: string) {
  return state.events.find((event) => event.id === eventId);
}

export function searchEvents(events: readonly TicketingEvent[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [...events];
  return events.filter((event) =>
    [event.title, event.venue, event.category, event.city, event.organizer, event.description]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
}

export function eventStartingPrice(event: TicketingEvent) {
  if (event.reservedSeating) {
    return Math.min(...event.seats.filter((seat) => !seat.sold).map((seat) => seat.price));
  }
  return Math.min(...event.ticketTypes.map((type) => type.price));
}

export function eventAvailability(event: TicketingEvent): AvailabilityFilter {
  if (event.status === "Sold Out" || event.ticketTypes.every((type) => type.sold >= type.capacity)) return "Sold Out";
  const remaining = event.ticketTypes.reduce((sum, type) => sum + Math.max(0, type.capacity - type.sold), 0);
  const capacity = event.ticketTypes.reduce((sum, type) => sum + type.capacity, 0);
  return remaining / Math.max(1, capacity) <= 0.15 ? "Limited" : "Available";
}

export function filterEvents(events: readonly TicketingEvent[], query: string, filters: EventFilters) {
  return searchEvents(events, query).filter((event) => {
    if (filters.category !== "All" && event.category !== filters.category) return false;
    if (filters.date !== "Any date" && !event.dateBuckets.includes(filters.date)) return false;
    if (filters.city !== "All" && event.city !== filters.city) return false;
    if (eventStartingPrice(event) > filters.maxPrice) return false;
    if (filters.availability !== "Any availability" && eventAvailability(event) !== filters.availability) return false;
    return event.status !== "Draft";
  });
}

export function searchSuggestions(events: readonly TicketingEvent[], query: string) {
  return searchEvents(events, query).slice(0, 5).map((event) => ({ id: event.id, label: event.title, meta: `${event.category} · ${event.city}` }));
}

export function remainingForType(event: TicketingEvent, ticketTypeId: string) {
  const type = event.ticketTypes.find((item) => item.id === ticketTypeId);
  return type ? Math.max(0, type.capacity - type.sold) : 0;
}

export function seatTicketTypeId(seat: Seat) {
  return seat.section.toLowerCase();
}

export function linePrice(event: TicketingEvent, line: DraftLine) {
  if (line.seatId) return event.seats.find((seat) => seat.id === line.seatId)?.price ?? 0;
  return (event.ticketTypes.find((type) => type.id === line.ticketTypeId)?.price ?? 0) * line.quantity;
}

export function promoDiscount(subtotal: number, code: string) {
  const normalized = code.trim().toUpperCase();
  if (normalized === "EVENT10") return round(subtotal * 0.1);
  if (normalized === "WELCOME5" && subtotal >= 25) return 5;
  return 0;
}

export function calculateTicketTotals(event: TicketingEvent, lines: readonly DraftLine[], promoCode = ""): Totals {
  const subtotal = round(lines.reduce((sum, line) => sum + linePrice(event, line), 0));
  const discount = promoDiscount(subtotal, promoCode);
  const serviceFee = round((subtotal - discount) * 0.08);
  const tax = round((subtotal - discount + serviceFee) * 0.05);
  return { subtotal, discount, serviceFee, tax, total: round(subtotal - discount + serviceFee + tax) };
}

export function ticketCount(lines: readonly DraftLine[]) {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function validateDraftAvailability(state: TicketingState, draft: PurchaseDraft) {
  const event = eventById(state, draft.eventId);
  if (!event || event.status !== "On Sale") return false;
  if (!event.sessions.some((item) => item.id === draft.sessionId) || !draft.lines.length) return false;
  if (event.reservedSeating) {
    const seatIds = draft.lines.map((line) => line.seatId);
    return seatIds.every((seatId, index) => seatId && seatIds.indexOf(seatId) === index && !event.seats.find((seat) => seat.id === seatId)?.sold);
  }
  return draft.lines.every((line) => {
    const type = event.ticketTypes.find((item) => item.id === line.ticketTypeId);
    return Boolean(type && line.quantity > 0 && line.quantity <= type.maxPerOrder && line.quantity <= type.capacity - type.sold);
  });
}

export function qrPayload(ticketId: string, eventId: string, sessionId: string) {
  return `ILBATECH|${ticketId}|${eventId}|${sessionId}`;
}

export function completePurchase(state: TicketingState, input: PurchaseInput): PurchaseResult {
  const normalizedCard = (input.cardNumber ?? "").replace(/\D/g, "");
  if (input.paymentMethod === "Card" && normalizedCard === "4000000000000002") {
    return { ok: false, state, code: "DECLINED", message: "Demo payment declined. Try the successful demo card ending in 4242." };
  }
  if (input.paymentMethod === "Card" && normalizedCard !== "4242424242424242") {
    return { ok: false, state, code: "INVALID_PAYMENT", message: "Enter the safe demo card 4242 4242 4242 4242." };
  }
  if (!validateDraftAvailability(state, input.draft)) {
    return { ok: false, state, code: "UNAVAILABLE", message: "One or more selected tickets are no longer available." };
  }

  const next = structuredClone(state);
  const event = eventById(next, input.draft.eventId)!;
  const orderNumber = next.nextOrderNumber;
  const orderId = `#EV-${orderNumber}`;
  const expandedLines = input.draft.lines.flatMap((line) =>
    Array.from({ length: line.quantity }, (_, index) => ({ ...line, quantity: 1, key: `${line.key}-${index}` })),
  );
  const tickets = expandedLines.map((line, index): Ticket => {
    const id = `TKT-EV${orderNumber}-${String(index + 1).padStart(2, "0")}`;
    const attendee = line.giftRecipient ?? line.attendee ?? input.draft.purchaser;
    return {
      id,
      orderId,
      eventId: event.id,
      sessionId: input.draft.sessionId,
      ticketTypeId: line.ticketTypeId,
      attendee: { firstName: attendee.firstName, lastName: attendee.lastName, email: attendee.email },
      ...(line.seatId ? { seatId: line.seatId } : {}),
      qrPayload: qrPayload(id, event.id, input.draft.sessionId),
      status: "Valid",
      gift: Boolean(line.giftRecipient),
    };
  });

  for (const line of input.draft.lines) {
    const type = event.ticketTypes.find((item) => item.id === line.ticketTypeId);
    if (type) type.sold += line.quantity;
    if (line.seatId) {
      const seat = event.seats.find((item) => item.id === line.seatId);
      if (seat) seat.sold = true;
    }
  }
  if (event.ticketTypes.every((type) => type.sold >= type.capacity)) event.status = "Sold Out";
  const totals = calculateTicketTotals(event, input.draft.lines, input.draft.promoCode);
  const order: Order = {
    id: orderId, eventId: event.id, sessionId: input.draft.sessionId,
    ticketIds: tickets.map((ticket) => ticket.id), purchasedAt: "August 30, 2026 · 11:42 AM",
    purchaser: input.draft.purchaser, paymentMethod: input.paymentMethod, paymentStatus: "Paid",
    ...totals, promoCode: input.draft.promoCode.trim().toUpperCase(),
  };
  next.orders.unshift(order);
  next.tickets.push(...tickets);
  next.notifications.unshift({ id: `note-${orderNumber}`, title: "Booking confirmed", message: `${tickets.length} ticket${tickets.length === 1 ? "" : "s"} confirmed for ${event.title}.`, createdAt: "Just now", read: false });
  next.nextOrderNumber += 1;
  next.draft = null;
  return { ok: true, state: next, order, tickets };
}

export function transferTicket(state: TicketingState, ticketId: string, recipientName: string, recipientEmail: string) {
  const next = structuredClone(state);
  const ticket = next.tickets.find((item) => item.id === ticketId);
  if (!ticket || ticket.status !== "Valid" || next.transfers.some((item) => item.ticketId === ticketId)) {
    return { ok: false as const, state, message: "This ticket is not eligible for transfer." };
  }
  ticket.status = "Transferred";
  ticket.ownerName = recipientName;
  ticket.ownerEmail = recipientEmail;
  const transfer: Transfer = { id: `TR-${next.transfers.length + 1}`, ticketId, recipientName, recipientEmail, transferredAt: "August 30, 2026 · 11:46 AM" };
  next.transfers.unshift(transfer);
  next.notifications.unshift({ id: `note-transfer-${ticketId}`, title: "Ticket transferred", message: `${ticketId} was transferred to ${recipientName}.`, createdAt: "Just now", read: false });
  return { ok: true as const, state: next, transfer };
}

export function validateTicket(state: TicketingState, ticketId: string, activeEventId: string): ValidationResult {
  const ticket = state.tickets.find((item) => item.id.toUpperCase() === ticketId.trim().toUpperCase());
  if (!ticket) return { code: "INVALID_TICKET" };
  const event = eventById(state, ticket.eventId)!;
  if (ticket.status === "Cancelled" || event.status === "Cancelled") return { code: "TICKET_CANCELLED", ticket };
  if (ticket.eventId !== activeEventId) return { code: "WRONG_EVENT", ticket, event };
  if (ticket.status === "Used") return { code: "ALREADY_USED", ticket };
  return { code: "VALID", ticket };
}

export function checkInTicket(state: TicketingState, ticketId: string, activeEventId: string, gate = "North Gate") {
  const validation = validateTicket(state, ticketId, activeEventId);
  if (validation.code !== "VALID") return { ok: false as const, state, validation };
  const next = structuredClone(state);
  const ticket = next.tickets.find((item) => item.id === validation.ticket.id)!;
  ticket.status = "Used";
  ticket.checkedInAt = "August 30, 2026 · 7:42 PM";
  const checkIn: CheckIn = { id: `CI-${next.checkIns.length + 1}`, ticketId: ticket.id, checkedInAt: ticket.checkedInAt, gate };
  next.checkIns.unshift(checkIn);
  return { ok: true as const, state: next, ticket, checkIn };
}

export function cancelEvent(state: TicketingState, eventId: string) {
  const next = structuredClone(state);
  const event = eventById(next, eventId);
  if (!event) return state;
  event.status = "Cancelled";
  next.tickets.filter((ticket) => ticket.eventId === eventId && ticket.status !== "Used").forEach((ticket) => { ticket.status = "Cancelled"; });
  next.notifications.unshift({ id: `note-cancel-${eventId}`, title: "Event cancelled", message: `${event.title} has been cancelled. No refund is issued because payment is simulated.`, createdAt: "Just now", read: false });
  return next;
}

export function joinWaitlist(state: TicketingState, eventId: string, name: string, email: string) {
  const event = eventById(state, eventId);
  if (!event || eventAvailability(event) !== "Sold Out") return { ok: false as const, state };
  const next = structuredClone(state);
  const entry: WaitlistEntry = { id: `WL-${next.waitlist.length + 1}`, eventId, name, email };
  next.waitlist.push(entry);
  return { ok: true as const, state: next, entry };
}

export function toggleFavorite(state: TicketingState, eventId: string) {
  const next = structuredClone(state);
  next.favorites = next.favorites.includes(eventId) ? next.favorites.filter((id) => id !== eventId) : [...next.favorites, eventId];
  return next;
}

export function addRecentSearch(state: TicketingState, query: string) {
  const clean = query.trim();
  if (!clean) return state;
  const next = structuredClone(state);
  next.recentSearches = [clean, ...next.recentSearches.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 4);
  return next;
}

export function eventMetrics(state: TicketingState, eventId: string) {
  const event = eventById(state, eventId)!;
  const capacity = event.ticketTypes.reduce((sum, type) => sum + type.capacity, 0);
  const sold = event.ticketTypes.reduce((sum, type) => sum + type.sold, 0);
  const eventOrders = state.orders.filter((order) => order.eventId === eventId);
  const revenue = round(eventOrders.reduce((sum, order) => sum + order.total, 0));
  const checkedIn = state.tickets.filter((ticket) => ticket.eventId === eventId && ticket.status === "Used").length;
  return { capacity, sold, available: Math.max(0, capacity - sold), revenue, checkedIn, checkInRate: sold ? Math.round((checkedIn / sold) * 100) : 0, averageOrderValue: eventOrders.length ? round(revenue / eventOrders.length) : 0 };
}

export function createOrganizerEvent(state: TicketingState, details: { title: string; category: EventCategory; description: string; venue: string; city: string; date: string; startTime: string; endTime: string; ageRestriction: string; capacity: number; reservedSeating: boolean }) {
  const next = structuredClone(state);
  const number = next.nextCreatedEventNumber;
  const event: TicketingEvent = {
    id: `created-event-${number}`, title: details.title, category: details.category, description: details.description,
    image: image("festival"), imageAlt: "Original event gathering in a warm courtyard", venue: details.venue, city: details.city,
    organizer: "ILBATECH", ageRestriction: details.ageRestriction, policies: sharedPolicies, status: "Draft",
    featured: false, newEvent: true, popular: false, dateBuckets: ["This Month"],
    sessions: [session(`created-session-${number}`, `${details.date} — ${details.startTime}`, details.date, details.startTime)],
    ticketTypes: [ticketType(`created-general-${number}`, "General Admission", 35, details.capacity, 0, `Sales close at ${details.endTime}`)],
    reservedSeating: details.reservedSeating, seats: details.reservedSeating ? createReservedSeats() : [], created: true,
  };
  next.events.push(event);
  next.nextCreatedEventNumber += 1;
  return { state: next, event };
}

export function configureTicketType(state: TicketingState, eventId: string, type: Omit<TicketType, "sold">) {
  const next = structuredClone(state);
  const event = eventById(next, eventId);
  if (!event) return state;
  event.ticketTypes.push({ ...type, sold: 0 });
  return next;
}

function migrateTicketingCopy(value: string) {
  return value
    .replaceAll("VIRELLO|", "ILBATECH|")
    .replaceAll("Virello Demo Organizer", "ILBATECH")
    .replaceAll("Welcome to Virello", "Welcome to ILBATECH")
    .replaceAll("Explore events, complete a safe demo checkout, and switch to Organizer View to validate the same ticket.", "Browse events, book a test ticket, and switch to Organizer to check it in.")
    .replaceAll("This fictional demo does not issue real tickets or process payments.", "Demo tickets are not valid for admission, and no payments are processed.")
    .replaceAll("Two fictional city squads", "Two city squads")
    .replaceAll("Original fictional indoor futsal match in an unbranded arena", "Indoor futsal match in a contemporary arena")
    .replaceAll("above a fictional coastal skyline", "above the coastal skyline")
    .replaceAll("A fictional lantern walk and family performance that has been cancelled in this demo state.", "A lantern walk and family performance that has been cancelled.")
    .replaceAll("Original family discovery experience in a bright exhibition hall", "Family discovery event in a bright exhibition hall")
    .replaceAll("has been cancelled in the demo. No real refund is issued.", "has been cancelled. No refund is issued because payment is simulated.");
}

function migrateTicketId(ticketId: string) {
  if (ticketId === "TKT-DEMO-CANCELLED") return "TKT-EV10710-01";
  if (ticketId === "TKT-DEMO-WRONG") return "TKT-EV10711-01";
  return ticketId;
}

export function loadTicketingState(raw: string | null) {
  if (!raw) return createInitialTicketingState();
  try {
    const parsed = JSON.parse(raw) as Partial<TicketingState> & Record<string, unknown>;
    if (![1, 2].includes(Number(parsed.version)) || !Array.isArray(parsed.events) || !Array.isArray(parsed.tickets)) return createInitialTicketingState();
    delete parsed.cardNumber;
    delete parsed.cvv;
    const migrated = JSON.parse(JSON.stringify(parsed), (_key, value) => typeof value === "string" ? migrateTicketingCopy(value) : value) as TicketingState;
    migrated.version = 2;
    migrated.tickets = migrated.tickets.map((ticket) => ({
      ...ticket,
      id: migrateTicketId(ticket.id),
      qrPayload: migrateTicketingCopy(ticket.qrPayload)
        .replace("TKT-DEMO-CANCELLED", "TKT-EV10710-01")
        .replace("TKT-DEMO-WRONG", "TKT-EV10711-01"),
    }));
    migrated.orders = migrated.orders.map((order) => ({ ...order, ticketIds: order.ticketIds.map(migrateTicketId) }));
    migrated.transfers = migrated.transfers.map((transfer) => ({ ...transfer, ticketId: migrateTicketId(transfer.ticketId) }));
    migrated.checkIns = migrated.checkIns.map((checkIn) => ({ ...checkIn, ticketId: migrateTicketId(checkIn.ticketId) }));
    return migrated;
  } catch {
    return createInitialTicketingState();
  }
}

export function resetTicketingState() {
  return createInitialTicketingState();
}
