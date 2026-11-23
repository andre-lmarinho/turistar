---
name: Turistar
description: A collaborative travel planner for organizing trips together.
colors:
  folio-ink: "#173a36"
  folio-ink-soft: "#46625a"
  folio-paper: "#f4f4ec"
  folio-white: "#fffef8"
  folio-citron: "#e7f05a"
  folio-coral: "#d95d39"
  folio-line: "#c8d2c7"
  app-background: "#fdfdfc"
  app-foreground: "#21201c"
  app-primary: "#3e63dd"
  app-accent: "#f76b15"
typography:
  display:
    fontFamily: "Alegreya, Georgia, serif"
    fontSize: "clamp(2.8rem, 5.1vw, 5.2rem)"
    fontWeight: 500
    lineHeight: 0.95
    letterSpacing: "-0.045em"
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 620
rounded:
  field: "0.3rem"
  button: "0.35rem"
  pill: "999px"
spacing:
  xs: "0.45rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.folio-citron}"
    textColor: "{colors.folio-ink}"
    rounded: "{rounded.button}"
    padding: "0.75rem 1rem 0.75rem 1.125rem"
    height: "3.25rem"
  button-submit:
    backgroundColor: "{colors.folio-citron}"
    textColor: "{colors.folio-ink}"
    rounded: "{rounded.button}"
    height: "3rem"
  input:
    backgroundColor: "{colors.folio-white}"
    textColor: "{colors.folio-ink}"
    rounded: "{rounded.field}"
    height: "2.9rem"
---

# Design System: Turistar

## Overview

**Creative North Star: "The Trip Folio"**

The signup surface is a product access screen, not a marketing page. A warm paper field holds one clear demo action. A clean, explicitly labeled 4:3 placeholder reserves space for a future product image; it does not simulate the app. Account creation opens only when requested.

This is the first implementation of The Trip Folio on signup, not a site-wide visual migration. The signup view scopes its palette and most of its visual treatment in its own CSS module. Shared UI and the root theme still use the app's separate neutral, indigo, and orange system. Reuse the local folio values only for this surface or when a later implementation deliberately extends them.

**Key Characteristics:**

- Warm paper frames the access screen; ink structures the content and the preview uses restrained trip colors.
- Citron marks the primary demo action. Coral marks selected stops and keyboard focus.
- A responsive split puts the access choice beside a clearly marked image placeholder.
- Global app theme tokens remain active outside the scoped signup treatment.

## Colors

The signup palette uses a warm, low-chroma paper canvas, deep green text, and two small, high-visibility accents; global app colors remain distinct.

### Primary

- **Folio Ink** (`{colors.folio-ink}`): Page text, wordmark, preview, and account form structure.

### Secondary

- **Folio Coral** (`{colors.folio-coral}`): Wordmark pin, route/feature icons, caret, and the signup surface's visible keyboard focus outline.
- **Folio Citron** (`{colors.folio-citron}`): Signup submit action and selected route marker.

### Neutral

- **Folio Paper** (`{colors.folio-paper}`): Signup page background and trip preview.
- **Folio White** (`{colors.folio-white}`): Fields and other light surfaces.
- **Folio Ink Soft** (`{colors.folio-ink-soft}`): Supporting copy and secondary labels.
- **Folio Line** (`{colors.folio-line}`): Signup dividers and subtle boundaries.
- **App Background** (`{colors.app-background}`) and **App Foreground** (`{colors.app-foreground}`): Root theme defaults outside the signup surface.
- **App Primary** (`{colors.app-primary}`) and **App Accent** (`{colors.app-accent}`): Shared app action colors; these are not substitutes for the folio signup colors.

### Named Rules

**The Scoped Folio Rule.** Keep the folio palette local to the signup surface unless a deliberate wider migration changes the shared theme.

**The Accent-as-Signpost Rule.** Use coral and citron for focused actions and travel cues, not as broad background fields.

## Typography

**Display Font:** Alegreya variable (`Alegreya, Georgia, serif`) for the access headline and trip title.
**Body Font:** Inherited app system sans (`ui-sans-serif, system-ui, sans-serif`).

**Character:** Editorial serif headlines give the access page a travel-journal voice. Compact sans-serif labels and controls keep planner details quick to scan.

### Hierarchy

- **Display** (weight 500, responsive 2.8–5.2rem, line-height 0.95): Access headline; balanced to a short measure.
- **Body** (weight 400, 1rem, line-height 1.6): Intro copy, with a maximum measure of 37ch.
- **Trip title** (Alegreya, 600, 1.45–2rem): Preview destination heading.
- **Label** (weight 620–700, 0.64–0.82rem): Form fields, tabs, itinerary times, and status text.

### Named Rules

**The Balanced Heading Rule.** Keep the signup headline tightly tracked, short-measured, and balanced; do not let its scale overpower the form.

## Layout

The access page is a full-height flex column with a centered header and main content, capped at 96rem. At wider widths, the access choice uses a narrower column beside the larger planner preview. Below 52rem, the columns stack. The planner preview reflows from itinerary/map to a vertical layout and from a three-day board to stacked day cards on small screens. Page padding and the desktop gap use fluid clamps.

## Elevation & Depth

Depth is mostly structural: thin borders, warm surface contrast, and a single broad, low-opacity green shadow under the planner preview. The language trigger overrides its shared styling to remove shadow and blur.

### Shadow Vocabulary

- **Product preview** (`0 24px 70px rgb(5 25 22 / 22%)`): Lift the planner folio from the paper canvas.

## Shapes

Buttons and fields use lightly softened corners; the language trigger is a full pill. The planner preview stays square-cornered and uses thin muted borders.

## Components

### Buttons

- **Character:** Confident, compact actions with clear contrast.
- **Shape:** Signup actions use softly rounded corners (0.35rem); the shared button primitive defaults to its app radius.
- **Primary:** The demo action uses citron with ink text. The account submit action uses the same treatment. Both are at least 3rem high.
- **Hover / Focus:** Hover deepens or shifts the relevant surface and border. Pressed signup actions scale slightly. Keyboard focus uses a 3px coral outline with a 3px offset.
- **Secondary:** The account action is transparent with a light border; hover adds a light tint.

### Cards / Containers

- **Corner Style:** Square folio with thin divisions between trip header, view selector, and content.
- **Background:** Warm paper surfaces against the matching page canvas.
- **Shadow Strategy:** The preview uses the broad low-opacity shadow described in Elevation & Depth.
- **Border:** Thin muted green-gray border.
- **Internal Padding:** Responsive padding around the itinerary, map, board, and budget views.

### Inputs / Fields

- **Style:** White surface, muted green-gray stroke, and lightly rounded corners; field height is 2.8rem.
- **Focus:** Citron border plus a visible outline.
- **Error / Disabled:** Invalid fields and messages use dark red on the light surface. Pending fields become read-only.

### Navigation

- **Language selector:** A transparent, full-pill trigger with an ink globe icon and a compact language menu. The menu uses rounded list rows, selected-state tint, and a checkmark. The signup surface removes trigger shadow and backdrop blur.

### Product Preview

The right column contains one static 4:3 placeholder with a dashed border and explicit “App preview placeholder” text. Replace it with a clean product image when one is ready. Do not recreate the app UI in this space.

## Do's and Don'ts

### Do:

- **Do** keep The Trip Folio colors scoped to this signup surface until a wider migration is implemented.
- **Do** use coral for selected stops and keyboard focus, and citron for the primary demo action.
- **Do** preserve the responsive planner preview and open the signup form only after the user asks for it.
- **Do** honor reduced motion by removing button transitions.

### Don't:

- **Don't** describe the root app theme as migrated; its background, foreground, primary, accent, radius, and font tokens remain separate.
- **Don't** add elevation to every surface; reserve the preview shadow for the planner panel.
- **Don't** replace the local ink/paper palette with global indigo or orange on this signup composition.
