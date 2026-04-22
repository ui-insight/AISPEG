import Link from "next/link";

interface OutreachEvent {
  title: string;
  eventType: "Workshop" | "Activity tool" | "Talk" | "Brief";
  date: string;
  location?: string;
  audience: string;
  description: string;
  presenters?: string[];
  url?: string;
  repoUrl?: string;
  liveUrl?: string;
  status: "Upcoming" | "Delivered";
}

const events: OutreachEvent[] = [
  {
    title: "AI4RA: The Intersection Between AI and Data",
    eventType: "Workshop",
    date: "April 20, 2026",
    location: "REACH 2026 · Room BRISTOL · 24 seats",
    audience: "Research administration professionals",
    description:
      "Three-hour hands-on workshop on building safer, more relevant, more inspectable AI-assisted workflows at participating institutions. Workshop thesis: \"What's the most important model? Your data model.\" Two themes ran throughout: reproducibility and data organization. Lessons from the AI4RA NSF GRANTED project woven across all modules.",
    presenters: [
      "Nathan Wiggins (Southern Utah University)",
      "Nathan Layman (University of Idaho)",
      "Barrie Robison (University of Idaho)",
    ],
    url: "https://ui-insight.github.io/REACHWorkshop2026/",
    repoUrl: "https://github.com/ui-insight/REACHWorkshop2026",
    liveUrl: "https://ui-insight.github.io/REACHWorkshop2026/",
    status: "Delivered",
  },
  {
    title: "Data Crawler Carl",
    eventType: "Activity tool",
    date: "April 20, 2026",
    audience: "REACH workshop participants",
    description:
      "In-browser AI CSV explorer built as the hands-on activity for the REACH 2026 AI4RA workshop. Upload a CSV, query with natural language, visualize with auto-generated Plotly charts. Runs entirely in the browser via sql.js + Google Gemini; only the schema sample leaves the browser, data stays local.",
    repoUrl: "https://github.com/ui-insight/data-crawler-carl",
    liveUrl: "https://ui-insight.github.io/data-crawler-carl/",
    status: "Delivered",
  },
];

const upcoming = events.filter((e) => e.status === "Upcoming");
const delivered = events.filter((e) => e.status === "Delivered");

export default function OutreachPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-ui-charcoal">Outreach</h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          Workshops, talks, activity tools, and peer-institution engagements
          where AISPEG and the AI4RA partnership share what we&apos;ve
          learned. Distinct from the UI AI interventions themselves &mdash;
          these are the ways we <em>teach and diffuse</em> the work.
        </p>
      </div>

      {upcoming.length > 0 && (
        <section className="space-y-4">
          <div className="border-l-4 border-ui-gold pl-4">
            <h2 className="text-xl font-bold text-ui-charcoal">Upcoming</h2>
          </div>
          <div className="space-y-4">
            {upcoming.map((e) => (
              <EventCard key={e.title} event={e} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="border-l-4 border-ui-gold pl-4">
          <h2 className="text-xl font-bold text-ui-charcoal">
            Delivered &amp; archived
          </h2>
        </div>
        <div className="space-y-4">
          {delivered.map((e) => (
            <EventCard key={e.title} event={e} />
          ))}
        </div>
      </section>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">
          Interactive slide decks AISPEG has prepared for specific audiences
          live under{" "}
          <Link href="/presentations" className="text-ui-gold-dark hover:underline">
            Presentations
          </Link>
          . Written briefs and PDF reports live under{" "}
          <Link href="/reports" className="text-ui-gold-dark hover:underline">
            Reports &amp; Briefs
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

function EventCard({ event }: { event: OutreachEvent }) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-ui-gold/15 px-2.5 py-0.5 text-xs font-medium text-ui-gold-dark">
          {event.eventType}
        </span>
        <span className="text-xs text-gray-400">{event.date}</span>
        {event.location && (
          <>
            <span className="text-xs text-gray-300">&middot;</span>
            <span className="text-xs text-gray-500">{event.location}</span>
          </>
        )}
      </div>
      <h3 className="mt-2 text-lg font-semibold text-ui-charcoal">
        {event.title}
      </h3>
      <p className="mt-1 text-sm text-gray-500">Audience: {event.audience}</p>
      <p className="mt-3 text-sm leading-relaxed text-gray-700">
        {event.description}
      </p>

      {event.presenters && event.presenters.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Presenters
          </p>
          <ul className="mt-1 text-sm text-gray-600">
            {event.presenters.map((p) => (
              <li key={p}>&bull; {p}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        {event.liveUrl && (
          <a
            href={event.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-ui-gold-dark hover:underline"
          >
            Live site &rarr;
          </a>
        )}
        {event.repoUrl && (
          <a
            href={event.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-ui-gold-dark hover:underline"
          >
            Repository &rarr;
          </a>
        )}
      </div>
    </article>
  );
}
