import { loadPyodide, version as pyodideVersion } from 'pyodide';

type PreviewRequest = {
  id: number;
  phase?: 'encounter' | 'process' | 'full';
  source?: string;
  functionName?: string;
  templateId?: string;
  args: unknown[];
  previewResult: string;
  previewRoll: string;
  previewCharacter?: {
    name: string;
    level: number;
  };
  rollMock?: {
    mode: 'mockReturns' | 'mockReturnsOnce' | 'mockReturnsNTimes';
    values: string[];
    fallback: string;
    times: number;
  };
  encounterCacheKey?: string;
  encounterOverride?: Record<string, unknown>;
};

const ctx = self as unknown as {
  onmessage: ((event: MessageEvent<PreviewRequest>) => void) | null;
  postMessage: (message: unknown) => void;
};
const ready = loadPyodide({
  indexURL: `https://cdn.jsdelivr.net/pyodide/v${pyodideVersion}/full/`,
});

ctx.onmessage = async (event: MessageEvent<PreviewRequest>) => {
  const {
    id,
    phase,
    source,
    functionName,
    templateId,
    args,
    previewResult,
    previewRoll,
    previewCharacter,
    rollMock,
    encounterCacheKey,
    encounterOverride,
  } = event.data;
  try {
    const pyodide = await ready;
    pyodide.globals.set(
      'WG_TEMPLATE_INPUT',
      JSON.stringify({
        source,
        functionName,
        templateId,
        args,
        previewResult,
        previewRoll,
        previewCharacter,
        phase,
        rollMock,
        encounterCacheKey,
        encounterOverride,
      }),
    );
    const json = await pyodide.runPythonAsync(PYTHON_TEMPLATE_PREVIEW_SCRIPT);
    ctx.postMessage({ id, ...JSON.parse(String(json)) });
  } catch (error) {
    ctx.postMessage({
      id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

const PYTHON_TEMPLATE_PREVIEW_SCRIPT = String.raw`
import json
from math import ceil, floor
from random import randint

payload = json.loads(WG_TEMPLATE_INPUT)
phase = payload.get("phase") or "full"
source = payload.get("source") or ""
function_name = payload.get("functionName") or ""
template_name = payload.get("templateId") or function_name
args = payload.get("args") or []
preview_result = payload.get("previewResult") or "success"
preview_roll = payload.get("previewRoll") or "15"
preview_character = payload.get("previewCharacter") or {}
roll_mock = payload.get("rollMock") or {}
encounter_cache_key = payload.get("encounterCacheKey") or ""
encounter_override = payload.get("encounterOverride")

try:
    WG_ENCOUNTER_CACHE
except NameError:
    WG_ENCOUNTER_CACHE = {}

def _arg(values, index, default=None):
    if values is None:
        return default
    try:
        if index < len(values):
            return values[index]
    except Exception:
        pass
    return default

def _text(value, default=""):
    if value is None:
        return default
    try:
        return str(value)
    except Exception:
        return default

def _int_or_text(value, default=0):
    if value is None:
        return default
    try:
        return int(value)
    except Exception:
        return value

def _is_numberish(value):
    try:
        int(value)
        return True
    except Exception:
        pass
    try:
        float(value)
        return True
    except Exception:
        return False

def _ability_for_check(check_name):
    text = _text(check_name).lower()
    key = text.replace(" ", "").replace("_", "").replace("-", "")
    ability_map = {
        "strength": "str",
        "athletics": "str",
        "dexterity": "dex",
        "initiative": "dex",
        "acrobatics": "dex",
        "sleightofhand": "dex",
        "stealth": "dex",
        "constitution": "con",
        "intelligence": "int",
        "arcana": "int",
        "history": "int",
        "investigation": "int",
        "nature": "int",
        "religion": "int",
        "wisdom": "wis",
        "animalhandling": "wis",
        "insight": "wis",
        "medicine": "wis",
        "perception": "wis",
        "survival": "wis",
        "charisma": "cha",
        "deception": "cha",
        "intimidation": "cha",
        "performance": "cha",
        "persuasion": "cha",
    }
    return ability_map.get(key, "wis")

def _ability_for_save(save_name):
    key = _text(save_name).lower().replace(" ", "").replace("_", "").replace("-", "")
    ability_map = {
        "strength": "str",
        "dexterity": "dex",
        "constitution": "con",
        "intelligence": "int",
        "wisdom": "wis",
        "charisma": "cha",
    }
    return ability_map.get(key)

def _roll(check_name, dc):
    return {
        "type": "check",
        "name": _text(check_name, "Wisdom (Survival)"),
        "ability": _ability_for_check(check_name),
        "dc": _text(dc, "12"),
    }

def _save(save_name, dc):
    result = {
        "type": "save",
        "name": _text(save_name, "Dexterity"),
        "dc": _text(dc, "12"),
    }
    ability = _ability_for_save(save_name)
    if ability is not None:
        result["ability"] = ability
    return result

def _base(name, description):
    return {
        "name": _text(name, "Encounter"),
        "description": _text(description),
    }

def _roll_field(roll, key):
    if roll is None:
        return None
    if isinstance(roll, dict):
        return roll.get(key)
    return getattr(roll, key, None)

def _first_roll_passed(ectx):
    rolls = ectx.get("rolls") if isinstance(ectx, dict) else []
    if not isinstance(rolls, list) or len(rolls) == 0:
        return False
    passed = _roll_field(rolls[0], "passed")
    if passed is None:
        passed = _roll_field(rolls[0], "success")
    return passed is True

def _display_roll(roll, show_dc=False, show_result=False):
    full = _roll_field(roll, "full") or _roll_field(roll, "total") or "0"
    name = _roll_field(roll, "name") or "Roll"
    line = f"{full} **{name}**"
    details = []
    dc = _roll_field(roll, "dc")
    if show_dc and dc not in [None, ""]:
        details.append(f"DC {dc}")
    passed = _roll_field(roll, "passed")
    if passed is None:
        passed = _roll_field(roll, "success")
    if show_result and passed is not None:
        details.append("Passed" if passed is True else "Failed")
    if details:
        line += f" ({', '.join(details)})"
    return line

def _enemy_line(enemy):
    if enemy is None:
        return None
    count = 1
    name = None
    if isinstance(enemy, dict):
        try:
            count = int(enemy.get("count") or enemy.get("qty") or 1)
        except Exception:
            count = 1
        name = enemy.get("name") or enemy.get("monster")
    else:
        name = enemy
    text = _text(name).strip()
    if text == "":
        return None
    return f"* {count}x {text}"

def _display_combat(enemies=None, surprised=None, details=None):
    lines = ["> Combat Initiated!"]
    if surprised is not None:
        surprise_list = surprised if isinstance(surprised, list) else [surprised]
        for target in surprise_list:
            text = _text(target).strip()
            if text != "":
                lines.append(f"{text} was **surprised**!")
    if details is not None:
        detail_list = details if isinstance(details, list) else [details]
        for detail in detail_list:
            text = _text(detail).strip()
            if text != "":
                lines.append(text)
    lines.append("Enemies:")
    enemy_lines = []
    if enemies is not None:
        enemy_list = enemies if isinstance(enemies, list) else [enemies]
        for enemy in enemy_list:
            line = _enemy_line(enemy)
            if line is not None:
                enemy_lines.append(line)
    if not enemy_lines:
        enemy_lines.append("* Generated enemies from target CR")
    return "\n".join(lines + enemy_lines)

def gather_item(args):
    if len(args) >= 5 and _is_numberish(_arg(args, 2)):
        name = _arg(args, 0, "Useful find")
        check_name = _arg(args, 1, "Wisdom (Survival)")
        dc = _arg(args, 2, "12")
        item = _arg(args, 3, "Supplies")
        total = _arg(args, 4, 1)
        bag = None
        desc = f"You gather **{item}** from the area."
    else:
        name = _arg(args, 0, "Useful find")
        desc = _arg(args, 1, "You find useful supplies in the wild.")
        check_name = _arg(args, 2, "Wisdom (Survival)")
        dc = _arg(args, 3, "12")
        item = _arg(args, 4, "Supplies")
        total = _arg(args, 5, 1)
        bag = _arg(args, 6)
    enc = _base(name, desc)
    enc["rolls"] = [_roll(check_name, dc)]
    outcome = {"type": "item", "name": _text(item, "Supplies"), "total": _int_or_text(total, 1)}
    if bag is not None and _text(bag).strip() != "":
        outcome["bag"] = _text(bag)
    def outcomes(ectx):
        if _first_roll_passed(ectx):
            return [outcome]
        return []
    enc["outcomes"] = outcomes
    return enc

def skill_check(args):
    enc = _base(_arg(args, 0, "Skill check"), _arg(args, 1, "A careful approach may reveal something useful."))
    enc["rolls"] = [_roll(_arg(args, 2, "Wisdom (Survival)"), _arg(args, 3, "12"))]
    return enc

def saving_throw(args):
    enc = _base(_arg(args, 0, "Saving throw"), _arg(args, 1, "A sudden threat demands quick reaction."))
    enc["rolls"] = [_save(_arg(args, 2, "Dexterity"), _arg(args, 3, "12"))]
    return enc

def story(args):
    return _base(_arg(args, 0, "Forest sign"), _arg(args, 1, "You notice a quiet detail in the wild."))

def combat_template(args):
    enc = _base(_arg(args, 0, "Hostile creatures"), _arg(args, 1, "Something dangerous moves nearby."))
    enc["cr"] = _arg(args, 2, 1)
    monsters = _arg(args, 3)
    difficulty = _arg(args, 4)
    if monsters is not None and _text(monsters).strip() != "":
        enc["monsters"] = monsters if isinstance(monsters, list) else [_text(monsters)]
    if difficulty is not None and _text(difficulty).strip() != "":
        enc["difficulty"] = _text(difficulty)
    enc["combat_text"] = _display_combat(enc.get("monsters"))
    return enc

def damage_combat(args):
    enc = combat_template(args)
    enc["outcomes"] = [{"type": "damage", "total": _int_or_text(_arg(args, 5, "1d4"), "1d4")}]
    return enc

def ambush(args):
    enc = combat_template(args)
    dc = _arg(args, 5, "12")
    enc["rolls"] = [
        _roll("Perception", dc),
        _roll("Stealth", dc),
        {"type": "passive", "name": "Perception", "ability": "wis", "dc": _text(dc, "12")},
    ]
    def combat_text(ectx):
        surprised = []
        rolls = ectx.get("rolls") if isinstance(ectx, dict) else []
        if isinstance(rolls, list) and len(rolls) > 0 and _roll_field(rolls[0], "passed") is False:
            character_obj = ectx.get("character") if isinstance(ectx, dict) else None
            surprised.append(getattr(character_obj, "name", None) or "The party")
        return _display_combat(enc.get("monsters"), surprised=surprised)
    enc["combat_text"] = combat_text
    return enc

def quest(args):
    enc = _base(_arg(args, 0, "Unfinished business"), _arg(args, 1, "A hook asks for follow-up."))
    if _arg(args, 2) is not None and _text(_arg(args, 2)).strip() != "":
        enc["reward"] = _text(_arg(args, 2))
    return enc

def gold(args):
    enc = _base(_arg(args, 0, "Treasure cache"), _arg(args, 1, "Coins glint in the dirt."))
    enc["outcomes"] = [{"type": "gold", "total": _int_or_text(_arg(args, 2, 1), 1)}]
    return enc

def healing(args):
    enc = _base(_arg(args, 0, "Restorative spring"), _arg(args, 1, "A restorative moment eases your wounds."))
    enc["outcomes"] = [{"type": "healing", "total": _int_or_text(_arg(args, 2, "1d4"), "1d4")}]
    return enc

def healing_check(args):
    enc = _base(_arg(args, 0, "Field medicine"), _arg(args, 1, "Careful treatment helps the wounded recover."))
    enc["rolls"] = [_roll(_arg(args, 2, "Medicine"), _arg(args, 3, "12"))]
    enc["outcomes"] = [{"type": "healing", "total": _int_or_text(_arg(args, 4, "1d4"), "1d4")}]
    return enc

def damage(args):
    enc = _base(_arg(args, 0, "Hazard"), _arg(args, 1, "The area turns dangerous."))
    enc["outcomes"] = [{"type": "damage", "total": _int_or_text(_arg(args, 2, "1d4"), "1d4")}]
    return enc

def raw(args):
    value = _arg(args, 0)
    if isinstance(value, dict):
        return value
    return None

def expand_builtin(template_name, args):
    key = _text(template_name).strip().lower()
    if key in ["gather_item", "gather"]:
        return gather_item(args)
    if key in ["skill_check", "check"]:
        return skill_check(args)
    if key in ["saving_throw", "save"]:
        return saving_throw(args)
    if key in ["flavour", "flavor", "static", "story"]:
        return story(args)
    if key == "combat":
        return combat_template(args)
    if key in ["damage_combat", "combat_damage", "hazard_combat"]:
        return damage_combat(args)
    if key == "ambush":
        return ambush(args)
    if key in ["quest", "hook"]:
        return quest(args)
    if key in ["gold", "gp"]:
        return gold(args)
    if key in ["healing", "heal"]:
        return healing(args)
    if key in ["healing_check", "heal_check"]:
        return healing_check(args)
    if key in ["damage", "hazard"]:
        return damage(args)
    if key in ["raw", "encounter"]:
        return raw(args)
    return None

def _media(value):
    result = _text(value).strip()
    if result == "" or result.lower() in ["none", "null", "undefined"]:
        return None
    return result

def _read_field(obj, key, default=None):
    if not isinstance(obj, dict):
        return default
    if key in obj:
        return obj.get(key)
    return default

def _encounter_context(encounter, character_obj, rolls_list):
    return {
        "character": character_obj,
        "rolls": rolls_list,
        "args": args,
        "encounter": encounter,
        "config": None,
        "activity": None,
        "biome": None,
        "location": None,
        "location_id": None,
        "current_location": None,
        "current_location_id": None,
    }

def _resolve_field(encounter, key, character_obj, rolls_list, default=None):
    value = _read_field(encounter, key, default)
    if callable(value):
        return value(_encounter_context(encounter, character_obj, rolls_list))
    return value

def process_encounter(encounter, preview_roll, preview_result, roll_mock=None):
    if encounter is None:
        return {
            "title": "Encounter",
            "name": "Encounter",
            "description": "No encounter data.",
            "desc": "No encounter data.",
            "rolls": [],
            "outcomes": [],
            "outcome_text": "",
            "footer": "Use !westmarch help for options.",
            "embed": {
                "title": "Encounter",
                "desc": "No encounter data.",
                "footer": "Use !westmarch help for options.",
            },
        }
    rolls_list = _processed_rolls(encounter.get("rolls"), preview_roll, preview_result, roll_mock)
    name = _text(_resolve_field(encounter, "name", preview_character_obj, rolls_list, "Encounter"), "Encounter").strip() or "Encounter"
    description = _text(_resolve_field(encounter, "description", preview_character_obj, rolls_list, ""))
    cr = _resolve_field(encounter, "cr", preview_character_obj, rolls_list, 0)
    difficulty = _text(_resolve_field(encounter, "difficulty", preview_character_obj, rolls_list, "medium"), "medium")
    monsters_value = _resolve_field(encounter, "monsters", preview_character_obj, rolls_list, [])
    monsters_list = monsters_value if isinstance(monsters_value, list) else ([_text(monsters_value)] if _text(monsters_value).strip() != "" else [])
    combat_text = _text(_resolve_field(encounter, "combat_text", preview_character_obj, rolls_list, ""))
    if _is_positive(cr) and combat_text.strip() == "":
        description = _append_combat_text(description, cr, difficulty, monsters_list)
    elif combat_text.strip() != "":
        description = "\n\n".join([part for part in [description.strip(), combat_text.strip()] if part != ""])
    outcomes_value = _resolve_field(encounter, "outcomes", preview_character_obj, rolls_list, [])
    outcomes_list = outcomes_value if isinstance(outcomes_value, list) else []
    outcome_text = process_outcomes(outcomes_list, preview_character_obj)
    if description.strip() == "":
        description = _fallback_description(encounter, rolls_list, preview_result)
    desc = "\n".join([part for part in [description.strip(), outcome_text.strip()] if part != ""])
    result = {
        "title": name,
        "name": name,
        "description": description.strip(),
        "desc": desc,
        "rolls": [_roll_to_json(roll) for roll in rolls_list],
        "outcomes": outcomes_list,
        "outcome_text": outcome_text,
        "footer": "Use !westmarch help for options.",
    }
    thumb_value = _resolve_field(encounter, "thumb", preview_character_obj, rolls_list)
    if thumb_value is None:
        thumb_value = _resolve_field(encounter, "thumbnail", preview_character_obj, rolls_list)
    image_value = _resolve_field(encounter, "image", preview_character_obj, rolls_list)
    if image_value is None:
        image_value = _resolve_field(encounter, "image_url", preview_character_obj, rolls_list)
    thumb = _media(thumb_value)
    image = _media(image_value)
    if thumb is not None:
        result["thumb"] = thumb
    if image is not None:
        result["image"] = image
    result["embed"] = {
        "title": name,
        "desc": desc,
        "footer": result["footer"],
    }
    if thumb is not None:
        result["embed"]["thumb"] = thumb
    if image is not None:
        result["embed"]["image"] = image
    return result

class PreviewRoll:
    def __init__(self, roll_conf, index, preview_roll, preview_result, roll_mock):
        self.type = _text(roll_conf.get("type"), "check") if isinstance(roll_conf, dict) else "check"
        self.name = _text(roll_conf.get("name"), self.type) if isinstance(roll_conf, dict) else self.type
        self.ability = _text(roll_conf.get("ability")) if isinstance(roll_conf, dict) else ""
        self.dc = _roll_total(roll_conf.get("dc")) if isinstance(roll_conf, dict) and roll_conf.get("dc") is not None else None
        self.total = _roll_total(_mock_roll_for(index, preview_roll, roll_mock))
        self.natural_roll = self.total
        self.full = _text(self.total)
        if self.dc is None:
            self.passed = None if preview_result == "neutral" else preview_result == "success"
        else:
            self.passed = self.total >= self.dc

def _roll_total(value):
    try:
        return int(value)
    except Exception:
        pass
    try:
        return int(float(value))
    except Exception:
        return 0

def _processed_rolls(rolls, preview_roll, preview_result, roll_mock=None):
    if not isinstance(rolls, list):
        return []
    return [
        PreviewRoll(roll, index, preview_roll, preview_result, roll_mock)
        for index, roll in enumerate(rolls)
        if isinstance(roll, dict)
    ]

def _roll_to_json(roll):
    result = {
        "type": roll.type,
        "name": roll.name,
        "total": roll.total,
        "full": roll.full,
        "passed": roll.passed,
    }
    if roll.dc is not None:
        result["dc"] = roll.dc
    if roll.ability != "":
        result["ability"] = roll.ability
    return result

def _is_positive(value):
    try:
        return float(value) > 0
    except Exception:
        return False

def _append_combat_text(description, cr, difficulty, monsters_list):
    combat_text = _display_combat(monsters_list)
    return "\n\n".join([part for part in [description.strip(), combat_text] if part != ""])

def _fallback_description(encounter, rolls_list, preview_result):
    parts = []
    description = _text(encounter.get("description"))
    if description.strip() != "":
        parts.append(description)
    for roll in rolls_list:
        parts.append(_display_roll(roll, show_dc=True, show_result=True))
    return "\n".join(parts)

def _mock_roll_for(index, preview_roll, roll_mock):
    if not isinstance(roll_mock, dict):
        return _text(preview_roll, "15")
    raw_values = roll_mock.get("values")
    if not isinstance(raw_values, list):
        raw_values = []
    values = [_text(value).strip() for value in raw_values]
    def _value_or_random(value):
        if value == "":
            return _text(randint(1, 20))
        return value
    primary = _value_or_random(values[0]) if values else _text(preview_roll, "15")
    fallback = _text(roll_mock.get("fallback"), _text(preview_roll, "15")).strip()
    if fallback == "":
        fallback = _text(preview_roll, "15")
    mode = _text(roll_mock.get("mode"), "mockReturns")
    if mode == "mockReturnsOnce":
        return primary if index == 0 else fallback
    if mode == "mockReturnsNTimes":
        try:
            times = int(roll_mock.get("times") or 1)
        except Exception:
            times = 1
        return primary if index < max(0, times) else fallback
    if index < len(values):
        return _value_or_random(values[index])
    return primary

def process_outcomes(outcomes, character_obj):
    lines = []
    if not isinstance(outcomes, list):
        return "\n".join(lines)
    for outcome in outcomes:
        if not isinstance(outcome, dict):
            continue
        outcome_type = _text(outcome.get("type"))
        if outcome_type == "item":
            bag = _text(outcome.get("bag"))
            lines.append(
                f"-# {character_obj.name} gained {_text(outcome.get('total'), '1')} x {_text(outcome.get('name'), 'item')}"
                + (f" in {bag}" if bag != "" else "")
                + "."
            )
        elif outcome_type == "gold":
            lines.append(f"-# {character_obj.name} gained {_text(outcome.get('total'), '1')} gp.")
        elif outcome_type == "healing":
            lines.append(f"-# {character_obj.name} recovered {_text(outcome.get('total'), '1d4')} hit points.")
        elif outcome_type == "damage":
            lines.append(f"-# {character_obj.name} took {_text(outcome.get('total'), '1d4')} damage.")
        elif outcome_type == "currency":
            lines.append(f"-# {character_obj.name} gained {_text(outcome.get('total'), '1')} {_text(outcome.get('id'), 'currency')}.")
        elif outcome_type == "quest":
            lines.append(f"-# {character_obj.name} updated quest **{_text(outcome.get('name'), 'Quest')}**.")
        elif outcome_type == "recipe":
            lines.append(f"-# {character_obj.name} learned recipe **{_text(outcome.get('name'), 'Recipe')}**.")
        elif outcome_type == "runes":
            lines.append(f"-# {character_obj.name} gained {_text(outcome.get('total'), '1')} runes.")
        elif outcome_type != "":
            lines.append(f"-# {outcome_type}: {json.dumps(outcome)}")
    return "\n".join(lines)

safe_builtins = {
    "abs": abs,
    "bool": bool,
    "dict": dict,
    "float": float,
    "int": int,
    "len": len,
    "list": list,
    "callable": callable,
    "max": max,
    "min": min,
    "range": range,
    "round": round,
    "str": str,
    "sum": sum,
}

class PreviewCharacter:
    def __init__(self, data):
        self.name = data.get("name") or "Daenerys Targaryen"
        self.level = data.get("level") or 1
        self.cvars = data.get("cvars") or {}

    def __str__(self):
        return self.name

    def get_cvar(self, key, default=None):
        return self.cvars.get(key, default)

    def cvar(self, key, default=None):
        return self.get_cvar(key, default)

    def set_cvar(self, key, value):
        self.cvars[key] = value
        return value

    def cc_exists(self, _name):
        return False

    def cc_str(self, name):
        return "0/0"

    def get_cc(self, _name):
        return 0

    def get_cc_max(self, _name):
        return 0

preview_character_obj = PreviewCharacter(preview_character)

def character():
    return preview_character_obj

namespace = {
    "__builtins__": safe_builtins,
    "_arg": _arg,
    "_text": _text,
    "_int_or_text": _int_or_text,
    "ceil": ceil,
    "floor": floor,
    "character": character,
}

def _generate_encounter():
    if source.strip() != "":
        exec(source, namespace)
        fn = namespace.get(function_name)
        if fn is None:
            candidates = []
            for key, value in namespace.items():
                if not key.startswith("_") and callable(value):
                    candidates.append(value)
            if len(candidates) == 1:
                fn = candidates[0]
        if fn is None or not callable(fn):
            raise Exception("No matching callable template function was found.")
        return fn(args)
    return expand_builtin(template_name, args)

def _clean_encounter(encounter):
    if not isinstance(encounter, dict):
        return encounter
    return {key: value for key, value in encounter.items() if str(key) != "kind"}

def _next_cache_key():
    base = _text(template_name or function_name, "encounter")
    return f"{base}:{len(WG_ENCOUNTER_CACHE) + 1}"

def _cache_encounter(encounter):
    key = encounter_cache_key or _next_cache_key()
    WG_ENCOUNTER_CACHE[key] = encounter
    return key

if phase == "process":
    if isinstance(encounter_override, dict):
        encounter = _clean_encounter(encounter_override)
        cache_key = _cache_encounter(encounter)
    elif encounter_cache_key in WG_ENCOUNTER_CACHE:
        encounter = WG_ENCOUNTER_CACHE[encounter_cache_key]
        cache_key = encounter_cache_key
    else:
        raise Exception("Generate an encounter before processing the preview.")
    display_output = process_encounter(encounter, preview_roll, preview_result, roll_mock)
    result = {
        "encounter": encounter,
        "displayOutput": display_output,
        "encounterCacheKey": cache_key,
    }
else:
    encounter = _clean_encounter(_generate_encounter())
    if not isinstance(encounter, dict):
        raise Exception("Template function did not return an encounter dict.")
    cache_key = _cache_encounter(encounter)
    result = {
        "encounter": encounter,
        "encounterCacheKey": cache_key,
    }
    if phase != "encounter":
        result["displayOutput"] = process_encounter(encounter, preview_roll, preview_result, roll_mock)

json.dumps(result, default=str)
`;
