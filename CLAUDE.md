# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server with HMR
npm run build     # production build
npm run preview   # serve the production build locally
npm run lint      # run ESLint
```

Tests live in `src/__tests__/` — see the testing section below.

## Architecture

This is a single-page React app (Vite + React 19) for building D&D 5e monster stat blocks. The entire application lives in **`src/App.jsx`** — there are no separate component files, no routing, and no state management library.

### Data model

All creature state is a single flat object (`data`) held in `useState`. The shape mirrors the printed stat block: identity fields, combat stats, six ability scores, lists for saves/skills/senses/speeds, and action arrays. See `BLANK` and `ADULT_RED_DRAGON` constants for the canonical shapes.

Action entries have a `kind` field — `"attack"` (structured fields: `toHit`, `reach`/`rangeNormal`/`rangeLong`, `damages[]`) or `"other"` (free-text `desc`). Both shapes coexist on the same object; the editor toggles between them without discarding hidden fields.

`CR_TABLE` is the authoritative source for XP and proficiency bonus — those values are always derived from CR, never user inputs.

For the full field reference including types, enums, and constraints, see **[DATA_MODEL.md](./DATA_MODEL.md)**.

### Two-pane layout

- **Left pane (`.editor`, `no-print`)**: form-based editor, hidden during printing.
- **Right pane (`.preview`)**: `<Statblock>` component that renders the stat block from `data` in real time.

Two print buttons — **Print (Colour)** and **Print (B&W)** — both run `validate(data)` first. Clean validation goes straight to print; any issues show a confirmation dialog. B&W print adds a `.print-bw` class to the root before calling `window.print()`, which triggers ink-saving overrides inside `@media print`. The editor pane is hidden on actual print via `.no-print`.

### Key derived values

- Ability modifier: `mod(score)` — `Math.floor((score - 10) / 2)`, formatted with sign.
- Passive Perception: `10 + Perception skill bonus`, or `10 + WIS mod` if no Perception entry exists.
- Attack text in the preview is assembled by `renderDamage()` from the `damages[]` array.

### Editor components

All reusable editor pieces are defined at the bottom of `App.jsx`:

| Component | Purpose |
|---|---|
| `HpEditor` | Hit Points: toggle between structured dice input and flat numeric value |
| `KeyValueAdder` | Constrained key→value rows (saves, skills, senses, speeds); prevents duplicate keys |
| `EntryList` | Repeatable name+description rows (traits, reactions, legendary actions) |
| `ActionListEditor` | Actions/Bonus Actions: Attack / Other toggle per entry |
| `DamageEditor` | Damage component rows within an attack entry |

### Styles

All CSS is inlined as a template-literal constant `CSS` at the bottom of `App.jsx`, injected via a `<style>` tag. There is no separate stylesheet. CSS custom properties (`--maroon`, `--parchment`, `--serif`, `--display`) define the visual theme. Google Fonts (Cinzel, EB Garamond) are loaded via `@import` inside the style tag.

## Testing

```bash
npm test          # run once
npm run test:watch  # watch mode
```

Tests live in `src/__tests__/` and use Vitest. Pure logic functions exported from `App.jsx` are the primary test targets: `mod`, `rawMod`, `signed`, `endPunct`, `renderDamage`, and `validate`.
