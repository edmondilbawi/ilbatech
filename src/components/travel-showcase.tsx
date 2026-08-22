"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { CalendarDays, MapPin, Search, Users } from "lucide-react";
import { getSitePath } from "@/config/site";
import styles from "./demo-v4.module.css";

const packages = [
  { name: "Aegean Coast Escape", destination: "Mediterranean", duration: "7 days", price: "$1,240", description: "Coastal villages, locally guided experiences and unhurried days by the sea." },
  { name: "Mountain & Cedar Trail", destination: "Lebanon", duration: "5 days", price: "$790", description: "A considered journey through mountain landscapes, heritage towns and local tables." },
  { name: "Amalfi Slow Journey", destination: "Italy", duration: "8 days", price: "$1,680", description: "An intimate coastal itinerary with thoughtful stays, transfers and day experiences." },
] as const;

type TravelPackage = typeof packages[number];

export function TravelShowcase() {
  const [destination, setDestination] = useState("All destinations");
  const [travelers, setTravelers] = useState("2 travelers");
  const [activePackage, setActivePackage] = useState<TravelPackage | null>(null);
  const [enquiring, setEnquiring] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const visiblePackages = destination === "All destinations" ? packages : packages.filter((item) => item.destination === destination);
  function scrollTo(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); }
  function search() { scrollTo("packages"); }
  function closeDialog() { setActivePackage(null); setEnquiring(false); setSubmitted(false); }
  function submitEnquiry(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSubmitted(true); }

  useEffect(() => {
    if (!activePackage) return;
    closeButtonRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActivePackage(null);
        setEnquiring(false);
        setSubmitted(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activePackage]);

  return <div className={`${styles.demoShell} ${styles.travel}`}>
    <header className={styles.demoTop}>
      <a className={styles.demoBrand} href="#travel-main"><i>A</i> AERIA JOURNEYS</a>
      <nav className={styles.travelNav} aria-label="Travel website">
        <button onClick={() => scrollTo("destinations")}>Destinations</button><button onClick={() => scrollTo("packages")}>Packages</button><button onClick={() => scrollTo("about-travel")}>About</button><button onClick={() => scrollTo("travel-contact")}>Contact</button>
      </nav>
      <span className={styles.demoBadge}>Interactive concept</span>
      <a className={styles.backLink} href={getSitePath("/work")}>← ILBATECH</a>
    </header>
    <main id="travel-main">
      <section className={styles.travelHero} aria-label="Mediterranean coast destination">
        <div><span>Journeys made personal</span><h1>Travel well. Remember more.</h1><p>Thoughtfully planned escapes shaped around the places you want to discover and the way you want to experience them.</p>
          <div className={styles.travelSearchBar}>
            <select className={styles.travelSearch} aria-label="Destination" value={destination} onChange={(event) => setDestination(event.target.value)}><option>All destinations</option><option>Mediterranean</option><option>Lebanon</option><option>Italy</option></select>
            <select className={styles.travelSearch} aria-label="Travelers" value={travelers} onChange={(event) => setTravelers(event.target.value)}><option>1 traveler</option><option>2 travelers</option><option>3 travelers</option><option>4+ travelers</option></select>
            <button className={styles.action} onClick={search}><Search aria-hidden="true" size={16} /> Find a journey</button>
          </div>
        </div>
      </section>

      <section id="destinations" className={styles.travelSection}>
        <div className={styles.travelHead}><div><span>Discover</span><h2>Destinations with a story</h2></div><p>Browse a small collection of sample routes, then open any package to explore the itinerary and enquiry journey.</p></div>
        <div className={styles.statGrid}><div className={styles.stat}><MapPin size={20} /><small>Mediterranean</small><strong>Coast</strong></div><div className={styles.stat}><MapPin size={20} /><small>Lebanon</small><strong>Mountains</strong></div><div className={styles.stat}><MapPin size={20} /><small>Italy</small><strong>Amalfi</strong></div><div className={styles.stat}><CalendarDays size={20} /><small>Flexible</small><strong>Dates</strong></div></div>
      </section>

      <section id="packages" className={styles.travelSection}>
        <div className={styles.travelHead}><div><span>Curated packages</span><h2>{destination === "All destinations" ? "Find your next journey" : destination}</h2></div><p>{visiblePackages.length} sample package{visiblePackages.length === 1 ? "" : "s"} for {travelers}. Pricing is illustrative and no booking or payment is processed.</p></div>
        <div className={styles.packageGrid}>
          {visiblePackages.map((item) => <article className={styles.packageCard} key={item.name}><div className={styles.packageImage} role="img" aria-label={`${item.destination} coastal travel scene`} /><div><small>{item.destination} · {item.duration}</small><h3>{item.name}</h3><p>{item.description}</p><footer><strong>From {item.price}</strong><button onClick={() => setActivePackage(item)}>View package</button></footer></div></article>)}
        </div>
      </section>

      <section id="about-travel" className={styles.travelAbout}><div><span>About Aeria</span><h2>Small details make the journey.</h2></div><div><p>This interactive concept shows how a travel business can inspire customers, help them find the right package, explain the experience clearly and turn interest into a structured enquiry.</p><p>All destinations, prices and availability shown here are sample content for demonstration only.</p></div></section>
      <section id="travel-contact" className={styles.travelContact}><MapPin aria-hidden="true" size={25} /><h2>Where would you like to go?</h2><p>Explore a package or start a sample enquiry to experience the complete customer journey.</p><button className={styles.action} onClick={() => { setActivePackage(packages[0]); setEnquiring(true); }}>Start an enquiry</button></section>
    </main>

    {activePackage && <div className={styles.enquiry} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialog(); }}>
      <section className={styles.enquiryPanel} role="dialog" aria-modal="true" aria-labelledby="travel-dialog-title">
        <header><div><small>{activePackage.destination} · {activePackage.duration}</small><h2 id="travel-dialog-title">{enquiring ? "Plan your journey" : activePackage.name}</h2></div><button ref={closeButtonRef} aria-label="Close package" onClick={closeDialog}>×</button></header>
        {!enquiring ? <><p>{activePackage.description}</p><div className={styles.statGrid}><div className={styles.stat}><CalendarDays size={18} /><small>Duration</small><strong>{activePackage.duration}</strong></div><div className={styles.stat}><Users size={18} /><small>Selected</small><strong>{travelers}</strong></div></div><p><strong>Sample itinerary:</strong> personal arrival, locally guided highlights, flexible discovery days and coordinated departure.</p><button className={styles.action} onClick={() => setEnquiring(true)}>Enquire about this package</button></> :
          <form onSubmit={submitEnquiry}>
            <label>Full name<input required autoComplete="name" /></label><label>Email address<input required type="email" autoComplete="email" /></label><label>Preferred month<input required type="month" /></label><label>Travel notes<textarea rows={4} defaultValue={`I'm interested in ${activePackage.name} for ${travelers}.`} /></label>
            <button className={styles.action} type="submit">Send sample enquiry</button>
            {submitted && <p className={styles.success} role="status">Sample enquiry received locally. Nothing was sent or booked.</p>}
          </form>}
      </section>
    </div>}
  </div>;
}
