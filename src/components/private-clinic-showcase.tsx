"use client";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  HeartPulse,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  ShieldCheck,
  Stethoscope,
  TriangleAlert,
  UserRound,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { SITE, getSitePath } from "@/config/site";
import styles from "./private-clinic-showcase.module.css";

const SERVICES = [
  { title: "General Medicine", icon: Stethoscope, copy: "Everyday consultations and coordinated next steps." },
  { title: "Cardiology", icon: HeartPulse, copy: "Clear pathways for specialist cardiovascular consultations." },
  { title: "Dermatology", icon: ShieldCheck, copy: "Skin-health consultations presented with clarity and care." },
  { title: "Pediatrics", icon: UserRound, copy: "A reassuring route for family and child consultations." },
  { title: "Preventive Care", icon: Check, copy: "Routine screening and wellbeing appointment discovery." },
  { title: "Diagnostics", icon: CalendarDays, copy: "Organized information for suitable diagnostic services." },
] as const;

const PHYSICIANS = [
  {
    id: "general-specialist",
    title: "General Medicine Specialist",
    specialty: "General Medicine",
    initials: "GM",
    summary: "A demo profile showing how experience, areas of focus, and consultation approach could be presented.",
  },
  {
    id: "cardiology-specialist",
    title: "Cardiology Specialist",
    specialty: "Cardiology",
    initials: "CS",
    summary: "A fictional specialist presentation designed to make expertise and appointment options easy to understand.",
  },
  {
    id: "dermatology-specialist",
    title: "Dermatology Specialist",
    specialty: "Dermatology",
    initials: "DS",
    summary: "A demo profile combining a concise introduction, focus area, and clear route to request a consultation.",
  },
] as const;

const STEPS = ["Specialty", "Physician", "Date & time", "Contact", "Review", "Complete"] as const;

type Appointment = {
  service: string;
  physician: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
};

const EMPTY_APPOINTMENT: Appointment = {
  service: "",
  physician: "",
  date: "",
  time: "",
  name: "",
  email: "",
  phone: "",
};

export function PrivateClinicShowcase() {
  const appointmentRef = useRef<HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [expandedPhysician, setExpandedPhysician] = useState("");
  const [step, setStep] = useState(0);
  const [appointment, setAppointment] = useState<Appointment>(EMPTY_APPOINTMENT);
  const [error, setError] = useState("");

  function scrollToAppointment() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    appointmentRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  }

  function beginAppointment(service = "", physician = "", targetStep = 0) {
    setAppointment((current) => ({
      ...current,
      service: service || current.service,
      physician: physician || current.physician,
    }));
    setStep(targetStep);
    setError("");
    setMobileMenuOpen(false);
    window.setTimeout(scrollToAppointment, 0);
  }

  function updateAppointment(field: keyof Appointment, value: string) {
    setAppointment((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function validateCurrentStep() {
    if (step === 0 && !appointment.service) return "Choose a specialty to continue.";
    if (step === 1 && !appointment.physician) return "Choose a physician option to continue.";
    if (step === 2 && (!appointment.date || !appointment.time)) return "Choose a preferred date and time window.";
    if (step === 3) {
      if (!appointment.name.trim()) return "Enter a sample name for the demonstration.";
      if (!/^\S+@\S+\.\S+$/.test(appointment.email)) return "Enter a valid sample email address.";
    }
    return "";
  }

  function nextStep() {
    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function resetDemo() {
    setAppointment(EMPTY_APPOINTMENT);
    setStep(0);
    setError("");
  }

  return (
    <main className={styles.demo}>
      <div className={styles.conceptBar}>
        <div className={styles.shell}>
          <span><b>ILBATECH Concept Preview</b> Front-end demonstration only</span>
          <a href={getSitePath("/work/private-clinic-website")}>
            <ArrowLeft aria-hidden="true" size={14} /> Return to Case Study
          </a>
        </div>
      </div>

      <header className={styles.clinicHeader}>
        <div className={styles.shell}>
          <a className={styles.clinicBrand} href="#clinic-top" aria-label="Private Clinic concept home">
            <span><HeartPulse aria-hidden="true" size={22} /></span>
            <strong>Private Clinic<small>Specialist care</small></strong>
          </a>
          <nav className={styles.desktopNav} aria-label="Clinic concept navigation">
            <a href="#clinic-services">Services</a>
            <a href="#clinic-specialists">Specialists</a>
            <a href="#clinic-visit">Visit</a>
          </nav>
          <button className={styles.headerCta} type="button" onClick={() => beginAppointment()}>
            Request appointment <ArrowRight aria-hidden="true" size={15} />
          </button>
          <button
            className={styles.menuButton}
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-controls="clinic-mobile-navigation"
            aria-label={mobileMenuOpen ? "Close clinic navigation" : "Open clinic navigation"}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
          {mobileMenuOpen && (
            <nav id="clinic-mobile-navigation" className={styles.mobileNav} aria-label="Clinic mobile navigation">
              <a href="#clinic-services" onClick={() => setMobileMenuOpen(false)}>Services</a>
              <a href="#clinic-specialists" onClick={() => setMobileMenuOpen(false)}>Specialists</a>
              <a href="#clinic-visit" onClick={() => setMobileMenuOpen(false)}>Visit</a>
              <button type="button" onClick={() => beginAppointment()}>Request appointment</button>
            </nav>
          )}
        </div>
      </header>

      <section id="clinic-top" className={styles.hero}>
        <div className={`${styles.shell} ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Specialist care, clearly presented</p>
            <h1>Confidence in every step of your care.</h1>
            <p>
              Discover services, explore demo specialist profiles, and try a clear
              appointment-request experience designed around patient confidence.
            </p>
            <div className={styles.heroActions}>
              <button type="button" onClick={() => beginAppointment()}>
                Request an appointment <ArrowRight aria-hidden="true" size={16} />
              </button>
              <a href="#clinic-services">Explore services</a>
            </div>
            <div className={styles.heroSignals}>
              <span><Check size={13} /> Clear service guidance</span>
              <span><Check size={13} /> Accessible request flow</span>
              <span><Check size={13} /> Responsive experience</span>
            </div>
          </div>
          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.heroOrb}><HeartPulse size={62} strokeWidth={1.2} /></div>
            <div className={styles.heroCardMain}>
              <span>Care pathway</span>
              <strong>Find the right starting point.</strong>
              <div><i>01</i> Choose a service</div>
              <div><i>02</i> Meet a specialist</div>
              <div><i>03</i> Request a preferred time</div>
            </div>
            <div className={styles.heroCardSmall}>
              <CalendarDays size={19} />
              <span>Appointment requests<small>Simple, guided, front-end demo</small></span>
            </div>
          </div>
        </div>
      </section>

      <section id="clinic-services" className={styles.services}>
        <div className={styles.shell}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>Services & treatments</p><h2>Care made easier to understand.</h2></div>
            <p>Select a service to see how focused discovery can guide an appointment request.</p>
          </div>
          <div className={styles.serviceGrid}>
            {SERVICES.map(({ title, icon: Icon, copy }) => (
              <button
                type="button"
                className={styles.serviceCard}
                aria-pressed={selectedService === title}
                onClick={() => setSelectedService(title)}
                key={title}
              >
                <Icon aria-hidden="true" size={22} strokeWidth={1.5} />
                <strong>{title}</strong>
                <span>{copy}</span>
                <small>{selectedService === title ? "Selected" : "Explore service"} <ArrowRight size={13} /></small>
              </button>
            ))}
          </div>
          {selectedService && (
            <div className={styles.selectedService} role="status">
              <span><Check aria-hidden="true" size={18} /></span>
              <div><small>Selected service</small><strong>{selectedService}</strong></div>
              <button type="button" onClick={() => beginAppointment(selectedService, "", 1)}>
                Continue to appointment <ArrowRight aria-hidden="true" size={15} />
              </button>
            </div>
          )}
        </div>
      </section>

      <section id="clinic-specialists" className={styles.specialists}>
        <div className={styles.shell}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>Demo physician experience</p><h2>Present expertise with clarity and care.</h2></div>
            <p>These are fictional demonstration profiles and do not represent real physicians.</p>
          </div>
          <div className={styles.physicianGrid}>
            {PHYSICIANS.map((physician) => (
              <article className={styles.physicianCard} key={physician.id}>
                <div className={styles.physicianPortrait} aria-hidden="true"><span>{physician.initials}</span></div>
                <div className={styles.demoLabel}>Demo physician profile</div>
                <h3>{physician.title}</h3>
                <p className={styles.specialty}>{physician.specialty}</p>
                <p className={styles.availability}><span /> Preferred times can be requested</p>
                {expandedPhysician === physician.id && <p className={styles.physicianSummary}>{physician.summary}</p>}
                <div className={styles.physicianActions}>
                  <button type="button" onClick={() => setExpandedPhysician(expandedPhysician === physician.id ? "" : physician.id)}>
                    {expandedPhysician === physician.id ? "Hide Profile" : "View Profile"}
                  </button>
                  <button type="button" onClick={() => beginAppointment(physician.specialty, physician.title, 2)}>
                    Request Appointment
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="clinic-appointment" className={styles.appointment} ref={appointmentRef}>
        <div className={styles.shell}>
          <div className={styles.appointmentIntro}>
            <p className={styles.eyebrow}>Interactive appointment journey</p>
            <h2>Try a clear request flow.</h2>
            <p>
              This demonstration does not book an appointment, send data, or store
              information. Use sample contact details only. No health information
              is requested.
            </p>
          </div>
          <form className={styles.appointmentForm} onSubmit={(event) => event.preventDefault()} noValidate>
            <ol className={styles.stepper} aria-label="Appointment request progress">
              {STEPS.map((label, index) => (
                <li key={label} className={index <= step ? styles.stepActive : ""} aria-current={index === step ? "step" : undefined}>
                  <span>{index < step ? <Check aria-hidden="true" size={12} /> : index + 1}</span><small>{label}</small>
                </li>
              ))}
            </ol>

            <div className={styles.formPanel}>
              {error && <p className={styles.formError} role="alert">{error}</p>}

              {step === 0 && (
                <fieldset>
                  <legend>Choose a specialty</legend>
                  <p>Select the area that best fits this demonstration request.</p>
                  <div className={styles.choiceGrid}>
                    {SERVICES.map(({ title, icon: Icon }) => (
                      <button type="button" aria-pressed={appointment.service === title} onClick={() => updateAppointment("service", title)} key={title}>
                        <Icon aria-hidden="true" size={17} /> {title}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              {step === 1 && (
                <fieldset>
                  <legend>Choose a physician option</legend>
                  <p>Request a general appointment or choose a fictional demo specialist.</p>
                  <div className={styles.choiceList}>
                    <button type="button" aria-pressed={appointment.physician === "General appointment"} onClick={() => updateAppointment("physician", "General appointment")}>
                      <span><UserRound size={17} /><b>General appointment</b><small>Let the clinic match the request appropriately.</small></span><Check size={15} />
                    </button>
                    {PHYSICIANS.filter((physician) => physician.specialty === appointment.service).map((physician) => (
                      <button type="button" aria-pressed={appointment.physician === physician.title} onClick={() => updateAppointment("physician", physician.title)} key={physician.id}>
                        <span><Stethoscope size={17} /><b>{physician.title}</b><small>Fictional demonstration profile</small></span><Check size={15} />
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              {step === 2 && (
                <fieldset>
                  <legend>Select a preferred date and time</legend>
                  <p>Selections demonstrate preference capture only and do not reflect real availability.</p>
                  <label className={styles.field}>
                    <span>Preferred date</span>
                    <input type="date" value={appointment.date} onChange={(event) => updateAppointment("date", event.target.value)} />
                  </label>
                  <div className={styles.timeChoices} aria-label="Preferred time window">
                    {["Morning · 09:00–12:00", "Afternoon · 12:00–16:00", "Evening · 16:00–18:00"].map((time) => (
                      <button type="button" aria-pressed={appointment.time === time} onClick={() => updateAppointment("time", time)} key={time}>
                        <Clock3 size={15} /> {time}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              {step === 3 && (
                <fieldset>
                  <legend>Enter sample contact details</legend>
                  <p>Use demonstration information only. These fields remain in this browser session and are never submitted.</p>
                  <div className={styles.formGrid}>
                    <label className={styles.field}><span>Sample name</span><input type="text" autoComplete="off" value={appointment.name} placeholder="Demo Visitor" onChange={(event) => updateAppointment("name", event.target.value)} /></label>
                    <label className={styles.field}><span>Sample email</span><input type="email" autoComplete="off" value={appointment.email} placeholder="demo@example.com" onChange={(event) => updateAppointment("email", event.target.value)} /></label>
                    <label className={styles.field}><span>Sample phone <small>(optional)</small></span><input type="tel" autoComplete="off" value={appointment.phone} placeholder="000 000 0000" onChange={(event) => updateAppointment("phone", event.target.value)} /></label>
                  </div>
                </fieldset>
              )}

              {step === 4 && (
                <fieldset>
                  <legend>Review the demonstration request</legend>
                  <p>Confirm the interface summary below. No request will be transmitted.</p>
                  <dl className={styles.reviewList}>
                    <div><dt>Specialty</dt><dd>{appointment.service}</dd></div>
                    <div><dt>Physician option</dt><dd>{appointment.physician}</dd></div>
                    <div><dt>Preferred date</dt><dd>{appointment.date}</dd></div>
                    <div><dt>Preferred time</dt><dd>{appointment.time}</dd></div>
                    <div><dt>Sample contact</dt><dd>{appointment.name} · {appointment.email}</dd></div>
                  </dl>
                </fieldset>
              )}

              {step === 5 && (
                <div className={styles.confirmation} role="status">
                  <span><Check aria-hidden="true" size={25} /></span>
                  <p className={styles.eyebrow}>Demonstration complete</p>
                  <h3>Your demo request is ready.</h3>
                  <p>No appointment was booked and no information was sent or stored.</p>
                  <button type="button" onClick={resetDemo}>Try the flow again</button>
                </div>
              )}

              {step < 5 && (
                <div className={styles.formActions}>
                  {step > 0 && <button type="button" onClick={() => { setStep((current) => current - 1); setError(""); }}>Back</button>}
                  <button type="button" onClick={nextStep}>{step === 4 ? "Confirm demo request" : "Continue"} <ArrowRight size={15} /></button>
                </div>
              )}
            </div>
          </form>
        </div>
      </section>

      <section id="clinic-visit" className={styles.visit}>
        <div className={`${styles.shell} ${styles.visitGrid}`}>
          <div>
            <p className={styles.eyebrow}>Contact & location concept</p>
            <h2>Make practical information easy to find.</h2>
            <div className={styles.contactCards}>
              <div><Phone size={18} /><span><small>Demo contact line · not active</small><b>000 000 0000</b></span></div>
              <div><Mail size={18} /><span><small>Demo email · not active</small><b>clinic@example.com</b></span></div>
              <div><Clock3 size={18} /><span><small>Example opening hours</small><b>Mon–Fri 08:00–18:00 · Sat 09:00–13:00</b></span></div>
            </div>
            <div className={styles.emergencyNote}>
              <TriangleAlert size={18} />
              <p><b>Emergency information distinction</b> In a live clinic website, emergency guidance would be configured using locally approved services. This concept does not provide medical advice or emergency support.</p>
            </div>
          </div>
          <div className={styles.mapConcept} role="img" aria-label="Generic demonstration map with no real clinic location">
            <div aria-hidden="true"><i /><i /><i /><i /><span><MapPin size={29} /><b>Demonstration location</b><small>No real address shown</small></span></div>
          </div>
        </div>
      </section>

      <section className={styles.ilbatechCta}>
        <div className={`${styles.shell} ${styles.ilbatechCtaGrid}`}>
          <div><p>ILBATECH · Concept Project</p><h2>Have a similar clinic project in mind?</h2></div>
          <div>
            <p>This concept was created by ILBATECH to demonstrate an approach to modern healthcare digital experiences.</p>
            <div>
              <a href={getSitePath("/contact#contact-form")}>Start a Conversation <ArrowRight size={15} /></a>
              <a href={SITE.whatsappUrl}><MessageCircle size={16} /> Chat on WhatsApp</a>
            </div>
          </div>
        </div>
      </section>

      <button className={styles.mobileAppointmentCta} type="button" onClick={() => beginAppointment()}>
        <CalendarDays size={17} /> Request appointment
      </button>
    </main>
  );
}
