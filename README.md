# Stat Block Maker

A browser-based tool for building D&D 5e monster stat blocks. Fill in the form on the left and see a formatted stat block update in real time on the right. Print directly from the browser when you're done.

## Features

- All standard stat block fields: identity, defenses, ability scores, saving throws, skills, senses, speeds, damage immunities/resistances/vulnerabilities
- Structured attack entries (to-hit, reach/range, typed damage components) alongside free-text actions
- Bonus Actions, Reactions, Legendary Actions, Lair Actions, and Regional Effects
- XP and Proficiency Bonus derived automatically from Challenge Rating
- Passive Perception derived from Wisdom modifier or Perception skill bonus
- Verify button flags any missing required fields before printing
- Print mode previews ink-saving black-and-white output; the editor is hidden on actual print

## Getting Started

```bash
npm install
npm run dev
```

Then open the local URL shown in the terminal. The Adult Red Dragon is pre-loaded as an example — use **Clear** to start fresh.

## Tech

React 19, Vite. No external UI libraries. All styles are self-contained.
