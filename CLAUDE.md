# Sungai Geroh race map: guide for the next session

Planning map for the WWSC tube race on Sungai Geroh (River Safety team, owner: Marcus).
Live at https://wwsc-river-map.netlify.app. Netlify deploys `main` automatically (~30 s);
pushing to `main` goes straight to the live site.

## Shape of the app

- Everything is in **`index.html`**: CSS, markup, then one big script (an IIFE). ~2,700 lines;
  the map data (`LAYERS`, `SECS`, `P`, `ROADS`, `EXPWAY`) are very long single lines, so
  search with `grep -n` / `grep -o` and patch exact strings rather than reading whole lines.
- The map is an SVG. World units ≈ 2.23 m (`MPU`). `view={k,tx,ty}` is the pan/zoom; `kfit` is the
  whole-river zoom. Icons/labels that keep their screen size are in `posEls` / `fixed`
  (`translate(x,y) scale(1/k)`).
- Data lives in **Firestore** (project `wwsc-river-map-7ab35`, compat SDK 10.12.2, anonymous auth).
  Collections: `items` (dock icons), `waypoints`, `ink` (drawings + text notes), `markx`
  (extras on Google-map markers), `notes` (section notes), `brief`, `reports`, `photos`
  (chunked over 900 kB as `id~0..n`), `comments`, `ccount`, `feed` (recent changes, 16 h),
  `bin` (recently deleted), `members`, `leads`, `log`, `visits`.
- Without Firebase the app falls back to localStorage on the device.

## Who can do what (the important part)

| Role | How | Can change |
|---|---|---|
| Viewer | opens the link | nothing (tries show a red "Log in to edit" bubble) |
| Editor | Log in: first + last name + department | what they put down, shared notes, comments |
| Lead | Log in as lead or admin + **lead code** (or admin taps "Make lead" in Admin → People) | everything their department put down |
| Admin | same form + **admin code** | everything, unlock, logs, admin page |

- A **person** = first + last name + department (`personKey`, stored as `pk`); the same person on
  another device can edit their own things. Each placed thing records `cr:{by,at,uid,dept,pk}`.
- The app checks permissions in `whyNot(o)` / `deny()`; the **database rules enforce the same**:
  `firebase/firestore.rules` (codes are placeholders `__ADMIN_CODE__`, `__LEAD_CODE__`; Marcus has
  the real ones). Rules are published by hand in the Firebase console → Firestore Database → Rules.
  **Never commit the real codes** (grep the diff for them before every commit).
- Admin pages, logs and visits are admin-only in the rules.

## Testing

See `tests/README.md`. Always run the relevant tests plus `layout-audit.js` before pushing, and
`rules-test.py` after any rules change. Test against the emulator, never the real database.

## Conventions Marcus likes

- Short plain-English summaries; no jargon. Phone, iPad (mostly portrait) and laptop all matter.
- Commit messages end with the Co-Authored-By / Claude-Session lines the session gives you.

## Next job: Geruntum map

Marcus wants a second map for **Sg Geruntum**, switchable with Geroh (a Geroh / Geruntum switch),
with the same tools: sections, section strip, icons, comments, photos, River mode, PDF.
- Drop-off: **Geruntum Gathering Point** (in `LAYERS` → extraction points, x≈2024, y≈-141).
- They **hike up the river** to the **old lunch spot** (`Lunch Spot 1`, upper layer, x≈1941, y≈-374),
  then **tube back down** Sg Geruntum to the Gathering Point.
- River line: `Sg Geruntum` in the `rivers` layer. Nearby: Geruntum River Right Road,
  Geruntum River Right Hijau Trail, The Dip Parking Spot, other Upper Geroh landmarks.
- Sections: no points given yet. Split into equal sections that Marcus can rename.
- Keep everything already placed on Geroh untouched. Things on the new map need to know which
  map they belong to.
