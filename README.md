# Umut Oku | .NET Backend Engineer

A bilingual portfolio about .NET, microservices, product search, data, messaging and operational problem solving. The interactive architecture and failure scenarios use synthetic data. The site is designed to run **free on GitHub Pages**, with an ASP.NET Core 10 host included in the same repository.

## Run locally

Requires .NET SDK 10 and Node.js 22 or later. There are no npm dependencies.

```sh
node scripts/prepare.mjs
dotnet run --project src/Portfolio.Web --urls http://127.0.0.1:5137
```

Open `http://127.0.0.1:5137`. The .NET host serves the UI and five deterministic demonstration scenarios through `/api/traces/{scenario}`: cache miss, search-index lag, successful payment, payment timeout and duplicate event. It also exposes `/health` and `/api/profile`. It does not connect to payment providers, employer services or databases.

## Verify and export

```sh
node scripts/prepare.mjs
dotnet build UmutOku.Portfolio.slnx -c Release
node --test tests/portfolio.test.mjs
node scripts/export.mjs
```

The public output is `artifacts/site/`. Only an explicit allowlist is exported. Source notes, build outputs, original CVs and research files are excluded. API and static hosting use the same scenario catalog. Tests cover this parity, uncertain payment states, redelivery, 404s, security headers, links, translations, SEO pages and the full credential archive.

## GitHub Pages

The intended user-site repository is `Umutoku/umutoku.github.io`, served at `https://umutoku.github.io/`. GitHub Pages hosts static files; it does not run the ASP.NET Core server. Every portfolio interaction is supported in static mode without a separate paid service, API key or database.

1. Push the reviewed source to the repository.
2. In **Settings → Pages**, select **GitHub Actions** as the source.
3. Push to `main`, or run **Publish portfolio to GitHub Pages** manually in Actions.

The workflow builds and tests .NET, exports the static site and deploys the resulting artifact. Pushes to `main` publish automatically; manual runs are also available. `Verify portfolio` runs on pushes and pull requests.

For a different host or project subpath, set `SITE_URL` before preparing/exporting. The URL must include the trailing project path, for example `https://username.github.io/portfolio/`. Relative assets keep the UI portable. Update the CV's printed address with `scripts/make-documents.py` if changing the canonical site URL.

The optional Dockerfile runs the .NET version on port 8080 as the built-in non-root `app` user. Docker hosting is separate from GitHub Pages.

## Content and design

- `src/Portfolio.Web/wwwroot/index.html`: English source page and professional work.
- `src/Portfolio.Web/wwwroot/data/tr.json`: Turkish copy.
- `scripts/credentials-source.mjs`: 47 public LinkedIn learning records, captured 29 October 2026. Original titles, issuers and listed issue dates are preserved; three records have no date. These include course completions and workshops as well as credentials.
- `scripts/prepare.mjs`: generates English/Turkish pages, the searchable credential archive, translation data, sitemap and robots.txt.
- `src/Portfolio.Web/wwwroot/data/traces.json`: shared demonstration catalog.
- `src/Portfolio.Web/wwwroot/data/knowledge.json`: professional practice and personal learning tracks, rendered during content preparation.
- `src/Portfolio.Web/wwwroot/scripts/domain-links.js`: illustrative domain relationships and links to anonymous work examples.
- `src/Portfolio.Web/wwwroot/scripts/ui-labels.js`: shared English/Turkish accessible names, used at build time and during language switching.
- `src/Portfolio.Web/wwwroot/scripts/decision-data.js`: fictional search/cache/event decisions, bilingual consequences and the small journey state model.
- `src/Portfolio.Web/wwwroot/scripts/decision-lab.js`: the optional three-decision experience; no score, timer, external requests or stored visitor choices.
- `src/Portfolio.Web/wwwroot/styles/`: tokens and responsive styles.
- `scripts/make-documents.py`: optional CV and social-card generator; requires Pillow and ReportLab. Generated files are committed, so builds do not need Python.
- `DESIGN.md`: the visual system and interaction guidance.

The capability map presents applied tools and continued study without a repository showcase. Employment contributions are described through anonymous work examples without proprietary code, internal issue links, endpoints or customer records. The employment timeline retains factual employer names. No unmeasured performance figures are claimed. Historical roles use years because the supplied CV and LinkedIn disagree on some end months.

## Search and accessibility

English and Turkish each have indexable HTML, canonical URLs and reciprocal language links. The site includes a sitemap, robots.txt, social sharing image, semantic headings and `ProfilePage`/`Person` structured data. OAI-SearchBot is explicitly allowed for ChatGPT search; `llms.txt` offers a concise factual reading guide, not a ranking guarantee. Search ranking and indexing are controlled by search engines; after publishing, the owner can verify the site in Google Search Console and submit `sitemap.xml`.

The dashboard presents twelve engineering tracks, five interactive scenarios and 47 learning records grouped by discipline. Its live diagnostics show the current visit's resource count, completed simulations and DOM-ready timing from the browser Navigation Timing API. These remain local and are not Core Web Vitals or employer performance claims. No GitHub API requests, uptime or throughput figures are used.

The core content works without JavaScript. Interaction uses native buttons, links and disclosures, visible keyboard focus, status announcements and reduced-motion support. Fonts are self-hosted under the included SIL Open Font License. There is no analytics, tracking SDK or pretend contact form.

## Sources

[GitHub profile](https://github.com/Umutoku) / [LinkedIn profile](https://www.linkedin.com/in/umutoku/) / [Credential records](https://www.linkedin.com/in/umutoku/details/certifications/).

Hosting: [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
Structured data: [Google profile-page guidelines](https://developers.google.com/search/docs/appearance/structured-data/profile-page).
ChatGPT discovery: [OpenAI crawlers](https://developers.openai.com/api/docs/bots).
