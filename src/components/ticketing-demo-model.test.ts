import assert from "node:assert/strict";
import test from "node:test";

const model = (await import(
  new URL("./ticketing-demo-model.ts", import.meta.url).href
)) as typeof import("./ticketing-demo-model");

const {
  DEFAULT_FILTERS,
  EVENT_CATEGORIES,
  INITIAL_EVENTS,
  addRecentSearch,
  calculateTicketTotals,
  cancelEvent,
  checkInTicket,
  completePurchase,
  configureTicketType,
  createInitialTicketingState,
  createOrganizerEvent,
  eventAvailability,
  eventById,
  eventMetrics,
  filterEvents,
  joinWaitlist,
  loadTicketingState,
  promoDiscount,
  remainingForType,
  resetTicketingState,
  searchEvents,
  searchSuggestions,
  seatTicketTypeId,
  toggleFavorite,
  transferTicket,
  validateDraftAvailability,
  validateTicket,
} = model;

function concertDraft(quantity = 2, promoCode = "EVENT10"): import("./ticketing-demo-model").PurchaseDraft {
  return {
    eventId: "harbor-lights-live",
    sessionId: "sat-2000",
    lines: [{ key: "premium", ticketTypeId: "premium", quantity, attendee: { firstName: "Dana", lastName: "Haddad", email: "dana@example.test" } }],
    promoCode,
    customerMode: "Guest" as const,
    purchaser: { firstName: "Dana", lastName: "Haddad", email: "dana@example.test", phone: "+961 00 000 000" },
  };
}

function buyConcert(quantity = 2) {
  return completePurchase(createInitialTicketingState(), {
    draft: concertDraft(quantity), paymentMethod: "Card", cardNumber: "4242 4242 4242 4242",
  });
}

test("catalog has 16 fictional events across all nine requested categories", () => {
  assert.equal(INITIAL_EVENTS.length, 16);
  assert.deepEqual(new Set(INITIAL_EVENTS.map((event) => event.category)), new Set(EVENT_CATEGORIES));
  assert.ok(INITIAL_EVENTS.every((event) => event.image.startsWith("/images/events/") && event.image.endsWith(".webp")));
});

test("event search matches title, venue, category, city, organizer, and description keywords", () => {
  assert.equal(searchEvents(INITIAL_EVENTS, "Harbor Lights")[0].id, "harbor-lights-live");
  assert.ok(searchEvents(INITIAL_EVENTS, "Pulse Arena").some((event) => event.category === "Sports"));
  assert.ok(searchEvents(INITIAL_EVENTS, "music").some((event) => event.id === "analog-sundays"));
  assert.equal(searchEvents(INITIAL_EVENTS, "not-a-real-event").length, 0);
});

test("search suggestions are natural and limited", () => {
  const suggestions = searchSuggestions(INITIAL_EVENTS, "Beirut");
  assert.ok(suggestions.length > 0 && suggestions.length <= 5);
  assert.ok(suggestions.every((item) => item.meta.includes("·")));
});

test("category, date, location, price, and availability filters affect results", () => {
  const results = filterEvents(INITIAL_EVENTS, "", { category: "Experiences", date: "Tomorrow", city: "Byblos", maxPrice: 50, availability: "Limited" });
  assert.deepEqual(results.map((event) => event.id), ["makers-morning"]);
  assert.ok(filterEvents(INITIAL_EVENTS, "", DEFAULT_FILTERS).every((event) => event.status !== "Draft"));
});

test("recent searches de-duplicate and cap history", () => {
  let state = createInitialTicketingState();
  for (const query of ["music", "sport", "family", "theatre", "music"]) state = addRecentSearch(state, query);
  assert.deepEqual(state.recentSearches, ["music", "theatre", "family", "sport"]);
});

test("multi-session concert requires a valid selected session", () => {
  const state = createInitialTicketingState();
  assert.equal(validateDraftAvailability(state, concertDraft()), true);
  assert.equal(validateDraftAvailability(state, { ...concertDraft(), sessionId: "missing" }), false);
  assert.equal(eventById(state, "harbor-lights-live")!.sessions.length, 3);
});

test("ticket pricing and exact deterministic totals reconcile", () => {
  const event = eventById(createInitialTicketingState(), "harbor-lights-live")!;
  assert.deepEqual(calculateTicketTotals(event, concertDraft().lines, "EVENT10"), { subtotal: 130, discount: 13, serviceFee: 9.36, tax: 6.32, total: 132.68 });
});

test("EVENT10 and WELCOME5 promotions follow their eligibility rules", () => {
  assert.equal(promoDiscount(130, "event10"), 13);
  assert.equal(promoDiscount(30, "WELCOME5"), 5);
  assert.equal(promoDiscount(20, "WELCOME5"), 0);
  assert.equal(promoDiscount(100, "NOPE"), 0);
});

test("ticket capacity prevents overselling and respects max per order", () => {
  const state = createInitialTicketingState();
  assert.equal(remainingForType(eventById(state, "harbor-lights-live")!, "vip"), 4);
  assert.equal(validateDraftAvailability(state, { ...concertDraft(), lines: [{ key: "vip", ticketTypeId: "vip", quantity: 5 }] }), false);
});

test("reserved seat states, pricing, accessibility, and section mapping are deterministic", () => {
  const event = eventById(createInitialTicketingState(), "lumen-movement")!;
  assert.equal(event.seats.find((seat) => seat.id === "A1")!.sold, true);
  assert.equal(event.seats.find((seat) => seat.id === "A7")!.accessible, true);
  assert.equal(event.seats.find((seat) => seat.id === "A7")!.price, 120);
  assert.equal(seatTicketTypeId(event.seats.find((seat) => seat.id === "C5")!), "middle");
});

test("reserved selection rejects sold and duplicate seats", () => {
  const state = createInitialTicketingState();
  const base = { ...concertDraft(), eventId: "lumen-movement", sessionId: "thu-1930" };
  assert.equal(validateDraftAvailability(state, { ...base, lines: [{ key: "A1", ticketTypeId: "front", quantity: 1, seatId: "A1" }] }), false);
  assert.equal(validateDraftAvailability(state, { ...base, lines: [{ key: "A7a", ticketTypeId: "front", quantity: 1, seatId: "A7" }, { key: "A7b", ticketTypeId: "front", quantity: 1, seatId: "A7" }] }), false);
  assert.equal(validateDraftAvailability(state, { ...base, lines: [{ key: "A7", ticketTypeId: "front", quantity: 1, seatId: "A7" }] }), true);
});

test("selecting and removing reserved seats changes totals immediately", () => {
  const event = eventById(createInitialTicketingState(), "lumen-movement")!;
  const first = { key: "A7", ticketTypeId: "front", quantity: 1, seatId: "A7" };
  const second = { key: "C5", ticketTypeId: "middle", quantity: 1, seatId: "C5" };
  assert.equal(calculateTicketTotals(event, [first, second]).subtotal, 200);
  assert.equal(calculateTicketTotals(event, [first]).subtotal, 120);
});

test("successful demo payment creates one order, sale, and two unique tickets", () => {
  const result = buyConcert();
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.order.id, "#EV-10842");
  assert.deepEqual(result.tickets.map((ticket) => ticket.id), ["TKT-EV10842-01", "TKT-EV10842-02"]);
  assert.equal(new Set(result.tickets.map((ticket) => ticket.qrPayload)).size, 2);
});

test("QR payloads contain safe identifiers but no attendee or payment data", () => {
  const result = buyConcert();
  assert.equal(result.ok, true);
  if (!result.ok) return;
  for (const ticket of result.tickets) {
    assert.match(ticket.qrPayload, /^VIRELLO\|TKT-EV10842-0[12]\|harbor-lights-live\|sat-2000$/);
    assert.equal(ticket.qrPayload.includes("dana"), false);
    assert.equal(ticket.qrPayload.includes("4242"), false);
  }
});

test("successful purchase never stores card number or CVV", () => {
  const result = buyConcert();
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const serialized = JSON.stringify(result.state);
  assert.equal(serialized.includes("4242424242424242"), false);
  assert.equal(serialized.toLowerCase().includes("cvv"), false);
});

test("invalid payment creates no order, ticket, or sale", () => {
  const state = createInitialTicketingState();
  const result = completePurchase(state, { draft: concertDraft(), paymentMethod: "Card", cardNumber: "1234" });
  assert.equal(result.ok, false);
  assert.equal(result.state, state);
  assert.equal(result.state.orders.length, 0);
  assert.equal(result.state.tickets.length, 2);
  assert.equal(eventMetrics(result.state, "harbor-lights-live").sold, 332);
});

test("deterministic declined payment creates nothing", () => {
  const state = createInitialTicketingState();
  const result = completePurchase(state, { draft: concertDraft(), paymentMethod: "Card", cardNumber: "4000 0000 0000 0002" });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "DECLINED");
  assert.equal(result.state.orders.length, 0);
});

test("organizer sales, capacity, and revenue update from customer purchase", () => {
  const result = buyConcert();
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(eventMetrics(result.state, "harbor-lights-live"), { capacity: 500, sold: 334, available: 166, revenue: 132.68, checkedIn: 0, checkInRate: 0, averageOrderValue: 132.68 });
});

test("ticket transfer updates ownership and preserves history", () => {
  const result = buyConcert();
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const transfer = transferTicket(result.state, result.tickets[1].id, "Lina Saad", "lina@example.test");
  assert.equal(transfer.ok, true);
  assert.equal(transfer.state.tickets.find((ticket) => ticket.id === result.tickets[1].id)!.status, "Transferred");
  assert.equal(transfer.state.transfers[0].recipientName, "Lina Saad");
});

test("transferred, used, and cancelled tickets cannot be transferred again", () => {
  const result = buyConcert();
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const first = transferTicket(result.state, result.tickets[1].id, "Lina Saad", "lina@example.test");
  assert.equal(first.ok, true);
  assert.equal(transferTicket(first.state, result.tickets[1].id, "Other", "other@example.test").ok, false);
  const checked = checkInTicket(result.state, result.tickets[0].id, "harbor-lights-live");
  assert.equal(checked.ok, true);
  assert.equal(transferTicket(checked.state, result.tickets[0].id, "Other", "other@example.test").ok, false);
  assert.equal(transferTicket(createInitialTicketingState(), "TKT-DEMO-CANCELLED", "Other", "other@example.test").ok, false);
});

test("valid check-in changes the same customer ticket to Used and updates attendance", () => {
  const result = buyConcert();
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const checked = checkInTicket(result.state, result.tickets[0].id, "harbor-lights-live");
  assert.equal(checked.ok, true);
  assert.equal(checked.state.tickets.find((ticket) => ticket.id === result.tickets[0].id)!.status, "Used");
  assert.equal(eventMetrics(checked.state, "harbor-lights-live").checkedIn, 1);
});

test("duplicate check-in protection returns ALREADY_USED and does not add history", () => {
  const result = buyConcert();
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const first = checkInTicket(result.state, result.tickets[0].id, "harbor-lights-live");
  assert.equal(first.ok, true);
  const second = checkInTicket(first.state, result.tickets[0].id, "harbor-lights-live");
  assert.equal(second.ok, false);
  assert.equal(second.validation.code, "ALREADY_USED");
  assert.equal(second.state.checkIns.length, 1);
});

test("invalid ticket validation is safe", () => {
  assert.deepEqual(validateTicket(createInitialTicketingState(), "NOT-A-TICKET", "harbor-lights-live"), { code: "INVALID_TICKET" });
});

test("cancelled ticket validation prevents entry", () => {
  assert.equal(validateTicket(createInitialTicketingState(), "TKT-DEMO-CANCELLED", "river-lantern-night").code, "TICKET_CANCELLED");
});

test("wrong-event validation identifies the ticket's relevant event", () => {
  const result = validateTicket(createInitialTicketingState(), "TKT-DEMO-WRONG", "harbor-lights-live");
  assert.equal(result.code, "WRONG_EVENT");
  if (result.code === "WRONG_EVENT") assert.equal(result.event.id, "lumen-movement");
});

test("organizer event cancellation updates customer ticket state", () => {
  const result = buyConcert();
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const cancelled = cancelEvent(result.state, "harbor-lights-live");
  assert.equal(eventById(cancelled, "harbor-lights-live")!.status, "Cancelled");
  assert.ok(result.tickets.every((ticket) => cancelled.tickets.find((item) => item.id === ticket.id)!.status === "Cancelled"));
});

test("sold-out event cannot purchase and accepts a simulated waitlist entry", () => {
  const state = createInitialTicketingState();
  const soldOut = eventById(state, "afterglow-rooftop")!;
  assert.equal(eventAvailability(soldOut), "Sold Out");
  const draft = { ...concertDraft(1), eventId: soldOut.id, sessionId: soldOut.sessions[0].id, lines: [{ key: "entry", ticketTypeId: "entry", quantity: 1 }] };
  assert.equal(validateDraftAvailability(state, draft), false);
  const joined = joinWaitlist(state, soldOut.id, "Nour Khoury", "nour@example.test");
  assert.equal(joined.ok, true);
  assert.equal(joined.state.waitlist.length, 1);
});

test("favorites persist as stable add/remove state", () => {
  const added = toggleFavorite(createInitialTicketingState(), "harbor-lights-live");
  assert.deepEqual(added.favorites, ["harbor-lights-live"]);
  assert.deepEqual(toggleFavorite(added, "harbor-lights-live").favorites, []);
});

test("gift recipient becomes the ticket attendee", () => {
  const draft = concertDraft(1);
  draft.lines[0].giftRecipient = { firstName: "Mira", lastName: "Karam", email: "mira@example.test" };
  const result = completePurchase(createInitialTicketingState(), { draft, paymentMethod: "Digital Wallet" });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.tickets[0].gift, true);
  assert.equal(result.tickets[0].attendee.firstName, "Mira");
});

test("created organizer event and configured ticket type share the same state", () => {
  const created = createOrganizerEvent(createInitialTicketingState(), { title: "New Demo Gathering", category: "Festivals", description: "A complete local demo event.", venue: "Demo Hall", city: "Beirut", date: "October 10", startTime: "6:00 PM", endTime: "10:00 PM", ageRestriction: "All ages", capacity: 120, reservedSeating: false });
  assert.equal(created.event.status, "Draft");
  const configured = configureTicketType(created.state, created.event.id, { id: "vip-new", name: "VIP", description: "Premium access", price: 90, capacity: 20, maxPerOrder: 4, salesStart: "2026-09-01", salesEnd: "2026-10-09" });
  assert.equal(eventById(configured, created.event.id)!.ticketTypes.length, 2);
});

test("persistence reload preserves orders and strips unexpected payment keys", () => {
  const result = buyConcert();
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const raw = JSON.stringify({ ...result.state, cardNumber: "4242", cvv: "123" });
  const loaded = loadTicketingState(raw) as unknown as Record<string, unknown>;
  assert.equal((loaded.orders as unknown[]).length, 1);
  assert.equal("cardNumber" in loaded, false);
  assert.equal("cvv" in loaded, false);
});

test("malformed or incompatible persistence resets safely", () => {
  assert.equal(loadTicketingState("not-json").events.length, 16);
  assert.equal(loadTicketingState(JSON.stringify({ version: 2 })).events.length, 16);
});

test("Reset Demo restores the exact deterministic original state", () => {
  const modified = toggleFavorite(createInitialTicketingState(), "harbor-lights-live");
  assert.notDeepEqual(modified, createInitialTicketingState());
  assert.deepEqual(resetTicketingState(), createInitialTicketingState());
});
