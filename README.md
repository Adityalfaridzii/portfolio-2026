# portfolio-2026

A static portfolio for Aditya Rahman Al-Faridzi, QA engineer. Built to be the opposite
of a showreel: every claim on the page carries the command that produced it.

## Run it

No build step, no dependencies, no package manager.

```bash
node _preview.mjs 4173      # then open http://127.0.0.1:4173/
```

Or open `index.html` directly — the only thing that may not load over `file://` is the
self-hosted font, in which case the system sans-serif fallback takes over.

## Structure

```
index.html          hero, method, work index, the ledger, experience, contact
amb-copilot.html    CF-01  Lark bot + RAG knowledge base + MCP server
qa-dashboard.html   CF-02  calculation and trade-trigger tool
automation.html     CF-03  Playwright revamp suite
cv.html             print-ready CV (A4, one page and a bit)
assets/style.css    one stylesheet, no framework
assets/main.js      reveal on scroll, sticky header, "only verified" switch
assets/fonts/       Archivo variable subset, self-hosted (36 KB)
assets/img/         portrait
_preview.mjs        throwaway static server for local viewing
_shots/             screenshots, print PDFs, audit output
```

## The rules this site follows

1. **A number without a source is a rumour.** `index.html#numbers` lists each figure with
   the command that produced it, and a switch that dims everything not re-derived from
   source.
2. **Corrections stay visible.** The Playwright suite was reported as 89 tests / 8 modules;
   recounted, it is 102 tests / 11 spec files. The page shows the old value struck through
   rather than quietly editing it.
3. **No company data.** No secrets, no PRD text, no client names, no dashboard figures.
   Architecture and decisions only.
4. **Nothing hidden behind an effect.** Reveal animations never gate content on print, and
   a 4-second safety net reveals anything the observer missed.

## Verified on 12 Nov 2026

| Figure | Value | Method |
|---|---|---|
| AMB Copilot commits | 211 | `git rev-list --count HEAD` |
| Edge functions | 22 | 24 dirs minus `_shared`, `_tests` |
| Bot unit-test files | 30 | `supabase/functions/_tests` |
| Playwright tests | 102 | `grep '^test('` across 11 spec files |
| QA Dashboard test blocks | 180 | `grep '^(it|test)('` across 25 files |
| QA Dashboard commits | 50 | `git rev-list --count HEAD` |

Reported, not reproducible from here: 190+ Jira tickets via the bot, 217 indexed documents,
14 active MCP tokens, Traveloka coverage figures.

## CV — two versions, on purpose

| File | For | Contains |
|---|---|---|
| `cv.html` | the public web | no phone number, no business figures |
| `Aditya_Rahman_Al-Faridzi_Resume_2026.docx` | applications, ATS | phone number, real text layer, no CID fonts |

Both are two pages. Decisions taken 12 Nov 2026, on Aditya's instruction:

- **"Senior" stays.** The headline reads Senior QA Engineer; the role line stays the
  employment title (QA Engineer, AI & Automation), so the two never contradict each other
  in a reference check.
- **MCP reach is 25 people.** The earlier "11 people" (old site) and "14 tokens" are
  retired; both are replaced by one reported figure.
- **Business figures are censored.** The Traveloka work is described by effect — OTP cost,
  support-handled deletions, SSO adoption — without the numbers. Those numbers stay in the
  internal CV only.

The DOCX exists because the PDF uses CID-encoded fonts with ligatures: `fi` and `fl` can
extract as single glyphs, and a cheap ATS parser then misses keywords like "certification".
The DOCX has no such failure mode.

## The motion layer

Four rules, enforced in `assets/style.css` and `assets/main.js`:

1. Motion explains a change; it never delays reading.
2. Nothing is permanently hidden if JS or an observer fails — a 4 s safety net reveals
   anything the IntersectionObserver missed.
3. Every effect is reversible: `prefers-reduced-motion`, or the **Motion** switch in the
   footer. The choice is remembered in `localStorage` (`af-motion`).
4. Transform and opacity only. No layout animation, no scroll hijacking, no libraries.

What is actually there:

| Effect | Where | Why |
|---|---|---|
| Masked line reveal on the headline | hero | says "this is the sentence that matters" |
| Rise / fade / clip choreography | hero, staggered 60–720 ms | leads the eye: kicker → claim → evidence → face |
| Portrait revealed by a vertical mask | hero | a photograph arriving, not a box fading in |
| Count-up on the stat strip and work metrics | — | **removed**: see below |

A note on the count-up that used to be here. It scrolled 0 → 211, which means for
900 ms the page displayed **209 commits** — a number that is simply false. On a site whose
argument is "every figure carries its source", that was a self-inflicted contradiction.
The figures now move into place with the value correct from the first frame; the
`data-count` attribute survives as the animation hook, not as an arithmetic source.

## Themes

Two skins, one stylesheet. The switch lives next to the motion control in the footer and
the choice is remembered (`af-theme`).

| | Paper (default) | Amber |
|---|---|---|
| Ground | `#f2f0e9` cool paper | `#f4ead7` warm parchment |
| Ink | `#14140f` | `#1c1409` |
| Accent | `#b23e16` | `#a83a14` |
| Display type | 96% width | 92% width, +6% size, tighter leading |
| Portrait | plain | `mix-blend-mode: multiply`, so the white studio backdrop sits on the paper |

Both were re-audited for contrast across every leaf text node: **0 failures at 4.5:1
(normal) and 3:1 (large)**. Print is forced back to pure white and black in both skins.

## Checks run
| Cursor spotlight on work rows | work list | shows the row is one object, not a table |
| Staggered ledger rows | the ledger | the audit reads top to bottom |
| Reading progress line | top of every page | you always know how much of the argument is left |
| Sticky section rail | case pages | jump between Problem → Evidence → What I'd change |
| Portrait parallax, ±14 px | hero | depth without a 3D scene; the photo lags the page |
| Cross-document view transitions | page → page | Chrome/Edge only; instant navigation elsewhere |

Checked in Chromium at 1440 and 390 px: **0 console errors, 0 horizontal overflow**, and all
three states render correctly — motion on, OS reduce-motion, and **JavaScript disabled**
(the last one is why the count-up values are also the fallback text).

## Checks run

- 1440 / 1280 / 1024 / 768 / 390 px: no horizontal overflow.
- Console: no errors, no failed requests, font loads (`document.fonts.check`).
- Contrast: computed for every leaf text node against its real background — 0 failures
  at 4.5:1 (normal) and 3:1 (large).
- Keyboard: first Tab lands on "Skip to content"; focus ring is visible everywhere.
- Print: 0 reveal elements still faded; `index-print.pdf` and `cv-print.pdf` generated.

## Deploy

Static host, no build step, no server-side anything. Upload **only these**:

```
index.html
amb-copilot.html      qa-dashboard.html      automation.html
traveloka-automation.html                  traveloka-identity.html
cv.html
assets/
```

Leave out `_shots/` (screenshots and PDFs, 19 MB), `_lab/` (prototypes and the
dormant dark skin), `_preview.mjs`, and the `*.md` notes. They are working files,
not the site.

The output of a full audit (7 pages × 2 viewports): 0 console errors, 0 failed
requests, 0 broken images once lazy images enter the viewport, 0 duplicate ids,
one `h1` per page, **0 contrast failures**, no horizontal overflow at 390–1440 px,
anchors landing below the sticky rail, print forced to white, CV still 2 pages.

Known cosmetic issue: on a phone the CV's print button (54 px) is wider than the
monogram (32 px), so the nav pill sits 11 px left of centre. Fix by hiding the
button under 720 px, at the cost of losing print access from the phone.
