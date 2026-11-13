# Sungai Geroh Race Map

A planning board for the Sungai Geroh tube race: the river from Rapid 0 to Hussein Bridge in nine sections, every marker from the team's Google My Map as toggleable layers, drag-on counters (race kit, safety, hazards), waypoints with attached icons and notes, Apple Pencil drawing, and a PDF briefing export.

Live site: https://wwsc-river-map.netlify.app

It is a single static page (`index.html`) with no build step.

## Satellite photo

Layers → Satellite photo shows Esri World Imagery under the river (website version only; Claude artifacts cannot load outside images). Imagery: Esri, Maxar, Earthstar Geographics, and the GIS User Community.

The river line started from the team's Google My Map trace and was then nudged onto the visible channel in the imagery (typically 3 m, at most about 9 m). The REX Camp stretch was re-traced by hand, and the expressway position comes from the imagery.

## Saving

- Opened as a Claude artifact, the plan is shared live between everyone with access.
- Opened from this site, the plan is saved only in the browser you use. Two people on two phones will not see each other's changes.

## Deploy

Netlify serves the folder as-is (`netlify.toml` publishes the repository root). Every push to `main` redeploys the live site.

For planning, not navigation.
