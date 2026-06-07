# Data Model

The entire creature state is a single flat object (`data`) held in `useState`. All fields are strings or arrays unless noted.

---

## DiceRoll type

Several fields use a structured `DiceRoll` object instead of a free-text string:

```js
{ dice: [{ count: number, sides: number }], modifier: number }
```

- `dice` — one or more die groups, each with a positive `count` and `sides` drawn from: 4, 6, 8, 10, 12, 20, 100
- `modifier` — flat integer added to the final result (may be negative or zero)
- The **displayed value** is always `floor(expected value)`, where `EV = Σ(count × (sides + 1) / 2) + modifier`
- An empty roll is represented as `{ dice: [], modifier: 0 }` — it renders as nothing

Examples:

| DiceRoll | EV | Renders as |
|---|---|---|
| `{ dice: [{count:1, sides:6}], modifier:0 }` | 3.5 → **3** | `3 (1d6)` |
| `{ dice: [{count:2, sides:10}], modifier:8 }` | 19.0 → **19** | `19 (2d10 + 8)` |
| `{ dice: [{count:19, sides:12}], modifier:133 }` | 256.5 → **256** | `256 (19d12 + 133)` |
| `{ dice: [{count:3, sides:12}], modifier:10 }` | 29.5 → **29** | `29 (3d12 + 10)` |

---

## HpValue type

The `hp` field uses a discriminated union keyed on `mode`:

**Dice mode** (default)
```js
{ mode: "dice", dice: [{ count: number, sides: number }], modifier: number }
```
Same structure as `DiceRoll` plus the `mode` discriminator. Renders as `"19 (2d10 + 8)"`.

**Flat mode**
```js
{ mode: "flat", flat: number }
```
A plain integer HP value with no dice expression. Renders as just the number, e.g. `"195"`.

Switching modes in the editor preserves the other mode's data on the object so toggling back is lossless.

---

## Required fields

The `validate()` function checks these fields before printing. Missing ones are surfaced in the Verify banner.

| Field | Description |
|---|---|
| `name` | Creature name, free text |
| `size` | One of: `Tiny`, `Small`, `Medium`, `Large`, `Huge`, `Gargantuan` |
| `type` | Free text — e.g. `dragon`, `humanoid (orc)` |
| `alignment` | One of the 9 standard alignments or `Unaligned` |
| `ac` | Armor Class — positive integer string |
| `hp` | Hit Points — `HpValue`; dice mode requires at least one die with count ≥ 1; flat mode requires a non-empty integer |
| `speedWalk` | Walking speed in ft. — non-negative integer string |
| `str` `dex` `con` `int` `wis` `cha` | Ability scores — integer strings, clamped 0–30, default `10` |
| `cr` | Challenge Rating — see [CR values](#challenge-rating) |

`legendaryCount` is also required (integer ≥ 1) whenever `legendaryActions` is non-empty.

---

## Identity

| Field | Required | Type | Notes |
|---|---|---|---|
| `name` | Yes | string | Free text |
| `size` | Yes | enum | `Tiny` \| `Small` \| `Medium` \| `Large` \| `Huge` \| `Gargantuan` |
| `type` | Yes | string | Free text |
| `alignment` | Yes | enum | `Lawful Good`, `Neutral Good`, `Chaotic Good`, `Lawful Neutral`, `True Neutral`, `Chaotic Neutral`, `Lawful Evil`, `Neutral Evil`, `Chaotic Evil`, `Unaligned` |
| `description` | No | string | Flavour text, displayed above the mechanical block |

---

## Defenses & Movement

| Field | Required | Type | Notes |
|---|---|---|---|
| `ac` | Yes | string | Positive integer |
| `acNote` | No | string | Parenthetical label, e.g. `Natural Armor` |
| `hp` | Yes | HpValue | Dice mode: at least one die with count ≥ 1; flat mode: non-empty integer; see [HpValue type](#hpvalue-type) |
| `speedWalk` | Yes | string | Non-negative integer, ft. |
| `speeds` | No | `SpeedEntry[]` | Additional movement modes; see below |

### SpeedEntry
```
{ mode: string, value: string }
```
- `mode` — one of: `Burrow`, `Climb`, `Fly`, `Swim`
- `value` — non-negative integer string, ft.
- Each mode may appear at most once.

---

## Ability Scores

Fields: `str`, `dex`, `con`, `int`, `wis`, `cha`

- All required, integer strings.
- Clamped range: **0–30**; the editor enforces this on input.
- Default: `"10"` (modifier +0).
- Modifier formula: `floor((score − 10) / 2)`, displayed with an explicit sign.

---

## Details

| Field | Required | Type | Notes |
|---|---|---|---|
| `savingThrows` | No | `SaveEntry[]` | See below |
| `skills` | No | `SkillEntry[]` | See below |
| `vulnerabilities` | No | `string[]` | Each entry is one damage type; joined with `, ` for display |
| `resistances` | No | `string[]` | Each entry is one damage type; joined with `, ` for display |
| `damageImmunities` | No | `string[]` | Each entry is one damage type; joined with `, ` for display |
| `conditionImmunities` | No | `string[]` | Each entry is one condition; joined with `, ` for display |
| `senses` | No | `SenseEntry[]` | See below; Passive Perception is appended automatically |
| `languages` | No | `string[]` | Each entry is one language; joined with `, ` for display |
| `cr` | Yes | enum | See [CR values](#challenge-rating) |

### SaveEntry
```
{ ability: string, value: string }
```
- `ability` — one of: `str`, `dex`, `con`, `int`, `wis`, `cha`
- `value` — signed integer string, e.g. `"6"` or `"-1"`
- Each ability may appear at most once.
- Rendered in ability order (STR → DEX → CON → INT → WIS → CHA).

### SkillEntry
```
{ skill: string, value: string }
```
- `skill` — one of the 18 standard D&D 5e skills: `Acrobatics`, `Animal Handling`, `Arcana`, `Athletics`, `Deception`, `History`, `Insight`, `Intimidation`, `Investigation`, `Medicine`, `Nature`, `Perception`, `Performance`, `Persuasion`, `Religion`, `Sleight of Hand`, `Stealth`, `Survival`
- `value` — signed integer string
- Each skill may appear at most once.
- Rendered alphabetically.
- A `Perception` entry also feeds the derived Passive Perception value (`10 + value`). If absent, Passive Perception falls back to `10 + WIS modifier`.

### SenseEntry
```
{ sense: string, value: string }
```
- `sense` — one of: `Blindsight`, `Darkvision`, `Tremorsense`, `Truesight`
- `value` — non-negative integer string, ft.
- Each sense may appear at most once.
- Rendered in the order listed above; Passive Perception is always appended last.

---

## Challenge Rating

`cr` is an enum key drawn from `CR_TABLE`. Valid keys:

`"0"`, `"1/8"`, `"1/4"`, `"1/2"`, `"1"` – `"30"`

XP and Proficiency Bonus are **always derived** from the CR and are never stored on the creature object.

| CR range | Proficiency Bonus |
|---|---|
| 0 – 4 | +2 |
| 5 – 8 | +3 |
| 9 – 12 | +4 |
| 13 – 16 | +5 |
| 17 – 20 | +6 |
| 21 – 24 | +7 |
| 25 – 28 | +8 |
| 29 – 30 | +9 |

---

## Traits

```
traits: EntryItem[]
```

### EntryItem
```
{ name: string, desc: string }
```
Both fields are free text. No constraints on count.

---

## Actions & Bonus Actions

```
actions: ActionItem[]
bonusActions: ActionItem[]
```

Each `ActionItem` has a `kind` discriminator field:

### kind: "other"
```
{ kind: "other", name: string, desc: string }
```
Free-text name and description.

### kind: "attack"
```
{
  kind: "attack",
  name: string,
  attackType: "Melee" | "Ranged",
  toHit: string,           // signed integer string, e.g. "14"
  reach: string,           // non-negative integer, ft. (Melee only)
  rangeNormal: string,     // non-negative integer, ft. (Ranged only)
  rangeLong: string,       // non-negative integer, ft. (Ranged only)
  damages: DamageComponent[],
  extra: string            // optional trailing sentence appended after the Hit line
}
```

All fields coexist on the same object regardless of `attackType`; the editor shows only the relevant subset.

### DamageComponent
```
{ roll: DiceRoll, type: string }
```
- `roll` — a `DiceRoll` object; see [DiceRoll type](#diceroll-type)
- `type` — one of the 13 damage types, or empty string:
  `Acid`, `Bludgeoning`, `Cold`, `Fire`, `Force`, `Lightning`, `Necrotic`, `Piercing`, `Poison`, `Psychic`, `Radiant`, `Slashing`, `Thunder`
- Multiple components are joined with `" plus "` in the rendered output.

---

## Reactions

```
reactions: EntryItem[]
```
Same shape as Traits — `{ name, desc }[]`.

---

## Legendary Actions

| Field | Required | Type | Notes |
|---|---|---|---|
| `legendaryCount` | Conditional | string | Required when `legendaryActions` is non-empty; integer string ≥ 1 |
| `legendaryActions` | No | `EntryItem[]` | Same `{ name, desc }` shape as Traits |

---

## Lair & Region

| Field | Required | Type | Notes |
|---|---|---|---|
| `lairActions` | No | string | Free text, rendered as a paragraph |
| `regionalEffects` | No | string | Free text, rendered as a paragraph |
