"use client";

import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Download,
  Filter,
  Gift,
  Heart,
  LayoutDashboard,
  ListChecks,
  MapPin,
  Menu,
  Minus,
  Plus,
  QrCode,
  RefreshCcw,
  Search,
  Send,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tickets,
  UserRound,
  Users,
  WalletCards,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { getContactPath, getSitePath } from "@/config/site";
import {
  DEFAULT_FILTERS,
  EVENT_CATEGORIES,
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
  eventStartingPrice,
  filterEvents,
  joinWaitlist,
  loadTicketingState,
  resetTicketingState,
  searchSuggestions,
  seatTicketTypeId,
  ticketCount,
  toggleFavorite,
  transferTicket,
  validateTicket,
  type Attendee,
  type AvailabilityFilter,
  type DateFilter,
  type DraftLine,
  type EventCategory,
  type EventFilters,
  type Order,
  type PurchaseDraft,
  type Ticket,
  type TicketingEvent,
  type TicketingState,
  type ValidationResult,
} from "./ticketing-demo-model";
import styles from "./ticketing-showcase.module.css";

const STORAGE_KEY = "ilbatech-event-ticketing-v2";
const LEGACY_STORAGE_KEY = "ilbatech-virello-ticketing-demo-v1";
const NAVIGATION_KEY = "ilbatech-event-ticketing-navigation-v2";
const LEGACY_NAVIGATION_KEY = "ilbatech-virello-ticketing-navigation-v1";
const EMPTY_ATTENDEE: Attendee = { firstName: "", lastName: "", email: "" };
type Mode = "customer" | "organizer";
type CustomerView = "discover" | "event" | "checkout" | "confirmation" | "tickets" | "orders" | "saved" | "notifications";
type OrganizerView = "dashboard" | "events" | "manage" | "attendees" | "checkin" | "analytics" | "create";
type CheckoutStep = "attendees" | "payment";

const CUSTOMER_VIEW_VALUES: readonly CustomerView[] = ["discover", "event", "checkout", "confirmation", "tickets", "orders", "saved", "notifications"];
const ORGANIZER_VIEW_VALUES: readonly OrganizerView[] = ["dashboard", "events", "manage", "attendees", "checkin", "analytics", "create"];

function isCustomerView(value: unknown): value is CustomerView {
  return typeof value === "string" && CUSTOMER_VIEW_VALUES.includes(value as CustomerView);
}

function isOrganizerView(value: unknown): value is OrganizerView {
  return typeof value === "string" && ORGANIZER_VIEW_VALUES.includes(value as OrganizerView);
}

const CUSTOMER_NAV: readonly { id: CustomerView; label: string; icon: LucideIcon }[] = [
  { id: "discover", label: "Discover", icon: Search },
  { id: "tickets", label: "My Tickets", icon: Tickets },
  { id: "saved", label: "Saved", icon: Heart },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "notifications", label: "Alerts", icon: Bell },
];

const ORGANIZER_NAV: readonly { id: OrganizerView; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "attendees", label: "Attendees", icon: Users },
  { id: "checkin", label: "Check-in", icon: QrCode },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
const attendeeName = (attendee: Attendee) => `${attendee.firstName} ${attendee.lastName}`.trim();

const DIALOG_FOCUS_SELECTOR =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function useAccessibleDialog<T extends HTMLElement = HTMLElement>(
  onClose: () => void,
  open = true,
) {
  const dialogRef = useRef<T>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open || !dialogRef.current) return;

    const dialog = dialogRef.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const focusable = () =>
      Array.from(dialog.querySelectorAll<HTMLElement>(DIALOG_FOCUS_SELECTOR));
    const frame = window.requestAnimationFrame(() => focusable()[0]?.focus());

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }

      if (event.key !== "Tab") return;
      const controls = focusable();
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];

      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open]);

  return dialogRef;
}

export function TicketingShowcase() {
  const [state, setState] = useState<TicketingState>(() => createInitialTicketingState());
  const [hydrated, setHydrated] = useState(false);
  const [mode, setMode] = useState<Mode>("customer");
  const [customerView, setCustomerView] = useState<CustomerView>("discover");
  const [organizerView, setOrganizerView] = useState<OrganizerView>("dashboard");
  const [selectedEventId, setSelectedEventId] = useState("harbor-lights-live");
  const [activeOrganizerEventId, setActiveOrganizerEventId] = useState("harbor-lights-live");
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);
      const restoredState = loadTicketingState(stored);
      setState(restoredState);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);

      try {
        const navigation = JSON.parse(window.sessionStorage.getItem(NAVIGATION_KEY) ?? window.sessionStorage.getItem(LEGACY_NAVIGATION_KEY) ?? "null") as Record<string, unknown> | null;
        if (navigation?.mode === "customer" || navigation?.mode === "organizer") setMode(navigation.mode);
        if (isCustomerView(navigation?.customerView)) setCustomerView(navigation.customerView);
        if (isOrganizerView(navigation?.organizerView)) setOrganizerView(navigation.organizerView);
        if (typeof navigation?.selectedEventId === "string" && restoredState.events.some((event) => event.id === navigation.selectedEventId)) setSelectedEventId(navigation.selectedEventId);
        if (typeof navigation?.activeOrganizerEventId === "string" && restoredState.events.some((event) => event.id === navigation.activeOrganizerEventId)) setActiveOrganizerEventId(navigation.activeOrganizerEventId);
        if (typeof navigation?.lastOrderId === "string" && restoredState.orders.some((order) => order.id === navigation.lastOrderId)) setLastOrderId(navigation.lastOrderId);
        window.sessionStorage.removeItem(LEGACY_NAVIGATION_KEY);
      } catch {
        window.sessionStorage.removeItem(NAVIGATION_KEY);
        window.sessionStorage.removeItem(LEGACY_NAVIGATION_KEY);
      }

      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  useEffect(() => {
    if (!hydrated) return;
    window.sessionStorage.setItem(NAVIGATION_KEY, JSON.stringify({ mode, customerView, organizerView, selectedEventId, activeOrganizerEventId, lastOrderId }));
  }, [activeOrganizerEventId, customerView, hydrated, lastOrderId, mode, organizerView, selectedEventId]);

  function openEvent(eventId: string) {
    setSelectedEventId(eventId);
    setCustomerView("event");
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function chooseCustomerView(view: CustomerView) {
    setCustomerView(view);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function chooseOrganizerView(view: OrganizerView) {
    setOrganizerView(view);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const lastOrder = state.orders.find((order) => order.id === lastOrderId) ?? null;

  return (
    <main className={styles.demo}>
      <a className={styles.skipLink} href="#ticketing-main">Skip to main content</a>
      <header className={styles.topbar}>
        <a className={styles.ilbatech} href={getSitePath("/")} aria-label="Return to ILBATECH">
          <Image src="/brand-mark.webp" width={42} height={42} unoptimized alt="" />
          <span><b>ILBATECH</b><small>Event Ticketing Platform</small></span>
        </a>
        <div className={styles.brand}><span>I</span><strong>ILBATECH</strong></div>
        <div className={styles.modeSwitcher} aria-label="Platform view">
          <button type="button" aria-pressed={mode === "customer"} onClick={() => switchMode("customer")}><UserRound /> Customer</button>
          <button type="button" aria-pressed={mode === "organizer"} onClick={() => switchMode("organizer")}><LayoutDashboard /> Organizer</button>
        </div>
        <button className={styles.menuButton} type="button" aria-label="Toggle navigation" aria-expanded={mobileNav} onClick={() => setMobileNav((value) => !value)}>{mobileNav ? <X /> : <Menu />}</button>
      </header>

      <div className={styles.shell}>
        <aside className={`${styles.sidebar} ${mobileNav ? styles.sidebarOpen : ""}`}>
          <div className={styles.sidebarMode}><span>View</span><strong>{mode === "customer" ? "Customer" : "Organizer"}</strong></div>
          <div className={styles.sidebarMobileSwitch} aria-label="Mobile platform view">
            <button type="button" aria-pressed={mode === "customer"} onClick={() => switchMode("customer")}><UserRound /> Customer</button>
            <button type="button" aria-pressed={mode === "organizer"} onClick={() => switchMode("organizer")}><LayoutDashboard /> Organizer</button>
          </div>
          <nav aria-label={`${mode} navigation`}>
            {(mode === "customer" ? CUSTOMER_NAV : ORGANIZER_NAV).map((item) => {
              const active = mode === "customer" ? customerView === item.id : organizerView === item.id;
              const Icon = item.icon;
              return <button key={item.id} type="button" aria-current={active ? "page" : undefined} onClick={() => mode === "customer" ? chooseCustomerView(item.id as CustomerView) : chooseOrganizerView(item.id as OrganizerView)}><Icon /><span>{item.label}</span>{item.id === "tickets" && customerTicketIds(state).length > 0 && <em>{customerTicketIds(state).length}</em>}{item.id === "notifications" && unreadCount(state) > 0 && <em>{unreadCount(state)}</em>}</button>;
            })}
          </nav>
          <div className={styles.sidebarFoot}>
            <button type="button" onClick={() => setResetOpen(true)}><RefreshCcw /> Reset Data</button>
            <a href={getSitePath("/work")}><ArrowLeft /> ILBATECH Work</a>
          </div>
        </aside>

        <div id="ticketing-main" className={styles.content}>
          {mode === "customer" ? (
            <CustomerExperience
              state={state}
              setState={setState}
              view={customerView}
              setView={chooseCustomerView}
              selectedEventId={selectedEventId}
              openEvent={openEvent}
              lastOrder={lastOrder}
              setLastOrderId={setLastOrderId}
            />
          ) : (
            <OrganizerExperience
              state={state}
              setState={setState}
              view={organizerView}
              setView={chooseOrganizerView}
              activeEventId={activeOrganizerEventId}
              setActiveEventId={setActiveOrganizerEventId}
            />
          )}
          <footer className={styles.demoFooter}>
            <div><Sparkles /><span><b>ILBATECH</b><small>Event Ticketing Platform</small></span></div>
            <a href={getContactPath("Website Development")}>Discuss a ticketing platform <ArrowRight /></a>
          </footer>
        </div>
      </div>

      {resetOpen && <ConfirmDialog title="Reset data to its original state?" text="This restores events, sales, tickets, transfers, check-ins, favorites, waitlists, notifications, and organizer changes." confirm="Reset data" onClose={() => setResetOpen(false)} onConfirm={() => { setState(resetTicketingState()); setCustomerView("discover"); setOrganizerView("dashboard"); setSelectedEventId("harbor-lights-live"); setActiveOrganizerEventId("harbor-lights-live"); setLastOrderId(null); setResetOpen(false); }} />}
    </main>
  );
}

function CustomerExperience({ state, setState, view, setView, selectedEventId, openEvent, lastOrder, setLastOrderId }: { state: TicketingState; setState: (state: TicketingState) => void; view: CustomerView; setView: (view: CustomerView) => void; selectedEventId: string; openEvent: (id: string) => void; lastOrder: Order | null; setLastOrderId: (id: string | null) => void }) {
  if (view === "event") return <EventDetail state={state} setState={setState} eventId={selectedEventId} back={() => setView("discover")} checkout={() => setView("checkout")} />;
  if (view === "checkout") return <Checkout state={state} setState={setState} back={() => setView("event")} confirmed={(orderId) => { setLastOrderId(orderId); setView("confirmation"); }} />;
  if (view === "confirmation") return <Confirmation state={state} order={lastOrder ?? state.orders[0] ?? null} viewTickets={() => setView("tickets")} browse={() => setView("discover")} />;
  if (view === "tickets") return <MyTickets state={state} setState={setState} openEvent={openEvent} />;
  if (view === "orders") return <Orders state={state} viewTickets={() => setView("tickets")} />;
  if (view === "saved") return <SavedEvents state={state} setState={setState} openEvent={openEvent} />;
  if (view === "notifications") return <Notifications state={state} setState={setState} />;
  return <Discover state={state} setState={setState} openEvent={openEvent} />;
}

function Discover({ state, setState, openEvent }: { state: TicketingState; setState: (state: TicketingState) => void; openEvent: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<EventFilters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const activeFilter = query.trim() || JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);
  const results = filterEvents(state.events, query, filters);
  const suggestions = query.trim() ? searchSuggestions(state.events, query) : [];
  const availableEvents = state.events.filter((event) => event.status !== "Draft" && event.status !== "Completed");

  function commitSearch(value = query) {
    setQuery(value);
    setState(addRecentSearch(state, value));
    setSearchFocused(false);
  }

  return <>
    <section className={styles.discoveryHero}>
      <div>
        <span className={styles.eyebrow}><Sparkles /> Events</span>
        <h1>Find events and <em>book tickets.</em></h1>
        <p>Search by category, date, location, or price. Your bookings stay in My Tickets.</p>
        <div className={styles.heroSearch}>
          <Search />
          <input aria-label="Search events" value={query} onFocus={() => setSearchFocused(true)} onChange={(event) => { setQuery(event.target.value); setSearchFocused(true); }} onKeyDown={(event) => { if (event.key === "Enter") commitSearch(); }} placeholder="Search events, venues, cities..." />
          {query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")}><X /></button>}
          <button type="button" onClick={() => commitSearch()}>Search</button>
          {searchFocused && (suggestions.length > 0 || state.recentSearches.length > 0) && <div className={styles.suggestions}>
            {suggestions.length > 0 ? suggestions.map((item) => <button type="button" key={item.id} onMouseDown={(event) => event.preventDefault()} onClick={() => { commitSearch(item.label); openEvent(item.id); }}><Search /><span><b>{item.label}</b><small>{item.meta}</small></span><ArrowRight /></button>) : <><small>Recent searches</small>{state.recentSearches.map((item) => <button type="button" key={item} onMouseDown={(event) => event.preventDefault()} onClick={() => commitSearch(item)}><Clock3 /><span><b>{item}</b></span></button>)}</>}
          </div>}
        </div>
        <div className={styles.quickSearch}><span>Popular:</span>{["music", "This Weekend", "family"].map((item) => <button type="button" key={item} onClick={() => item === "This Weekend" ? setFilters({ ...filters, date: "This Weekend" }) : commitSearch(item)}>{item}</button>)}</div>
      </div>
      <article className={styles.heroEvent}>
        <Image src="/images/events/music.webp" width={1440} height={960} unoptimized priority loading="eager" alt="Live concert inside a contemporary hall" />
        <div><span>Editor&apos;s pick · This weekend</span><h2>Harbor Lights Live</h2><p><CalendarDays /> Saturday, September 5 · 8:00 PM</p><p><MapPin /> The Lantern Hall · Beirut</p><button type="button" onClick={() => openEvent("harbor-lights-live")}>Get Tickets <ArrowRight /></button></div>
      </article>
    </section>

    <section className={styles.categoryRail} aria-label="Event categories">
      {EVENT_CATEGORIES.map((category) => <button type="button" key={category} aria-pressed={filters.category === category} onClick={() => setFilters({ ...filters, category: filters.category === category ? "All" : category })}><CategoryIcon category={category} /><span>{category}</span></button>)}
    </section>

    <section className={styles.filterBar}>
      <div><span>{activeFilter ? `${results.length} matching events` : "Popular events"}</span><h2>{activeFilter ? "Search results" : "Browse events"}</h2></div>
      <button type="button" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((value) => !value)}><Filter /> Filters{activeFilter && <em />}</button>
      {filtersOpen && <div className={styles.filterPanel}>
        <label><span>Category</span><select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value as EventFilters["category"] })}><option>All</option>{EVENT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
        <label><span>Date</span><select value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value as DateFilter })}>{["Any date", "Today", "Tomorrow", "This Weekend", "This Week", "This Month"].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Location</span><select value={filters.city} onChange={(event) => setFilters({ ...filters, city: event.target.value })}><option>All</option>{[...new Set(state.events.map((item) => item.city))].sort().map((city) => <option key={city}>{city}</option>)}</select></label>
        <label><span>Maximum price · {money(filters.maxPrice)}</span><input type="range" min="10" max="150" step="5" value={filters.maxPrice} onChange={(event) => setFilters({ ...filters, maxPrice: Number(event.target.value) })} /></label>
        <label><span>Availability</span><select value={filters.availability} onChange={(event) => setFilters({ ...filters, availability: event.target.value as AvailabilityFilter })}>{["Any availability", "Available", "Limited", "Sold Out"].map((item) => <option key={item}>{item}</option>)}</select></label>
        <button type="button" onClick={() => { setFilters(DEFAULT_FILTERS); setQuery(""); }}>Clear all</button>
      </div>}
    </section>

    {activeFilter ? <EventGrid events={results} state={state} setState={setState} openEvent={openEvent} empty="No events match those filters." /> : <>
      <EventSection title="Featured Events" subtitle="Selected events" events={availableEvents.filter((event) => event.featured).slice(0, 5)} state={state} setState={setState} openEvent={openEvent} />
      <EventSection title="This Weekend" subtitle="Plans for Friday through Sunday" events={availableEvents.filter((event) => event.dateBuckets.includes("This Weekend")).slice(0, 5)} state={state} setState={setState} openEvent={openEvent} />
      <EventSection title="Popular Near You" subtitle="Most booked" events={availableEvents.filter((event) => event.popular).slice(0, 5)} state={state} setState={setState} openEvent={openEvent} />
      <EventSection title="New Events" subtitle="Recently added" events={availableEvents.filter((event) => event.newEvent).slice(0, 5)} state={state} setState={setState} openEvent={openEvent} />
      <EventSection title="Upcoming Events" subtitle="Later this month" events={availableEvents.slice(5, 15)} state={state} setState={setState} openEvent={openEvent} />
    </>}
  </>;
}

function EventSection({ title, subtitle, events, state, setState, openEvent }: { title: string; subtitle: string; events: TicketingEvent[]; state: TicketingState; setState: (state: TicketingState) => void; openEvent: (id: string) => void }) {
  return <section className={styles.eventSection}><div className={styles.sectionHeading}><div><span>{subtitle}</span><h2>{title}</h2></div><small>{events.length} events</small></div><EventGrid events={events} state={state} setState={setState} openEvent={openEvent} /></section>;
}

function EventGrid({ events, state, setState, openEvent, empty }: { events: TicketingEvent[]; state: TicketingState; setState: (state: TicketingState) => void; openEvent: (id: string) => void; empty?: string }) {
  if (!events.length) return <div className={styles.empty}><Search /><h2>{empty ?? "No events yet"}</h2><p>Try a different search, date, location, or price range.</p></div>;
  return <div className={styles.eventGrid}>{events.map((event) => <EventCard key={event.id} event={event} saved={state.favorites.includes(event.id)} open={() => openEvent(event.id)} favorite={() => setState(toggleFavorite(state, event.id))} />)}</div>;
}

function EventCard({ event, saved, open, favorite }: { event: TicketingEvent; saved: boolean; open: () => void; favorite: () => void }) {
  const currentAvailability = event.status === "Cancelled" ? "Event Cancelled" : eventAvailability(event);
  return <article className={styles.eventCard}>
    <div className={styles.cardImage}><button type="button" aria-label={`Open ${event.title}`} onClick={open}><Image src={event.image} alt={event.imageAlt} width={1440} height={960} unoptimized /></button>{event.badge && <span>{event.badge}</span>}<button className={styles.favorite} type="button" aria-label={`${saved ? "Remove" : "Save"} ${event.title}`} aria-pressed={saved} onClick={favorite}><Heart /></button></div>
    <button className={styles.cardBody} type="button" onClick={open}><small>{event.category}</small><h3>{event.title}</h3><p><CalendarDays /> {event.sessions[0].date} · {event.sessions[0].time}</p><p><MapPin /> {event.venue} · {event.city}</p><div><span>From <b>{money(eventStartingPrice(event))}</b></span><em data-status={currentAvailability}>{currentAvailability}</em></div></button>
  </article>;
}

function EventDetail({ state, setState, eventId, back, checkout }: { state: TicketingState; setState: (state: TicketingState) => void; eventId: string; back: () => void; checkout: () => void }) {
  const event = eventById(state, eventId)!;
  const existing = state.draft?.eventId === event.id ? state.draft : null;
  const [sessionId, setSessionId] = useState(existing?.sessionId ?? event.sessions[0]?.id ?? "");
  const [lines, setLines] = useState<DraftLine[]>(existing?.lines ?? []);
  const [message, setMessage] = useState("");
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const totals = calculateTicketTotals(event, lines);
  const soldOut = eventAvailability(event) === "Sold Out" || event.status === "Sold Out";
  const cancelled = event.status === "Cancelled";

  function persistSelection(nextSessionId: string, nextLines: DraftLine[]) {
    const draft: PurchaseDraft = {
      eventId: event.id,
      sessionId: nextSessionId,
      lines: nextLines,
      promoCode: existing?.promoCode ?? "",
      customerMode: existing?.customerMode ?? "Guest",
      purchaser: existing?.purchaser ?? { firstName: "", lastName: "", email: "", phone: "" },
    };
    setState({ ...state, draft });
  }

  function chooseSession(nextSessionId: string) {
    setSessionId(nextSessionId);
    persistSelection(nextSessionId, lines);
  }

  function updateQuantity(typeId: string, delta: number) {
    const type = event.ticketTypes.find((item) => item.id === typeId)!;
    const current = lines.find((line) => line.ticketTypeId === typeId)?.quantity ?? 0;
    const nextQuantity = Math.max(0, Math.min(type.maxPerOrder, type.capacity - type.sold, current + delta));
    if (current + delta > nextQuantity) setMessage(`Only ${Math.min(type.maxPerOrder, type.capacity - type.sold)} ${type.name} tickets can be selected.`);
    else setMessage("");
    const nextLines = nextQuantity ? [...lines.filter((line) => line.ticketTypeId !== typeId), { key: typeId, ticketTypeId: typeId, quantity: nextQuantity }] : lines.filter((line) => line.ticketTypeId !== typeId);
    setLines(nextLines);
    persistSelection(sessionId, nextLines);
  }

  function toggleSeat(seatId: string) {
    const seat = event.seats.find((item) => item.id === seatId)!;
    if (seat.sold) { setMessage(`${seat.id} is already reserved.`); return; }
    setMessage("");
    const nextLines = lines.some((line) => line.seatId === seatId) ? lines.filter((line) => line.seatId !== seatId) : [...lines, { key: seat.id, ticketTypeId: seatTicketTypeId(seat), quantity: 1, seatId: seat.id }];
    setLines(nextLines);
    persistSelection(sessionId, nextLines);
  }

  function continueToCheckout() {
    if (!sessionId) { setMessage("Choose a date and session to continue."); return; }
    if (!lines.length) { setMessage(event.reservedSeating ? "Select at least one available seat." : "Select at least one ticket."); return; }
    persistSelection(sessionId, lines);
    checkout();
  }

  return <>
    <button className={styles.backButton} type="button" onClick={back}><ArrowLeft /> Back to events</button>
    <section className={styles.detailHero}>
      <Image src={event.image} width={1440} height={960} unoptimized priority alt={event.imageAlt} />
      <div><span>{event.category} · {event.status}</span><h1>{event.title}</h1><p>{event.description}</p><dl><div><dt><CalendarDays /> Date</dt><dd>{event.sessions[0].date}</dd></div><div><dt><MapPin /> Venue</dt><dd>{event.venue} · {event.city}</dd></div><div><dt><Users /> Organizer</dt><dd>{event.organizer}</dd></div><div><dt><ShieldCheck /> Admission</dt><dd>{event.ageRestriction}</dd></div></dl></div>
      <button className={styles.favoriteHero} type="button" aria-label={`${state.favorites.includes(event.id) ? "Remove from" : "Add to"} saved events`} aria-pressed={state.favorites.includes(event.id)} onClick={() => setState(toggleFavorite(state, event.id))}><Heart /></button>
    </section>

    <div className={styles.detailLayout}>
      <div className={styles.ticketBuilder}>
        <section className={styles.builderSection}><div className={styles.stepTitle}><span>1</span><div><small>Choose your session</small><h2>Select a date and time</h2></div></div><div className={styles.sessionGrid}>{event.sessions.map((item) => <button type="button" key={item.id} aria-pressed={sessionId === item.id} onClick={() => chooseSession(item.id)}><CalendarDays /><span><b>{item.label.split(" — ")[0]}</b><small>{item.date} · {item.time}</small></span>{sessionId === item.id && <Check />}</button>)}</div></section>
        <section className={styles.builderSection}><div className={styles.stepTitle}><span>2</span><div><small>{event.reservedSeating ? "Reserved seating" : "General admission"}</small><h2>{event.reservedSeating ? "Choose your seats" : "Choose ticket types"}</h2></div></div>
          {event.reservedSeating ? <SeatMap event={event} lines={lines} toggle={toggleSeat} /> : <div className={styles.ticketTypes}>{event.ticketTypes.map((type) => { const quantity = lines.find((line) => line.ticketTypeId === type.id)?.quantity ?? 0; const remaining = type.capacity - type.sold; return <article key={type.id}><div><span><b>{type.name}</b><small>{type.description}</small></span><strong>{money(type.price)}</strong></div><div><small>{remaining <= 10 ? `Only ${remaining} remaining` : `${remaining} available`} · Max {type.maxPerOrder}</small><Quantity value={quantity} decrement={() => updateQuantity(type.id, -1)} increment={() => updateQuantity(type.id, 1)} disableIncrement={quantity >= Math.min(type.maxPerOrder, remaining)} /></div></article>; })}</div>}
        </section>
        <section className={styles.venueInfo}><div><MapPin /></div><span><small>Venue information</small><h2>{event.venue}</h2><p>{event.city} · Doors open 60 minutes before the selected session.</p></span></section>
        <section className={styles.policies}><h2>Good to know</h2><ul>{event.policies.map((policy) => <li key={policy}><Check /> {policy}</li>)}</ul></section>
      </div>
      <aside className={styles.orderSummary}>
        <span>Your selection</span><h2>{lines.length ? `${ticketCount(lines)} ticket${ticketCount(lines) === 1 ? "" : "s"}` : "Choose your tickets"}</h2>
        <div className={styles.summaryEvent}><Image src={event.image} width={1440} height={960} unoptimized alt="" /><span><b>{event.title}</b><small>{event.sessions.find((item) => item.id === sessionId)?.label}</small></span></div>
        {lines.length > 0 && <div className={styles.lineItems}>{lines.map((line) => <div key={line.key}><span>{line.seatId ? `Seat ${line.seatId}` : `${line.quantity} × ${event.ticketTypes.find((item) => item.id === line.ticketTypeId)?.name}`}</span><b>{money(line.seatId ? event.seats.find((seat) => seat.id === line.seatId)!.price : event.ticketTypes.find((item) => item.id === line.ticketTypeId)!.price * line.quantity)}</b></div>)}</div>}
        <div className={styles.summaryTotal}><span>Ticket subtotal</span><strong>{money(totals.subtotal)}</strong></div>
        {message && <p className={styles.inlineError} role="status">{message}</p>}
        {cancelled ? <div className={styles.unavailable}><X /><b>Event Cancelled</b><span>Ticket sales are closed. No payment or refund is processed.</span></div> : soldOut ? <><div className={styles.unavailable}><Tickets /><b>Sold Out</b><span>Join the waitlist for availability updates.</span></div><button className={styles.primary} type="button" onClick={() => setWaitlistOpen(true)}>Join Waitlist</button></> : <button className={styles.primary} type="button" onClick={continueToCheckout} disabled={!lines.length}>Continue to checkout <ArrowRight /></button>}
        <small className={styles.safeNote}><ShieldCheck /> Pricing, availability, and checkout are simulated locally.</small>
      </aside>
    </div>
    {waitlistOpen && <WaitlistDialog event={event} state={state} setState={setState} close={() => setWaitlistOpen(false)} />}
  </>;
}

function SeatMap({ event, lines, toggle }: { event: TicketingEvent; lines: DraftLine[]; toggle: (seatId: string) => void }) {
  return (
    <div className={styles.seatMapWrap}>
      <div className={styles.seatLegend}>
        <span>
          <i data-seat="available" /> Available
        </span>
        <span>
          <i data-seat="selected" /> Selected
        </span>
        <span>
          <i data-seat="sold" /> Reserved
        </span>
        <span>
          <i data-seat="accessible" /> Accessible
        </span>
      </div>
      <p className={styles.seatScrollHint}>Swipe horizontally to view every seat.</p>
      <div className={styles.seatMapScroll}>
        <div className={styles.seatMap}>
          <div className={styles.stage}>
            <span>STAGE</span>
          </div>
          {["A", "B", "C", "D", "E"].map((row) => (
            <div className={styles.seatRow} key={row}>
              <b>{row}</b>
              <div>
                {event.seats
                  .filter((seat) => seat.row === row)
                  .map((seat) => {
                    const selected = lines.some((line) => line.seatId === seat.id);
                    return (
                      <button type="button" key={seat.id} data-seat={seat.sold ? "sold" : selected ? "selected" : seat.accessible ? "accessible" : "available"} aria-label={`Seat ${seat.id}, ${seat.section}, ${money(seat.price)}${seat.sold ? ", reserved" : seat.accessible ? ", accessible" : ""}`} aria-pressed={selected} disabled={seat.sold} onClick={() => toggle(seat.id)}>
                        {seat.number}
                        {seat.accessible && <span>♿</span>}
                      </button>
                    );
                  })}
              </div>
              <b>{row}</b>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.sectionPrices}>
        <span>
          <i /> Front · {money(120)}
        </span>
        <span>
          <i /> Middle · {money(80)}
        </span>
        <span>
          <i /> Rear · {money(50)}
        </span>
      </div>
    </div>
  );
}

function Checkout({ state, setState, back, confirmed }: { state: TicketingState; setState: (state: TicketingState) => void; back: () => void; confirmed: (orderId: string) => void }) {
  const originalDraft = state.draft;
  const event = originalDraft ? eventById(state, originalDraft.eventId) : null;
  const [step, setStep] = useState<CheckoutStep>("attendees");
  const [purchaser, setPurchaser] = useState(originalDraft?.purchaser ?? { firstName: "", lastName: "", email: "", phone: "" });
  const [usePurchaser, setUsePurchaser] = useState(true);
  const initialCount = originalDraft ? ticketCount(originalDraft.lines) : 0;
  const [attendees, setAttendees] = useState<Attendee[]>(Array.from({ length: initialCount }, () => ({ ...EMPTY_ATTENDEE })));
  const [giftIndexes, setGiftIndexes] = useState<number[]>([]);
  const [promo, setPromo] = useState(originalDraft?.promoCode ?? "");
  const [promoMessage, setPromoMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Card" | "Digital Wallet">("Card");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const paymentDraftRef = useRef<PurchaseDraft | null>(null);

  if (!originalDraft || !event) return <div className={styles.empty}><ShoppingBag /><h1>No tickets selected</h1><p>Choose an event and tickets before checkout.</p><button type="button" onClick={back}>Browse events</button></div>;

  const expandedLines = originalDraft.lines.flatMap((line) => Array.from({ length: line.quantity }, (_, index) => ({ ...line, key: `${line.key}-${index}`, quantity: 1 })));
  const checkoutLines = expandedLines.map((line, index) => ({ ...line, attendee: usePurchaser ? purchaser : attendees[index], ...(giftIndexes.includes(index) ? { giftRecipient: attendees[index] } : {}) }));
  const draft = { ...originalDraft, lines: checkoutLines, purchaser, promoCode: promo.trim().toUpperCase() };
  const totals = calculateTicketTotals(event, checkoutLines, promo);
  const session = event.sessions.find((item) => item.id === originalDraft.sessionId)!;

  function updateAttendee(index: number, field: keyof Attendee, value: string) {
    setAttendees((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  }

  function applyPromo() {
    const code = promo.trim().toUpperCase();
    if (code === "EVENT10") setPromoMessage("EVENT10 applied · 10% off tickets.");
    else if (code === "WELCOME5" && totals.subtotal >= 25) setPromoMessage("WELCOME5 applied · $5 off.");
    else setPromoMessage("That code is invalid or not eligible for this order.");
  }

  function continueToPayment(eventForm: FormEvent) {
    eventForm.preventDefault();
    if (!purchaser.firstName || !purchaser.lastName || !purchaser.email || !purchaser.phone) return;
    if (!usePurchaser && attendees.some((item) => !item.firstName || !item.lastName || !item.email)) return;
    paymentDraftRef.current = draft;
    setState({ ...state, draft });
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function pay(eventForm: FormEvent) {
    eventForm.preventDefault();
    setPaymentError("");
    if (paymentMethod === "Card" && (!card.name || !card.expiry || card.cvv.length < 3)) { setPaymentError("Complete the test card fields to continue."); return; }
    setProcessing(true);
    const purchaseDraft = paymentDraftRef.current ?? draft;
    window.setTimeout(() => {
      const result = completePurchase(state, { draft: purchaseDraft, paymentMethod, ...(paymentMethod === "Card" ? { cardNumber: card.number } : {}) });
      setProcessing(false);
      if (!result.ok) { setPaymentError(result.message); return; }
      setCard({ number: "", expiry: "", cvv: "", name: "" });
      setState(result.state);
      confirmed(result.order.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 700);
  }

  return <>
    <button className={styles.backButton} type="button" onClick={step === "payment" ? () => setStep("attendees") : back}><ArrowLeft /> {step === "payment" ? "Attendee details" : "Ticket selection"}</button>
    <div className={styles.checkoutHeader}><span>Checkout</span><h1>{step === "attendees" ? "Who are the tickets for?" : "Complete payment"}</h1><div><span data-active><Check /> Tickets</span><i /><span data-active><UserRound /> Attendees</span><i /><span data-active={step === "payment"}><WalletCards /> Payment</span></div></div>
    <div className={styles.checkoutLayout}>
      <div className={styles.checkoutPanel}>
        {step === "attendees" ? <form onSubmit={continueToPayment}>
          <FormSection number="1" title="Purchaser details" text="Used for your booking confirmation."><div className={styles.formGrid}><Field label="First name"><input required autoComplete="given-name" value={purchaser.firstName} onChange={(e) => setPurchaser({ ...purchaser, firstName: e.target.value })} placeholder="Dana" /></Field><Field label="Last name"><input required autoComplete="family-name" value={purchaser.lastName} onChange={(e) => setPurchaser({ ...purchaser, lastName: e.target.value })} placeholder="Haddad" /></Field><Field label="Email"><input required type="email" autoComplete="email" value={purchaser.email} onChange={(e) => setPurchaser({ ...purchaser, email: e.target.value })} placeholder="dana@example.test" /></Field><Field label="Phone"><input required type="tel" autoComplete="tel" value={purchaser.phone} onChange={(e) => setPurchaser({ ...purchaser, phone: e.target.value })} placeholder="+961 00 000 000" /></Field></div><label className={styles.accountChoice}><input type="radio" checked={originalDraft.customerMode === "Guest"} readOnly /><span><b>Guest checkout</b><small>Continue without creating an account.</small></span></label></FormSection>
          <FormSection number="2" title={`Attendee information · ${initialCount} ticket${initialCount === 1 ? "" : "s"}`} text="Names appear on the generated digital tickets."><label className={styles.checkbox}><input type="checkbox" checked={usePurchaser} onChange={(e) => setUsePurchaser(e.target.checked)} /><span><b>Use purchaser details for all tickets</b><small>Turn this off to add individual attendees or gifts.</small></span></label>{!usePurchaser && attendees.map((attendee, index) => <article className={styles.attendeeCard} key={index}><div><span>Ticket {index + 1}</span><label><input type="checkbox" checked={giftIndexes.includes(index)} onChange={() => setGiftIndexes((items) => items.includes(index) ? items.filter((item) => item !== index) : [...items, index])} /><Gift /> Gift ticket</label></div><div className={styles.formGrid}><Field label="First name"><input required value={attendee.firstName} onChange={(e) => updateAttendee(index, "firstName", e.target.value)} /></Field><Field label="Last name"><input required value={attendee.lastName} onChange={(e) => updateAttendee(index, "lastName", e.target.value)} /></Field><Field label="Email"><input required type="email" value={attendee.email} onChange={(e) => updateAttendee(index, "email", e.target.value)} /></Field></div></article>)}</FormSection>
          <FormSection number="3" title="Promotion code" text="Try EVENT10 or WELCOME5."><div className={styles.promoBox}><input aria-label="Promotion code" value={promo} onChange={(e) => { setPromo(e.target.value); setPromoMessage(""); }} placeholder="EVENT10" /><button type="button" onClick={applyPromo}>Apply</button></div>{promoMessage && <p className={promoMessage.includes("applied") ? styles.successMessage : styles.inlineError}>{promoMessage}</p>}</FormSection>
          <button className={styles.primary} type="submit">Continue to payment <ArrowRight /></button>
        </form> : <form onSubmit={pay}>
          <div className={styles.demoPayment}><ShieldCheck /><div><span>DEMO PAYMENT</span><b>No money will be charged.</b><p>Use 4242 4242 4242 4242 for success. Use 4000 0000 0000 0002 for a declined payment.</p></div></div>
          <FormSection number="1" title="Payment method" text="Choose a simulated payment method."><div className={styles.paymentMethods}><button type="button" aria-pressed={paymentMethod === "Card"} onClick={() => setPaymentMethod("Card")}><WalletCards /><span><b>Credit / Debit Card</b><small>Test card fields</small></span><Check /></button><button type="button" aria-pressed={paymentMethod === "Digital Wallet"} onClick={() => setPaymentMethod("Digital Wallet")}><Zap /><span><b>Digital Wallet</b><small>Simulated approval</small></span><Check /></button></div></FormSection>
          {paymentMethod === "Card" ? <FormSection number="2" title="Test card details" text="Card number and CVV stay only in these fields and are never stored."><div className={styles.formGrid}><Field label="Name on card" wide><input required autoComplete="off" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="Alex Morgan" /></Field><Field label="Card number" wide><input required inputMode="numeric" autoComplete="off" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="4242 4242 4242 4242" /></Field><Field label="Expiry"><input required autoComplete="off" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} placeholder="12/30" /></Field><Field label="CVV"><input required inputMode="numeric" autoComplete="off" maxLength={4} value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} placeholder="123" /></Field></div></FormSection> : <div className={styles.walletPanel}><Zap /><h2>Wallet ready</h2><p>Confirm below to simulate an approved digital-wallet payment.</p></div>}
          {paymentError && <p className={styles.paymentError} role="alert"><X /> {paymentError}</p>}
          <button className={styles.primary} type="submit" disabled={processing}>{processing ? <><span className={styles.spinner} /> Processing Payment</> : <>Pay {money(totals.total)} <ShieldCheck /></>}</button>
          <p className={styles.architectureNote}><b>Demo payment:</b> card details are not stored, and no charge will be made.</p>
        </form>}
      </div>
      <OrderReview event={event} sessionLabel={`${session.date} · ${session.time}`} lines={checkoutLines} totals={totals} promo={promo} />
    </div>
  </>;
}

function OrderReview({ event, sessionLabel, lines, totals, promo }: { event: TicketingEvent; sessionLabel: string; lines: DraftLine[]; totals: ReturnType<typeof calculateTicketTotals>; promo: string }) {
  return <aside className={styles.checkoutSummary}><span>Order review</span><div className={styles.summaryEvent}><Image src={event.image} width={1440} height={960} unoptimized alt="" /><span><b>{event.title}</b><small>{event.venue}</small></span></div><dl><div><dt>Date & time</dt><dd>{sessionLabel}</dd></div><div><dt>Tickets</dt><dd>{ticketCount(lines)}</dd></div>{lines.some((line) => line.seatId) && <div><dt>Seats</dt><dd>{lines.map((line) => line.seatId).filter(Boolean).join(", ")}</dd></div>}</dl><div className={styles.totalList}><div><span>Ticket subtotal</span><b>{money(totals.subtotal)}</b></div>{totals.discount > 0 && <div data-discount><span>Discount · {promo.toUpperCase()}</span><b>−{money(totals.discount)}</b></div>}<div><span>Service fee</span><b>{money(totals.serviceFee)}</b></div><div><span>Tax</span><b>{money(totals.tax)}</b></div><div><span>Total</span><b>{money(totals.total)}</b></div></div><small><ShieldCheck /> Totals are shown before payment.</small></aside>;
}

function Confirmation({ state, order, viewTickets, browse }: { state: TicketingState; order: Order | null; viewTickets: () => void; browse: () => void }) {
  if (!order) return <div className={styles.empty}><Tickets /><h1>No recent booking</h1><button type="button" onClick={browse}>Browse events</button></div>;
  const event = eventById(state, order.eventId)!;
  const session = event.sessions.find((item) => item.id === order.sessionId)!;
  const tickets = state.tickets.filter((ticket) => order.ticketIds.includes(ticket.id));
  return <section className={styles.confirmation}><div className={styles.confirmIcon}><Check /></div><span>BOOKING CONFIRMED</span><h1>Your booking is confirmed.</h1><p>Order {order.id}</p><div className={styles.confirmCard}><Image src={event.image} width={1440} height={960} unoptimized alt={event.imageAlt} /><div><small>{event.category}</small><h2>{event.title}</h2><p><CalendarDays /> {session.date} · {session.time}</p><p><MapPin /> {event.venue} · {event.city}</p><dl><div><dt>Tickets</dt><dd>{tickets.length}</dd></div><div><dt>Amount</dt><dd>{money(order.total)}</dd></div><div><dt>Payment</dt><dd>{order.paymentMethod} · Simulated</dd></div><div><dt>Purchaser</dt><dd>{attendeeName(order.purchaser)}</dd></div></dl></div></div><div className={styles.confirmTickets}>{tickets.map((ticket) => <div key={ticket.id}><MiniQr payload={ticket.qrPayload} /><span><b>{ticket.id}</b><small>{ticket.seatId ? `Seat ${ticket.seatId}` : event.ticketTypes.find((type) => type.id === ticket.ticketTypeId)?.name}</small></span></div>)}</div><div className={styles.confirmActions}><button className={styles.primary} type="button" onClick={viewTickets}>View Tickets <ArrowRight /></button><button type="button" onClick={() => downloadOrder(state, order)}>Download Tickets <Download /></button><button type="button" onClick={browse}>Continue Browsing</button></div><p className={styles.safeNote}><ShieldCheck /> QR codes contain only ticket and event identifiers. These tickets are not valid for admission.</p></section>;
}

function MyTickets({ state, setState, openEvent }: { state: TicketingState; setState: (state: TicketingState) => void; openEvent: (id: string) => void }) {
  const ticketIds = customerTicketIds(state);
  const customerTickets = state.tickets.filter((ticket) => ticketIds.includes(ticket.id));
  const upcoming = customerTickets.filter((ticket) => !["Completed"].includes(eventById(state, ticket.eventId)?.status ?? ""));
  const past = customerTickets.filter((ticket) => eventById(state, ticket.eventId)?.status === "Completed");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const selectedTicket = state.tickets.find((ticket) => ticket.id === selectedTicketId) ?? null;
  return <section><PageHeading eyebrow="Tickets" title="My Tickets" text="Open a ticket to show its QR code, transfer it when eligible, or download a copy." /><div className={styles.ticketTabs}><span>Upcoming <b>{upcoming.length}</b></span><span>Past <b>{past.length}</b></span></div>{upcoming.length ? <div className={styles.myTicketGrid}>{upcoming.map((ticket) => <TicketCard key={ticket.id} state={state} ticket={ticket} open={() => setSelectedTicketId(ticket.id)} />)}</div> : <div className={styles.empty}><Tickets /><h2>No upcoming tickets</h2><p>Complete checkout to create tickets here.</p><button type="button" onClick={() => openEvent("harbor-lights-live")}>Book Harbor Lights Live</button></div>}{past.length > 0 && <><div className={styles.sectionHeading}><h2>Past events</h2></div><div className={styles.myTicketGrid}>{past.map((ticket) => <TicketCard key={ticket.id} state={state} ticket={ticket} open={() => setSelectedTicketId(ticket.id)} />)}</div></>}{selectedTicket && <TicketDialog state={state} setState={setState} ticket={selectedTicket} close={() => setSelectedTicketId(null)} />}</section>;
}

function TicketCard({ state, ticket, open }: { state: TicketingState; ticket: Ticket; open: () => void }) {
  const event = eventById(state, ticket.eventId)!;
  const session = event.sessions.find((item) => item.id === ticket.sessionId)!;
  return <article className={styles.myTicket}><Image src={event.image} width={1440} height={960} unoptimized alt="" /><div><span><em data-ticket={ticket.status}>{ticket.status}</em>{ticket.gift && <em><Gift /> Gift</em>}</span><h2>{event.title}</h2><p><CalendarDays /> {session.date} · {session.time}</p><p><MapPin /> {event.venue}</p><dl><div><dt>Type</dt><dd>{event.ticketTypes.find((type) => type.id === ticket.ticketTypeId)?.name}</dd></div><div><dt>Seat</dt><dd>{ticket.seatId ?? "General admission"}</dd></div></dl><button type="button" onClick={open}>View Ticket <ArrowRight /></button></div></article>;
}

function TicketDialog({ state, setState, ticket, close }: { state: TicketingState; setState: (state: TicketingState) => void; ticket: Ticket; close: () => void }) {
  const event = eventById(state, ticket.eventId)!;
  const session = event.sessions.find((item) => item.id === ticket.sessionId)!;
  const [transferOpen, setTransferOpen] = useState(false);
  const [recipient, setRecipient] = useState({ name: "", email: "" });
  const [message, setMessage] = useState("");
  const dialogRef = useAccessibleDialog(close);

  async function share() {
    const text = `${event.title} · ${session.date} · Ticket ${ticket.id}`;
    try {
      if (navigator.share) await navigator.share({ title: "ILBATECH ticket", text });
      else {
        await navigator.clipboard.writeText(text);
        setMessage("Safe ticket summary copied to clipboard.");
      }
    } catch {
      setMessage("Sharing was cancelled.");
    }
  }

  function submitTransfer(e: FormEvent) {
    e.preventDefault();
    const result = transferTicket(state, ticket.id, recipient.name, recipient.email);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setState(result.state);
    setMessage(`Transferred to ${recipient.name}.`);
    setTransferOpen(false);
  }

  return (
    <div className={styles.dialogBackdrop} onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <section ref={dialogRef} className={styles.ticketDialog} role="dialog" aria-modal="true" aria-labelledby="digital-ticket-title">
        <button className={styles.dialogClose} type="button" aria-label="Close ticket" onClick={close}>
          <X />
        </button>
        <div className={styles.digitalTicket}>
          <div className={styles.ticketBrand}>
            <span>I</span>
            <b>ILBATECH</b>
            <em data-ticket={ticket.status}>{ticket.status}</em>
          </div>
          <small>{event.category}</small>
          <h2 id="digital-ticket-title">{event.title}</h2>
          <p>
            {session.date} · {session.time}
          </p>
          <p>
            {event.venue} · {event.city}
          </p>
          <div className={styles.qrFrame}>
            <QrVisual payload={ticket.qrPayload} />
            <span>Present this QR code at entry.</span>
          </div>
          <dl>
            <div>
              <dt>Attendee</dt>
              <dd>{attendeeName(ticket.attendee)}</dd>
            </div>
            <div>
              <dt>Ticket</dt>
              <dd>{event.ticketTypes.find((type) => type.id === ticket.ticketTypeId)?.name}</dd>
            </div>
            <div>
              <dt>Seat</dt>
              <dd>{ticket.seatId ?? "General admission"}</dd>
            </div>
            <div>
              <dt>Ticket ID</dt>
              <dd>{ticket.id}</dd>
            </div>
          </dl>
          {ticket.status === "Used" && (
            <p className={styles.usedNotice}>
              <CheckCircle2 /> Checked in {ticket.checkedInAt}
            </p>
          )}
          {ticket.status === "Transferred" && (
            <p className={styles.transferNotice}>
              <Send /> Transferred to {ticket.ownerName}
            </p>
          )}
          {ticket.status === "Cancelled" && (
            <p className={styles.cancelNotice}>
              <X /> This ticket is cancelled and cannot be used.
            </p>
          )}
        </div>
        <div className={styles.ticketActions}>
          <button type="button" onClick={() => downloadTicket(state, ticket)}>
            <Download /> Download
          </button>
          <button type="button" onClick={share}>
            <Share2 /> Share
          </button>
          <button type="button" disabled={ticket.status !== "Valid" || state.transfers.some((item) => item.ticketId === ticket.id)} onClick={() => setTransferOpen((value) => !value)}>
            <Send /> Transfer
          </button>
        </div>
        {transferOpen && (
          <form className={styles.transferForm} onSubmit={submitTransfer}>
            <h3>Transfer this ticket</h3>
            <p>The recipient becomes the ticket owner. This change is saved in this browser, and the ticket cannot be transferred again.</p>
            <Field label="Recipient name">
              <input required value={recipient.name} onChange={(e) => setRecipient({ ...recipient, name: e.target.value })} placeholder="Lina Saad" />
            </Field>
            <Field label="Recipient email">
              <input required type="email" value={recipient.email} onChange={(e) => setRecipient({ ...recipient, email: e.target.value })} placeholder="lina@example.test" />
            </Field>
            <button className={styles.primary} type="submit">
              Confirm Transfer
            </button>
          </form>
        )}
        {message && (
          <p className={styles.dialogMessage} role="status">
            {message}
          </p>
        )}
        <p className={styles.qrSecurity}>QR check-in is simulated in this browser. This ticket is not valid for admission.</p>
      </section>
    </div>
  );
}

function Orders({ state, viewTickets }: { state: TicketingState; viewTickets: () => void }) {
  return <section><PageHeading eyebrow="Customer account" title="Order history" text="Successful simulated payments create an order and its linked tickets. Failed payments create nothing." />{state.orders.length ? <div className={styles.orders}>{state.orders.map((order) => { const event = eventById(state, order.eventId)!; return <article key={order.id}><div><span>{order.id}</span><em>{order.paymentStatus}</em></div><h2>{event.title}</h2><p>{order.purchasedAt}</p><dl><div><dt>Quantity</dt><dd>{order.ticketIds.length}</dd></div><div><dt>Total</dt><dd>{money(order.total)}</dd></div><div><dt>Payment</dt><dd>{order.paymentMethod}</dd></div></dl><div><button type="button" onClick={() => downloadOrder(state, order)}><Download /> View Order</button><button type="button" onClick={viewTickets}>View Tickets <ArrowRight /></button></div></article>; })}</div> : <div className={styles.empty}><ShoppingBag /><h2>No orders yet</h2><p>Completed orders will appear here.</p></div>}</section>;
}

function SavedEvents({ state, setState, openEvent }: { state: TicketingState; setState: (state: TicketingState) => void; openEvent: (id: string) => void }) {
  const events = state.events.filter((event) => state.favorites.includes(event.id));
  return <section><PageHeading eyebrow="Saved events" title="Your saved events" text="Saved events remain in this browser until the data is reset." /><EventGrid events={events} state={state} setState={setState} openEvent={openEvent} empty="No saved events yet." /></section>;
}

function Notifications({ state, setState }: { state: TicketingState; setState: (state: TicketingState) => void }) {
  return <section><PageHeading eyebrow="Notifications & reminders" title="Useful updates, without the noise." text="These are simulated locally—no emails, SMS messages, or push notifications are sent." /><div className={styles.notifications}>{state.notifications.map((notification) => <button type="button" key={notification.id} data-read={notification.read} onClick={() => setState({ ...state, notifications: state.notifications.map((item) => item.id === notification.id ? { ...item, read: true } : item) })}><span>{notification.title.includes("cancel") ? <X /> : notification.title.includes("transfer") ? <Send /> : <Bell />}</span><div><b>{notification.title}</b><p>{notification.message}</p><small>{notification.createdAt}</small></div>{!notification.read && <em />}</button>)}</div></section>;
}

function OrganizerExperience({ state, setState, view, setView, activeEventId, setActiveEventId }: { state: TicketingState; setState: (state: TicketingState) => void; view: OrganizerView; setView: (view: OrganizerView) => void; activeEventId: string; setActiveEventId: (id: string) => void }) {
  const selectEvent = (id: string, nextView: OrganizerView) => { setActiveEventId(id); setView(nextView); };
  if (view === "events") return <OrganizerEvents state={state} selectEvent={selectEvent} create={() => setView("create")} />;
  if (view === "manage") return <ManageEvent state={state} setState={setState} eventId={activeEventId} back={() => setView("events")} attendees={() => setView("attendees")} checkin={() => setView("checkin")} />;
  if (view === "attendees") return <Attendees state={state} setState={setState} eventId={activeEventId} setEventId={setActiveEventId} checkin={() => setView("checkin")} />;
  if (view === "checkin") return <CheckInDesk state={state} setState={setState} eventId={activeEventId} setEventId={setActiveEventId} />;
  if (view === "analytics") return <OrganizerAnalytics state={state} eventId={activeEventId} setEventId={setActiveEventId} />;
  if (view === "create") return <CreateEvent state={state} setState={setState} created={(id) => selectEvent(id, "manage")} cancel={() => setView("events")} />;
  return <OrganizerDashboard state={state} selectEvent={selectEvent} />;
}

function OrganizerDashboard({ state, selectEvent }: { state: TicketingState; selectEvent: (id: string, view: OrganizerView) => void }) {
  const onSale = state.events.filter((event) => event.status === "On Sale");
  const totalSold = onSale.reduce((sum, event) => sum + eventMetrics(state, event.id).sold, 0);
  const totalCapacity = onSale.reduce((sum, event) => sum + eventMetrics(state, event.id).capacity, 0);
  const revenue = state.orders.reduce((sum, order) => sum + order.total, 0);
  const checkedIn = state.tickets.filter((ticket) => ticket.status === "Used").length;
  return <section><div className={styles.organizerWelcome}><div><span>Organizer workspace</span><h1>Good morning, Northline.</h1><p>Sales, capacity, attendees, and door activity stay connected to one shared ticket state.</p></div><button type="button" onClick={() => selectEvent("harbor-lights-live", "checkin")}><QrCode /> Open Check-in</button></div><div className={styles.metricGrid}><Metric icon={CircleDollarSign} label="Revenue" value={money(revenue)} note="Customer orders" /><Metric icon={Tickets} label="Tickets sold" value={totalSold.toLocaleString()} note={`of ${totalCapacity.toLocaleString()} capacity`} /><Metric icon={CheckCircle2} label="Checked in" value={String(checkedIn)} note="Across all events" /><Metric icon={CalendarDays} label="Upcoming events" value={String(onSale.length)} note="Currently on sale" /></div><div className={styles.dashboardGrid}><section className={styles.panel}><PanelTitle eyebrow="Event performance" title="Live sales overview" action="All events" onAction={() => selectEvent("harbor-lights-live", "events")} /><div className={styles.performanceList}>{onSale.slice(0, 6).map((event) => { const metrics = eventMetrics(state, event.id); return <button type="button" key={event.id} onClick={() => selectEvent(event.id, "manage")}><Image src={event.image} width={1440} height={960} unoptimized alt="" /><span><b>{event.title}</b><small>{event.sessions[0].date} · {event.venue}</small><i><em style={{ width: `${Math.round((metrics.sold / metrics.capacity) * 100)}%` }} /></i></span><strong>{metrics.sold}<small>sold</small></strong></button>; })}</div></section><section className={styles.panel}><PanelTitle eyebrow="Recent sales" title="Customer activity" /><div className={styles.activityList}>{state.orders.length ? state.orders.slice(0, 5).map((order) => <div key={order.id}><span><ShoppingBag /></span><p><b>{order.id}</b><small>{eventById(state, order.eventId)?.title} · {order.ticketIds.length} tickets</small></p><strong>{money(order.total)}</strong></div>) : <div className={styles.panelEmpty}><ShoppingBag /><p>Complete a customer checkout to see the sale here.</p></div>}</div></section><section className={styles.panel}><PanelTitle eyebrow="Door activity" title="Recent check-ins" action="Open desk" onAction={() => selectEvent("harbor-lights-live", "checkin")} /><div className={styles.activityList}>{state.checkIns.length ? state.checkIns.slice(0, 5).map((item) => { const ticket = state.tickets.find((ticket) => ticket.id === item.ticketId)!; return <div key={item.id}><span><Check /></span><p><b>{attendeeName(ticket.attendee)}</b><small>{item.ticketId} · {item.gate}</small></p><strong>{item.checkedInAt.split(" · ")[1]}</strong></div>; }) : <div className={styles.panelEmpty}><QrCode /><p>No check-ins yet. Validate a customer ticket at the door.</p></div>}</div></section><section className={`${styles.panel} ${styles.salesChart}`}><PanelTitle eyebrow="Sales over time" title="Last seven days" /><div aria-label="Accessible sales summary: sales increased from 18 to 54 tickets across seven days">{[18, 26, 22, 38, 47, 41, 54].map((value, index) => <span key={index}><i style={{ height: `${value * 2}px` }} /><small>{["M", "T", "W", "T", "F", "S", "S"][index]}</small></span>)}</div></section></div></section>;
}

function OrganizerEvents({ state, selectEvent, create }: { state: TicketingState; selectEvent: (id: string, view: OrganizerView) => void; create: () => void }) {
  const [tab, setTab] = useState<"Upcoming" | "Draft" | "Completed">("Upcoming");
  const events = state.events.filter((event) => tab === "Upcoming" ? ["On Sale", "Sold Out", "Cancelled"].includes(event.status) : tab === "Draft" ? event.status === "Draft" : event.status === "Completed");
  return <section><div className={styles.pageActionHeading}><PageHeading eyebrow="Event management" title="Events" text="Create, edit, configure, and monitor every event from one workspace." /><button className={styles.primary} type="button" onClick={create}><Plus /> Create Event</button></div><div className={styles.tabs}>{(["Upcoming", "Draft", "Completed"] as const).map((item) => <button type="button" key={item} aria-pressed={tab === item} onClick={() => setTab(item)}>{item}<span>{state.events.filter((event) => item === "Upcoming" ? ["On Sale", "Sold Out", "Cancelled"].includes(event.status) : item === "Draft" ? event.status === "Draft" : event.status === "Completed").length}</span></button>)}</div><div className={styles.organizerEvents}>{events.map((event) => { const metrics = eventMetrics(state, event.id); return <article key={event.id}><Image src={event.image} width={1440} height={960} unoptimized alt="" /><div><span><em data-event={event.status}>{event.status}</em>{event.reservedSeating && <em>Reserved seating</em>}</span><h2>{event.title}</h2><p><CalendarDays /> {event.sessions[0].date} · {event.sessions[0].time}</p><p><MapPin /> {event.venue} · {event.city}</p><dl><div><dt>Sold</dt><dd>{metrics.sold}</dd></div><div><dt>Available</dt><dd>{metrics.available}</dd></div><div><dt>Capacity</dt><dd>{metrics.capacity}</dd></div></dl><div><button type="button" onClick={() => selectEvent(event.id, "manage")}>View Event</button><button type="button" onClick={() => selectEvent(event.id, "manage")}>Manage Tickets <ArrowRight /></button></div></div></article>; })}</div></section>;
}

function ManageEvent({ state, setState, eventId, back, attendees, checkin }: { state: TicketingState; setState: (state: TicketingState) => void; eventId: string; back: () => void; attendees: () => void; checkin: () => void }) {
  const event = eventById(state, eventId) ?? state.events[0];
  const metrics = eventMetrics(state, event.id);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const configDialogRef = useAccessibleDialog<HTMLFormElement>(() => setConfigOpen(false), configOpen);
  const [type, setType] = useState({
    name: "",
    price: "",
    capacity: "",
    max: "6",
    salesStart: "2026-09-01",
    salesEnd: "2026-10-30",
  });

  function addType(e: FormEvent) {
    e.preventDefault();
    const id = `${type.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${event.ticketTypes.length + 1}`;
    setState(
      configureTicketType(state, event.id, {
        id,
        name: type.name,
        description: "Configured in Organizer View",
        price: Number(type.price),
        capacity: Number(type.capacity),
        maxPerOrder: Number(type.max),
        salesStart: type.salesStart,
        salesEnd: type.salesEnd,
      }),
    );
    setConfigOpen(false);
  }

  return (
    <section>
      <button className={styles.backButton} type="button" onClick={back}>
        <ArrowLeft /> Event overview
      </button>
      <div className={styles.manageHero}>
        <Image src={event.image} width={1440} height={960} unoptimized alt="" />
        <div>
          <span>
            <em data-event={event.status}>{event.status}</em>
            {event.reservedSeating && <em>Reserved seating</em>}
          </span>
          <h1>{event.title}</h1>
          <p>
            {event.sessions[0].date} · {event.venue}, {event.city}
          </p>
          <div>
            <button type="button" onClick={attendees}>
              <Users /> Attendee List
            </button>
            <button type="button" onClick={checkin}>
              <QrCode /> Check-in
            </button>
            {event.status !== "Cancelled" && (
              <button type="button" onClick={() => setCancelOpen(true)}>
                <X /> Cancel Event
              </button>
            )}
          </div>
        </div>
      </div>
      <div className={styles.metricGrid}>
        <Metric icon={CircleDollarSign} label="Gross sales" value={money(metrics.revenue)} note="Customer orders" />
        <Metric icon={Tickets} label="Tickets sold" value={String(metrics.sold)} note={`of ${metrics.capacity}`} />
        <Metric icon={Activity} label="Available" value={String(metrics.available)} note="Remaining capacity" />
        <Metric icon={CheckCircle2} label="Check-in rate" value={`${metrics.checkInRate}%`} note={`${metrics.checkedIn} checked in`} />
      </div>
      <div className={styles.manageGrid}>
        <section className={styles.panel}>
          <PanelTitle eyebrow="Ticket configuration" title="Inventory by ticket type" action="Add ticket type" onAction={() => setConfigOpen(true)} />
          <div className={styles.ticketBreakdown}>
            {event.ticketTypes.map((item) => (
              <div key={item.id}>
                <span>
                  <b>{item.name}</b>
                  <small>
                    {money(item.price)} · max {item.maxPerOrder}/order
                  </small>
                </span>
                <i>
                  <em
                    style={{
                      width: `${Math.round((item.sold / item.capacity) * 100)}%`,
                    }}
                  />
                </i>
                <strong>
                  {item.sold} / {item.capacity}
                </strong>
              </div>
            ))}
          </div>
          <p className={styles.chartText}>
            Total capacity {metrics.capacity}; sold {metrics.sold}; available {metrics.available}. Figures are based on current ticket sales and capacity.
          </p>
        </section>
        <section className={styles.panel}>
          <PanelTitle eyebrow="Admission model" title={event.reservedSeating ? "Reserved seating" : "General admission"} />
          <div className={styles.admissionConcept}>
            {event.reservedSeating ? (
              <>
                <QrCode />
                <h3>Assigned seats enabled</h3>
                <p>Front, middle, and rear pricing zones are configured. Accessible seats are identified on the customer map.</p>
                <div>
                  <span>Front · {money(120)}</span>
                  <span>Middle · {money(80)}</span>
                  <span>Rear · {money(50)}</span>
                </div>
              </>
            ) : (
              <>
                <Tickets />
                <h3>Capacity by ticket type</h3>
                <p>Customers select quantities without a seat map. Inventory is protected per ticket type and maximum order size.</p>
              </>
            )}
          </div>
        </section>
        <section className={styles.panel}>
          <PanelTitle eyebrow="Session performance" title="Sales by date" />
          <div className={styles.sessionSales}>
            {event.sessions.map((item, index) => (
              <div key={item.id}>
                <span>
                  <b>{item.label}</b>
                  <small>{item.date}</small>
                </span>
                <strong>{Math.max(0, Math.round(metrics.sold / event.sessions.length) + (index === 1 ? 4 : 0))} sold</strong>
              </div>
            ))}
          </div>
        </section>
        <section className={`${styles.panel} ${styles.salesChart}`}>
          <PanelTitle eyebrow="Sales momentum" title="Tickets over time" />
          <div aria-label="Accessible summary: steady ticket sales across seven periods">
            {[22, 31, 28, 48, 42, 61, 73].map((value, index) => (
              <span key={index}>
                <i style={{ height: `${value * 1.5}px` }} />
                <small>P{index + 1}</small>
              </span>
            ))}
          </div>
        </section>
      </div>
      {configOpen && (
        <div className={styles.dialogBackdrop} onMouseDown={(e) => e.target === e.currentTarget && setConfigOpen(false)}>
          <form ref={configDialogRef} className={styles.formDialog} role="dialog" aria-modal="true" aria-labelledby="ticket-configuration-title" onSubmit={addType}>
            <button className={styles.dialogClose} type="button" aria-label="Close ticket configuration" onClick={() => setConfigOpen(false)}>
              <X />
            </button>
            <span>Ticket configuration</span>
            <h2 id="ticket-configuration-title">Add ticket type</h2>
            <div className={styles.formGrid}>
              <Field label="Ticket name" wide>
                <input required value={type.name} onChange={(e) => setType({ ...type, name: e.target.value })} placeholder="VIP" />
              </Field>
              <Field label="Price">
                <input required type="number" min="0" value={type.price} onChange={(e) => setType({ ...type, price: e.target.value })} />
              </Field>
              <Field label="Capacity">
                <input required type="number" min="1" value={type.capacity} onChange={(e) => setType({ ...type, capacity: e.target.value })} />
              </Field>
              <Field label="Maximum per order">
                <input required type="number" min="1" value={type.max} onChange={(e) => setType({ ...type, max: e.target.value })} />
              </Field>
              <Field label="Sales start">
                <input required type="date" value={type.salesStart} onChange={(e) => setType({ ...type, salesStart: e.target.value })} />
              </Field>
              <Field label="Sales end">
                <input required type="date" value={type.salesEnd} onChange={(e) => setType({ ...type, salesEnd: e.target.value })} />
              </Field>
            </div>
            <button className={styles.primary} type="submit">
              Save Ticket Type
            </button>
          </form>
        </div>
      )}
      {cancelOpen && (
        <ConfirmDialog
          title={`Cancel ${event.title}?`}
          text="Customer tickets will change to Cancelled immediately. No refund is issued because payment is simulated."
          confirm="Cancel event"
          onClose={() => setCancelOpen(false)}
          onConfirm={() => {
            setState(cancelEvent(state, event.id));
            setCancelOpen(false);
          }}
        />
      )}
    </section>
  );
}

function Attendees({ state, setState, eventId, setEventId, checkin }: { state: TicketingState; setState: (state: TicketingState) => void; eventId: string; setEventId: (id: string) => void; checkin: () => void }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | Ticket["status"]>("All");
  const event = eventById(state, eventId)!;
  const tickets = state.tickets.filter((ticket) => ticket.eventId === event.id).filter((ticket) => status === "All" || ticket.status === status).filter((ticket) => [attendeeName(ticket.attendee), ticket.attendee.email, ticket.id, ticket.orderId].join(" ").toLowerCase().includes(query.toLowerCase()));
  function quickCheck(ticket: Ticket) { const result = checkInTicket(state, ticket.id, event.id); if (result.ok) setState(result.state); }
  return <section><PageHeading eyebrow="Attendee management" title="Attendee list" text="Search by name, email, ticket ID, or order, then validate eligible entry." /><EventSelect state={state} value={eventId} setValue={setEventId} /><div className={styles.tableTools}><label><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search attendees, tickets, orders..." /></label><select aria-label="Filter attendee status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>{["All", "Valid", "Transferred", "Used", "Cancelled"].map((item) => <option key={item}>{item}</option>)}</select><button type="button" onClick={checkin}><QrCode /> Open Check-in</button></div><div className={styles.tableWrap}><table><thead><tr><th>Attendee</th><th>Ticket</th><th>Type / Seat</th><th>Order</th><th>Status</th><th>Check-In</th></tr></thead><tbody>{tickets.map((ticket) => <tr key={ticket.id}><td data-label="Attendee"><b>{attendeeName(ticket.attendee)}</b><small>{ticket.attendee.email}</small></td><td data-label="Ticket"><code>{ticket.id}</code></td><td data-label="Type / Seat">{event.ticketTypes.find((type) => type.id === ticket.ticketTypeId)?.name}<small>{ticket.seatId ? `Seat ${ticket.seatId}` : "General admission"}</small></td><td data-label="Order">{ticket.orderId}</td><td data-label="Status"><em data-ticket={ticket.status}>{ticket.status}</em></td><td data-label="Check-In"><button type="button" disabled={!(["Valid", "Transferred"] as Ticket["status"][]).includes(ticket.status)} onClick={() => quickCheck(ticket)}>{ticket.status === "Used" ? "Checked in" : "Check In"}</button></td></tr>)}</tbody></table>{!tickets.length && <div className={styles.tableEmpty}><Search /><p>No attendees match this event and filter.</p></div>}</div></section>;
}

function CheckInDesk({ state, setState, eventId, setEventId }: { state: TicketingState; setState: (state: TicketingState) => void; eventId: string; setEventId: (id: string) => void }) {
  const event = eventById(state, eventId)!;
  const [ticketId, setTicketId] = useState("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [justCheckedIn, setJustCheckedIn] = useState(false);
  const [manualQuery, setManualQuery] = useState("");
  const eventTickets = state.tickets.filter((ticket) => ticket.eventId === event.id);
  const manualResults = eventTickets.filter((ticket) => [attendeeName(ticket.attendee), ticket.attendee.email, ticket.id, ticket.orderId].join(" ").toLowerCase().includes(manualQuery.toLowerCase())).slice(0, 6);

  function scan(id = ticketId) { setTicketId(id); setJustCheckedIn(false); setValidation(validateTicket(state, id, event.id)); }
  function checkIn() { const result = checkInTicket(state, ticketId, event.id); if (result.ok) { setState(result.state); setValidation({ code: "ALREADY_USED", ticket: result.ticket }); setJustCheckedIn(true); } else { setJustCheckedIn(false); setValidation(result.validation); } }

  return <section><PageHeading eyebrow="Door operations" title="Ticket check-in" text="Use ticket lookup or manual attendee search. Camera scanning is not enabled." /><EventSelect state={state} value={eventId} setValue={(id) => { setEventId(id); setValidation(null); setJustCheckedIn(false); setTicketId(""); }} /><div className={styles.checkinLayout}><section className={styles.scanner}><div className={styles.scannerTop}><span><QrCode /></span><div><small>Ticket lookup</small><h2>Scan Ticket</h2></div><em>Gate device · North Gate</em></div><div className={styles.scanWindow}><i /><QrCode /><span>Enter or select a test ticket ID</span></div><label><span>Ticket ID / QR identifier</span><div><input value={ticketId} onChange={(e) => { setTicketId(e.target.value); setValidation(null); setJustCheckedIn(false); }} placeholder="TKT-EV10842-01" /><button type="button" onClick={() => scan()}><Search /> Validate</button></div></label><div className={styles.scanExamples}><span>Try:</span>{eventTickets.slice(-3).map((ticket) => <button type="button" key={ticket.id} onClick={() => scan(ticket.id)}>{ticket.id}</button>)}<button type="button" onClick={() => scan("TKT-EV10710-01")}>Cancelled</button><button type="button" onClick={() => scan("TKT-EV10711-01")}>Wrong event</button><button type="button" onClick={() => scan("INVALID-QR")}>Invalid</button></div>{validation && <ValidationCard validation={validation} state={state} checkIn={checkIn} checkedIn={justCheckedIn} />}</section><aside className={styles.recentCheckins}><PanelTitle eyebrow="Live door log" title="Recent Check-ins" /><div>{state.checkIns.length ? state.checkIns.slice(0, 7).map((item) => { const ticket = state.tickets.find((ticket) => ticket.id === item.ticketId)!; return <article key={item.id}><span><Check /></span><div><b>{attendeeName(ticket.attendee)}</b><small>{ticket.id} · {item.gate}</small></div><time>{item.checkedInAt.split(" · ")[1]}</time></article>; }) : <div className={styles.panelEmpty}><QrCode /><p>Validated entries will appear here.</p></div>}</div></aside></div><section className={styles.manualSearch}><div><small>Fallback workflow</small><h2>Manual attendee search</h2><p>Search name, email, ticket ID, or order ID.</p></div><label><Search /><input value={manualQuery} onChange={(e) => setManualQuery(e.target.value)} placeholder="Search attendee or ticket..." /></label>{manualQuery && <div>{manualResults.map((ticket) => <button type="button" key={ticket.id} onClick={() => scan(ticket.id)}><span><b>{attendeeName(ticket.attendee)}</b><small>{ticket.attendee.email} · {ticket.orderId}</small></span><em data-ticket={ticket.status}>{ticket.status}</em><ArrowRight /></button>)}</div>}</section></section>;
}

function ValidationCard({ validation, state, checkIn, checkedIn = false }: { validation: ValidationResult; state: TicketingState; checkIn: () => void; checkedIn?: boolean }) {
  const config = checkedIn ? { title: "CHECKED IN", icon: CheckCircle2, tone: "valid", text: "Entry recorded successfully. The ticket is now Used." } : validation.code === "VALID" ? { title: "VALID TICKET", icon: Check, tone: "valid", text: "Ticket is eligible for entry." } : validation.code === "ALREADY_USED" ? { title: "ALREADY USED", icon: RefreshCcw, tone: "used", text: "Duplicate entry has been blocked." } : validation.code === "TICKET_CANCELLED" ? { title: "TICKET CANCELLED", icon: X, tone: "cancelled", text: "Entry is not permitted." } : validation.code === "WRONG_EVENT" ? { title: "WRONG EVENT", icon: CalendarDays, tone: "wrong", text: `This ticket belongs to ${validation.event.title}.` } : { title: "INVALID TICKET", icon: ShieldCheck, tone: "invalid", text: "No matching ticket identifier was found." };
  const Icon = config.icon;
  const ticket = "ticket" in validation ? validation.ticket : null;
  const event = ticket ? eventById(state, ticket.eventId)! : null;
  return <div className={styles.validationCard} data-tone={config.tone} role="status"><div><span><Icon /></span><div><small>Validation result</small><h3>{config.title}</h3><p>{config.text}</p></div></div>{ticket && event && <dl><div><dt>Attendee</dt><dd>{attendeeName(ticket.attendee)}</dd></div><div><dt>Ticket type</dt><dd>{event.ticketTypes.find((type) => type.id === ticket.ticketTypeId)?.name}</dd></div><div><dt>Seat</dt><dd>{ticket.seatId ?? "General admission"}</dd></div>{ticket.checkedInAt && <div><dt>{checkedIn ? "Checked in" : "Previous check-in"}</dt><dd>{ticket.checkedInAt}</dd></div>}</dl>}{validation.code === "VALID" && !checkedIn && <button type="button" onClick={checkIn}><CheckCircle2 /> Check In</button>}</div>;
}

function OrganizerAnalytics({ state, eventId, setEventId }: { state: TicketingState; eventId: string; setEventId: (id: string) => void }) {
  const event = eventById(state, eventId)!;
  const metrics = eventMetrics(state, event.id);
  const noShowRate = metrics.sold ? 100 - metrics.checkInRate : 0;
  return <section><PageHeading eyebrow="Sales & attendance analytics" title="Event performance" text="Sales, capacity, and attendance use the same event data." /><EventSelect state={state} value={eventId} setValue={setEventId} /><div className={styles.metricGrid}><Metric icon={Tickets} label="Tickets sold" value={String(metrics.sold)} note={`${metrics.available} remaining`} /><Metric icon={CircleDollarSign} label="Customer revenue" value={money(metrics.revenue)} note={`AOV ${money(metrics.averageOrderValue)}`} /><Metric icon={CheckCircle2} label="Attendance" value={`${metrics.checkInRate}%`} note={`${metrics.checkedIn} checked in`} /><Metric icon={Users} label="No-show rate" value={`${noShowRate}%`} note="Based on current door state" /></div><div className={styles.analyticsPanels}><section className={styles.panel}><PanelTitle eyebrow="Ticket type performance" title="Sales mix" /><div className={styles.ticketBreakdown}>{event.ticketTypes.map((type) => <div key={type.id}><span><b>{type.name}</b><small>{money(type.price)} per ticket</small></span><i><em style={{ width: `${Math.round((type.sold / type.capacity) * 100)}%` }} /></i><strong>{type.sold} / {type.capacity}</strong></div>)}</div><p className={styles.chartText}>Accessible summary: {event.ticketTypes.map((type) => `${type.name} ${type.sold} of ${type.capacity}`).join("; ")}.</p></section><section className={`${styles.panel} ${styles.lineChart}`}><PanelTitle eyebrow="Sales over time" title="Weekly momentum" /><svg viewBox="0 0 620 220" role="img" aria-label="Sales trend rising from 16 to 73 tickets over seven periods"><path d="M25 182 L115 145 L205 160 L295 105 L385 118 L475 65 L585 34" /><g>{[[25,182],[115,145],[205,160],[295,105],[385,118],[475,65],[585,34]].map(([x,y], i) => <circle key={i} cx={x} cy={y} r="6" />)}</g></svg><div>{["P1", "P2", "P3", "P4", "P5", "P6", "P7"].map((item) => <span key={item}>{item}</span>)}</div></section><section className={styles.panel}><PanelTitle eyebrow="Session breakdown" title="Tickets by date" /><div className={styles.sessionSales}>{event.sessions.map((session, index) => <div key={session.id}><span><b>{session.label}</b><small>{session.date}</small></span><strong>{Math.round(metrics.sold / event.sessions.length) + (index === 1 ? 3 : 0)} sold</strong></div>)}</div></section><section className={styles.panel}><PanelTitle eyebrow="Capacity reconciliation" title="At a glance" /><div className={styles.capacityRing} style={{ "--percent": `${Math.round((metrics.sold / Math.max(1, metrics.capacity)) * 360)}deg` } as React.CSSProperties}><span><b>{Math.round((metrics.sold / Math.max(1, metrics.capacity)) * 100)}%</b><small>sold</small></span></div><dl className={styles.capacityLegend}><div><dt>Capacity</dt><dd>{metrics.capacity}</dd></div><div><dt>Sold</dt><dd>{metrics.sold}</dd></div><div><dt>Available</dt><dd>{metrics.available}</dd></div></dl></section></div></section>;
}

function CreateEvent({ state, setState, created, cancel }: { state: TicketingState; setState: (state: TicketingState) => void; created: (id: string) => void; cancel: () => void }) {
  const [form, setForm] = useState({ title: "", category: "Concerts" as EventCategory, description: "", venue: "", city: "Beirut", date: "October 10, 2026", startTime: "6:00 PM", endTime: "10:00 PM", ageRestriction: "All ages", capacity: "200", reservedSeating: false, eventImage: "Curated category image" });
  function submit(e: FormEvent) { e.preventDefault(); const result = createOrganizerEvent(state, { ...form, capacity: Number(form.capacity) }); setState(result.state); created(result.event.id); }
  return <section><button className={styles.backButton} type="button" onClick={cancel}><ArrowLeft /> Events</button><PageHeading eyebrow="Event management" title="Create Event" text="Create a draft, then configure its ticket inventory from the management screen." /><form className={styles.createForm} onSubmit={submit}><FormSection number="1" title="Event essentials" text="Add the event name, category, age policy, and customer description."><div className={styles.formGrid}><Field label="Event Name" wide><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Courtyard Music Night" /></Field><Field label="Category"><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as EventCategory })}>{EVENT_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Age Restriction"><input required value={form.ageRestriction} onChange={(e) => setForm({ ...form, ageRestriction: e.target.value })} /></Field><Field label="Description" wide><textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the event..." /></Field><Field label="Event Image" wide><select value={form.eventImage} onChange={(e) => setForm({ ...form, eventImage: e.target.value })}><option>Category image</option><option>Festival image</option><option>Concert image</option></select></Field></div></FormSection><FormSection number="2" title="Venue & schedule" text="Set the location and one starting session."><div className={styles.formGrid}><Field label="Venue"><input required value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></Field><Field label="City"><input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field><Field label="Date"><input required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field><Field label="Start Time"><input required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></Field><Field label="End Time"><input required value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></Field><Field label="Capacity"><input required type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></Field></div></FormSection><FormSection number="3" title="Admission model" text="Choose general admission or assigned seating."><div className={styles.paymentMethods}><button type="button" aria-pressed={!form.reservedSeating} onClick={() => setForm({ ...form, reservedSeating: false })}><Tickets /><span><b>General Admission</b><small>Quantity by ticket type</small></span><Check /></button><button type="button" aria-pressed={form.reservedSeating} onClick={() => setForm({ ...form, reservedSeating: true })}><ListChecks /><span><b>Reserved Seating</b><small>Assigned seats</small></span><Check /></button></div></FormSection><div className={styles.formActions}><button type="button" onClick={cancel}>Cancel</button><button className={styles.primary} type="submit">Create Draft Event <ArrowRight /></button></div></form></section>;
}

function WaitlistDialog({ event, state, setState, close }: { event: TicketingEvent; state: TicketingState; setState: (state: TicketingState) => void; close: () => void }) {
  const [details, setDetails] = useState({ name: "", email: "" });
  const [joined, setJoined] = useState(false);
  const dialogRef = useAccessibleDialog(close);
  function submit(e: FormEvent) {
    e.preventDefault();
    const result = joinWaitlist(state, event.id, details.name, details.email);
    if (result.ok) {
      setState(result.state);
      setJoined(true);
    }
  }
  return (
    <div className={styles.dialogBackdrop} onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <section ref={dialogRef} className={styles.formDialog} role="dialog" aria-modal="true" aria-labelledby="waitlist-title">
        <button className={styles.dialogClose} type="button" aria-label="Close waitlist" onClick={close}>
          <X />
        </button>
        {joined ? (
          <div className={styles.dialogSuccess}>
            <Check />
            <span>Waitlist confirmed</span>
            <h2 id="waitlist-title">You’re on the waitlist.</h2>
            <p>No email will be sent. This entry remains in this browser until the data is reset.</p>
            <button className={styles.primary} type="button" onClick={close}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <span>Sold out · Waitlist</span>
            <h2 id="waitlist-title">Join the waitlist</h2>
            <p>{event.title}</p>
            <Field label="Name">
              <input required value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} />
            </Field>
            <Field label="Email">
              <input required type="email" value={details.email} onChange={(e) => setDetails({ ...details, email: e.target.value })} />
            </Field>
            <button className={styles.primary} type="submit">
              Join Waitlist
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

function ConfirmDialog({ title, text, confirm, onClose, onConfirm }: { title: string; text: string; confirm: string; onClose: () => void; onConfirm: () => void }) {
  const dialogRef = useAccessibleDialog(onClose);

  return (
    <div className={styles.dialogBackdrop} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section ref={dialogRef} className={styles.confirmDialog} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <button className={styles.dialogClose} type="button" aria-label="Close confirmation" onClick={onClose}>
          <X />
        </button>
        <span>
          <RefreshCcw />
        </span>
        <h2 id="confirm-title">{title}</h2>
        <p>{text}</p>
        <div>
          <button type="button" onClick={onClose}>
            Keep data
          </button>
          <button type="button" onClick={onConfirm}>
            {confirm}
          </button>
        </div>
      </section>
    </div>
  );
}

function EventSelect({ state, value, setValue }: { state: TicketingState; value: string; setValue: (id: string) => void }) {
  return <label className={styles.eventSelect}><span>Active event</span><select value={value} onChange={(e) => setValue(e.target.value)}>{state.events.filter((event) => event.status !== "Draft" && event.status !== "Completed").map((event) => <option value={event.id} key={event.id}>{event.title} · {event.status}</option>)}</select><ChevronDown /></label>;
}

function PageHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) { return <div className={styles.pageHeading}><span>{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>; }
function PanelTitle({ eyebrow, title, action, onAction }: { eyebrow: string; title: string; action?: string; onAction?: () => void }) { return <div className={styles.panelTitle}><div><span>{eyebrow}</span><h2>{title}</h2></div>{action && <button type="button" onClick={onAction}>{action} <ArrowRight /></button>}</div>; }
function Metric({ icon: Icon, label, value, note }: { icon: LucideIcon; label: string; value: string; note: string }) { return <article className={styles.metric}><span><Icon /></span><div><small>{label}</small><strong>{value}</strong><p>{note}</p></div></article>; }
function Field({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) { return <label className={wide ? styles.fieldWide : styles.field}><span>{label}</span>{children}</label>; }
function FormSection({ number, title, text, children }: { number: string; title: string; text: string; children: ReactNode }) { return <section className={styles.formSection}><div className={styles.stepTitle}><span>{number}</span><div><h2>{title}</h2><small>{text}</small></div></div>{children}</section>; }
function Quantity({ value, decrement, increment, disableIncrement }: { value: number; decrement: () => void; increment: () => void; disableIncrement?: boolean }) { return <div className={styles.quantity}><button type="button" aria-label="Decrease quantity" disabled={value === 0} onClick={decrement}><Minus /></button><span>{value}</span><button type="button" aria-label="Increase quantity" disabled={disableIncrement} onClick={increment}><Plus /></button></div>; }

function CategoryIcon({ category }: { category: EventCategory }) {
  const icons: Record<EventCategory, string> = { Concerts: "♫", Nightlife: "✦", Sports: "◎", Festivals: "☀", Family: "☺", Comedy: "◡", Theatre: "◇", Experiences: "◌", Conferences: "▦" };
  return <b aria-hidden="true">{icons[category]}</b>;
}

function QrVisual({ payload }: { payload: string }) {
  const label = `Unique QR code for ${payload.split("|")[1]}`;
  return <QRCodeSVG className={styles.qr} value={payload} size={190} level="M" marginSize={4} title={label} role="img" aria-label={label} />;
}
function MiniQr({ payload }: { payload: string }) { return <div className={styles.miniQr}><QrVisual payload={payload} /></div>; }

function customerTicketIds(state: TicketingState) { return state.orders.flatMap((order) => order.ticketIds); }
function unreadCount(state: TicketingState) { return state.notifications.filter((item) => !item.read).length; }
function downloadTicket(state: TicketingState, ticket: Ticket) { const event = eventById(state, ticket.eventId)!; const session = event.sessions.find((item) => item.id === ticket.sessionId)!; downloadText(`${ticket.id}.txt`, `ILBATECH TICKET\n${event.title}\n${session.date} · ${session.time}\n${event.venue}\nTicket: ${ticket.id}\nStatus: ${ticket.status}\nQR payload: ${ticket.qrPayload}\n\nDemo ticket — not valid for admission.`); }
function downloadOrder(state: TicketingState, order: Order) { const event = eventById(state, order.eventId)!; downloadText(`${order.id.replace("#", "")}-tickets.txt`, `ILBATECH BOOKING\nOrder ${order.id}\n${event.title}\nTickets: ${order.ticketIds.join(", ")}\nAmount: ${money(order.total)}\nPayment: ${order.paymentMethod} (simulated)\n\nDemo payment — no charge was made.`); }
function downloadText(filename: string, text: string) { const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([text], { type: "text/plain" })); link.download = filename; link.click(); URL.revokeObjectURL(link.href); }
