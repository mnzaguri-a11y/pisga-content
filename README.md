# pisga-content

Public content for the Pisga Trivia app, served at https://mnzaguri-a11y.github.io/pisga-content/

- `packs/<id>.json`: a question pack. Pack id example: `2026-w46`. Question ids must start with `<pack id>-` (for example `2026-w46-001`). Each question has the bundled-bank schema plus `cat` (one of: gaming, movies, brands, club, science, world, pop, israel, food, idioms; type `complete` is a sentence with `____` to fill).
- `packs/index.json`: pack ids in release order, oldest first. The last one is shown in the app as "חדש השבוע". Removing an id pulls that pack from every device on its next launch.
- `fixes.json`: corrections to existing questions, e.g. `{"id":"science-014","why":"..."}` or `{"id":"food-120","remove":true}`. Overridable fields: q, opts (opts[0] is correct), hint, why, lvl, type.
- `config.json`: remote config. `ads` overrides ad behaviour without an app update. Defaults: `{"on":true,"freeDays":0,"by":"q","steps":[[60,15],[200,7],[1500,2],[1e9,1]],"floor":1,"gapSec":30,"upsellEvery":2,"price":"$1"}`. `steps` is [[limit, show one interstitial every N questions], ...]; with `by:"q"` the limit is lifetime answered questions, with `by:"days"` days since install. `gapSec` is the minimum time between ads; `upsellEvery` shows the remove-ads offer after every N-th ad; `price` is the label used when the store price has not loaded. Add `"units":{"inter":"ca-app-pub-…/…","reward":"ca-app-pub-…/…"}` to switch from Google test ads to real ad units. `"on":false` turns all ads off.
- `index.html`, `privacy.html`: the public site. `privacy.html` is a copy of `app_extra/privacy.html` in the app repo; keep both in sync.

## Publishing (signing happens on the owner's PC)
1. Edit packs, `fixes.json` or `config.json`.
2. Run on the PC:
   ```
   PISGA_SIGN_KEY_FILE=../extracted/pisga-trivia/secrets/pack-signing-key.pem node tools/build.js
   ```
   The script validates everything, writes `site/` (the public files plus `manifest.json`, with each pack's SHA-256, fixes and config) and signs the manifest (ECDSA P-256) into `site/manifest.sig`.
3. Commit everything, `site/` included, and push.

On push, `.github/workflows/pages.yml` runs `tools/verify.js`. It checks the signature against the app's public key and every pack hash, and only then deploys `site/` to GitHub Pages. Unsigned or edited files fail the check and are not published. The app runs the same checks again on the device.

The private signing key never leaves the PC. It is in the app repo folder under `secrets/pack-signing-key.pem` (git-ignored) and must be backed up. Losing it means shipping an app update with a new public key.
