// Italian dictionary — the source of truth for the Dictionary type.
// "\n" inside a string renders as a line break (see <Lines />).
const it = {
  meta: {
    title: "Fondamenta Costruzioni — Impresa edile a Pordenone",
    description:
      "Costruzioni residenziali, ristrutturazioni, tetti e facciate a Pordenone e provincia. Preventivo gratuito.",
  },
  top: { hours: "Lun – Sab: 7:30 – 18:30" },
  nav: { home: "Home", about: "Chi siamo", services: "Servizi", process: "Metodo", contacts: "Contatti", menu: "Menu", theme: "Tema scuro" },
  cta: { quote: "Preventivo gratuito" },
  hero: {
    kicker: "Impresa edile a Pordenone",
    title: ["PRECISIONE.", "QUALITÀ.", "INNOVAZIONE."],
    badge: "anni di cantieri\nin Friuli",
    tag: "dal progetto alla consegna",
    sideTitle: "COSTRUTTORI DI\nFIDUCIA & QUALITÀ",
    sideText:
      "Case nuove, ristrutturazioni, tetti e facciate in tutto il Friuli Occidentale. Un unico referente, tempi certi e cantieri puliti.",
    sideCta: "Richiedi un sopralluogo",
    imageAlt: "Operaio al lavoro sulle armature in cantiere",
  },
  marquee: ["Costruzioni residenziali", "Ristrutturazioni", "Tetti e coperture", "Facciate", "Cappotto termico", "Chiavi in mano"],
  about: {
    tag: "dove le idee prendono forma",
    title: "COSTRUIAMO PIÙ CHE EDIFICI —\nCOSTRUIAMO CASE CHE DURANO",
    lead: "Da oltre 15 anni trasformiamo progetti di case, ristrutturazioni e coperture in realtà solide, a Pordenone e in tutta la provincia.",
    text: "Uniamo artigianalità friulana, materiali certificati e una gestione del cantiere precisa. Ogni dettaglio conta, dal primo sopralluogo all'ultima tegola, perché una casa ben costruita dura per generazioni.",
    stats: { projects: "progetti\ncompletati", clients: "clienti\nsoddisfatti", years: "anni nel\nsettore edile" },
    photoAlt: "La nostra squadra in cantiere",
    houseAlt: "Casa moderna realizzata",
  },
  services: {
    tag: "soluzioni complete",
    title: "SOLUZIONI COMPLETE\nPER OGNI PROGETTO",
    cta: "Parla con noi",
    items: [
      { title: "COSTRUZIONI\nRESIDENZIALI", text: "Case unifamiliari, bifamiliari e piccole palazzine: dalle fondazioni alle finiture, chiavi in mano." },
      { title: "RISTRUTTU­RAZIONI", text: "Ristrutturazioni complete di case e appartamenti: impianti, bagni, cucine, demolizioni e ricostruzioni." },
      { title: "TETTI &\nCOPERTURE", text: "Rifacimento tetti in legno e laterocemento, impermeabilizzazioni, lattonerie e lucernari." },
      { title: "FACCIATE &\nCAPPOTTO", text: "Isolamento a cappotto, rifacimento facciate e riqualificazione energetica dell'involucro." },
    ],
  },
  process: {
    tag: "il nostro metodo",
    title: "QUATTRO PASSI,\nNESSUNA SORPRESA",
    steps: [
      { title: "Sopralluogo gratuito", text: "Veniamo in cantiere, ascoltiamo le tue esigenze e valutiamo lo stato dell'edificio." },
      { title: "Progetto e preventivo", text: "Preventivo dettagliato e trasparente, voce per voce, con tempi di consegna definiti." },
      { title: "Cantiere", text: "Un capocantiere dedicato e aggiornamenti settimanali con foto sull'avanzamento dei lavori." },
      { title: "Consegna chiavi in mano", text: "Collaudo, pulizia finale, documentazione completa e garanzia sui lavori eseguiti." },
    ],
  },
  why: {
    tag: "partner per il tuo successo",
    title: "IL TUO PROGETTO,\nLA NOSTRA PRIORITÀ",
    imageAlt: "Villa moderna con piscina",
    items: [
      { title: "Affidabilità e trasparenza", text: "Un unico referente, prezzi chiari e nessun costo nascosto. I tempi concordati sono scritti nel contratto e li rispettiamo." },
      { title: "Materiali e tecnologie moderne", text: "Lavoriamo con fornitori certificati e soluzioni per il risparmio energetico, per una casa più efficiente, silenziosa e confortevole." },
      { title: "Pratiche edilizie e detrazioni", text: "Ti seguiamo nelle pratiche edilizie e nella documentazione per le detrazioni fiscali previste per ristrutturazioni e riqualificazione energetica." },
    ],
  },
  contact: {
    tag: "parliamo del tuo progetto",
    title: "RICHIEDI UN\nPREVENTIVO GRATUITO",
    text: "Raccontaci cosa vuoi costruire o ristrutturare: ti ricontattiamo entro 24 ore lavorative.",
    phoneLabel: "Telefono",
    emailLabel: "Email",
    areaLabel: "Zona di lavoro",
    area: "Pordenone e provincia, Friuli-Venezia Giulia",
  },
  form: {
    name: "Nome e cognome",
    phone: "Telefono",
    email: "Email (facoltativa)",
    type: "Tipo di lavoro",
    types: {
      new_build: "Nuova costruzione",
      renovation: "Ristrutturazione",
      roof: "Tetto / copertura",
      facade: "Facciata / cappotto",
      other: "Altro",
    },
    message: "Messaggio",
    messagePlaceholder: "Descrivi brevemente il lavoro, la zona e le tempistiche",
    consent: "Acconsento al trattamento dei dati personali per essere ricontattato.",
    send: "Invia richiesta",
    sending: "Invio in corso…",
    success: "Grazie! Abbiamo ricevuto la tua richiesta, ti ricontatteremo a breve.",
    errors: {
      name: "Inserisci nome e cognome.",
      phone: "Inserisci un numero di telefono valido.",
      email: "Indirizzo email non valido.",
      message: "Il messaggio è troppo lungo.",
      consent: "È necessario il consenso per inviare la richiesta.",
      invalid: "Controlla i campi evidenziati.",
      server: "Si è verificato un errore. Riprova o chiamaci direttamente.",
    },
  },
  footer: { language: "Lingua" },
};

export default it;
export type Dictionary = typeof it;
