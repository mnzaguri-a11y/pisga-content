# Friday news pack (AI + law & tech): procedure

Run by the scheduled task `pisga-friday-news` on the owner's PC, Fridays at 10:00. The owner is Matan, the app is פסגה: טריוויה. Talk to him in Hebrew; he reads from his phone. Nothing is published without his explicit approval in chat.

The idea: the two categories `ai` (עידן ה-AI) and `lawtech` (משפט והייטק) are the app's "magazine". Every Friday a small pack of fresh, current questions arrives, each with a detailed explanation (`more`) that reads like a short article, so a player who answers the week's questions ends up knowing what happened in AI and in the law-meets-technology world. Quality over quantity: every fact verified, every explanation genuinely informative.

Paths (all under `C:\Users\Mtnza\Desktop\Gamik Studio\PSAGOT TREVIA`):
- Content repo: `pisga-content` (public, GitHub Pages). Packs are in `packs/`; the release order is in `packs/index.json`.
- App repo: `extracted/pisga-trivia`. Schema in `SCHEMA.md`, question tracker `tools/qtool.js`, banks in `banks/`.
- Signing key: `extracted/pisga-trivia/secrets/pack-signing-key.pem`. Pass it only through `PISGA_SIGN_KEY_FILE`. Never print, copy, commit or upload it.
- Review files for the owner go to `builds/`.

## 1. Research (no approval needed)
1. Pack id: `news-YYYY-MM-DD` with today's date (e.g. `news-2026-11-14`). If it already exists in `packs/index.json`, stop and tell the owner.
2. Collect the week's material with web search (the last 7–10 days, plus one or two "evergreen" items that fit): 
   - AI: model and product launches, research results, company decisions, funding and acquisitions, government decisions, notable failures or incidents, studies about AI use, Israeli AI news.
   - Law & tech: court rulings, regulator decisions and fines, new laws coming into force, antitrust steps, privacy cases, IP and copyright rulings (including AI-related), Israeli legal/tech news.
   Use reliable sources (news agencies, major papers, official sites, court documents). For every item note the date, the exact figures and the source URL; two independent sources for anything surprising.
3. Choose 18–22 items that make good questions: a clear, single correct answer that stays true (the ruling, the amount, the date, the company, the country), interesting to a general audience, not a rumor, not a prediction, not a pending case described as decided.

## 2. Write
1. Read `extracted/pisga-trivia/SCHEMA.md` and the latest two `news-*` packs for style. Check the existing questions so the pack does not repeat them: `cd ../extracted/pisga-trivia && node tools/qtool.js gaps ai` / `gaps lawtech`, and `docs/index/ai.md`, `docs/index/lawtech.md`.
2. Write `packs/<id>.json`: `{"id","title","questions":[...]}`, ids `<id>-001` and up. Each question has the bank fields plus `cat` (`ai` or `lawtech`; about 60/40) and MUST have `more`:
   - `q`: the question, phrased so it stays correct later ("באיזו מדינה נכנס לתוקף ב-2026 חוק ש…", not "השבוע").
   - `why`: 1–3 sentences, the precise answer with one detail (≤600 chars).
   - `more`: 300–900 chars, 3–6 sentences, the article: what happened, background, why it matters, what comes next, a surprising detail. Plain lively Hebrew, no bullets, every fact from your sources.
   - Levels: mostly 2–4 (1:3, 2:6, 3:7, 4:4, 5:1 for 21 questions). Types: knowledge mostly, 2–3 `which`, 2–3 `estimate` (exact figures from the sources; the correct option is never the round-looking one), optionally 1 `logic`.
   - Owner's rules: no round-number correct answers in numeric questions, distractors close but fair; hints never give the answer away; exactly one defensible correct answer; neutral tone on political topics; no private lives.
   - `title`: short Hebrew, with the date, e.g. "חדשות ה-AI והמשפט · 14.11". It is shown on the "חדש השבוע" tile.
3. Duplicate check: `cd ../extracted/pisga-trivia && node tools/qtool.js check --self ../../pisga-content/packs/<id>.json`. Replace every `!!!`, judge every `!!`. Repeat until no `!!!`.
4. Fact-check with a separate subagent: give it the file and the source URLs; it verifies every answer, every other option (none may also be correct), every figure in `why`/`more`, and the Hebrew. Apply its fixes or drop the question.
5. Validate: add the id to `packs/index.json`, run `PISGA_SIGN_KEY_FILE=../extracted/pisga-trivia/secrets/pack-signing-key.pem node tools/build.js`. If you must stop before approval, `git checkout -- site` so nothing half-done is left.
6. Review file `builds/pack-<id>-review.md`, grouped by category: number, level, question, ✅ correct, ❌ others, hint, why, and the `more` text, with the main source link per question. Send it with SendUserFile (status proactive).
7. Tell the owner in Hebrew, briefly: the title and count, what the checks caught, that nothing is published until he approves, that he can reply with question numbers to change. Then stop and wait.

## 3. Publish (only after the owner approves in chat)
1. Apply his changes, fact-check them.
2. `tools/build.js` with the key file, then `node tools/verify.js`.
3. Commit (`News pack <id>: N questions, fact-checked`) and push to `main`. Watch the "Publish content" workflow until it succeeds.
4. Download `manifest.json`, `manifest.sig` and the pack from `https://mnzaguri-a11y.github.io/pisga-content/` into a temp `site/` folder and run `tools/verify.js` against it.
5. Add the pack's meta in the app repo: `banks/meta/pack-<id>.json` (`{"<question id>":{"t":"<topic>","f":"<fact sentence>"}}`), run `node tools/qtool.js index`, commit and push there (`Meta for news pack <id>`).
6. Tell the owner it is live and that phones get it the next time they open the app.
