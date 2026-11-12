# CONTENT.md — what the site says, and why

Audit run 13 Nov 2026. Method: keyword count across the five HTML files, then sentence-level
read of every block. This is not a style note; it is a positioning problem.

## 1. The site's proportions do not match its claim

The site argues "quality starts upstream, I am a QA engineer." Then the first screen is six
rows about one bot, and the word `RAG` appears **20 times** — more than `regression` (10) and
`test plan` (3) combined.

| Word | Count | Verdict |
|---|---|---|
| RAG | 20 | over-weighted |
| Playwright | 18 | good, near stuffing at the top |
| API | 16 | good |
| Jira | 20 | fine |
| regression | 10 | low for the claim |
| test plan | 3 | low |
| shift-left | 1 | low |
| SDET | 1 | low |
| `CI/CD` | **0** | **missing** |
| `test strategy` | **0** | **missing** |
| `flaky` | **0** | **missing** |
| `traceability` | **0** | **missing** |

A recruiter's screen scans for the right column. Three of those four are keywords he plainly
has: he runs specs in GitHub Actions and GitLab CI, he writes test plans in TestRail, and a
102-test suite that has been maintained since August has flaky-test opinions in it.

**Fix:** keep the AI story, but stop leading with it. Lead with the job, let the tooling be
the differentiator — which is also what his own CV says.

## 2. The first line answers the wrong question

Current: *"Thirteen claims. Every one has a command behind it."*

That sentence describes **the page**. A reader's first question is *who is this and what does
he do*. Same for the lede: *"Below is not a summary — it is the first page of the audit…"* —
two clauses of self-reference in the most valuable line on the site.

**Fix:** the headline states the work; the lede states the position and the keywords; the
table proves it. Three jobs, three elements, no overlap.

## 3. The same six numbers appear three times

Hero table (6), work cards (11 metrics), full ledger (13). The reader meets `211` on three
screens. Repetition is what makes a page feel like a CV export.

**Fix:** hero keeps 4 claims (the strongest, one of each state), the work cards keep only the
metric that belongs to that work, and the ledger stays the only complete table.

## 4. Voice rules

1. **Subject is the work, not the page.** No sentence describes the website itself.
2. **Verb first.** "Wrote 102 Playwright tests", not "Responsible for Playwright testing".
3. **Every claim ends in a number or a name.** If it can end in neither, it is a value
   statement and belongs in one short block, not scattered.
4. **One idea per line.** If a line needs a dash and a parenthetical, it is two lines.

## 5. Rewritten copy

### Hero — headline options

1. **"I test the tools that test the money."** ← recommended. Concrete, fintech, tooling.
2. "Four years of finding other people's bugs before customers do."
3. "Seven things that survived production."

### Hero — lede

> Senior QA engineer, four years in fintech, e-commerce and travel. I write the automation —
> Playwright suites, API checks, CI/CD pipelines — own test strategy and shift-left practice,
> and build the AI tooling that QA and dev teams run on. Every figure on this page carries the
> command that produced it.

### Intake section

> The numbers above come from a machine, not a spreadsheet. This is it doing its job: a rough
> note in a Lark channel becomes a ticket with steps, environment, epic and a duplicate check —
> and the reporter confirms it before it exists in Jira.

### The work

> Three systems still in service, plus one framework I keep sharp. Each opens into the problem,
> the decisions I would defend, and what I would do differently.

### Principles — with the evidence attached

1. **Quality starts at the PRD.** Impact written into the spec, dev owns the unit tests, QA
   receives a feature whose bugs were reasoned about before they existed. *(Shift-left is the
   cheapest defect you will ever fix.)*
2. **If it cannot be checked, it is a rumour.** I re-counted my own Playwright figure during
   this audit: 89 became 102, and the correction is on the page instead of quietly deleted.
3. **AI is a build artefact.** Temperature 0, unit tests, a human gate before anything reaches
   Jira. A tool that guesses confidently is a defect with good manners.

### Contact — add the ask

> Open to senior QA, SDET and quality-engineering roles. Jakarta, or remote. Bahasa Indonesia
> and English.

## 6. What only he can give

Without these, the copy stays accurate but thin:

- Team size at PT Surya Anugrah Mulya, and how many engineers he has led or reviewed.
- Minutes saved per ticket by the bot (before → after).
- Whether he can talk publicly about flaky-test policy — that word is worth a paragraph and he
  certainly has one.
