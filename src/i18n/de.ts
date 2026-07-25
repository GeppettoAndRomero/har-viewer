import type { ToolContent } from './types';

// Deutsch. Keine Wort-für-Wort-Übersetzung, sondern Transkreation auf Basis der
// Begriffe, die in deutschsprachigen Entwickler-/Netzwerk-Analyse-Kreisen tatsächlich
// verwendet werden. Keine Werbefloskeln (einfach / schnell / perfekt) — Datenschutz
// wird strukturell begründet, nicht versprochen (BRAND-OPERATING-MODEL). Register:
// informelles „du", wie bei kostenlosen Browser-Tools üblich.

export const de: ToolContent = {
  htmlLang: 'de',

  meta: {
    title: 'HAR Viewer — DevTools-Netzwerkmitschnitte im Browser ansehen | runlocally',
    description:
      'Eine .har-Datei (HTTP Archive) aus den Browser-DevTools ansehen: Anfragenliste, Timing-Wasserfall, Header/Body/Cookie-Details. Werte, die wie Tokens oder Sitzungs-Cookies aussehen, werden markiert. Die Datei wird auf deinem Gerät gelesen und nie hochgeladen. Open Source, funktioniert offline.',
    ogTitle: 'HAR Viewer — DevTools-Netzwerkmitschnitte ansehen, ohne Upload',
    ogDescription:
      'Eine .har-Datei im Browser öffnen: Anfragenliste, Wasserfall, und Hinweise auf Tokens oder Sitzungs-Cookies. Nichts wird hochgeladen. Open Source, offline nutzbar.',
  },

  hero: {
    h1: 'HAR Viewer',
    tagline:
      'Einen DevTools-.har-Mitschnitt im Browser ansehen — Anfragenliste, Timing-Wasserfall und Hinweise auf Werte, die wie Tokens oder Sitzungs-Cookies aussehen. Nichts wird hochgeladen.',
  },

  intro: {
    h2: 'HAR-Dateien im Browser ansehen',
    paras: [
      'Eine .har-Datei (HTTP Archive) ist der Netzwerkmitschnitt, den die DevTools deines Browsers exportieren: jede Anfrage und Antwort, mit Headern, Timing, Cookies und Body. Dieses Tool öffnet sie und zeigt eine scrollbare Anfragenliste, eine Timing-Aufschlüsselung pro Anfrage sowie vollständige Header-/Body-Details für alles, worauf du klickst.',
      'Ein HAR-Mitschnitt gehört auch zu den sensibelsten Dateien, die ein Browser erzeugen kann — er kann gültige Sitzungs-Cookies, Bearer-Tokens und API-Schlüssel enthalten, genau so, wie sie gesendet wurden. Das ist keine Theorie: Beim Okta-Supportsystem-Vorfall 2023 nutzte ein Angreifer ein Sitzungs-Token, das in einer HAR-Datei enthalten war, die ein Kunde in einem Support-Ticket hochgeladen hatte. Dieses Tool durchsucht beim Laden Header, Query-Parameter und Cookies nach Wertformen, die typischerweise auf ein Geheimnis hindeuten, und markiert die betroffenen Anfragen — damit du siehst, was du gerade weitergeben würdest, bevor du es teilst.',
    ],
  },

  privacy: {
    h2: 'Warum deine Datei auf dem Gerät bleibt',
    lead: 'Datenschutz ist hier strukturell, kein Versprechen. Es gibt keinen Upload-Schritt, weil es keinen Server gibt, an den die Datei gesendet werden könnte — das zählt hier mehr als bei den meisten Tools, da eine HAR-Datei genau die Sitzungs-Tokens enthalten kann, hinter denen ein Angreifer her wäre:',
    points: [
      'Die Datei wird vollständig in deinem Browser gelesen und geparst.',
      'Die Seite wird als statische Dateien ausgeliefert und sendet keine Anfrage mit deinen Daten.',
      'Der Quellcode ist offen und kann von allen eingesehen werden (MIT).',
      'Die Seite funktioniert offline – was nur möglich ist, weil nichts das Gerät verlässt.',
    ],
    note: 'Wenn du es selbst prüfen willst, öffne beim Öffnen einer Datei das Netzwerk-Panel deines Browsers – keine Anfrage trägt ihren Inhalt.',
    sourceLinkText: 'Quellcode ansehen.',
  },

  howto: {
    h2: 'So funktioniert es',
    steps: [
      {
        h3: 'Datei öffnen',
        p: 'Klicke, um eine .har-Datei auszuwählen, die du über die DevTools deines Browsers (Netzwerk-Panel → HAR exportieren) exportiert hast, oder ziehe sie irgendwo auf die Seite. Die Datei wird lokal gelesen.',
      },
      {
        h3: 'Anfragenliste durchsehen',
        p: 'Methode, URL, Status, Typ, Größe und Zeit für jede Anfrage, mit einem kleinen Zeitleisten-Balken pro Zeile. Ein Warnsymbol markiert jede Anfrage, deren Header, Query-Parameter oder Cookies wie ein Token oder Geheimnis aussehen.',
      },
      {
        h3: 'Zeile für Details anklicken',
        p: 'Vollständige Anfrage-/Antwort-Header, Query-Parameter, Cookies und formatierte Bodies ansehen. Markierte Werte werden direkt hervorgehoben — nie versteckt —, sodass du genau siehst, was gesendet wurde.',
      },
    ],
  },

  faqHeading: 'Häufige Fragen',
  faq: [
    {
      q: 'Wird meine HAR-Datei irgendwohin hochgeladen?',
      a: 'Nein. Die Datei wird vollständig in deinem Browser gelesen und geparst. Es gibt keine Serverkomponente, also gibt es für ihren Inhalt — auch für alles Sensible darin — keinen Weg vom Gerät. Der Quellcode ist offen und du kannst das im Netzwerk-Panel deines Browsers nachprüfen.',
    },
    {
      q: 'Was bedeutet das Warnsymbol?',
      a: 'Es bedeutet, dass die Header, Query-Parameter oder Cookies dieser Anfrage einen Wert enthalten, der wie ein verbreitetes Geheimnis aussieht: ein Authorization: Bearer-Token, ein JWT (beginnt mit eyJ, drei durch Punkte getrennte Segmente), ein AWS-Zugriffsschlüssel (AKIA...), ein GitHub-Token (ghp_/gho_...), ein API-Schlüssel mit sk--Präfix, ein Query-Parameter namens api_key/access_token/token, oder einfach das Vorhandensein eines Cookie-/Set-Cookie-Headers.',
    },
    {
      q: 'Werden markierte Werte versteckt oder geschwärzt?',
      a: 'Nein — mit Absicht. Der Zweck ist lokale Sichtbarkeit: zu sehen, was dein eigener Mitschnitt enthält, bevor du entscheidest, ob du ihn mit jemandem teilst. Markierte Werte werden in der Detailansicht hervorgehoben, nicht maskiert.',
    },
    {
      q: 'Werden auch Anfrage- und Antwort-Bodies durchsucht?',
      a: 'In dieser Version nicht. Die Erkennung beschränkt sich auf Header-Werte, Query-Parameter-Werte und Cookie-Werte. Auch Bodies können Geheimnisse enthalten, aber sie zu durchsuchen ist ein größeres, eigenständiges Problem für eine spätere Version.',
    },
    {
      q: 'Kann es Tokens entfernen und eine bereinigte HAR-Datei exportieren?',
      a: 'Nein — dies ist ein Viewer, und das gezielte Bereinigen/Schwärzen von HAR-Dateien ist eine andere Aufgabe mit eigenen Abwägungen. Falls du das brauchst: Cloudflare veröffentlicht einen quelloffenen, clientseitigen HAR-Sanitizer, der genau dafür gebaut ist.',
    },
    {
      q: 'Was zeigt der Zeitleisten-Balken?',
      a: 'Die Phasen blocked/DNS/connect/send/wait/receive jeder Anfrage (aus den timings der HAR-Datei), als gestapelter Balken gezeichnet und an der Gesamtdauer des Mitschnitts bemessen — eine Anfrage, die einen großen Anteil der Sitzung ausgemacht hat, zeigt einen langen Balken, eine schnelle einen kurzen.',
    },
    {
      q: 'Funktioniert es offline?',
      a: 'Ja. Das Tool ist eine PWA. Nach dem ersten Besuch wird es zwischengespeichert, sodass es ohne Netzwerkverbindung geöffnet werden kann. Du kannst es auch zum Startbildschirm hinzufügen.',
    },
  ],

  footer: {
    openSourceLabel: 'Open Source (MIT)',
    partOf: 'Teil von',
    brandTail: '— kleine Tools, die lokal auf deinem Gerät laufen.',
    colophon:
      'Erstellt und gepflegt von Geppetto. Ein Teil des Codes entsteht mit KI-Unterstützung; Prüfung und Entscheidungen liegen beim Maintainer.',
    securityText: 'Sicherheit',
  },
};
