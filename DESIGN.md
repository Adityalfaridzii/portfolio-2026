# DESIGN.md — portfolio-2026

My design system. Written 13 Nov 2026, replacing `portfolio-3d/DESIGN.md` as the governing
spec for this site. That document described a different site (an amber hall with a 3D
character); this one describes a document that is handed to a sceptic.

## The night's question

> A recruiter has thirty seconds and no reason to believe a single number on this page.
> What should the first screen look like?

Every rule below answers that. Where a rule and a decoration disagree, the rule wins.

## References, and exactly what I took

Not inspiration by vibe — mechanics, one per reference.

| Reference | What I took | What I refused |
|---|---|---|
| [Ramp Agents](https://devdojo.com/index.php/inspiration/agents-ramp) — bone-white paper, one display family, aggressive negative tracking, hairline grid, mono micro-labels | The *quiet ground + loud single element*, and `01 · IDENTITY` style micro-labels | The electric-lime CTA; lime is a fintech signal, not a QA one |
| [datasheet-chrome](https://git.catalystgroup.tech/herman/wireless-bobulator/-/blob/0f98c501ad9187e1c5b3f18b7e3e8451fef6cbc6/themes/bobulator/layouts/partials/datasheet-chrome.html) — dim engineering strip: document number, revision, date, origin, page-of-total | The running head and the folio line on every sheet | Its colour; the structure is what is valuable |
| [Annual report layout](https://github.com/danmolitor/forme/blob/88d58cbb9adffabd8ea6ae18ad80b62eedec117b/docs/templates/report-annual.mdx) — contents folios, KPI keylines, `feet 02/03` | KPI keylines: a number sits above a rule, its label to the left, tabular | The cover treatment; this site has no cover |
| [Industrial Spec Sheet](https://laarpi.com/styles/industrial-spec-sheet) — hazard palette, "safety orange used the way an engineer would: to mark what matters" | Accent is a **marker**, never a decoration: corrections, discrepancies, the next action | The hazard-yellow second accent — two accents compete for one meaning |
| [Tech gadget PDP spec callouts](https://paneflow.com/templates/tech-gadget-pdp-spec-callouts) — thin annotation leaders from the object to a mono label | The annotation layer: a claim is *pointed at*, not just stated | Cobalt; and callouts on a product photo, which I do not have |
| [Planhat](https://styles.refero.design/style/94c4fc51-4323-4f06-a4a4-27517e190445) — no shadow; elevation via surface shift, 1px hairlines, negative space | Zero-shadow discipline, three surfaces only | Its warm-neutral palette, which is close to the generic SaaS look |
| [Mintlify documentation system](https://cdn.jsdelivr.net/npm/awesome-design-md@1.1.0/design-md/mintlify/DESIGN.md) | Nothing | **Everything**: pill buttons at radius 9999, Inter, centred hero + two CTAs. This is the "AI slop" archetype, now with a name |

## The system: FIELD REPORT

The site is one field report, paginated. Not a landing page; a document with a header strip,
a revision, numbered sheets, and a place for the reader to check the work.

**Key characteristics**

1. **Document chrome before decoration.** Every page carries a running head line —
   `ALFARIDZI · PORTFOLIO`, sheet number, revision date, origin — set in 10px mono, tracked,
   above the content. The page announces what it is before it says anything.
2. **The grid is faint but present.** A 96px architectural grid at 3.5% ink sits behind
   everything. It is not decoration: it is the same grid the columns sit on, so the page
   shows its own scaffolding the way a drawing does.
3. **One accent, and it means "look here".** Hazard orange is only ever: a correction, a
   discrepancy, an active state, or the next action. Never a decorative rule, never a
   background, never a hover colour for its own sake.
4. **Type: quiet ground, loud figure.** Display is one family at weight 500 — not 800 — set
   large with tracking at or below -0.045em and leading under 1.0. Body is the same family
   at 400, measure capped at 62ch. Every figure is tabular and sits above a keyline.
5. **Annotations point.** A mono label with a hairline leader connects a claim to where it
   came from. If a number cannot be pointed at, it does not go on the sheet.
6. **No shadow, three surfaces, no gradients.** Elevation is a surface shift and a 1px rule.
   `paper` (ground), `paper-2` (panel), `ink` (the one dark block). Nothing else.
7. **Square by default.** Radius 0. The only circles allowed are a status dot and the knob
   of a switch — both are physical objects that are actually round.
8. **Two motions, no more.** The sheet settles (reveal), and the marker travels (progress
   rail). Motion explains a change in state; it never performs.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--paper` | `#f2f0e9` | ground |
| `--paper-2` | `#e7e4d9` | panel head, signature strip |
| `--ink` | `#14140f` | type, rules, the one dark block |
| `--muted` | `#57544a` | secondary prose (8.5:1 on paper) |
| `--faint` | `#6b6860` | micro-labels, captions (5.2:1 — measured, not chosen) |
| `--accent` | `#b23e16` | **marker only** (4.6:1 on paper) |
| `--ok` | `#1c6b4b` | verified state |
| `--line` | `rgba(20,20,15,.15)` | structural rule |
| `--grid` | `rgba(20,20,15,.035)` | the 96px grid |
| `--radius` | `0` | everything |
| display | 500, `-0.045em`, `0.96` | page claims |
| body | 400, `1.6`, 62ch | prose |
| mono | 400, `0.14em` tracked, uppercase | labels, folios, sources |

## Rejected, with the reason attached

| Rejected | Why |
|---|---|
| Centred hero, subtitle, two buttons | The archetype itself. If the first screen would survive being swapped onto any other portfolio, it is not a design. |
| Portrait in the hero | A face at top-right is the strongest template signal on the page. The subject belongs at the end, where the reader is deciding whether to write. |
| Pill buttons and badges | Borrowed from consumer SaaS docs. A badge is a stamp, and a stamp is square. |
| Count-up numbers | For 900ms the page states a false figure. On this page that is the cardinal sin. |
| Gradients, glass, glow | They mean "product launch". This is a report. |
| Second accent colour | Two accents compete; one accent is a marker, three are decoration. |
| Skill bars | Unverifiable by construction. |

## What is still open

- The 96px grid is currently CSS-only, not a real 12-column system; columns are hand-set.
- The annotation layer exists in the intake panel but not yet in the ledger rows.
- Folio numbers per sheet are not yet wired to a sheet count.
