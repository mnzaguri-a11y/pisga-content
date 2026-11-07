# Weekly question pack: procedure

Run by the weekly scheduled task on the owner's PC. The owner is Matan, the app is פסגה: טריוויה. Talk to him in Hebrew; he often reads from his phone. Nothing is published without his explicit approval in chat.

Paths (all under `C:\Users\Mtnza\Desktop\Gamik Studio\PSAGOT TREVIA`):
- Content repo: `pisga-content` (public, GitHub Pages). Packs are in `packs/`; the release order is in `packs/index.json`.
- App repo: `extracted/pisga-trivia`. The bundled banks are in `banks/`, the question schema in `SCHEMA.md`.
- Signing key: `extracted/pisga-trivia/secrets/pack-signing-key.pem`. Pass it only through `PISGA_SIGN_KEY_FILE`. Never print, copy, commit or upload it.
- Review files for the owner go to `builds/`.

## 1. Prepare (no approval needed)
1. Pack id: the ISO week, `YYYY-wWW` (e.g. `2026-w46`). If that id already exists in `packs/index.json`, stop and tell the owner.
2. Read `SCHEMA.md` and 2–3 recent packs to match the style. Write about 60 questions to `packs/<id>.json`:
   - Shape: `{"id","title","questions":[...]}`. Each question has the bank fields plus `cat` (gaming, movies, brands, club, science, world, pop, israel, food, idioms). Question ids are `<pack id>-001` and up.
   - Mix: about 6–7 per category. Levels roughly 1:8, 2:12, 3:20, 4:13, 5:7.
   - Title: a short Hebrew name, optionally a theme (holiday, season, current sports event). It is shown on the "חדש השבוע" tile.
   - Owner's rules: no round-number correct answers in numeric questions, with distractors close but fair; emoji questions at most 1 in 7; `why` must be accurate and teach something; never show question counts; hints must not give the answer away; exactly one defensible correct answer.
   - Prefer stable facts. Avoid anything that may have changed recently, unless it is the theme and you verify it.
3. Check for duplicates. Run `node tools/dupcheck.js ../extracted/pisga-trivia/banks packs/<id>.json`, and also grep the banks and packs for each question's key names. The bundled banks hold 2,700 standard trivia questions, so expect many common facts to already exist. Replace every question that tests a fact already asked, and repeat until clean.
4. Fact-check with a separate subagent. Give it the file and ask it to check every question with web search: correct answer, no second correct option, every fact in `why` and `hint`, logic answers recomputed, Hebrew quality. Apply the fixes, or drop questions.
5. Run `PISGA_SIGN_KEY_FILE=../extracted/pisga-trivia/secrets/pack-signing-key.pem node tools/build.js` only as a validation. Add the id to `packs/index.json` first. If you need to stop before approval, revert `site/` with `git checkout -- site` so nothing half-done is left behind.
6. Write the review file `builds/pack-<id>-review.md`, grouped by category. For each question: number, level, question, ✅ correct, ❌ the others, hint, why. Send it to the owner with SendUserFile (status proactive).
7. Tell the owner in Hebrew, briefly:
   - the pack title and the number of questions;
   - what the duplicate check and fact-check caught;
   - that nothing is published until he approves;
   - that he can reply with question numbers to change.

   Then stop and wait.

## 2. Publish (only after the owner approves in chat)
1. Apply any changes he asked for, and fact-check them.
2. Make sure the pack id is in `packs/index.json`. Run `tools/build.js` with the key file, then `node tools/verify.js`.
3. Commit (`Pack <id>: N questions, fact-checked`) and push to `main`. Watch the "Publish content" workflow until it succeeds.
4. Download `manifest.json`, `manifest.sig` and the pack from `https://mnzaguri-a11y.github.io/pisga-content/` into a temp `site/` folder. Run `tools/verify.js` against it (copy the script next to that folder).
5. Tell the owner it is live, and that phones get it the next time they open the app.

## Fixes between packs
When the owner reports a wrong question (from the app's question reports), add an entry to `fixes.json`: `{"id":"<question id>", <fields to override>}`, or `{"id":"...","remove":true}`. Then publish exactly as in section 2: approval, build, verify, push.
