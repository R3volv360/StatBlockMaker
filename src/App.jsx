import React, { useState, useEffect } from "react";

/* ------------------------------------------------------------------ *
 * Challenge Rating table — the backbone enum.
 * Each CR carries its display label, XP value, and proficiency bonus.
 * XP and PB are DERIVED from CR; they are never user inputs.
 * (CR 0 defaults to 10 XP, per the agreed rule.)
 * ------------------------------------------------------------------ */
const CR_TABLE = [
  { key: "0", label: "0", xp: 10, pb: 2 },
  { key: "1/8", label: "1/8", xp: 25, pb: 2 },
  { key: "1/4", label: "1/4", xp: 50, pb: 2 },
  { key: "1/2", label: "1/2", xp: 100, pb: 2 },
  { key: "1", label: "1", xp: 200, pb: 2 },
  { key: "2", label: "2", xp: 450, pb: 2 },
  { key: "3", label: "3", xp: 700, pb: 2 },
  { key: "4", label: "4", xp: 1100, pb: 2 },
  { key: "5", label: "5", xp: 1800, pb: 3 },
  { key: "6", label: "6", xp: 2300, pb: 3 },
  { key: "7", label: "7", xp: 2900, pb: 3 },
  { key: "8", label: "8", xp: 3900, pb: 3 },
  { key: "9", label: "9", xp: 5000, pb: 4 },
  { key: "10", label: "10", xp: 5900, pb: 4 },
  { key: "11", label: "11", xp: 7200, pb: 4 },
  { key: "12", label: "12", xp: 8400, pb: 4 },
  { key: "13", label: "13", xp: 10000, pb: 5 },
  { key: "14", label: "14", xp: 11500, pb: 5 },
  { key: "15", label: "15", xp: 13000, pb: 5 },
  { key: "16", label: "16", xp: 15000, pb: 5 },
  { key: "17", label: "17", xp: 18000, pb: 6 },
  { key: "18", label: "18", xp: 20000, pb: 6 },
  { key: "19", label: "19", xp: 22000, pb: 6 },
  { key: "20", label: "20", xp: 25000, pb: 6 },
  { key: "21", label: "21", xp: 33000, pb: 7 },
  { key: "22", label: "22", xp: 41000, pb: 7 },
  { key: "23", label: "23", xp: 50000, pb: 7 },
  { key: "24", label: "24", xp: 62000, pb: 7 },
  { key: "25", label: "25", xp: 75000, pb: 8 },
  { key: "26", label: "26", xp: 90000, pb: 8 },
  { key: "27", label: "27", xp: 105000, pb: 8 },
  { key: "28", label: "28", xp: 120000, pb: 8 },
  { key: "29", label: "29", xp: 135000, pb: 9 },
  { key: "30", label: "30", xp: 155000, pb: 9 },
];
const CR_BY_KEY = Object.fromEntries(CR_TABLE.map((c) => [c.key, c]));

const SIZES = ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"];

const ALIGNMENTS = [
  "Lawful Good", "Neutral Good", "Chaotic Good",
  "Lawful Neutral", "True Neutral", "Chaotic Neutral",
  "Lawful Evil", "Neutral Evil", "Chaotic Evil",
  "Unaligned",
];

const ABILITIES = [
  ["str", "STR"],
  ["dex", "DEX"],
  ["con", "CON"],
  ["int", "INT"],
  ["wis", "WIS"],
  ["cha", "CHA"],
];

/* Ability modifier from a score, formatted with sign. */
export const mod = (score) => {
  const n = parseInt(score, 10);
  if (Number.isNaN(n)) return "+0";
  const m = Math.floor((n - 10) / 2);
  return (m >= 0 ? "+" : "") + m;
};

const emptyEntry = () => ({ name: "", desc: "" });

/* Action entries can be a structured attack or a free-text "other" action. */
const emptyAction = (kind = "other") => ({
  kind,
  name: "",
  desc: "",
  attackType: "Melee",
  toHit: "",
  reach: "",
  rangeNormal: "",
  rangeLong: "",
  damages: [],
  extra: "",
});

/* Ensure a string ends with sentence punctuation. */
export const endPunct = (s) => {
  const t = (s || "").trim();
  if (!t) return t;
  return /[.!?]$/.test(t) ? t : t + ".";
};

/* Render an attack's damage components, e.g.
   "19 (2d10 + 8) piercing damage plus 7 (2d6) fire damage." */
export const renderDamage = (item) => {
  const comps = (item.damages || []).filter(
    (d) => (d.roll && diceStr(d.roll)) || (d.type && d.type.trim())
  );
  if (comps.length === 0) return "";
  const parts = comps.map((d) => {
    const amt = renderRoll(d.roll);
    const typ = (d.type || "").trim().toLowerCase();
    return [amt, typ ? `${typ} damage` : amt ? "damage" : ""]
      .filter(Boolean)
      .join(" ");
  });
  return endPunct(parts.join(" plus "));
};

/* ---- Structured-field option lists ---- */
const ABILITY_KEYS = [
  { value: "str", label: "Strength" },
  { value: "dex", label: "Dexterity" },
  { value: "con", label: "Constitution" },
  { value: "int", label: "Intelligence" },
  { value: "wis", label: "Wisdom" },
  { value: "cha", label: "Charisma" },
];
const ABILITY_ABBR = { str: "Str", dex: "Dex", con: "Con", int: "Int", wis: "Wis", cha: "Cha" };
const ABILITY_ORDER = ABILITY_KEYS.map((a) => a.value);

const SKILLS = [
  "Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception",
  "History", "Insight", "Intimidation", "Investigation", "Medicine",
  "Nature", "Perception", "Performance", "Persuasion", "Religion",
  "Sleight of Hand", "Stealth", "Survival",
];
const SKILL_KEYS = SKILLS.map((s) => ({ value: s, label: s }));

const SENSE_TYPES = ["Blindsight", "Darkvision", "Tremorsense", "Truesight"];
const SENSE_KEYS = SENSE_TYPES.map((s) => ({ value: s, label: s }));

const SPEED_MODES = ["Burrow", "Climb", "Fly", "Swim"];
const SPEED_KEYS = SPEED_MODES.map((s) => ({ value: s, label: s }));

const DAMAGE_TYPES = [
  "Acid", "Bludgeoning", "Cold", "Fire", "Force", "Lightning",
  "Necrotic", "Piercing", "Poison", "Psychic", "Radiant", "Slashing", "Thunder",
];

const DIE_SIDES = [4, 6, 8, 10, 12, 20, 100];

/* Format a stored bonus value with an explicit sign. */
export const signed = (v) => {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return "+0";
  return (n >= 0 ? "+" : "") + n;
};
export const rawMod = (score) => {
  const n = parseInt(score, 10);
  return Number.isNaN(n) ? 0 : Math.floor((n - 10) / 2);
};

/* Expected value (floored) of a DiceRoll: { dice: [{count, sides}], modifier }. */
export const diceEV = (roll) => {
  if (!roll || !roll.dice) return 0;
  const sum = roll.dice.reduce(
    (s, d) => s + (parseInt(d.count, 10) || 0) * ((parseInt(d.sides, 10) || 0) + 1) / 2,
    0
  );
  return Math.floor(sum + (parseInt(roll.modifier, 10) || 0));
};

/* Formatted dice expression, e.g. "2d10 + 8" or "2d6 - 3". */
export const diceStr = (roll) => {
  if (!roll || !roll.dice) return "";
  const parts = roll.dice
    .filter((d) => (parseInt(d.count, 10) || 0) > 0)
    .map((d) => `${d.count}d${d.sides}`);
  if (parts.length === 0) return "";
  const mod = parseInt(roll.modifier, 10) || 0;
  let str = parts.join(" + ");
  if (mod > 0) str += ` + ${mod}`;
  else if (mod < 0) str += ` - ${Math.abs(mod)}`;
  return str;
};

/* Full rendered value, e.g. "19 (2d10 + 8)". Empty string if no dice. */
const renderRoll = (roll) => {
  if (!roll) return "";
  if (roll.mode === "flat") return roll.flat != null && roll.flat !== "" ? String(roll.flat) : "";
  const str = diceStr(roll);
  return str ? `${diceEV(roll)} (${str})` : "";
};

/* Required-field validation. Returns a list of human-readable issues. */
const isBlank = (v) => v == null || String(v).trim() === "";
const isBlankRoll = (roll) => {
  if (!roll) return true;
  if (roll.mode === "flat") return roll.flat == null || String(roll.flat).trim() === "";
  return !roll.dice || !roll.dice.some((d) => (parseInt(d.count, 10) || 0) > 0);
};
export function validate(d) {
  const issues = [];
  if (isBlank(d.name)) issues.push("Name");
  if (isBlank(d.size)) issues.push("Size");
  if (isBlank(d.type)) issues.push("Type");
  if (isBlank(d.alignment)) issues.push("Alignment");
  if (isBlank(d.ac)) issues.push("Armor Class");
  if (isBlankRoll(d.hp)) issues.push("Hit Points");
  if (isBlank(d.speedWalk)) issues.push("Speed");
  ["str", "dex", "con", "int", "wis", "cha"].forEach((k) => {
    if (isBlank(d[k])) issues.push(`${ABILITY_ABBR[k]} score`);
  });
  if (isBlank(d.cr)) issues.push("Challenge Rating");
  if (
    d.legendaryActions.length > 0 &&
    (isBlank(d.legendaryCount) || parseInt(d.legendaryCount, 10) < 1)
  )
    issues.push("Legendary actions per round");
  return issues;
}

/* ------------------------------------------------------------------ *
 * Default / seed data: the Adult Red Dragon example.
 * ------------------------------------------------------------------ */
const ADULT_RED_DRAGON = {
  name: "Adult Red Dragon",
  size: "Huge",
  type: "dragon",
  alignment: "Chaotic Evil",
  description:
    "The most covetous of the true dragons, red dragons tirelessly seek to increase their treasure hoards. They are exceptionally vain, even for dragons, and a red dragon's ego is bound up in its sense of superiority over all other creatures.",
  ac: "19",
  acNote: "Natural Armor",
  hp: { dice: [{ count: 19, sides: 12 }], modifier: 133 },
  speedWalk: "40",
  speeds: [
    { mode: "Climb", value: "40" },
    { mode: "Fly", value: "80" },
  ],
  str: "27", dex: "10", con: "25", int: "16", wis: "13", cha: "21",
  savingThrows: [
    { ability: "dex", value: "6" },
    { ability: "con", value: "13" },
    { ability: "wis", value: "7" },
    { ability: "cha", value: "11" },
  ],
  skills: [
    { skill: "Perception", value: "13" },
    { skill: "Stealth", value: "6" },
  ],
  vulnerabilities: [],
  resistances: [],
  damageImmunities: ["Fire"],
  conditionImmunities: [],
  senses: [
    { sense: "Blindsight", value: "60" },
    { sense: "Darkvision", value: "120" },
  ],
  languages: ["Common", "Draconic"],
  cr: "17",
  traits: [
    {
      name: "Legendary Resistance (3/Day)",
      desc: "If the dragon fails a saving throw, it can choose to succeed instead.",
    },
  ],
  actions: [
    {
      kind: "other",
      name: "Multiattack",
      desc: "The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws.",
    },
    {
      kind: "attack",
      name: "Bite",
      attackType: "Melee",
      toHit: "14",
      reach: "10",
      damages: [
        { roll: { dice: [{ count: 2, sides: 10 }], modifier: 8 }, type: "Piercing" },
        { roll: { dice: [{ count: 2, sides: 6 }], modifier: 0 }, type: "Fire" },
      ],
    },
    {
      kind: "attack",
      name: "Claw",
      attackType: "Melee",
      toHit: "14",
      reach: "5",
      damages: [{ roll: { dice: [{ count: 2, sides: 6 }], modifier: 8 }, type: "Slashing" }],
    },
    {
      kind: "attack",
      name: "Tail",
      attackType: "Melee",
      toHit: "14",
      reach: "15",
      damages: [{ roll: { dice: [{ count: 2, sides: 8 }], modifier: 8 }, type: "Bludgeoning" }],
    },
    {
      kind: "other",
      name: "Frightful Presence",
      desc: "Each creature of the dragon's choice that is within 120 ft. of the dragon and aware of it must succeed on a DC 19 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours.",
    },
    {
      kind: "other",
      name: "Fire Breath (Recharge 5–6)",
      desc: "The dragon exhales fire in a 60-foot cone. Each creature in that area must make a DC 21 Dexterity saving throw, taking 63 (18d6) fire damage on a failed save, or half as much damage on a successful one.",
    },
  ],
  bonusActions: [],
  reactions: [],
  legendaryCount: "3",
  legendaryActions: [
    { name: "Detect", desc: "The dragon makes a Wisdom (Perception) check." },
    { name: "Tail Attack", desc: "The dragon makes a tail attack." },
    {
      name: "Wing Attack (Costs 2 Actions)",
      desc: "The dragon beats its wings. Each creature within 10 ft. of the dragon must succeed on a DC 22 Dexterity saving throw or take 15 (2d6 + 8) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed.",
    },
  ],
  lairActions: "",
  regionalEffects: "",
};

const BLANK = {
  name: "", size: "Medium", type: "", alignment: "", description: "",
  ac: "", acNote: "", hp: { mode: "dice", dice: [], modifier: 0 }, speedWalk: "30", speeds: [],
  str: "10", dex: "10", con: "10", int: "10", wis: "10", cha: "10",
  savingThrows: [], skills: [],
  vulnerabilities: [], resistances: [],
  damageImmunities: [], conditionImmunities: [], senses: [], languages: [],
  cr: "1",
  traits: [], actions: [], bonusActions: [], reactions: [],
  legendaryCount: "", legendaryActions: [],
  lairActions: "", regionalEffects: "",
};

/* ================================================================== *
 * App
 * ================================================================== */
export default function App() {
  const [data, setData] = useState(ADULT_RED_DRAGON);
  const [printBW, setPrintBW] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [printPending, setPrintPending] = useState(null); // null | 'colour' | 'bw'

  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const runVerify = () => setVerifyResult(validate(data));

  /* a verify result is a snapshot; clear it whenever the form changes */
  useEffect(() => { setVerifyResult(null); }, [data]);

  /* dynamic-list helpers */
  const addItem = (list) => set(list, [...data[list], emptyEntry()]);
  const removeItem = (list, i) =>
    set(list, data[list].filter((_, idx) => idx !== i));
  const updateItem = (list, i, field, v) =>
    set(
      list,
      data[list].map((it, idx) => (idx === i ? { ...it, [field]: v } : it))
    );

  /* add a key/value entry, defaulting the key to the first unused option */
  const addKV = (list, keyField, keys) => {
    const used = data[list].map((e) => e[keyField]);
    const next = keys.find((k) => !used.includes(k.value));
    if (!next) return;
    set(list, [...data[list], { [keyField]: next.value, value: "" }]);
  };

  /* add an action entry of a given kind (attack | other) */
  const addAction = (list, kind) =>
    set(list, [...data[list], emptyAction(kind)]);

  const doPrint = (bw) => {
    setPrintBW(bw);
    setTimeout(() => { window.print(); setPrintBW(false); }, 50);
  };

  const handlePrint = (bw) => {
    const issues = validate(data);
    if (issues.length === 0) { doPrint(bw); return; }
    setVerifyResult(issues);
    setPrintPending(bw ? 'bw' : 'colour');
  };

  return (
    <div className={"sg-root" + (printBW ? " print-bw" : "")}>
      <style>{CSS}</style>

      {/* ---------------- Top toolbar ---------------- */}
      <header className="toolbar">
        <h1 className="toolbar-title">Statblock Maker</h1>
        <div className="toolbar-actions">
          <button className="btn" onClick={() => setData(ADULT_RED_DRAGON)}>
            Load Example
          </button>
          <button className="btn" onClick={() => setData(BLANK)}>
            Clear
          </button>
          <button className="btn" onClick={runVerify}>
            Verify
          </button>
          <button className="btn btn-primary" onClick={() => handlePrint(false)}>
            Print (Colour)
          </button>
          <button className="btn btn-primary" onClick={() => handlePrint(true)}>
            Print (B&amp;W)
          </button>
        </div>
      </header>

      <div className="layout">
        {/* ============== EDITOR ============== */}
        <div className="editor no-print">
          {verifyResult && (
            <div className={"verify-banner " + (verifyResult.length === 0 ? "ok" : "err")}>
              {verifyResult.length === 0 ? (
                <span>✓ All required fields are filled.</span>
              ) : (
                <>
                  <strong>
                    {verifyResult.length} required field
                    {verifyResult.length === 1 ? "" : "s"} still need
                    {verifyResult.length === 1 ? "s" : ""} attention:
                  </strong>
                  <ul>
                    {verifyResult.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
          <Section title="Identity">
            <Field label="Name" req>
              <input value={data.name} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <Row>
              <Field label="Size" req>
                <select value={data.size} onChange={(e) => set("size", e.target.value)}>
                  {SIZES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Type" req>
                <input
                  value={data.type}
                  placeholder="dragon, humanoid (orc)…"
                  onChange={(e) => set("type", e.target.value)}
                />
              </Field>
            </Row>
            <Field label="Alignment" req>
              <select
                value={data.alignment}
                onChange={(e) => set("alignment", e.target.value)}
              >
                <option value="">Choose…</option>
                {ALIGNMENTS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </Field>
            <Field label="Description (flavour text)">
              <textarea
                rows={3}
                value={data.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
          </Section>

          <Section title="Defenses & Movement">
            <Field label="Armor Class" req>
              <div className="ac-row">
                <input type="number" value={data.ac}
                  onChange={(e) => set("ac", e.target.value)} />
                <input type="text" value={data.acNote}
                  placeholder="description, e.g. Natural Armor (optional)"
                  onChange={(e) => set("acNote", e.target.value)} />
              </div>
            </Field>
            <Field label="Hit Points" req>
              <HpEditor hp={data.hp} onChange={(v) => set("hp", v)} />
            </Field>
            <Field label="Speed" req>
              <div className="kv-val">
                <input type="number" min="0" value={data.speedWalk}
                  onChange={(e) => set("speedWalk", e.target.value)} />
                <span className="kv-suffix">ft.</span>
              </div>
            </Field>
            <Field label="Other speeds">
              <KeyValueAdder data={data} list="speeds" keyField="mode"
                keys={SPEED_KEYS} suffix="ft." nonNeg addLabel="speed"
                update={updateItem} remove={removeItem} add={addKV} />
            </Field>
          </Section>

          <Section title="Ability Scores">
            <div className="ability-grid">
              {ABILITIES.map(([k, lbl]) => (
                <div key={k} className="ability-cell">
                  <label>{lbl}</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={data[k]}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      set(k, Number.isNaN(n) ? "" : String(Math.min(30, Math.max(0, n))));
                    }}
                  />
                  <span className="ability-mod">{mod(data[k])}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Details">
            <Field label="Saving Throws">
              <KeyValueAdder data={data} list="savingThrows" keyField="ability"
                keys={ABILITY_KEYS} isSigned addLabel="saving throw"
                update={updateItem} remove={removeItem} add={addKV} />
            </Field>
            <Field label="Skills">
              <KeyValueAdder data={data} list="skills" keyField="skill"
                keys={SKILL_KEYS} isSigned addLabel="skill"
                update={updateItem} remove={removeItem} add={addKV} />
            </Field>
            <Field label="Damage Vulnerabilities">
              <StringListEditor value={data.vulnerabilities} onChange={(v) => set("vulnerabilities", v)}
                placeholder="e.g. Cold" addLabel="vulnerability" />
            </Field>
            <Field label="Damage Resistances">
              <StringListEditor value={data.resistances} onChange={(v) => set("resistances", v)}
                placeholder="e.g. Fire" addLabel="resistance" />
            </Field>
            <Field label="Damage Immunities">
              <StringListEditor value={data.damageImmunities} onChange={(v) => set("damageImmunities", v)}
                placeholder="e.g. Poison" addLabel="immunity" />
            </Field>
            <Field label="Condition Immunities">
              <StringListEditor value={data.conditionImmunities} onChange={(v) => set("conditionImmunities", v)}
                placeholder="e.g. Charmed" addLabel="immunity" />
            </Field>
            <Field label="Senses">
              <KeyValueAdder data={data} list="senses" keyField="sense"
                keys={SENSE_KEYS} suffix="ft." nonNeg addLabel="sense"
                update={updateItem} remove={removeItem} add={addKV} />
              <div className="hint">Passive Perception is derived automatically
                and added to the Senses line.</div>
            </Field>
            <Field label="Languages">
              <StringListEditor value={data.languages} onChange={(v) => set("languages", v)}
                placeholder="e.g. Common" addLabel="language" />
            </Field>
            <Field label="Challenge Rating" req>
              <select value={data.cr} onChange={(e) => set("cr", e.target.value)}>
                {CR_TABLE.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label} ({c.xp.toLocaleString()} XP, PB +{c.pb})
                  </option>
                ))}
              </select>
            </Field>
          </Section>

          <ListEditor title="Traits" list="traits" data={data}
            add={() => addItem("traits")} remove={removeItem} update={updateItem} />
          <Section title="Actions">
            <ActionListEditor list="actions" data={data}
              update={updateItem} remove={removeItem} add={addAction} />
          </Section>
          <Section title="Bonus Actions">
            <ActionListEditor list="bonusActions" data={data}
              update={updateItem} remove={removeItem} add={addAction} />
          </Section>
          <ListEditor title="Reactions" list="reactions" data={data}
            add={() => addItem("reactions")} remove={removeItem} update={updateItem} />

          <Section title="Legendary Actions">
            <Field label="Actions per round" req={data.legendaryActions.length > 0}>
              <div className="kv-val">
                <input type="number" min="1" value={data.legendaryCount}
                  onChange={(e) => set("legendaryCount", e.target.value)} />
                <span className="kv-suffix">per round</span>
              </div>
              {data.legendaryActions.length > 0 &&
                (data.legendaryCount === "" || parseInt(data.legendaryCount, 10) < 1) && (
                  <div className="hint hint-warn">
                    Required: set how many legendary actions this creature takes each round.
                  </div>
                )}
            </Field>
            <EntryList list="legendaryActions" data={data}
              add={() => addItem("legendaryActions")} remove={removeItem} update={updateItem} />
          </Section>

          <Section title="Lair & Region">
            <Field label="Lair Actions">
              <textarea rows={3} value={data.lairActions}
                onChange={(e) => set("lairActions", e.target.value)} />
            </Field>
            <Field label="Regional Effects">
              <textarea rows={3} value={data.regionalEffects}
                onChange={(e) => set("regionalEffects", e.target.value)} />
            </Field>
          </Section>
        </div>

        {/* ============== PREVIEW ============== */}
        <div className="preview">
          <Statblock data={data} />
        </div>
      </div>

      {printPending !== null && (
        <div className="modal-overlay">
          <div className="modal">
            <p className="modal-msg">Verification errors found! Are you sure you want to print?</p>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => { const bw = printPending === 'bw'; setPrintPending(null); doPrint(bw); }}>
                Yes, print it!
              </button>
              <button className="btn" onClick={() => setPrintPending(null)}>
                No, let me fix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== *
 * Rendered statblock
 * ================================================================== */
function Statblock({ data }) {
  const cr = CR_BY_KEY[data.cr];
  const subtitle = [data.size, data.type].filter(Boolean).join(" ");
  const subline = data.alignment ? `${subtitle}, ${data.alignment}` : subtitle;

  /* Speed: walking first, then modes in canonical order */
  const speedParts = [];
  if (data.speedWalk !== "" && data.speedWalk != null)
    speedParts.push(`${data.speedWalk} ft.`);
  SPEED_MODES.forEach((m) => {
    const hit = data.speeds.find((s) => s.mode === m && s.value !== "");
    if (hit) speedParts.push(`${m.toLowerCase()} ${hit.value} ft.`);
  });
  const speedStr = speedParts.join(", ");

  /* Saving throws: ability order, e.g. "Dex +6, Con +13" */
  const savesStr = [...data.savingThrows]
    .filter((s) => s.value !== "")
    .sort((a, b) => ABILITY_ORDER.indexOf(a.ability) - ABILITY_ORDER.indexOf(b.ability))
    .map((s) => `${ABILITY_ABBR[s.ability]} ${signed(s.value)}`)
    .join(", ");

  /* Skills: alphabetical */
  const skillsStr = [...data.skills]
    .filter((s) => s.value !== "")
    .sort((a, b) => a.skill.localeCompare(b.skill))
    .map((s) => `${s.skill} ${signed(s.value)}`)
    .join(", ");

  /* Senses: listed senses + derived passive perception */
  const perception = data.skills.find((s) => s.skill === "Perception");
  const passivePerception = perception && perception.value !== ""
    ? 10 + parseInt(perception.value, 10)
    : 10 + rawMod(data.wis);
  const senseParts = SENSE_TYPES
    .map((t) => data.senses.find((s) => s.sense === t && s.value !== ""))
    .filter(Boolean)
    .map((s) => `${s.sense} ${s.value} ft.`);
  senseParts.push(`Passive Perception ${passivePerception}`);
  const sensesStr = senseParts.join(", ");

  const acStr =
    data.ac !== "" && data.ac != null
      ? data.acNote && data.acNote.trim()
        ? `${data.ac} (${data.acNote})`
        : `${data.ac}`
      : "";

  const joinList = (arr) => (arr || []).filter(Boolean).join(", ");
  const props = [
    ["Saving Throws", savesStr],
    ["Skills", skillsStr],
    ["Damage Vulnerabilities", joinList(data.vulnerabilities)],
    ["Damage Resistances", joinList(data.resistances)],
    ["Damage Immunities", joinList(data.damageImmunities)],
    ["Condition Immunities", joinList(data.conditionImmunities)],
    ["Senses", sensesStr],
    ["Languages", joinList(data.languages)],
  ].filter(([, v]) => v && v.trim());

  return (
    <div className="sb-wrap">
      {/* Description box — above the mechanical block */}
      {data.description && data.description.trim() && (
        <div className="desc-box">
          <div className="desc-label">Description</div>
          <p>{data.description}</p>
        </div>
      )}

      <div className="sb">
        <Bar />

        <h2 className="sb-name">{data.name || "Unnamed Creature"}</h2>
        <div className="sb-subtitle">{subline}</div>

        <Bar />

        <div className="sb-red">
          {acStr && <PropInline name="Armor Class" value={acStr} />}
          {renderRoll(data.hp) && <PropInline name="Hit Points" value={renderRoll(data.hp)} />}
          {speedStr && <PropInline name="Speed" value={speedStr} />}
        </div>

        <Bar />

        <table className="sb-abilities">
          <thead>
            <tr>{ABILITIES.map(([, l]) => <th key={l}>{l}</th>)}</tr>
          </thead>
          <tbody>
            <tr>
              {ABILITIES.map(([k]) => (
                <td key={k}>
                  {data[k] || "—"} ({mod(data[k])})
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        <Bar />

        <div className="sb-red">
          {props.map(([name, value]) => (
            <PropInline key={name} name={name} value={value} />
          ))}
          <PropInline
            name="Challenge"
            value={`${cr.label} (${cr.xp.toLocaleString()} XP)`}
          />
          <PropInline name="Proficiency Bonus" value={`+${cr.pb}`} />
        </div>

        <Bar />

        {/* Traits (no header, classic style) */}
        {data.traits.length > 0 && (
          <div className="sb-entries">
            {data.traits.map((t, i) => <Entry key={i} {...t} />)}
          </div>
        )}

        <ActionSection title="Actions" items={data.actions} />
        <ActionSection title="Bonus Actions" items={data.bonusActions} />
        <EntrySection title="Reactions" items={data.reactions} />

        {data.legendaryActions.length > 0 && (
          <>
            <h3 className="sb-section">Legendary Actions</h3>
            {data.legendaryCount !== "" && parseInt(data.legendaryCount, 10) >= 1 && (
              <p className="sb-intro">
                Can take {data.legendaryCount} legendary action
                {parseInt(data.legendaryCount, 10) === 1 ? "" : "s"}, choosing from
                the options below. Only one legendary action can be used at a time and
                only at the end of another creature's turn. Spent legendary actions are
                regained at the start of each turn.
              </p>
            )}
            <div className="sb-entries">
              {data.legendaryActions.map((t, i) => <Entry key={i} {...t} />)}
            </div>
          </>
        )}

        {data.lairActions && data.lairActions.trim() && (
          <>
            <h3 className="sb-section">Lair Actions</h3>
            <p className="sb-intro">{data.lairActions}</p>
          </>
        )}
        {data.regionalEffects && data.regionalEffects.trim() && (
          <>
            <h3 className="sb-section">Regional Effects</h3>
            <p className="sb-intro">{data.regionalEffects}</p>
          </>
        )}

        <Bar />
      </div>
    </div>
  );
}

/* ---------- small presentational pieces ---------- */
const Bar = () => <div className="sb-bar" aria-hidden="true" />;

const PropInline = ({ name, value }) => (
  <p className="prop">
    <span className="prop-name">{name}</span> {value}
  </p>
);

const Entry = ({ name, desc }) => (
  <p className="sb-entry">
    {name && <span className="entry-name">{name}. </span>}
    {desc}
  </p>
);

function EntrySection({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <>
      <h3 className="sb-section">{title}</h3>
      <div className="sb-entries">
        {items.map((t, i) => <Entry key={i} {...t} />)}
      </div>
    </>
  );
}

/* Renders an action: a structured attack line, or a plain name/desc entry. */
function ActionEntry({ item }) {
  const kind = item.kind || "other";
  if (kind !== "attack") return <Entry name={item.name} desc={item.desc} />;

  const toHit =
    item.toHit !== "" && item.toHit != null ? signed(item.toHit) : "+0";
  const isRanged = (item.attackType || "Melee") === "Ranged";
  const reachRange = isRanged
    ? `range ${item.rangeNormal || "?"}/${item.rangeLong || "?"} ft.`
    : `reach ${item.reach || "?"} ft.`;
  const extra = item.extra && item.extra.trim() ? " " + item.extra.trim() : "";

  return (
    <p className="sb-entry">
      <span className="entry-name">{item.name}. </span>
      <em>{item.attackType || "Melee"} Weapon Attack:</em> {toHit} to hit,{" "}
      {reachRange}, one target. <em>Hit:</em> {renderDamage(item)}
      {extra}
    </p>
  );
}

function ActionSection({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <>
      <h3 className="sb-section">{title}</h3>
      <div className="sb-entries">
        {items.map((t, i) => <ActionEntry key={i} item={t} />)}
      </div>
    </>
  );
}

/* ---------- editor building blocks ---------- */
const Section = ({ title, children }) => (
  <div className="ed-section">
    <div className="ed-head">{title}</div>
    <div className="ed-body">{children}</div>
  </div>
);

const Field = ({ label, children }) => (
  <label className="ed-field">
    <span className="ed-label">{label}</span>
    {children}
  </label>
);

const Row = ({ children }) => <div className="ed-row">{children}</div>;

/* List editor with a wrapping Section */
function ListEditor({ title, list, data, add, remove, update }) {
  return (
    <Section title={title}>
      <EntryList list={list} data={data} add={add} remove={remove} update={update} />
    </Section>
  );
}

/* The repeatable name+desc rows, reused by traits/actions/etc. */
function EntryList({ list, data, add, remove, update }) {
  return (
    <>
      {data[list].map((item, i) => (
        <div key={i} className="entry-edit">
          <div className="entry-edit-head">
            <input
              className="entry-name-input"
              placeholder="Name (e.g. Fire Breath (Recharge 5–6))"
              value={item.name}
              onChange={(e) => update(list, i, "name", e.target.value)}
            />
            <button
              className="btn btn-sm btn-danger"
              onClick={() => remove(list, i)}
              title="Remove"
            >
              ✕
            </button>
          </div>
          <textarea
            rows={2}
            placeholder="Description"
            value={item.desc}
            onChange={(e) => update(list, i, "desc", e.target.value)}
          />
        </div>
      ))}
      <button className="btn btn-sm btn-add" onClick={add}>
        + Add {list === "legendaryActions" ? "legendary action" : "entry"}
      </button>
    </>
  );
}

/* Simple list of free-text values with per-item remove and an Add button. */
function StringListEditor({ value, onChange, placeholder, addLabel }) {
  const items = value || [];
  const add = () => onChange([...items, ""]);
  const update = (i, v) => onChange(items.map((x, idx) => (idx === i ? v : x)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <div className="str-list">
      {items.map((item, i) => (
        <div className="str-list-row" key={i}>
          <input value={item} placeholder={placeholder}
            onChange={(e) => update(i, e.target.value)} />
          <button className="btn btn-sm btn-danger" title="Remove"
            onClick={() => remove(i)}>✕</button>
        </div>
      ))}
      <button className="btn btn-sm btn-add" onClick={add}>+ Add {addLabel}</button>
    </div>
  );
}

/* Constrained key/value rows: pick a key from a fixed list (no repeats)
   and give it a value. Used for saving throws, skills, senses, speeds. */
function KeyValueAdder({ data, list, keyField, keys, suffix, isSigned, nonNeg, addLabel, update, remove, add }) {
  const entries = data[list];
  const used = entries.map((e) => e[keyField]);
  const optionsFor = (current) =>
    keys.filter((k) => k.value === current || !used.includes(k.value));
  const anyLeft = keys.some((k) => !used.includes(k.value));

  return (
    <div className="kv-list">
      {entries.map((e, i) => (
        <div className="kv-row" key={i}>
          <select
            value={e[keyField]}
            onChange={(ev) => update(list, i, keyField, ev.target.value)}
          >
            {optionsFor(e[keyField]).map((k) => (
              <option key={k.value} value={k.value}>{k.label}</option>
            ))}
          </select>
          <div className="kv-val">
            <input
              type="number"
              {...(nonNeg ? { min: "0" } : {})}
              value={e.value}
              placeholder={isSigned ? "+0" : "0"}
              onChange={(ev) => update(list, i, "value", ev.target.value)}
            />
            {suffix && <span className="kv-suffix">{suffix}</span>}
          </div>
          <button className="btn btn-sm btn-danger" title="Remove"
            onClick={() => remove(list, i)}>✕</button>
        </div>
      ))}
      <button className="btn btn-sm btn-add" disabled={!anyLeft}
        onClick={() => add(list, keyField, keys)}>
        + Add {addLabel}
      </button>
    </div>
  );
}

/* Hit Points editor: toggle between dice-roll and flat numeric input. */
function HpEditor({ hp, onChange }) {
  const h = hp || { mode: "dice", dice: [], modifier: 0 };
  const mode = h.mode || "dice";
  const setMode = (m) => {
    if (m === mode) return;
    if (m === "flat") {
      const ev = h.dice && h.dice.length ? diceEV(h) : "";
      onChange({ ...h, mode: "flat", flat: h.flat != null && h.flat !== "" ? h.flat : ev });
    } else {
      onChange({ ...h, mode: "dice" });
    }
  };
  return (
    <div className="hp-editor">
      <div className="hp-mode-toggle">
        <button className={`btn btn-sm${mode === "dice" ? " btn-toggle-active" : ""}`} onClick={() => setMode("dice")}>Dice</button>
        <button className={`btn btn-sm${mode === "flat" ? " btn-toggle-active" : ""}`} onClick={() => setMode("flat")}>Flat</button>
      </div>
      {mode === "flat" ? (
        <input type="number" min="1" value={h.flat ?? ""}
          onChange={(e) => { const v = parseInt(e.target.value, 10); onChange({ mode: "flat", flat: Number.isNaN(v) ? "" : v }); }} />
      ) : (
        <DiceRollEditor roll={h} onChange={(r) => onChange({ ...r, mode: "dice" })} />
      )}
    </div>
  );
}

/* Structured dice roll input.
   Single group: [count] d [sides] + [modifier] [remove] — all on one line.
   Multiple groups: each group on its own line, modifier row below. */
function DiceRollEditor({ roll, onChange }) {
  const r = roll || { dice: [], modifier: 0 };
  const addDie = () => onChange({ ...r, dice: [...r.dice, { count: 1, sides: 6 }] });
  const removeDie = (i) => onChange({ ...r, dice: r.dice.filter((_, idx) => idx !== i) });
  const updateDie = (i, field, v) =>
    onChange({ ...r, dice: r.dice.map((d, idx) => (idx === i ? { ...d, [field]: parseInt(v, 10) || 1 } : d)) });
  const setModifier = (e) => {
    const v = parseInt(e.target.value, 10);
    onChange({ ...r, modifier: Number.isNaN(v) ? 0 : v });
  };
  const preview = renderRoll(r);
  const multi = r.dice.length > 1;
  return (
    <div className="dice-editor">
      {r.dice.map((d, i) => (
        <div className="dice-row" key={i}>
          <input type="number" min="1" value={d.count}
            onChange={(e) => updateDie(i, "count", e.target.value)} />
          <span className="dice-lbl">d</span>
          <select value={d.sides} onChange={(e) => updateDie(i, "sides", e.target.value)}>
            {DIE_SIDES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {!multi && (
            <>
              <span className="dice-lbl">+</span>
              <input type="number" className="dice-mod-input" value={r.modifier} onChange={setModifier} />
            </>
          )}
          <button className="btn btn-sm btn-danger" title="Remove" onClick={() => removeDie(i)}>✕</button>
        </div>
      ))}
      {multi && (
        <div className="dice-mod-row">
          <span className="kv-suffix">Modifier</span>
          <input type="number" value={r.modifier} onChange={setModifier} />
        </div>
      )}
      <div className="dice-footer">
        <button className="btn btn-sm btn-add" onClick={addDie}>+ Add dice</button>
        {preview && <span className="dice-preview">{preview}</span>}
      </div>
    </div>
  );
}

/* Typed damage components for an attack: a DiceRoll + damage-type enum. */
function DamageEditor({ damages, onChange }) {
  const list = damages || [];
  const add = () => onChange([...list, { roll: { dice: [], modifier: 0 }, type: "" }]);
  const upd = (idx, field, v) =>
    onChange(list.map((d, i) => (i === idx ? { ...d, [field]: v } : d)));
  const rm = (idx) => onChange(list.filter((_, i) => i !== idx));
  return (
    <div className="dmg-list">
      {list.map((d, idx) => (
        <div className="dmg-entry" key={idx}>
          <div className="dmg-header">
            <select value={d.type || ""} onChange={(e) => upd(idx, "type", e.target.value)}>
              <option value="">type…</option>
              {DAMAGE_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <button className="btn btn-sm btn-danger" title="Remove" onClick={() => rm(idx)}>✕</button>
          </div>
          <DiceRollEditor
            roll={d.roll || { dice: [], modifier: 0 }}
            onChange={(r) => upd(idx, "roll", r)}
          />
        </div>
      ))}
      <button className="btn btn-sm btn-add" onClick={add}>+ Add damage</button>
    </div>
  );
}

/* Editor for Actions / Bonus Actions: each entry is an attack or an "other".
   The Attack/Other toggle flips which fields show; data persists either way. */
function ActionListEditor({ list, data, update, remove, add }) {
  return (
    <>
      {data[list].map((item, i) => {
        const kind = item.kind || "other";
        const isRanged = (item.attackType || "Melee") === "Ranged";
        return (
          <div key={i} className="entry-edit">
            <div className="entry-edit-head spread">
              <div className="seg">
                <button
                  className={"seg-btn" + (kind === "attack" ? " on" : "")}
                  onClick={() => update(list, i, "kind", "attack")}
                >
                  Attack
                </button>
                <button
                  className={"seg-btn" + (kind === "other" ? " on" : "")}
                  onClick={() => update(list, i, "kind", "other")}
                >
                  Other
                </button>
              </div>
              <button className="btn btn-sm btn-danger" title="Remove"
                onClick={() => remove(list, i)}>✕</button>
            </div>

            <input
              className="entry-name-input"
              placeholder={kind === "attack" ? "Name (e.g. Bite)" : "Name"}
              value={item.name || ""}
              onChange={(e) => update(list, i, "name", e.target.value)}
            />

            {kind === "other" ? (
              <textarea
                rows={2}
                placeholder="Description"
                value={item.desc || ""}
                onChange={(e) => update(list, i, "desc", e.target.value)}
              />
            ) : (
              <div className="atk-fields">
                <div className="atk-row">
                  <select
                    value={item.attackType || "Melee"}
                    onChange={(e) => update(list, i, "attackType", e.target.value)}
                  >
                    <option>Melee</option>
                    <option>Ranged</option>
                  </select>
                  <div className="kv-val">
                    <span className="kv-pre">+</span>
                    <input
                      type="number"
                      value={item.toHit || ""}
                      onChange={(e) => update(list, i, "toHit", e.target.value)}
                    />
                    <span className="kv-suffix">to hit</span>
                  </div>
                </div>

                {isRanged ? (
                  <div className="atk-row">
                    <div className="kv-val">
                      <input
                        type="number"
                        min="0"
                        placeholder="normal"
                        value={item.rangeNormal || ""}
                        onChange={(e) => update(list, i, "rangeNormal", e.target.value)}
                      />
                      <span className="kv-suffix">/</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="long"
                        value={item.rangeLong || ""}
                        onChange={(e) => update(list, i, "rangeLong", e.target.value)}
                      />
                      <span className="kv-suffix">ft. range</span>
                    </div>
                  </div>
                ) : (
                  <div className="atk-row">
                    <div className="kv-val">
                      <input
                        type="number"
                        min="0"
                        value={item.reach || ""}
                        onChange={(e) => update(list, i, "reach", e.target.value)}
                      />
                      <span className="kv-suffix">ft. reach</span>
                    </div>
                  </div>
                )}

                <div className="atk-sub-label">Damage</div>
                <DamageEditor
                  damages={item.damages}
                  onChange={(arr) => update(list, i, "damages", arr)}
                />
                <textarea
                  rows={2}
                  placeholder="Extra detail (optional)"
                  value={item.extra || ""}
                  onChange={(e) => update(list, i, "extra", e.target.value)}
                />
              </div>
            )}
          </div>
        );
      })}
      <div className="add-row">
        <button className="btn btn-sm btn-add" onClick={() => add(list, "attack")}>
          + Add attack
        </button>
        <button className="btn btn-sm btn-add" onClick={() => add(list, "other")}>
          + Add other action
        </button>
      </div>
    </>
  );
}

/* ================================================================== *
 * Styles
 * ================================================================== */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&display=swap');

:root{
  --maroon:#922610;
  --parchment:#fdf1dc;
  --ink:#1d1008;
  --editor-bg:#f4f1ea;
  --line:#d8d2c4;
  --sans:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
  --serif:'EB Garamond',Georgia,'Times New Roman',serif;
  --display:'Cinzel','EB Garamond',serif;
}

*{box-sizing:border-box}
.sg-root{font-family:var(--sans);color:#222;background:#e9e6df;min-height:100vh}

/* toolbar */
.toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;
  padding:12px 20px;background:#2b1c14;color:#f4ead7;flex-wrap:wrap;
  position:sticky;top:0;z-index:10}
.toolbar-title{font-family:var(--display);font-size:22px;letter-spacing:.04em;margin:0;color:#f1c27a}
.toolbar-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}

.btn{font-family:var(--sans);font-size:13px;padding:7px 13px;border-radius:6px;
  border:1px solid #00000022;background:#e8ddca;color:#2b1c14;cursor:pointer;font-weight:600}
.btn:hover{filter:brightness(1.05)}
.btn-primary{background:var(--maroon);color:#fff;border-color:#00000033}
.btn-sm{font-size:12px;padding:5px 9px}
.btn-add{background:#e3eadb;color:#2c4a1d;border-color:#3a5a2422}
.btn-danger{background:#f3d9d2;color:#7a1e0d;line-height:1}

/* layout */
.layout{display:grid;grid-template-columns:minmax(360px,440px) 1fr;align-items:start;gap:24px;padding:24px;max-width:1280px;margin:0 auto}
@media(max-width:900px){.layout{grid-template-columns:1fr}}

/* editor */
.editor{display:flex;flex-direction:column;gap:16px}
.ed-section{background:#fff;border:1px solid var(--line);border-radius:10px;overflow:hidden}
.ed-head{background:#2b1c14;color:#f1c27a;font-family:var(--display);
  font-size:14px;font-weight:700;letter-spacing:.05em;
  padding:9px 16px;border-bottom:2px solid var(--maroon)}
.ed-body{padding:4px 16px 16px}
.ed-field{display:flex;flex-direction:column;gap:4px;margin-top:12px}
.ed-label{font-size:12px;font-weight:600;color:#555;line-height:1.2}
.verify-banner{border-radius:10px;padding:12px 16px;font-size:13px;line-height:1.5;
  border:1px solid}
.verify-banner.ok{background:#e9f4e6;border-color:#9ccb8e;color:#2c5320}
.verify-banner.err{background:#fbe9e4;border-color:#d9a292;color:#7a1e0d}
.verify-banner ul{margin:6px 0 0;padding-left:20px}
.verify-banner li{margin:2px 0}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:1000}
.modal{background:#fff;border-radius:10px;padding:28px 32px;max-width:380px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,.25)}
.modal-msg{margin:0 0 20px;font-size:15px;line-height:1.5;color:#222}
.modal-actions{display:flex;gap:10px;justify-content:flex-end}
.ed-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start}
input,select,textarea{font-family:var(--sans);font-size:14px;
  border:1px solid #cfcabb;border-radius:6px;background:#fcfbf8;color:#222;width:100%}
input,select{height:38px;padding:0 10px}
select{appearance:none;-webkit-appearance:none;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'><path d='M2 4l4 4 4-4' stroke='%23922610' stroke-width='1.6' fill='none' stroke-linecap='round'/></svg>");
  background-repeat:no-repeat;background-position:right 10px center;padding-right:30px}
textarea{padding:8px 10px;resize:vertical}
input:focus,select:focus,textarea:focus{outline:2px solid var(--maroon)55;border-color:var(--maroon)}

/* ability editor */
.ability-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}
@media(max-width:520px){.ability-grid{grid-template-columns:repeat(3,1fr)}}
.ability-cell{display:flex;flex-direction:column;align-items:center;gap:3px;
  background:#faf8f3;border:1px solid var(--line);border-radius:8px;padding:7px 4px}
.ability-cell label{font-size:11px;font-weight:700;color:var(--maroon)}
.ability-cell input{text-align:center;padding:0 2px}
.ability-mod{font-size:12px;color:#777}

.hint{font-size:11px;color:#888;margin-top:5px;line-height:1.3}
.hint-warn{color:var(--maroon);font-weight:600}
.ac-row{display:grid;grid-template-columns:90px 1fr;gap:8px}

/* constrained key/value adders (saves, skills, senses, speeds) */
.kv-list{display:flex;flex-direction:column;gap:7px}
.kv-row{display:grid;grid-template-columns:1fr 96px auto;gap:8px;align-items:center}
.kv-val{display:flex;align-items:center;gap:5px}
.kv-val input{text-align:right}
.kv-suffix{font-size:13px;color:#777;white-space:nowrap}
.btn:disabled{opacity:.45;cursor:not-allowed}

/* entry editors */
.entry-edit{border:1px dashed #cfc6b3;border-radius:8px;padding:8px;margin-top:10px;background:#fcfaf5}
.entry-edit-head{display:flex;gap:8px;margin-bottom:6px}
.entry-edit-head.spread{justify-content:space-between;align-items:center}
.entry-name-input{font-weight:600}

/* attack/other toggle + attack fields */
.seg{display:inline-flex;border:1px solid #cfcabb;border-radius:6px;overflow:hidden}
.seg-btn{font-size:12px;padding:6px 14px;border:none;background:#f0ece2;color:#555;
  cursor:pointer;font-weight:600;line-height:1}
.seg-btn.on{background:var(--maroon);color:#fff}
.atk-fields{display:flex;flex-direction:column;gap:8px;margin-top:8px}
.atk-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.atk-row select{width:auto;min-width:120px}
.atk-row .kv-val input{width:64px}
.kv-pre{font-size:14px;color:#777}
.add-row{display:flex;gap:8px;flex-wrap:wrap}
.atk-sub-label{font-size:12px;font-weight:600;color:#555;margin-top:2px}
.str-list{display:flex;flex-direction:column;gap:6px}
.str-list-row{display:flex;gap:6px;align-items:center}
.str-list-row input{flex:1}
.dmg-list{display:flex;flex-direction:column;gap:7px}
.dmg-entry{border:1px dashed #cfc6b3;border-radius:6px;padding:6px 8px;background:#fdf9f3}
.dmg-header{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.dmg-header select{flex:1}
.hp-editor{display:flex;flex-direction:column;gap:6px}
.hp-mode-toggle{display:flex;gap:0}
.hp-mode-toggle .btn{border-radius:0;border:1px solid #b9a98a;background:#f5f0e8;color:#555;padding:2px 10px;font-size:12px}
.hp-mode-toggle .btn:first-child{border-radius:4px 0 0 4px}
.hp-mode-toggle .btn:last-child{border-radius:0 4px 4px 0;border-left:none}
.hp-mode-toggle .btn-toggle-active{background:var(--maroon);color:#fff;border-color:var(--maroon)}
.dice-editor{display:flex;flex-direction:column;gap:6px;margin-top:2px}
.dice-row{display:flex;align-items:center;gap:6px}
.dice-row input[type=number]{width:52px;text-align:center;padding:0 4px}
.dice-mod-input{width:64px !important}
.dice-lbl{font-size:13px;color:#777}
.dice-mod-row{display:flex;align-items:center;gap:8px}
.dice-mod-row input{width:80px;text-align:right}
.dice-footer{display:flex;align-items:center;gap:10px}
.dice-preview{font-size:12px;color:#555;font-style:italic}

/* ===================== STATBLOCK ===================== */
.preview{position:relative}
.sb-wrap{max-width:560px;margin:0 auto}

.desc-box{border:1px solid #b9a98a;border-radius:8px;background:#fffdf7;
  padding:12px 16px;margin-bottom:18px}
.desc-label{font-family:var(--sans);font-size:11px;font-weight:700;letter-spacing:.08em;
  text-transform:uppercase;color:var(--maroon);margin-bottom:4px}
.desc-box p{font-family:var(--serif);font-size:15px;line-height:1.45;margin:0;color:var(--ink)}

.sb{
  font-family:var(--serif);color:var(--ink);font-size:15px;line-height:1.4;
  background:var(--parchment);
  background-image:radial-gradient(circle at 30% 10%, #fff6e6 0%, transparent 60%),
                   radial-gradient(circle at 80% 90%, #f6e4c4 0%, transparent 55%);
  border:1px solid #ddd0b0;
  box-shadow:0 0 6px #0003,0 12px 30px -12px #00000055;
  padding:16px 20px 6px;
  /* tapered edge accents top & bottom (classic statblock) */
  border-top:5px solid var(--maroon);
  border-bottom:5px solid var(--maroon);
}
.sb-name{font-family:var(--display);color:var(--maroon);font-size:26px;line-height:1.05;
  margin:6px 0 0;font-weight:700;letter-spacing:.01em}
.sb-subtitle{font-style:italic;font-size:14px;margin:2px 0 0;color:#3a2517}

.sb-bar{height:5px;margin:8px 0;background:
  linear-gradient(to right,var(--maroon) 0%,var(--maroon) 100%);
  clip-path:polygon(0 0,100% 0,calc(100% - 6px) 100%,0 100%)}

.sb-red{margin:4px 0}
.prop{margin:2px 0;color:var(--maroon);font-size:14.5px}
.prop-name{font-weight:700}
.prop, .prop .prop-name{}
.sb-red .prop{color:var(--maroon)}
.sb-red .prop{ }
.prop{color:var(--ink)}
.prop-name{color:var(--maroon)}

.sb-abilities{width:100%;text-align:center;border-collapse:collapse;margin:4px 0}
.sb-abilities th{font-family:var(--display);color:var(--maroon);font-size:12px;font-weight:700;
  padding:2px 0}
.sb-abilities td{color:var(--ink);font-size:14px;padding:1px 0}

.sb-section{font-family:var(--display);color:var(--maroon);font-size:19px;font-weight:600;
  margin:14px 0 4px;padding-bottom:2px;border-bottom:2px solid var(--maroon);font-variant:small-caps}
.sb-intro{margin:4px 0;font-size:14.5px}
.sb-entries{display:flex;flex-direction:column;gap:7px;margin-top:6px}
.sb-entry{margin:0;font-size:14.5px}
.entry-name{font-weight:700;font-style:italic}

/* ===================== PRINT ===================== */
@media print{
  .no-print{display:none !important}
  .sg-root{background:#fff}
  .toolbar{display:none !important}
  .layout{display:block;padding:0;max-width:none}
  .preview{padding:0}
  .sb-wrap{max-width:none}
  .sb{box-shadow:none !important}
  .sb-entries{display:block}
  .sb-entry{break-inside:avoid;margin-bottom:7px}
  .sb-section{break-after:avoid}
  .sb-intro{break-after:avoid}
  .print-bw .sb{
    background:#fff !important;background-image:none !important;
    border:1.5px solid #000 !important;color:#000 !important;
  }
  .print-bw .sb *{color:#000 !important}
  .print-bw .sb-bar{background:#000 !important;height:2px;clip-path:none}
  .print-bw .sb-section{border-bottom:1.5px solid #000 !important}
  .print-bw .desc-box{border-color:#000}
  .print-bw .desc-box *{color:#000 !important}
}
`;
