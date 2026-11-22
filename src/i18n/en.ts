import type { Dictionary } from "./it";

const en: Dictionary = {
  meta: {
    title: "Fondamenta Costruzioni — Building company in Pordenone",
    description:
      "Residential construction, renovations, roofing and façades in Pordenone and its province. Free quote.",
  },
  top: { hours: "Mon – Sat: 7:30am – 6:30pm" },
  nav: { home: "Home", about: "About", services: "Services", process: "Process", contacts: "Contacts", menu: "Menu", theme: "Dark mode" },
  cta: { quote: "Free quote" },
  hero: {
    kicker: "Building company in Pordenone",
    title: ["PRECISION.", "QUALITY.", "INNOVATION."],
    badge: "years of building\nin Friuli",
    tag: "from design to delivery",
    sideTitle: "BUILDERS OF\nTRUST & QUALITY",
    sideText:
      "New homes, renovations, roofs and façades across western Friuli. One point of contact, reliable timelines and tidy sites.",
    sideCta: "Book a site visit",
    imageAlt: "Worker tying rebar on a construction site",
  },
  marquee: ["Residential construction", "Renovations", "Roofing", "Façades", "Thermal insulation", "Turnkey projects"],
  about: {
    tag: "where ideas take solid form",
    title: "WE BUILD MORE THAN STRUCTURES —\nWE BUILD HOMES THAT LAST",
    lead: "For over 15 years we've turned plans for homes, renovations and roofs into solid realities in Pordenone and across its province.",
    text: "We combine Friulian craftsmanship, certified materials and precise site management. Every detail matters, from the first site visit to the last roof tile, because a well-built home lasts for generations.",
    stats: { projects: "completed\nprojects", clients: "client\nsatisfaction", years: "years in\nconstruction" },
    photoAlt: "Our team on a construction site",
    houseAlt: "A modern house we built",
  },
  services: {
    tag: "end-to-end solutions",
    title: "COMPREHENSIVE SOLUTIONS\nFOR EVERY PROJECT",
    cta: "Talk to us",
    items: [
      { title: "RESIDENTIAL\nCONSTRUCTION", text: "Detached and semi-detached houses and small apartment buildings: from foundations to finishes, turnkey." },
      { title: "RENOVATIONS", text: "Complete renovations of houses and apartments: plumbing and electrics, bathrooms, kitchens, demolition and rebuilding." },
      { title: "ROOFING", text: "Timber and concrete roof rebuilding, waterproofing, gutters, flashing and skylights." },
      { title: "FAÇADES &\nINSULATION", text: "External thermal insulation, façade restoration and energy upgrades of the building envelope." },
    ],
  },
  process: {
    tag: "how we work",
    title: "FOUR STEPS,\nNO SURPRISES",
    steps: [
      { title: "Free site visit", text: "We come on site, listen to your needs and assess the condition of the building." },
      { title: "Design & quote", text: "A detailed, transparent, itemised quote with a defined delivery date." },
      { title: "Construction", text: "A dedicated site manager and weekly photo updates on how the work is progressing." },
      { title: "Turnkey handover", text: "Final inspection, cleaning, complete documentation and a warranty on all work." },
    ],
  },
  why: {
    tag: "partnering for success",
    title: "YOUR PROJECT,\nOUR PRIORITY",
    imageAlt: "Modern villa with a swimming pool",
    items: [
      { title: "Reliability and transparency", text: "One point of contact, clear prices and no hidden costs. Agreed timelines are written into the contract — and we keep them." },
      { title: "Modern materials and technology", text: "We work with certified suppliers and energy-saving solutions for a more efficient, quieter and more comfortable home." },
      { title: "Permits and tax incentives", text: "We guide you through building permits and the paperwork for the tax deductions available for renovations and energy upgrades." },
    ],
  },
  contact: {
    tag: "let's talk about your project",
    title: "GET A\nFREE QUOTE",
    text: "Tell us what you want to build or renovate — we'll get back to you within 24 business hours.",
    phoneLabel: "Phone",
    emailLabel: "Email",
    areaLabel: "Service area",
    area: "Pordenone and province, Friuli-Venezia Giulia",
  },
  form: {
    name: "Full name",
    phone: "Phone",
    email: "Email (optional)",
    type: "Type of work",
    types: {
      new_build: "New build",
      renovation: "Renovation",
      roof: "Roof",
      facade: "Façade / insulation",
      inspection: "Free site visit",
      design_quote: "Design & quote",
      construction: "Construction",
      turnkey: "Turnkey handover",
      other: "Other",
    },
    message: "Message",
    messagePlaceholder: "Briefly describe the job, the location and your timing",
    consent: "I agree to the processing of my personal data so I can be contacted.",
    send: "Send request",
    sending: "Sending…",
    success: "Thank you! We've received your request and will be in touch shortly.",
    errors: {
      name: "Please enter your full name.",
      phone: "Please enter a valid phone number.",
      email: "Invalid email address.",
      message: "The message is too long.",
      consent: "Your consent is required to send the request.",
      invalid: "Please check the highlighted fields.",
      server: "Something went wrong. Please try again or call us directly.",
    },
  },
  footer: { language: "Language" },
};

export default en;
