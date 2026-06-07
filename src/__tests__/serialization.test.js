import { describe, it, expect } from "vitest";
import { exportStatBlock, importStatBlock } from "../App.jsx";

// Every field in the data model, all non-empty / non-default values.
const FULL = {
  name: "Test Dragon",
  size: "Large",
  type: "dragon",
  alignment: "Lawful Evil",
  description: "A fully-populated test creature for round-trip coverage.",
  ac: "17",
  acNote: "Natural Armor",
  hp: { mode: "dice", dice: [{ count: 10, sides: 10 }], modifier: 20 },
  speedWalk: "40",
  speeds: [
    { mode: "Fly", value: "60" },
    { mode: "Swim", value: "30" },
  ],
  str: "20", dex: "12", con: "18", int: "14", wis: "11", cha: "16",
  savingThrows: [
    { ability: "dex", value: "5" },
    { ability: "con", value: "8" },
  ],
  skills: [
    { skill: "Perception", value: "8" },
    { skill: "Stealth", value: "5" },
  ],
  vulnerabilities: ["Cold"],
  resistances: ["Bludgeoning"],
  damageImmunities: ["Fire", "Poison"],
  conditionImmunities: ["Charmed", "Frightened"],
  senses: [
    { sense: "Blindsight", value: "30" },
    { sense: "Darkvision", value: "90" },
  ],
  languages: ["Common", "Draconic", "Infernal"],
  cr: "10",
  traits: [
    { name: "Legendary Resistance (3/Day)", desc: "It can choose to succeed on a failed save." },
    { name: "Amphibious", desc: "Can breathe air and water." },
  ],
  actions: [
    {
      kind: "other",
      name: "Multiattack",
      desc: "Makes three attacks.",
      attackType: "Melee",
      toHit: "",
      reach: "",
      rangeNormal: "",
      rangeLong: "",
      damages: [],
      extra: "",
    },
    {
      kind: "attack",
      name: "Bite",
      attackType: "Melee",
      toHit: "9",
      reach: "10",
      rangeNormal: "",
      rangeLong: "",
      damages: [
        { roll: { dice: [{ count: 2, sides: 10 }], modifier: 5 }, type: "Piercing" },
        { roll: { dice: [{ count: 1, sides: 6 }], modifier: 0 }, type: "Fire" },
      ],
      extra: "The target is grappled (escape DC 17).",
      desc: "",
    },
    {
      kind: "attack",
      name: "Spit Acid",
      attackType: "Ranged",
      toHit: "5",
      reach: "",
      rangeNormal: "60",
      rangeLong: "240",
      damages: [
        { roll: { dice: [{ count: 3, sides: 8 }], modifier: 0 }, type: "Acid" },
      ],
      extra: "",
      desc: "",
    },
  ],
  bonusActions: [
    {
      kind: "other",
      name: "Tail Swipe",
      desc: "Swipes its tail at a nearby creature.",
      attackType: "Melee",
      toHit: "",
      reach: "",
      rangeNormal: "",
      rangeLong: "",
      damages: [],
      extra: "",
    },
  ],
  reactions: [
    { name: "Parry", desc: "Adds 3 to its AC against one melee attack." },
  ],
  legendaryCount: "3",
  legendaryActions: [
    { name: "Detect", desc: "Makes a Wisdom (Perception) check." },
    { name: "Wing Attack (Costs 2 Actions)", desc: "Beats its wings." },
  ],
  lairActions: "On initiative count 20, the dragon takes a lair action.",
  regionalEffects: "The region surrounding the lair is warped by the dragon's presence.",
};

const MINIMAL = {
  name: "Goblin",
  size: "Small",
  type: "humanoid (goblinoid)",
  alignment: "Neutral Evil",
  description: "",
  ac: "15",
  acNote: "",
  hp: { mode: "dice", dice: [{ count: 2, sides: 6 }], modifier: 0 },
  speedWalk: "30",
  speeds: [],
  str: "8", dex: "14", con: "10", int: "10", wis: "8", cha: "8",
  savingThrows: [],
  skills: [],
  vulnerabilities: [],
  resistances: [],
  damageImmunities: [],
  conditionImmunities: [],
  senses: [],
  languages: ["Common", "Goblin"],
  cr: "1/4",
  traits: [],
  actions: [],
  bonusActions: [],
  reactions: [],
  legendaryCount: "",
  legendaryActions: [],
  lairActions: "",
  regionalEffects: "",
};

// ── exportStatBlock ───────────────────────────────────────────────────────────

describe("exportStatBlock", () => {
  it("returns a string", () => {
    expect(typeof exportStatBlock(MINIMAL)).toBe("string");
  });

  it("returns valid JSON", () => {
    expect(() => JSON.parse(exportStatBlock(MINIMAL))).not.toThrow();
  });

  it("includes a numeric version field", () => {
    const parsed = JSON.parse(exportStatBlock(MINIMAL));
    expect(typeof parsed.version).toBe("number");
  });

  it("embeds creature data under a statblock key", () => {
    const parsed = JSON.parse(exportStatBlock(MINIMAL));
    expect(parsed.statblock).toBeDefined();
    expect(parsed.statblock.name).toBe("Goblin");
    expect(parsed.statblock.cr).toBe("1/4");
  });

  it("does not mutate the original data object", () => {
    const original = { ...MINIMAL };
    exportStatBlock(MINIMAL);
    expect(MINIMAL).toEqual(original);
  });
});

// ── importStatBlock ───────────────────────────────────────────────────────────

describe("importStatBlock", () => {
  it("round-trips a minimal creature", () => {
    const imported = importStatBlock(exportStatBlock(MINIMAL));
    expect(imported.name).toBe(MINIMAL.name);
    expect(imported.cr).toBe(MINIMAL.cr);
    expect(imported.hp).toEqual(MINIMAL.hp);
    expect(imported.actions).toEqual(MINIMAL.actions);
    expect(imported.languages).toEqual(MINIMAL.languages);
  });

  it("round-trips a creature with attacks, traits, and legendary actions", () => {
    const complex = {
      ...MINIMAL,
      traits: [{ name: "Pack Tactics", desc: "Advantage on attack rolls when an ally is adjacent." }],
      actions: [
        {
          kind: "attack",
          name: "Scimitar",
          attackType: "Melee",
          toHit: "4",
          reach: "5",
          rangeNormal: "",
          rangeLong: "",
          damages: [{ roll: { dice: [{ count: 1, sides: 6 }], modifier: 2 }, type: "Slashing" }],
          extra: "",
          desc: "",
        },
      ],
      legendaryCount: "3",
      legendaryActions: [{ name: "Detect", desc: "Makes a Perception check." }],
    };
    const imported = importStatBlock(exportStatBlock(complex));
    expect(imported.traits).toEqual(complex.traits);
    expect(imported.actions).toEqual(complex.actions);
    expect(imported.legendaryCount).toBe("3");
    expect(imported.legendaryActions).toEqual(complex.legendaryActions);
  });

  it("throws for non-string input", () => {
    expect(() => importStatBlock(null)).toThrow();
    expect(() => importStatBlock(42)).toThrow();
    expect(() => importStatBlock({})).toThrow();
  });

  it("throws for invalid JSON", () => {
    expect(() => importStatBlock("not json at all")).toThrow();
    expect(() => importStatBlock("{unterminated")).toThrow();
  });

  it("throws when the statblock key is missing", () => {
    expect(() => importStatBlock(JSON.stringify({ version: 1 }))).toThrow();
    expect(() => importStatBlock(JSON.stringify({ version: 1, statblock: null }))).toThrow();
  });

  it("throws for an unrecognised version", () => {
    const future = JSON.stringify({ version: 999, statblock: MINIMAL });
    expect(() => importStatBlock(future)).toThrow();
  });

  it("fills in missing optional fields with blank defaults", () => {
    const sparse = {
      version: 1,
      statblock: {
        name: "Goblin",
        size: "Small",
        type: "humanoid",
        alignment: "Neutral Evil",
        ac: "15",
        hp: { mode: "dice", dice: [{ count: 2, sides: 6 }], modifier: 0 },
        speedWalk: "30",
        str: "8", dex: "14", con: "10", int: "10", wis: "8", cha: "8",
        cr: "1/4",
        legendaryActions: [],
        // description, acNote, speeds, savingThrows, skills, traits, etc. all omitted
      },
    };
    const imported = importStatBlock(JSON.stringify(sparse));
    expect(imported.description).toBe("");
    expect(imported.acNote).toBe("");
    expect(imported.speeds).toEqual([]);
    expect(imported.savingThrows).toEqual([]);
    expect(imported.skills).toEqual([]);
    expect(imported.traits).toEqual([]);
    expect(imported.bonusActions).toEqual([]);
    expect(imported.reactions).toEqual([]);
    expect(imported.lairActions).toBe("");
    expect(imported.regionalEffects).toBe("");
  });

  it("ignores unknown fields not in the data model", () => {
    const withJunk = {
      version: 1,
      statblock: { ...MINIMAL, unknownField: "junk", anotherExtra: 99 },
    };
    const imported = importStatBlock(JSON.stringify(withJunk));
    expect(imported.unknownField).toBeUndefined();
    expect(imported.anotherExtra).toBeUndefined();
  });

  it("normalises an hp object missing the mode field to dice mode", () => {
    const legacyHp = {
      version: 1,
      statblock: {
        ...MINIMAL,
        hp: { dice: [{ count: 2, sides: 6 }], modifier: 0 }, // no mode field
      },
    };
    const imported = importStatBlock(JSON.stringify(legacyHp));
    expect(imported.hp.mode).toBe("dice");
    expect(imported.hp.dice).toEqual([{ count: 2, sides: 6 }]);
  });

  it("preserves flat hp mode", () => {
    const flatHp = {
      version: 1,
      statblock: { ...MINIMAL, hp: { mode: "flat", flat: 42 } },
    };
    const imported = importStatBlock(JSON.stringify(flatHp));
    expect(imported.hp.mode).toBe("flat");
    expect(imported.hp.flat).toBe(42);
  });
});

// ── Full field coverage ───────────────────────────────────────────────────────

describe("full round-trip", () => {
  it("preserves every field exactly", () => {
    expect(importStatBlock(exportStatBlock(FULL))).toEqual(FULL);
  });

  it.each(["0", "1/8", "1/4", "1/2"])(
    "preserves fractional CR %s",
    (cr) => {
      expect(importStatBlock(exportStatBlock({ ...FULL, cr })).cr).toBe(cr);
    }
  );

  it("preserves flat HP through export and import", () => {
    const flat = { ...FULL, hp: { mode: "flat", flat: 195 } };
    expect(importStatBlock(exportStatBlock(flat)).hp).toEqual({ mode: "flat", flat: 195 });
  });

  it("preserves hp with multiple dice groups and a non-zero modifier", () => {
    const hp = { mode: "dice", dice: [{ count: 10, sides: 10 }, { count: 2, sides: 6 }], modifier: 15 };
    expect(importStatBlock(exportStatBlock({ ...FULL, hp })).hp).toEqual(hp);
  });
});
