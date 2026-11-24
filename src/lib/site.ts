// Company details — replace the placeholders with real data.
// Name, address and phone must match the Google Business Profile exactly (local SEO).
const address = {
  street: "Via Pistola, 10",
  postalCode: "33080",
  locality: "Porcia",
  province: "PN",
  region: "Friuli-Venezia Giulia",
  country: "IT",
};
const mapsQuery = `${address.street}, ${address.postalCode} ${address.locality} ${address.province}`;

export const site = {
  name: "Fondamenta Costruzioni",
  shortName: "FONDAMENTA",
  legalName: "Fondamenta Costruzioni s.r.l.",
  vat: "00000000000", // TODO: real P.IVA
  phone: "+39 0434 000 000", // TODO: real phone
  phoneHref: "tel:+390434000000",
  email: "info@fondamenta-costruzioni.it", // TODO: real email
  city: `${address.locality} (${address.province})`,
  address,
  /** One-line postal address, as shown on the site. */
  addressLine: `${address.street}, ${address.postalCode} ${address.locality} (${address.province})`,
  mapsQuery,
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`,
  directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapsQuery)}`,
  /** Same as the "Lun – Sab" hours in the dictionaries. */
  openingHours: { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "07:30", closes: "18:30" },
  /** Towns we work in (structured data for local search). */
  areaServed: [
    "Porcia",
    "Pordenone",
    "Cordenons",
    "Fiume Veneto",
    "Azzano Decimo",
    "Sacile",
    "Prata di Pordenone",
    "Brugnera",
    "Fontanafredda",
    "Roveredo in Piano",
    "San Vito al Tagliamento",
  ],
  socials: {
    facebook: "#",
    instagram: "#",
    linkedin: "#",
  },
  stats: { projects: 200, clients: 99, years: 15 }, // TODO: real numbers
};
