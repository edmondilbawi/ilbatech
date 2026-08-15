export const GOOGLE_FORM = {
  actionUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSe52jHHa2iopu-mImttPj4rNOxainVSLlQr1qdATzwIUzaSPQ/formResponse",
  target: "itg-google-form-response",
  fields: {
    fullName: {
      question: "Name",
      entryId: "entry.1344544065",
      requiredByGoogle: true,
    },
    email: {
      question: "Email",
      entryId: "entry.1542327069",
      requiredByGoogle: false,
    },
    company: {
      question: "Company Name",
      entryId: "entry.1123393057",
      requiredByGoogle: true,
    },
    service: {
      question: "What do you need help with?",
      entryId: "entry.415823819",
      requiredByGoogle: true,
    },
    project: {
      question: "Tell us about your project.",
      entryId: "entry.231616111",
      requiredByGoogle: true,
    },
    additional: {
      question: "Additional Details",
      entryId: "entry.2137717800",
      requiredByGoogle: false,
    },
  },
  serviceOptions: [
    "Website Development",
    "Mobile Application",
    "AI & Task Automation",
    "E-Commerce",
    "Not sure, I need advice",
    "Other",
  ],
} as const;
