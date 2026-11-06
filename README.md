# pisga-content

Public content for the Pisga Trivia app, served at https://mnzaguri-a11y.github.io/pisga-content/

- `packs/<id>.json`: a question pack. Pack id example: `2026-w46`. Question ids must start with `<pack id>-` (for example `2026-w46-001`). Each question has the bundled-bank schema plus `cat` (one of: gaming, movies, brands, club, science, world, pop, israel, food).
- `packs/index.json`: pack ids in release order, oldest first. The last one is shown in the app as "חדש השבוע". Removing an id pulls that pack from every device on its next launch.
- `fixes.json`: corrections to existing questions, e.g. `{"id":"science-014","why":"..."}` or `{"id":"food-120","remove":true}`. Overridable fields: q, opts (opts[0] is correct), hint, why, lvl, type.
- `config.json`: remote config (e.g. ad frequency, later).
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
