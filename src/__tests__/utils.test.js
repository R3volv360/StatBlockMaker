import { describe, it, expect } from "vitest";
import { mod, rawMod, signed, endPunct, renderDamage, validate, diceEV, diceStr } from "../App.jsx";

// ── mod ──────────────────────────────────────────────────────────────────────

describe("mod", () => {
  it("returns +0 for score 10", () => expect(mod("10")).toBe("+0"));
  it("returns +0 for score 11 (floors)", () => expect(mod("11")).toBe("+0"));
  it("returns +1 for score 12", () => expect(mod("12")).toBe("+1"));
  it("returns +5 for score 20", () => expect(mod("20")).toBe("+5"));
  it("returns +10 for score 30 (max D&D 5e)", () => expect(mod("30")).toBe("+10"));
  it("returns -1 for score 8", () => expect(mod("8")).toBe("-1"));
  it("returns -5 for score 1 (min D&D 5e)", () => expect(mod("1")).toBe("-5"));
  it("returns +0 for non-numeric input", () => expect(mod("")).toBe("+0"));
  it("accepts numeric values as well as strings", () => expect(mod(14)).toBe("+2"));
});

// ── rawMod ───────────────────────────────────────────────────────────────────

describe("rawMod", () => {
  it("returns 0 for score 10", () => expect(rawMod("10")).toBe(0));
  it("returns -1 for score 8", () => expect(rawMod("8")).toBe(-1));
  it("returns 5 for score 20", () => expect(rawMod("20")).toBe(5));
  it("returns 0 for non-numeric input", () => expect(rawMod("")).toBe(0));
});

// ── signed ───────────────────────────────────────────────────────────────────

describe("signed", () => {
  it("prefixes positive values with +", () => expect(signed("6")).toBe("+6"));
  it("preserves - on negative values", () => expect(signed("-1")).toBe("-1"));
  it("returns +0 for zero", () => expect(signed("0")).toBe("+0"));
  it("returns +0 for non-numeric input", () => expect(signed("abc")).toBe("+0"));
  it("handles large values", () => expect(signed("13")).toBe("+13"));
});

// ── endPunct ─────────────────────────────────────────────────────────────────

describe("endPunct", () => {
  it("appends a period when no punctuation present", () =>
    expect(endPunct("Hello")).toBe("Hello."));
  it("does not double-add a period", () =>
    expect(endPunct("Hello.")).toBe("Hello."));
  it("preserves existing !", () => expect(endPunct("Stop!")).toBe("Stop!"));
  it("preserves existing ?", () => expect(endPunct("Really?")).toBe("Really?"));
  it("trims surrounding whitespace before checking", () =>
    expect(endPunct("  Hello  ")).toBe("Hello."));
  it("returns empty string for empty input", () => expect(endPunct("")).toBe(""));
  it("returns empty string for null/undefined", () => {
    expect(endPunct(null)).toBe("");
    expect(endPunct(undefined)).toBe("");
  });
});

// ── diceEV ───────────────────────────────────────────────────────────────────

describe("diceEV", () => {
  it("returns 0 for empty roll", () =>
    expect(diceEV({ dice: [], modifier: 0 })).toBe(0));

  it("returns 0 for null", () => expect(diceEV(null)).toBe(0));

  it("1d6 → 3 (floor of 3.5)", () =>
    expect(diceEV({ dice: [{ count: 1, sides: 6 }], modifier: 0 })).toBe(3));

  it("2d6 → 7", () =>
    expect(diceEV({ dice: [{ count: 2, sides: 6 }], modifier: 0 })).toBe(7));

  it("3d12 + 10 → 29 (floor of 29.5)", () =>
    expect(diceEV({ dice: [{ count: 3, sides: 12 }], modifier: 10 })).toBe(29));

  it("19d12 + 133 → 256 (Adult Red Dragon HP)", () =>
    expect(diceEV({ dice: [{ count: 19, sides: 12 }], modifier: 133 })).toBe(256));

  it("2d10 + 8 → 19 (Bite piercing)", () =>
    expect(diceEV({ dice: [{ count: 2, sides: 10 }], modifier: 8 })).toBe(19));

  it("applies negative modifier", () =>
    expect(diceEV({ dice: [{ count: 1, sides: 6 }], modifier: -2 })).toBe(1));

  it("floors the result", () =>
    expect(diceEV({ dice: [{ count: 1, sides: 6 }], modifier: 0 })).toBe(3));

  it("handles multiple dice groups", () =>
    expect(diceEV({ dice: [{ count: 2, sides: 6 }, { count: 1, sides: 8 }], modifier: 0 })).toBe(11));
});

// ── diceStr ──────────────────────────────────────────────────────────────────

describe("diceStr", () => {
  it("returns empty string for empty roll", () =>
    expect(diceStr({ dice: [], modifier: 0 })).toBe(""));

  it("returns empty string for null", () => expect(diceStr(null)).toBe(""));

  it("formats a single die group", () =>
    expect(diceStr({ dice: [{ count: 2, sides: 6 }], modifier: 0 })).toBe("2d6"));

  it("appends positive modifier", () =>
    expect(diceStr({ dice: [{ count: 2, sides: 10 }], modifier: 8 })).toBe("2d10 + 8"));

  it("appends negative modifier with minus sign", () =>
    expect(diceStr({ dice: [{ count: 2, sides: 6 }], modifier: -3 })).toBe("2d6 - 3"));

  it("omits zero modifier", () =>
    expect(diceStr({ dice: [{ count: 1, sides: 8 }], modifier: 0 })).toBe("1d8"));

  it("joins multiple dice groups with ' + '", () =>
    expect(diceStr({ dice: [{ count: 2, sides: 6 }, { count: 1, sides: 8 }], modifier: 0 }))
      .toBe("2d6 + 1d8"));

  it("skips dice entries with count 0", () =>
    expect(diceStr({ dice: [{ count: 0, sides: 6 }, { count: 1, sides: 8 }], modifier: 0 }))
      .toBe("1d8"));
});

// ── renderDamage ─────────────────────────────────────────────────────────────

describe("renderDamage", () => {
  it("returns empty string when damages is empty", () =>
    expect(renderDamage({ damages: [] })).toBe(""));

  it("renders a single damage component with type", () =>
    expect(
      renderDamage({ damages: [{ roll: { dice: [{ count: 2, sides: 10 }], modifier: 8 }, type: "Piercing" }] })
    ).toBe("19 (2d10 + 8) piercing damage."));

  it("renders a component with no type", () =>
    expect(
      renderDamage({ damages: [{ roll: { dice: [{ count: 1, sides: 6 }], modifier: 0 }, type: "" }] })
    ).toBe("3 (1d6) damage."));

  it("joins multiple components with 'plus'", () =>
    expect(
      renderDamage({
        damages: [
          { roll: { dice: [{ count: 2, sides: 10 }], modifier: 8 }, type: "Piercing" },
          { roll: { dice: [{ count: 2, sides: 6 }], modifier: 0 }, type: "Fire" },
        ],
      })
    ).toBe("19 (2d10 + 8) piercing damage plus 7 (2d6) fire damage."));

  it("skips entries with no dice and no type", () =>
    expect(
      renderDamage({
        damages: [
          { roll: { dice: [], modifier: 0 }, type: "" },
          { roll: { dice: [{ count: 1, sides: 6 }], modifier: 0 }, type: "Cold" },
        ],
      })
    ).toBe("3 (1d6) cold damage."));

  it("lowercases the damage type", () =>
    expect(
      renderDamage({ damages: [{ roll: { dice: [{ count: 1, sides: 8 }], modifier: 0 }, type: "Thunder" }] })
    ).toBe("4 (1d8) thunder damage."));
});

// ── validate ─────────────────────────────────────────────────────────────────

const VALID_BASE = {
  name: "Goblin",
  size: "Small",
  type: "humanoid",
  alignment: "Neutral Evil",
  ac: "15",
  hp: { dice: [{ count: 2, sides: 6 }], modifier: 0 },
  speedWalk: "30",
  str: "8", dex: "14", con: "10", int: "10", wis: "8", cha: "8",
  cr: "1/4",
  legendaryCount: "",
  legendaryActions: [],
};

describe("validate", () => {
  it("returns no issues for a fully valid creature", () =>
    expect(validate(VALID_BASE)).toEqual([]));

  it("flags missing name", () =>
    expect(validate({ ...VALID_BASE, name: "" })).toContain("Name"));

  it("flags missing size", () =>
    expect(validate({ ...VALID_BASE, size: "" })).toContain("Size"));

  it("flags missing type", () =>
    expect(validate({ ...VALID_BASE, type: "" })).toContain("Type"));

  it("flags missing alignment", () =>
    expect(validate({ ...VALID_BASE, alignment: "" })).toContain("Alignment"));

  it("flags missing AC", () =>
    expect(validate({ ...VALID_BASE, ac: "" })).toContain("Armor Class"));

  it("flags HP with no dice", () =>
    expect(validate({ ...VALID_BASE, hp: { dice: [], modifier: 0 } })).toContain("Hit Points"));

  it("flags HP with all-zero counts", () =>
    expect(validate({ ...VALID_BASE, hp: { dice: [{ count: 0, sides: 6 }], modifier: 5 } })).toContain("Hit Points"));

  it("does not flag HP that has at least one die", () =>
    expect(validate(VALID_BASE)).not.toContain("Hit Points"));

  it("accepts flat HP with a numeric value", () =>
    expect(validate({ ...VALID_BASE, hp: { mode: "flat", flat: 50 } })).not.toContain("Hit Points"));

  it("flags flat HP with empty string", () =>
    expect(validate({ ...VALID_BASE, hp: { mode: "flat", flat: "" } })).toContain("Hit Points"));

  it("flags flat HP with null", () =>
    expect(validate({ ...VALID_BASE, hp: { mode: "flat", flat: null } })).toContain("Hit Points"));

  it("flags flat HP with no flat field set", () =>
    expect(validate({ ...VALID_BASE, hp: { mode: "flat" } })).toContain("Hit Points"));

  it("flags missing walking speed", () =>
    expect(validate({ ...VALID_BASE, speedWalk: "" })).toContain("Speed"));

  it.each(["str", "dex", "con", "int", "wis", "cha"])(
    "flags missing %s score",
    (ability) =>
      expect(validate({ ...VALID_BASE, [ability]: "" })).toHaveLength(1)
  );

  it("flags missing CR", () =>
    expect(validate({ ...VALID_BASE, cr: "" })).toContain("Challenge Rating"));

  it("flags missing legendaryCount when legendaryActions are present", () =>
    expect(
      validate({ ...VALID_BASE, legendaryActions: [{ name: "Detect", desc: "..." }], legendaryCount: "" })
    ).toContain("Legendary actions per round"));

  it("flags legendaryCount of 0 when legendaryActions are present", () =>
    expect(
      validate({ ...VALID_BASE, legendaryActions: [{ name: "Detect", desc: "..." }], legendaryCount: "0" })
    ).toContain("Legendary actions per round"));

  it("does not flag legendaryCount when legendaryActions is empty", () =>
    expect(validate({ ...VALID_BASE, legendaryCount: "", legendaryActions: [] })).toEqual([]));

  it("returns multiple issues when several fields are missing", () => {
    const issues = validate({ ...VALID_BASE, name: "", ac: "", hp: { dice: [], modifier: 0 } });
    expect(issues).toContain("Name");
    expect(issues).toContain("Armor Class");
    expect(issues).toContain("Hit Points");
    expect(issues).toHaveLength(3);
  });
});
