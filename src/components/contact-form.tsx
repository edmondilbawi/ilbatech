"use client";

import { FormEvent, SyntheticEvent, useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { GOOGLE_FORM } from "@/config/google-form";
import { SITE } from "@/config/site";

type SubmissionStatus = "idle" | "submitting" | "success" | "error";

const SUBMISSION_TIMEOUT_MS = 20_000;
const HELP_OPTIONS = [
  { label: "Website / Web App", service: "Website Development" },
  { label: "Business System", service: "Not sure, I need advice" },
  { label: "Mobile App", service: "Mobile Application" },
  { label: "AI / Automation", service: "AI & Task Automation" },
  { label: "E-Commerce", service: "E-Commerce" },
  { label: "Not Sure Yet", service: "Not sure, I need advice" },
  { label: "Other", service: "Other" },
] as const;

export function ContactForm() {
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [contextApplied, setContextApplied] = useState(false);
  const [selectedHelp, setSelectedHelp] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const submissionPendingRef = useRef(false);
  const timeoutRef = useRef<number | undefined>(undefined);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const websiteRef = useRef<HTMLInputElement>(null);
  const additionalRef = useRef<HTMLTextAreaElement>(null);
  const googleAdditionalRef = useRef<HTMLInputElement>(null);
  const serviceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const requestedService = new URLSearchParams(window.location.search).get(
      "service",
    );

    if (
      requestedService &&
      (GOOGLE_FORM.serviceOptions as readonly string[]).includes(
        requestedService,
      ) &&
      serviceRef.current
    ) {
      serviceRef.current.value = requestedService;
      setSelectedHelp(
        HELP_OPTIONS.find((option) => option.service === requestedService)?.label ?? "",
      );
      setContextApplied(true);
    }

    return () => window.clearTimeout(timeoutRef.current);
  }, []);

  function finishSubmission() {
    submissionPendingRef.current = false;
    window.clearTimeout(timeoutRef.current);
    formRef.current?.reset();
    setSelectedHelp("");
    setStatus("success");
  }

  function handleIframeLoad(event: SyntheticEvent<HTMLIFrameElement>) {
    if (!submissionPendingRef.current) return;

    try {
      const iframeUrl = event.currentTarget.contentWindow?.location.href;
      if (!iframeUrl || iframeUrl === "about:blank") return;
    } catch {
      finishSubmission();
      return;
    }

    finishSubmission();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;

    if (submissionPendingRef.current) {
      event.preventDefault();
      return;
    }

    if (!form.checkValidity()) {
      event.preventDefault();
      form.reportValidity();
      return;
    }

    if (honeypotRef.current?.value.trim()) {
      event.preventDefault();
      form.reset();
      setSelectedHelp("");
      setStatus("success");
      return;
    }

    const additionalDetails = [
      phoneRef.current?.value.trim()
        ? `Phone number: ${phoneRef.current.value.trim()}`
        : "",
      websiteRef.current?.value.trim()
        ? `Current website: ${websiteRef.current.value.trim()}`
        : "",
      additionalRef.current?.value.trim()
        ? `Additional details: ${additionalRef.current.value.trim()}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    if (googleAdditionalRef.current) {
      googleAdditionalRef.current.value = additionalDetails;
    }

    submissionPendingRef.current = true;
    setStatus("submitting");
    timeoutRef.current = window.setTimeout(() => {
      if (!submissionPendingRef.current) return;
      submissionPendingRef.current = false;
      setStatus("error");
    }, SUBMISSION_TIMEOUT_MS);
  }

  const statusMessage = {
    idle: "",
    submitting: "Sending your enquiry…",
    success:
      "Thank you. We’ve received your enquiry and will review it shortly. We’ll get back to you using the email address you provided.",
    error: "",
  }[status];

  return (
    <>
      <form
        ref={formRef}
        id="contact-form"
        className="contact-form"
        action={GOOGLE_FORM.actionUrl}
        method="POST"
        target={GOOGLE_FORM.target}
        noValidate
        onSubmit={handleSubmit}
      >
        {contextApplied && (
          <p className="form-context" id="service-context">
            We’ve preselected the closest service category based on what you were
            exploring. You can change it at any time.
          </p>
        )}
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="full-name">
              Full Name <b aria-hidden="true">*</b>
            </label>
            <input
              id="full-name"
              name={GOOGLE_FORM.fields.fullName.entryId}
              autoComplete="name"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="company">
              Business / Company Name or Business Type <b aria-hidden="true">*</b>
            </label>
            <input
              id="company"
              name={GOOGLE_FORM.fields.company.entryId}
              autoComplete="organization"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="email">
              Email Address <b aria-hidden="true">*</b>
            </label>
            <input
              id="email"
              name={GOOGLE_FORM.fields.email.entryId}
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="phone">
              Phone Number <span>(optional)</span>
            </label>
            <input
              ref={phoneRef}
              id="phone"
              type="tel"
              autoComplete="tel"
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="help">
            What do you need help with? <b aria-hidden="true">*</b>
          </label>
          <select
            id="help"
            value={selectedHelp}
            required
            aria-describedby={contextApplied ? "service-context" : undefined}
            onChange={(event) => {
              const nextHelp = event.currentTarget.value;
              const option = HELP_OPTIONS.find((item) => item.label === nextHelp);
              setSelectedHelp(nextHelp);
              if (serviceRef.current) serviceRef.current.value = option?.service ?? "";
              setContextApplied(false);
            }}
          >
            <option value="" disabled>
              Select the closest option
            </option>
            {HELP_OPTIONS.map((option) => (
              <option key={option.label} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
          <input ref={serviceRef} type="hidden" name={GOOGLE_FORM.fields.service.entryId} />
        </div>

        <div className="form-field">
          <label htmlFor="project">
            Tell us about your project or business challenge{"\u00a0"}
            <b aria-hidden="true">*</b>
          </label>
          <textarea
            id="project"
            name={GOOGLE_FORM.fields.project.entryId}
            rows={5}
            placeholder="What are you trying to accomplish, and what is making the business harder to operate today?"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="website">
            Current Website <span>(optional)</span>
          </label>
          <input
            ref={websiteRef}
            id="website"
            type="url"
            placeholder="https://"
            inputMode="url"
            autoComplete="url"
          />
        </div>

        <div className="form-field">
          <label htmlFor="additional-details">
            Anything else you&apos;d like us to know? <span>(optional)</span>
          </label>
          <textarea
            ref={additionalRef}
            id="additional-details"
            rows={4}
            placeholder="Add any useful context, priorities, or constraints."
          />
        </div>

        <div className="form-honeypot" aria-hidden="true">
          <label htmlFor="business-fax">Leave this field empty</label>
          <input
            ref={honeypotRef}
            id="business-fax"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <input
          ref={googleAdditionalRef}
          type="hidden"
          name={GOOGLE_FORM.fields.additional.entryId}
        />

        <p className="form-required">
          <b>*</b> Required fields
        </p>
        <p className="form-disclosure">
          Submitting sends the information you enter to ILBATECH through Google
          Forms. Please do not include passwords, payment details, health
          information, or other sensitive data.
        </p>
        <button
          type="submit"
          className="button button--primary"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? (
            "Sending…"
          ) : (
            <>
              Send Message
              <ArrowRight aria-hidden="true" size={17} strokeWidth={1.8} />
            </>
          )}
        </button>
        <p
          className={`form-status form-status--${status}`}
          role={status === "error" ? "alert" : "status"}
          aria-live={status === "error" ? "assertive" : "polite"}
        >
          {status === "error" ? (
            <>
              Something went wrong while submitting your enquiry. Please try
              again or{" "}
              <a href={`mailto:${SITE.email}`}>contact us directly</a>.
            </>
          ) : (
            statusMessage
          )}
        </p>
      </form>

      <iframe
        className="form-submission-frame"
        name={GOOGLE_FORM.target}
        src="about:blank"
        title="Contact form submission response"
        tabIndex={-1}
        aria-hidden="true"
        onLoad={handleIframeLoad}
      />
    </>
  );
}
