# Tests

Browser tests (Playwright) and database-rules tests, run against a **local copy** of Firebase
(the Firebase emulator) so they never touch the real plan.

## One-time setup

```bash
cd tests/emu && npm install            # firebase-tools + jsPDF (served locally to the PDF tests)
npm install pannellum@2.5.6 --no-save  # 360° viewer, served locally to panorama-360.js
```

Playwright and Chromium must be available (`require('playwright')`).

## Each time

1. Build the emulator rules with the real codes (ask Marcus; they are not in the repo):

   ```bash
   cd tests/emu && ADMIN_CODE=... LEAD_CODE=... ./make-rules.sh
   ```

2. Start the local database and a web server for the app (two terminals):

   ```bash
   cd tests/emu && npx firebase emulators:start --project wwsc-river-map-7ab35 --only firestore,auth
   ```

   ```bash
   python3 -m http.server 8765 --bind 127.0.0.1    # from the repo root
   ```

3. From `tests/`, run what you need. Clear the local database between runs so old test data doesn't
   get in the way:

   ```bash
   curl -X DELETE "http://127.0.0.1:8081/emulator/v1/projects/wwsc-river-map-7ab35/databases/(default)/documents"
   ```

   ```bash
   python3 rules-test.py "$ADMIN_CODE" "$LEAD_CODE"   # database rules: expect "85/85 passed"
   ```

   ```bash
   node layout-audit.js | grep -v '"over":\[\],"off":\[\]'   # layout on 11 devices: expect no output
   ```

   ```bash
   node permissions.js "$ADMIN_CODE"   # and leads.js / same-person.js / lead-code.js "$ADMIN_CODE" "$LEAD_CODE"
   ```

The app talks to the emulator because each test sets `window.__EMU` before the page loads.
Screenshots and PDFs the tests write land in `tests/` and are git-ignored.

| Script | Checks |
|---|---|
| rules-test.py | Every database rule: viewers, editors, own things, same person on two devices, leads (code and admin-made), admin, locks, comments, logs |
| layout-audit.js | No overlaps or off-screen panels on laptops, iPads and phones in several states |
| permissions.js | Viewer gets "Log in to edit"; editors can't change others' things; admin can |
| leads.js, lead-code.js, same-person.js | Department leads, the lead code, one person on two devices |
| comments.js, google-notes.js, text-notes.js | Comments, editable Google-map notes, note sizing with zoom |
| photos-feed-rivermode.js, panorama-360.js | Several photos per thing, recent changes, River mode surviving reloads, panoramas/360° |
| wheel-zoom-river.js, clear-categories-find.js, place-one.js | Fan-out wheel, zoom, blue river switch, clear mode, categories, find-next, one-at-a-time placing |
| pdf-export.js, phone-*.js | PDF export (rotated maps), phone layout, phone PDF sheet, phone "Add an icon" |
