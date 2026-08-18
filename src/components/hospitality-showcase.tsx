"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Coffee,
  Leaf,
  MapPin,
  Menu,
  MessageCircle,
  Search,
  Sparkles,
  Utensils,
  UsersRound,
  X,
} from "lucide-react";
import { type KeyboardEvent, useRef, useState } from "react";
import { getContactPath, getSitePath } from "@/config/site";
import styles from "./hospitality-showcase.module.css";

const CATEGORIES = ["Breakfast", "Main Dishes", "Desserts", "Coffee", "Drinks"] as const;
type Category = (typeof CATEGORIES)[number];
type Dietary = "Vegetarian" | "Vegan" | "Gluten-conscious";

type MenuItem = {
  id: string;
  category: Category;
  title: string;
  description: string;
  details: string;
  price: string;
  dietary: Dietary[];
  featured?: string;
  tone: "amber" | "green" | "rose" | "coffee" | "citrus";
};

const MENU_ITEMS: MenuItem[] = [
  { id: "garden-eggs", category: "Breakfast", title: "Garden Eggs", description: "Soft eggs, herbs, charred tomato, toasted sourdough.", details: "A bright breakfast composition with seasonal herbs and a slow-roasted tomato base.", price: "USD 14", dietary: ["Vegetarian"], featured: "Featured breakfast", tone: "amber" },
  { id: "cardamom-oats", category: "Breakfast", title: "Cardamom Oats", description: "Warm oats, date, pear, toasted seeds.", details: "A gently spiced bowl designed around fruit, texture, and a warm morning rhythm.", price: "USD 10", dietary: ["Vegan", "Gluten-conscious"], tone: "rose" },
  { id: "morning-flatbread", category: "Breakfast", title: "Morning Flatbread", description: "Labneh, cucumber, za’atar, garden leaves.", details: "A crisp flatbread with cool labneh and fresh herbs, presented as a shareable breakfast plate.", price: "USD 12", dietary: ["Vegetarian"], tone: "green" },
  { id: "ember-chicken", category: "Main Dishes", title: "Ember Chicken", description: "Charred chicken, lemon grain, smoked pepper.", details: "A warm main dish concept balancing flame-grilled character with citrus and grains.", price: "USD 24", dietary: ["Gluten-conscious"], featured: "House feature", tone: "amber" },
  { id: "roasted-aubergine", category: "Main Dishes", title: "Roasted Aubergine", description: "Tahini, tomato, herbs, toasted seeds.", details: "Slow-roasted aubergine layered with sesame, acidity, and a fresh herb finish.", price: "USD 19", dietary: ["Vegan", "Gluten-conscious"], tone: "green" },
  { id: "coastal-catch", category: "Main Dishes", title: "Coastal Catch", description: "Market fish, fennel, citrus, olive oil.", details: "A restrained seasonal plate concept built around a daily catch and clean accompaniments.", price: "USD 27", dietary: ["Gluten-conscious"], tone: "citrus" },
  { id: "olive-oil-cake", category: "Desserts", title: "Citrus Olive Oil Cake", description: "Orange, soft cream, pistachio.", details: "A tender citrus-led cake with a light cream finish and a small pistachio crunch.", price: "USD 9", dietary: ["Vegetarian"], featured: "Seasonal feature", tone: "citrus" },
  { id: "dark-chocolate-tart", category: "Desserts", title: "Dark Chocolate Tart", description: "Cocoa pastry, sea salt, crème fraîche.", details: "A rich but balanced dessert concept with dark chocolate and a clean cultured-cream finish.", price: "USD 11", dietary: ["Vegetarian"], tone: "coffee" },
  { id: "seasonal-fruit", category: "Desserts", title: "Seasonal Fruit", description: "Fresh fruit, citrus granita, mint.", details: "A lighter seasonal finish using fresh fruit and an aromatic granita presentation.", price: "USD 8", dietary: ["Vegan", "Gluten-conscious"], tone: "rose" },
  { id: "house-espresso", category: "Coffee", title: "House Espresso", description: "Balanced roast with cocoa and citrus notes.", details: "A concise coffee presentation with origin, roast, and preparation information ready for a live menu.", price: "USD 4", dietary: ["Vegan", "Gluten-conscious"], featured: "Coffee feature", tone: "coffee" },
  { id: "cardamom-latte", category: "Coffee", title: "Cardamom Latte", description: "Espresso, steamed milk, cardamom.", details: "A warm espresso drink with a restrained cardamom note and optional plant-based milk presentation.", price: "USD 6", dietary: ["Vegetarian"], tone: "amber" },
  { id: "cold-brew", category: "Coffee", title: "Slow Cold Brew", description: "Long-steeped coffee, served over ice.", details: "A clean cold-coffee option presented with preparation detail and serving choice.", price: "USD 6", dietary: ["Vegan", "Gluten-conscious"], tone: "coffee" },
  { id: "citrus-spritz", category: "Drinks", title: "Citrus Garden Spritz", description: "Grapefruit, rosemary, sparkling water.", details: "A bright non-alcoholic spritz concept built around citrus, herbs, and a dry finish.", price: "USD 8", dietary: ["Vegan", "Gluten-conscious"], featured: "Featured drink", tone: "citrus" },
  { id: "house-iced-tea", category: "Drinks", title: "House Iced Tea", description: "Black tea, peach, lemon verbena.", details: "A slow-steeped house tea with a subtle fruit note and a fresh herbal finish.", price: "USD 7", dietary: ["Vegan", "Gluten-conscious"], tone: "rose" },
  { id: "sparkling-botanical", category: "Drinks", title: "Sparkling Botanical", description: "Cucumber, basil, lime, soda.", details: "A crisp, herb-led refreshment concept designed for lunch or evening service.", price: "USD 7", dietary: ["Vegan", "Gluten-conscious"], tone: "green" },
];

type Reservation = {
  date: string;
  time: string;
  partySize: string;
  name: string;
  contactMethod: "Email" | "Phone";
  contact: string;
};

const EMPTY_RESERVATION: Reservation = {
  date: "",
  time: "",
  partySize: "",
  name: "",
  contactMethod: "Email",
  contact: "",
};

export function HospitalityShowcase() {
  const categoryRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reservationRef = useRef<HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [category, setCategory] = useState<Category>("Breakfast");
  const [query, setQuery] = useState("");
  const [dietaryFilters, setDietaryFilters] = useState<Dietary[]>([]);
  const [expandedItem, setExpandedItem] = useState("");
  const [reservation, setReservation] = useState<Reservation>(EMPTY_RESERVATION);
  const [reservationState, setReservationState] = useState<"form" | "review" | "confirmed">("form");
  const [reservationError, setReservationError] = useState("");

  const visibleItems = MENU_ITEMS.filter((item) => {
    const matchesCategory = item.category === category;
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery = !normalizedQuery || `${item.title} ${item.description}`.toLowerCase().includes(normalizedQuery);
    const matchesDietary = dietaryFilters.every((filter) => item.dietary.includes(filter));
    return matchesCategory && matchesQuery && matchesDietary;
  });

  function selectCategory(nextCategory: Category) {
    setCategory(nextCategory);
    setExpandedItem("");
  }

  function handleCategoryKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % CATEGORIES.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + CATEGORIES.length) % CATEGORIES.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = CATEGORIES.length - 1;
    selectCategory(CATEGORIES[nextIndex]);
    categoryRefs.current[nextIndex]?.focus();
  }

  function toggleDietary(filter: Dietary) {
    setDietaryFilters((current) => current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter]);
  }

  function scrollToReservation() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reservationRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  }

  function openReservation() {
    setMobileMenuOpen(false);
    window.setTimeout(scrollToReservation, 0);
  }

  function updateReservation(field: keyof Reservation, value: string) {
    setReservation((current) => ({ ...current, [field]: value }));
    setReservationError("");
  }

  function reviewReservation() {
    if (!reservation.date || !reservation.time || !reservation.partySize || !reservation.name.trim() || !reservation.contact.trim()) {
      setReservationError("Complete each field with sample information to review the demonstration request.");
      return;
    }
    if (reservation.contactMethod === "Email" && !/^\S+@\S+\.\S+$/.test(reservation.contact)) {
      setReservationError("Enter a valid sample email address.");
      return;
    }
    if (reservation.contactMethod === "Phone" && reservation.contact.replace(/\D/g, "").length < 6) {
      setReservationError("Enter a valid sample phone number.");
      return;
    }
    setReservationError("");
    setReservationState("review");
  }

  function resetReservation() {
    setReservation(EMPTY_RESERVATION);
    setReservationState("form");
    setReservationError("");
  }

  return (
    <main className={styles.demo}>
      <div className={styles.conceptBar}>
        <div className={styles.shell}>
          <span><b>ILBATECH Concept Preview</b> Front-end hospitality demonstration</span>
          <a href={getSitePath("/work/cafe-restaurant-website")}><ArrowLeft size={14} /> Return to Case Study</a>
        </div>
      </div>

      <header className={styles.header}>
        <div className={styles.shell}>
          <a href="#hospitality-top" className={styles.brand} aria-label="Café and Restaurant concept home">
            <span><Utensils size={18} /></span>
            <strong>Café & Restaurant<small>Seasonal dining concept</small></strong>
          </a>
          <nav className={styles.desktopNav} aria-label="Hospitality concept navigation">
            <a href="#hospitality-menu">Menu</a><a href="#hospitality-story">Our Space</a><a href="#hospitality-visit">Visit</a>
          </nav>
          <button className={styles.headerCta} type="button" onClick={openReservation}>Request a table <ArrowRight size={14} /></button>
          <button className={styles.menuButton} type="button" aria-expanded={mobileMenuOpen} aria-controls="hospitality-mobile-navigation" aria-label={mobileMenuOpen ? "Close restaurant navigation" : "Open restaurant navigation"} onClick={() => setMobileMenuOpen((open) => !open)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
          {mobileMenuOpen && (
            <nav id="hospitality-mobile-navigation" className={styles.mobileNav} aria-label="Hospitality mobile navigation">
              <a href="#hospitality-menu" onClick={() => setMobileMenuOpen(false)}>Menu</a>
              <a href="#hospitality-story" onClick={() => setMobileMenuOpen(false)}>Our Space</a>
              <a href="#hospitality-visit" onClick={() => setMobileMenuOpen(false)}>Visit</a>
              <button type="button" onClick={openReservation}>Request a table</button>
            </nav>
          )}
        </div>
      </header>

      <section id="hospitality-top" className={styles.hero}>
        <div className={`${styles.shell} ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Seasonal kitchen · Thoughtful gathering</p>
            <h1>Gather around something good.</h1>
            <p>A warm hospitality concept where menus feel effortless to explore and every practical detail is close at hand.</p>
            <div className={styles.heroActions}>
              <a href="#hospitality-menu">View the menu <ArrowRight size={15} /></a>
              <button type="button" onClick={openReservation}>Request a table</button>
            </div>
            <div className={styles.heroDetails}><span><Clock3 size={13} /> Example hours · Open daily</span><span><MapPin size={13} /> Demonstration location</span></div>
          </div>
          <div className={styles.heroComposition} aria-hidden="true">
            <div className={styles.tableTexture} />
            <div className={styles.plateLarge}><i /><i /><i /><i /></div>
            <div className={styles.plateSmall}><Coffee size={32} /></div>
            <div className={styles.menuSlip}><small>Today’s table</small><strong>Seasonal plates<br />& slow moments.</strong><span>Breakfast · Lunch · Coffee</span></div>
            <span className={styles.herbOne} /><span className={styles.herbTwo} />
          </div>
        </div>
      </section>

      <section id="hospitality-menu" className={styles.menuSection}>
        <div className={styles.shell}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>Interactive menu</p><h2>Discover the table, your way.</h2></div>
            <p>Switch categories, search the active menu, filter dietary indicators, and open item details.</p>
          </div>

          <div className={styles.menuTools}>
            <div className={styles.categoryTabs} role="tablist" aria-label="Menu categories">
              {CATEGORIES.map((item, index) => (
                <button
                  ref={(element) => { categoryRefs.current[index] = element; }}
                  type="button"
                  role="tab"
                  id={`menu-tab-${index}`}
                  aria-selected={category === item}
                  aria-controls="menu-results"
                  tabIndex={category === item ? 0 : -1}
                  onClick={() => selectCategory(item)}
                  onKeyDown={(event) => handleCategoryKeyDown(event, index)}
                  key={item}
                >{item}</button>
              ))}
            </div>
            <div className={styles.filterBar}>
              <label className={styles.searchField}><span>Search active category</span><div><Search size={15} /><input type="search" value={query} placeholder="Search menu items" onChange={(event) => setQuery(event.target.value)} /></div></label>
              <fieldset className={styles.dietaryFilters}>
                <legend>Dietary filters</legend>
                {(["Vegetarian", "Vegan", "Gluten-conscious"] as Dietary[]).map((filter) => (
                  <button type="button" aria-pressed={dietaryFilters.includes(filter)} onClick={() => toggleDietary(filter)} key={filter}><Leaf size={12} /> {filter}</button>
                ))}
              </fieldset>
            </div>
          </div>

          <div className={styles.menuStatus} aria-live="polite">
            <span>{category}</span><small>Showing {visibleItems.length} demonstration {visibleItems.length === 1 ? "item" : "items"}</small>
          </div>
          <div id="menu-results" className={styles.menuGrid} role="tabpanel" aria-labelledby={`menu-tab-${CATEGORIES.indexOf(category)}`}>
            {visibleItems.map((item) => (
              <article className={styles.menuCard} key={item.id}>
                <div className={styles.dishVisual} data-tone={item.tone} aria-hidden="true"><span /><i /><b /></div>
                <div className={styles.menuCardBody}>
                  <div className={styles.itemTop}>
                    <div>{item.featured && <small><Sparkles size={10} /> {item.featured}</small>}<h3>{item.title}</h3></div>
                    <strong>{item.price}</strong>
                  </div>
                  <p>{item.description}</p>
                  <div className={styles.dietaryTags}>{item.dietary.map((tag) => <span key={tag}>{tag}</span>)}</div>
                  {expandedItem === item.id && <div id={`dish-${item.id}`} className={styles.itemDetails}><p>{item.details}</p><small>Dietary indicators are illustrative. A live menu would use venue-approved ingredient and allergen information.</small></div>}
                  <button type="button" aria-expanded={expandedItem === item.id} aria-controls={`dish-${item.id}`} onClick={() => setExpandedItem(expandedItem === item.id ? "" : item.id)}>
                    {expandedItem === item.id ? "Hide details" : "View details"} <ArrowRight size={13} />
                  </button>
                </div>
              </article>
            ))}
          </div>
          {visibleItems.length === 0 && (
            <div className={styles.emptyMenu} role="status"><Coffee size={23} /><h3>No matching demo items</h3><p>Clear the search or dietary filters to continue exploring.</p><button type="button" onClick={() => { setQuery(""); setDietaryFilters([]); }}>Clear filters</button></div>
          )}
        </div>
      </section>

      <section id="hospitality-story" className={styles.story}>
        <div className={`${styles.shell} ${styles.storyGrid}`}>
          <div className={styles.storyVisual} aria-hidden="true"><div className={styles.storyArch}><span>Morning light</span><i /></div><div className={styles.storyCard}><Coffee size={21} /><strong>From coffee to dinner.</strong><small>One consistent hospitality experience.</small></div></div>
          <div className={styles.storyCopy}>
            <p className={styles.eyebrow}>Atmosphere & story</p>
            <h2>A place designed to feel unhurried.</h2>
            <p>This concept demonstrates how a hospitality business can express its atmosphere through editorial rhythm, warm materials, and clear guest information—without letting style obscure the menu or next action.</p>
            <div><span>Seasonal menu language</span><span>Day-to-evening experience</span><span>Warm, considered visual identity</span></div>
          </div>
        </div>
      </section>

      <section id="hospitality-reservation" className={styles.reservation} ref={reservationRef}>
        <div className={`${styles.shell} ${styles.reservationGrid}`}>
          <div className={styles.reservationIntro}>
            <p className={styles.eyebrow}>Reservation request demo</p>
            <h2>A shorter path to the table.</h2>
            <p>This local-only interface does not reserve a table, transmit data, or store information. Use sample contact details only.</p>
            <div><Check size={14} /> No account required</div><div><Check size={14} /> No payment information</div><div><Check size={14} /> No external reservation service</div>
          </div>
          <form className={styles.reservationForm} onSubmit={(event) => event.preventDefault()} noValidate>
            {reservationState === "form" && (
              <>
                <div className={styles.formHeading}><span>01</span><div><small>Demonstration request</small><h3>Choose your table preferences.</h3></div></div>
                {reservationError && <p className={styles.formError} role="alert">{reservationError}</p>}
                <div className={styles.formGrid}>
                  <label><span>Preferred date</span><input type="date" value={reservation.date} onChange={(event) => updateReservation("date", event.target.value)} /></label>
                  <label><span>Preferred time</span><select value={reservation.time} onChange={(event) => updateReservation("time", event.target.value)}><option value="">Choose a demo time</option><option>Breakfast · 09:00</option><option>Lunch · 13:00</option><option>Dinner · 19:30</option></select></label>
                  <label><span>Party size</span><select value={reservation.partySize} onChange={(event) => updateReservation("partySize", event.target.value)}><option value="">Choose party size</option>{[1, 2, 3, 4, 5, 6].map((size) => <option value={String(size)} key={size}>{size} {size === 1 ? "guest" : "guests"}</option>)}</select></label>
                  <label><span>Sample name</span><input type="text" autoComplete="off" placeholder="Demo Guest" value={reservation.name} onChange={(event) => updateReservation("name", event.target.value)} /></label>
                  <label><span>Contact method</span><select value={reservation.contactMethod} onChange={(event) => updateReservation("contactMethod", event.target.value as Reservation["contactMethod"])}><option>Email</option><option>Phone</option></select></label>
                  <label><span>Sample {reservation.contactMethod.toLowerCase()}</span><input type={reservation.contactMethod === "Email" ? "email" : "tel"} autoComplete="off" placeholder={reservation.contactMethod === "Email" ? "demo@example.com" : "000 000 0000"} value={reservation.contact} onChange={(event) => updateReservation("contact", event.target.value)} /></label>
                </div>
                <button className={styles.formPrimary} type="button" onClick={reviewReservation}>Review demo request <ArrowRight size={14} /></button>
              </>
            )}
            {reservationState === "review" && (
              <div className={styles.reservationReview}>
                <div className={styles.formHeading}><span>02</span><div><small>Review</small><h3>Check the demonstration request.</h3></div></div>
                <dl><div><dt>Date</dt><dd>{reservation.date}</dd></div><div><dt>Time</dt><dd>{reservation.time}</dd></div><div><dt>Table</dt><dd>{reservation.partySize} {reservation.partySize === "1" ? "guest" : "guests"}</dd></div><div><dt>Sample contact</dt><dd>{reservation.name} · {reservation.contact}</dd></div></dl>
                <p>No reservation will be sent when you continue.</p>
                <div><button type="button" onClick={() => setReservationState("form")}>Edit details</button><button type="button" onClick={() => setReservationState("confirmed")}>Confirm demo request <ArrowRight size={14} /></button></div>
              </div>
            )}
            {reservationState === "confirmed" && (
              <div className={styles.reservationConfirmation} role="status"><span><Check size={24} /></span><p className={styles.eyebrow}>Demonstration complete</p><h3>Your table request is ready.</h3><p>No reservation was made and no information was sent or stored.</p><button type="button" onClick={resetReservation}>Try the demo again</button></div>
            )}
          </form>
        </div>
      </section>

      <section id="hospitality-visit" className={styles.visit}>
        <div className={`${styles.shell} ${styles.visitGrid}`}>
          <div className={styles.visitCopy}><p className={styles.eyebrow}>Opening & location concept</p><h2>Everything guests need before they arrive.</h2><div className={styles.visitDetails}><div><Clock3 size={18} /><span><small>Example opening hours</small><b>Mon–Thu · 08:00–22:00<br />Fri–Sun · 08:00–23:00</b></span></div><div><MapPin size={18} /><span><small>Demonstration address</small><b>Market Street · City Centre<br />No real location</b></span></div><div><MessageCircle size={18} /><span><small>Demo contact · not active</small><b>000 000 0000</b></span></div></div></div>
          <div className={styles.map} role="img" aria-label="Abstract demonstration map with no real restaurant location"><div aria-hidden="true"><i /><i /><i /><span><MapPin size={28} /><b>Demonstration location</b><small>No real address shown</small></span></div></div>
        </div>
      </section>

      <section className={styles.ilbatechCta}>
        <div className={`${styles.shell} ${styles.ilbatechCtaGrid}`}>
          <div><p>ILBATECH · Concept Project</p><h2>Have a similar hospitality project in mind?</h2></div>
          <div><p>This concept was created by ILBATECH to demonstrate an approach to modern hospitality digital experiences.</p><div><a href={getContactPath("Website Development")}>Discuss a Similar Project <ArrowRight size={15} /></a></div></div>
        </div>
      </section>

      <button className={styles.mobileReservationCta} type="button" onClick={openReservation}><UsersRound size={17} /> Request a table</button>
    </main>
  );
}
