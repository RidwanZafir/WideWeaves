# Explainer Script — "Abandoned but Not Forgotten"
### Timed narration for the submission video (~3 minutes, ~430 words)
### How to use: read the **SAY** lines aloud. Do the **[SCREEN]** cue at each mark.
### Pace: calm, unhurried — ~140 words per minute. Total run time: ~3:05.

---

## 0:00 — HOOK (15 sec)

**[SCREEN: Cold open on the app's intro. Two pixel ground strips, five stakes.
Don't touch anything for 3 full seconds.]**

**SAY:**
> "Everything on this screen is still out there.
> Five pieces of hardware humanity left on the Moon and Mars —
> and every one of them is still sitting where we left it."

---

## 0:15 — THE PROBLEM (30 sec)

**[SCREEN: Slow zoom on the stakes. Hold on the two grounds — grey Moon, rust Mars.]**

**SAY:**
> "The hardware is fine. It's the *record* that's rotting.
> The people who know why each object was left are retiring.
> Coordinates get quoted with precision nobody actually has.
> And when the next mission lands nearby, nobody owns the question:
> what should happen to this?
> Nostalgia isn't a problem statement. So we built the tool that fixes the
> record instead of just mourning it."

---

## 0:45 — THE APP, BEAT 1: THE HEALTHY RECORD (30 sec)

**[SCREEN: Click Surveyor 1. Linger on the badges: Well documented, Intact, 1966.
Scroll slowly through What it is → Why it was abandoned → the lesson pull-quote.]**

**SAY:**
> "This is a curator's workspace, not a gallery. Three columns:
> the archive, the record, and the provenance.
> Surveyor 1 is the healthy case. It completed its work in 1966 and was never
> recovered — leaving it wasn't a failure, it was the plan.
> The app says so outright, because distinguishing *abandoned on purpose*
> from *lost on arrival* is half the job."

---

## 1:15 — BEAT 2: THE NASA EVIDENCE (25 sec)

**[SCREEN: Point at the NASA card in the masthead — the LRO photo, PIA12910,
NASA's own caption. Then the Sources panel, the PIA12910 link.]**

**SAY:**
> "Every claim points at evidence. This is a real Lunar Reconnaissance Orbiter
> photograph of Surveyor 1, PIA12910, with NASA's own caption —
> shipped inside the app, working fully offline.
> No stock photos. No invented coordinates. If the app doesn't know something,
> the record says so, in writing."

---

## 1:40 — BEAT 3: THE HONEST RECORD (25 sec)

**[SCREEN: Click Schiaparelli EDM lander. Hold on 'Reasonably certain → Wreckage'
and the status note.]**

**SAY:**
> "And here is the whole thesis in one record. Schiaparelli crashed on Mars in
> 2016. The app writes: *impact and debris field expected near the intended
> landing site.* No other tool in this space would write that sentence.
> Most would invent a coordinate. False precision is worse than honesty —
> downstream missions inherit the error."

---

## 2:05 — BEAT 4: SEARCH, FILTER, ACT (35 sec)

**[SCREEN: Type 'collision' — lands on Luna 2 via its lesson. Filter to Mars —
show the rail note 'Still reading Luna 2 — outside this filter.']**

**SAY:**
> "Search reaches into meanings, not labels — *collision* finds Luna 2 through
> its lesson, not its title. Filtering never costs you your place:
> the record you were reading stays open, and the rail tells you why.
> And this is the dent, not a museum — a work queue.
> Type a real next action, submit it, quit the app, reopen it:
> it's still there, in a real SQLite archive that belongs to you."

**[SCREEN: File the action on Surveyor 1 live. Show it appear in the queue.]**

---

## 2:40 — THE BUILD (20 sec)

**[SCREEN: Quick montage — contact sheet stills, the pixel map, the five
silhouettes. End on the intro screen.]**

**SAY:**
> "Hand-drawn pixel art, zero gradients, verified end to end:
> three hundred and two automated checks, and the packaged build is
> tested byte-for-byte — because the first build we ever shipped
> contained no artwork at all, and the tests are why it can never
> happen again."

---

## 3:00 — CLOSE (10 sec)

**[SCREEN: Title card. 'Abandoned but Not Forgotten.']**

**SAY:**
> "The hardware will outlive everyone who chose it.
> The least we can do is keep its record alive."

**[END.]**

---

## Appendix A — 60-second cut-down (for short-form / backup)

**[SCREEN: Intro → Surveyor 1 + NASA card → Schiaparelli → file an action.]**

**SAY:**
> "Five pieces of hardware we left on the Moon and Mars — all still out there.
> This app keeps their records alive: what each object is, why it was left,
> and what should happen next. Real NASA imagery — this is Surveyor 1 seen by
> the Lunar Reconnaissance Orbiter. Honest uncertainty — Schiaparelli's debris
> field is marked *expected*, never invented. And it's a work queue, not a
> museum: file a next action and it's written to a real archive on your machine.
> Abandoned — but not forgotten."

---

## Appendix B — delivery notes

- **Never apologize for the dataset.** "Five pilot records in the exact shape
  a real feed would take" is the line. Honesty is the thesis, not a disclaimer.
- **Say PIA numbers out loud** ("P-I-A-1-2-9-1-0") — judges listen for real
  NASA asset usage.
- **Don't tour features.** Every click must carry the argument
  (honesty / stewardship / action). If a click doesn't make the case, cut it.
- **Record at 1440×900**, frozen motion, mic close. The app's own
  `shots/contact-sheet.html` shows the exact eight states to cover.
- If anything breaks live: the line is *"It fails loudly instead of shipping
  quietly"* — then keep going. The verification story survives a demo glitch.
