# pisga-content

Public content for the Pisga Trivia app, served at https://mnzaguri-a11y.github.io/pisga-content/

- `packs/<id>.json`: a question pack. Pack id example: `2026-w46`. Question ids must start with `<pack id>-` (for example `2026-w46-001`). Each question has the bundled-bank schema plus `cat` (one of: gaming, movies, brands, club, science, world, pop, israel, food).
- `packs/index.json`: pack ids in release order, oldest first. The last one is shown in the app as "חדש השבוע". Removing an id pulls that pack from every device on its next launch.
- `fixes.json`: corrections to existing questions, e.g. `{"id":"science-014","why":"..."}` or `{"id":"food-120","remove":true}`. Overridable fields: q, opts (opts[0] is correct), hint, why, lvl, type.
- `config.json`: remote config (e.g. ad frequency, later).
- `index.html`, `privacy.html`: the public site. `privacy.html` is a copy of `app_extra/privacy.html` in the app repo; keep both in sync.

On every push to `main`, `.github/workflows/pages.yml` runs `tools/build.js`. The script validates everything, writes `manifest.json` (pack list with SHA-256 hashes, plus fixes and config) and signs it with the `PISGA_SIGN_KEY` secret (ECDSA P-256) into `manifest.sig`, then deploys to GitHub Pages. The app accepts content only when the signature verifies against the public key built into it. On pull requests the workflow only validates.

The private signing key is kept in the app repo under `secrets/pack-signing-key.pem` (git-ignored) and must be backed up. Losing it means shipping an app update with a new public key.
