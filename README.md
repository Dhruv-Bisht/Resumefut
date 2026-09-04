# ResumeFUT

Your resume, scouted. Upload a resume PDF (or paste your experience) and get
back a FIFA Ultimate Team–style player card: an overall rating, a "position,"
and six stats — EXP, SKL, LED, IMP, EDU, VER — scored by a fully local,
open-source heuristic engine. No AI calls, no third-party APIs, nothing
leaves your machine except the extracted text hitting your own `/api/analyze`
route.

## Why not scrape LinkedIn?

This started as a "LinkedInFUT" idea, but LinkedIn doesn't allow scraping
public profiles and has no public API for reading arbitrary users' data.
Resumes solve the same problem legitimately: everyone already has one, PDF
parsing is trivial and fully client-side, and there's no ToS or auth to
fight.

## Layout

The results page mirrors a scouting report, not just a bare card:

- **Header** — rating badge, name (auto-detected from the resume, click to
  edit), position, archetype, and a one-line style tagline
- **Left panel** — attributes (skill moves / weak foot / work rate / style,
  as star ratings) and detected "playstyles" — hover the ⓘ next to each
  attribute for what it actually measures
- **Center** — the downloadable FUT-style card itself, with an optional
  uploaded photo and a nationality flag
- **Right panel** — scouting metrics: each of the six stats alongside the
  real underlying signal it came from (e.g. "6 yrs tracked", "9 skills
  matched") with a progress bar

Name entry has been removed from the form — `extractName()` in
`lib/scoring.js` pulls it from the top of the resume text (with proper line
reconstruction from the PDF, not a naive text dump — see
`lib/extractPdfText.js`), and it's editable inline on the results page if it
guesses wrong.

## Derby Mode

`/derby` — upload two resumes and battle them stat by stat, like a kids'
trading-card game. Both get scored independently, then each of the six
categories is compared head to head; whoever wins more categories wins the
derby (ties break on overall rating). Purely a fun visualization on top of
the same scoring engine — no new logic beyond the comparison itself.

## Stack

- **Next.js** (pages router) + **Tailwind CSS**
- **pdfjs-dist** — extracts text from the uploaded PDF entirely in the
  browser (the file itself is never uploaded to a server)
- **html-to-image** — turns the rendered card into a downloadable PNG
- Zero external AI/API dependencies for scoring — see `lib/scoring.js`

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

This is a stock Next.js app, so it deploys with zero config:

1. Push this repo to GitHub.
2. Import it in [vercel.com/new](https://vercel.com/new).
3. Deploy — no environment variables are required for the default heuristic
   engine.

## How scoring works

All logic lives in [`lib/scoring.js`](./lib/scoring.js), which is
intentionally small and readable:

| Stat | What it measures | Signals used |
|------|-------------------|--------------|
| EXP  | Experience | Years across detected date ranges, seniority keywords |
| SKL  | Skills | Hits against a curated skill/tool keyword list, presence of a skills section |
| LED  | Leadership | Management/ownership verbs, "team of N" mentions |
| IMP  | Impact | Quantified bullets (%, $, large numbers), results-driven verbs |
| EDU  | Education | Highest detected degree tier, certification mentions |
| VER  | Versatility | Number of distinct industry/role keyword buckets matched |

"Position" and "archetype" (e.g. *THE CLOSER*, *THE SCHOLAR*) are derived
from which industry bucket and which stat dominate, respectively — see
`detectPosition` and `pickArchetype` in the same file.

This is deliberately simple so it's easy to extend. Ideas for contributions:

- Smarter date-range parsing (multi-format, non-English months)
- A richer/curated skill keyword list per industry
- Optional AI-powered scoring mode as a pluggable alternative engine
- Card sharing (OG image generation for a shareable link)
- More archetypes and position codes

## Disclaimer

Ratings are heuristic, for-fun approximations based on keyword patterns.
They are not a real assessment of anyone's skills or worth.

## License

MIT — see [LICENSE](./LICENSE).
