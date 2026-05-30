#!/usr/bin/env python3
"""Probe Avrae statement-budget maxima for *-perf stress tests (see gvar-perf-boundaries.mdc).

Each **dimension row** is one testcase title + search bounds; the script runs ``find_max`` for that
row alone (binary search on ``loops`` / ``compiles`` / …). Put **any number of rows** in a
``--dimensions-file`` or repeat ``--dimension``; output is one TSV line per row. Same extra flags
(e.g. ``-reps "10"``) can be repeated per row via ``--extra-suffix`` or the optional 5th field.

Each probe run shells out to ``avrae-ls --run-tests``. That path executes Drac2 through the
``draconic.DraconicInterpreter`` with its default ``DraconicConfig`` (including ``max_statements``,
``max_loops``, etc.)—the same statement accounting the Avrae bot relies on for Drac2, not a
separate limit invented by ``avrae-ls``. So this script is a thin wrapper for finding how much
work fits under the real per-invocation statement cap for your ``*-perf`` harnesses.
"""
from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path


def _repo_root() -> Path:
    here = Path(__file__).resolve()
    for p in here.parents:
        if (p / "src" / "gvars").is_dir():
            return p
    return Path.cwd()


def _dim5(d: tuple) -> tuple[str, str, int, int, str]:
    """Normalize preset dimension tuples (4-tuple) to (testcase, param, low, cap, row_extra)."""
    if len(d) == 5:
        t = d[4]
        if not isinstance(t, str):
            t = str(t)
        return (d[0], d[1], d[2], d[3], t)
    return (d[0], d[1], d[2], d[3], "")


def _norm_cli_extra(s: str) -> str:
    """Ensure a leading space before the next CLI flag (line ends with -param \"value\")."""
    s = (s or "").strip()
    if not s:
        return ""
    return s if s.startswith(" ") else f" {s}"


PRESETS: dict[str, dict] = {
    "regex": {
        "alias_dir": "src/gvars/utils/regex",
        "stress_alias": "regex-perf",
        "probe_filename": "_probe.regex-perf.alias-test",
        "dimensions": [
            ("benchmark search loop should keep correct spans", "loops", 1272, 10000),
            ("benchmark class brace loop should keep full matches", "loops", 3, 2000),
            ("benchmark quantified alternation loop should keep matches", "loops", 4, 80),
            ("benchmark compile multiple regexes in one invocation", "compiles", 69, 250),
            ("benchmark compile cache hit loop should keep matches", "compiles", 760, 4000),
            ("benchmark compile cache miss loop should keep matches", "compiles", 54, 300),
            ("benchmark compiled full_match loop should keep matches", "loops", 2390, 10000),
            ("benchmark compiled fullmatch alias loop should keep matches", "loops", 2390, 10000),
            ("benchmark compiled match loop should keep end index", "loops", 1800, 10000),
            ("benchmark compiled search loop should keep span", "loops", 1278, 10000),
            ("benchmark compiled match_from loop should keep end index", "loops", 1830, 10000),
            ("benchmark compiled match_from_captures loop should keep captures", "loops", 122, 600),
            ("benchmark compiled search_captures loop should keep captures", "loops", 56, 300),
        ],
    },
    "rolls": {
        "alias_dir": "src/gvars/utils/rolls",
        "stress_alias": "rolls-perf",
        "probe_filename": "_probe.rolls-perf.alias-test",
        "dimensions": [
            ("benchmark get_roll flat 1d1 loop should keep totals", "loops", 50, 25000),
            ("benchmark get_roll check loop should keep athletics", "loops", 50, 12000),
            ("benchmark get_roll save loop should keep dexterity", "loops", 50, 12000),
            ("benchmark get_roll attack loop should keep melee", "loops", 50, 12000),
            ("benchmark get_roll passive loop should keep perception", "loops", 50, 12000),
        ],
    },
    "performance_examples": {
        "alias_dir": "src/gvars/utils/performance_examples",
        "stress_alias": "performance_examples-perf",
        "probe_filename": "_probe.performance_examples-perf.alias-test",
        # Baselines match performance_examples-perf.alias-test -loops; raise caps when re-probing.
        "dimensions": [
            ("benchmark adv dice list index loop should keep checksum", "loops", 4313, 120000),
            ("benchmark adv dice if chain loop should keep checksum", "loops", 3420, 120000),
            ("benchmark three way list index loop should keep checksum", "loops", 4509, 120000),
            ("benchmark three way if chain loop should keep checksum", "loops", 3968, 120000),
            ("benchmark dict get loop should keep checksum", "loops", 6612, 120000),
            ("benchmark dict in and subscript loop should keep checksum", "loops", 5834, 120000),
            ("benchmark dict get missing key default one loop should keep checksum", "loops", 7085, 120000),
            ("benchmark dict in else subscript missing key default one loop should keep checksum", "loops", 7084, 120000),
            ("benchmark tuple membership loop should keep checksum", "loops", 4508, 120000),
            ("benchmark list membership loop should keep checksum", "loops", 4508, 120000),
            ("benchmark dict bracket known key loop should keep checksum", "loops", 7628, 120000),
            ("benchmark dict get known key loop should keep checksum", "loops", 6610, 120000),
            ("benchmark dict get bare present key loop should keep checksum", "loops", 7627, 120000),
            ("benchmark dict bracket present same key loop should keep checksum", "loops", 8262, 120000),
            (
                "benchmark counter plus assign loop should keep checksum",
                "loops",
                805,
                120000,
                '-reps "10"',
            ),
            (
                "benchmark counter plus eq loop should keep checksum",
                "loops",
                877,
                120000,
                '-reps "10"',
            ),
            ("benchmark string concat assign loop should keep checksum", "loops", 9013, 120000),
            ("benchmark string concat plus eq loop should keep checksum", "loops", 9914, 120000),
        ],
    },
}


def parse_dimension(s: str) -> tuple[str, str, int, int, str]:
    """``testcase,param,baseline,cap`` or five fields: ``...,cap,extra_suffix`` (suffix appended after ``-param VALUE``)."""
    parts = [x.strip() for x in s.split(",", maxsplit=4)]
    if len(parts) < 4:
        raise argparse.ArgumentTypeError(
            f"Expected testcase,param,baseline,cap[,extra_suffix] — got {len(parts)} fields in {s!r}"
        )
    testcase, param, low_s, cap_s = parts[0], parts[1], parts[2], parts[3]
    row_extra = parts[4] if len(parts) > 4 else ""
    return testcase, param, int(low_s), int(cap_s), row_extra


def write_probe(probe_path: Path, testcase_line: str, name: str) -> None:
    body = f"{testcase_line}\n---\n---\nname: {name}\n"
    probe_path.write_text(body)


def try_val(
    root: Path,
    probe_rel: Path,
    stress_alias: str,
    testcase_line: str,
    name: str,
    timeout: int,
) -> bool:
    probe_abs = root / probe_rel
    write_probe(probe_abs, testcase_line, name)
    r = subprocess.run(
        ["avrae-ls", "--run-tests", str(probe_rel)],
        cwd=root,
        capture_output=True,
        text=True,
        timeout=timeout,
    )
    out = (r.stdout or "") + (r.stderr or "")
    return r.returncode == 0 and "FAIL" not in out


def line_for(
    stress_alias: str, sub: str, param: str, val: int, *, extra_suffix: str = ""
) -> str:
    return f'!{stress_alias} -testcase "{sub}" -{param} "{val}"{extra_suffix}'


def find_max(
    root: Path,
    probe_rel: Path,
    stress_alias: str,
    sub: str,
    param: str,
    baseline: int,
    cap: int,
    timeout: int,
    max_binary: int,
    *,
    extra_suffix: str = "",
) -> int:
    def trial(line: str, label: str) -> bool:
        return try_val(root, probe_rel, stress_alias, line, label, timeout)

    if not trial(
        line_for(stress_alias, sub, param, baseline, extra_suffix=extra_suffix),
        f"probe baseline {baseline}",
    ):
        raise SystemExit(f"baseline fails: {sub!r} @ {baseline}")

    if baseline >= cap:
        return baseline

    if trial(line_for(stress_alias, sub, param, cap, extra_suffix=extra_suffix), f"probe cap {cap}"):
        return cap

    lo = baseline
    hi = min(cap, max(lo + 1, lo * 2))
    steps = 0
    while hi <= cap and steps < 8:
        steps += 1
        if trial(line_for(stress_alias, sub, param, hi, extra_suffix=extra_suffix), f"probe hi {hi}"):
            lo = hi
            if lo >= cap:
                return cap
            nxt = min(cap, max(lo + 1, lo * 2))
            if nxt <= lo:
                break
            hi = nxt
        else:
            break

    if lo >= cap:
        return cap

    good, bad = lo, hi
    bsteps = 0
    while good + 1 < bad and bsteps < max_binary:
        bsteps += 1
        mid = (good + bad) // 2
        if trial(line_for(stress_alias, sub, param, mid, extra_suffix=extra_suffix), f"probe mid {mid}"):
            good = mid
        else:
            bad = mid
    return good


def main() -> None:
    epilog = """Examples (repo root):
  python3 .cursor/scripts/probe_perf_boundaries.py --preset regex
  python3 .cursor/scripts/probe_perf_boundaries.py --preset rolls
  python3 .cursor/scripts/probe_perf_boundaries.py \\
    --alias-dir src/gvars/utils/foo --stress-alias foo-perf \\
    --dimension "Full testcase title as in *-perf.alias,loops,10,5000"
  # Re-probe from committed baselines (same dimensions as --preset performance_examples)
  python3 .cursor/scripts/probe_perf_boundaries.py --preset performance_examples --max-binary 20

  # Preset paths only; dimensions from your own file (4- or 5-field lines, same as --dimension)
  python3 .cursor/scripts/probe_perf_boundaries.py --preset performance_examples \\
    --no-preset-dimensions --dimensions-file path/to/dimensions.txt

  # Same extra flags on every probed row (stress alias must tolerate them; leading space optional)
  python3 .cursor/scripts/probe_perf_boundaries.py --preset performance_examples \\
    --extra-suffix '-reps "10"' --max-binary 20

  # Counter assign vs += with -reps: two --dimension rows (5th field), preset paths only
  python3 .cursor/scripts/probe_perf_boundaries.py --preset performance_examples \\
    --no-preset-dimensions \\
    --dimension 'benchmark counter plus assign loop should keep checksum,loops,5,2500,-reps "10"' \\
    --dimension 'benchmark counter plus eq loop should keep checksum,loops,5,2500,-reps "10"' \\
    --max-binary 20

TSV on stdout (one row per dimension): testcase, param, maxima. Progress on stderr."""
    ap = argparse.ArgumentParser(
        description=__doc__.strip(),
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=epilog,
    )
    ap.add_argument(
        "--root",
        type=Path,
        default=None,
        help="Repository root (default: auto-detect from this script)",
    )
    ap.add_argument(
        "--preset",
        choices=sorted(PRESETS.keys()),
        help="Built-in alias-dir, stress alias, probe filename, and (unless --no-preset-dimensions) dimensions",
    )
    ap.add_argument(
        "--no-preset-dimensions",
        action="store_true",
        help="With --preset: only apply alias-dir, stress-alias, and probe-filename from the preset; supply dimensions via --dimension / --dimensions-file",
    )
    ap.add_argument(
        "--alias-dir",
        type=str,
        help="Directory relative to root containing the probe file (e.g. src/gvars/utils/regex)",
    )
    ap.add_argument(
        "--stress-alias",
        type=str,
        help="Alias command name for the first line of the .alias-test (e.g. regex-perf)",
    )
    ap.add_argument(
        "--probe-filename",
        type=str,
        help="Probe file basename inside alias-dir (default: _probe.<stress-alias>.alias-test)",
    )
    ap.add_argument(
        "--dimension",
        action="append",
        default=[],
        type=parse_dimension,
        metavar="TESTCASE,PARAM,LOW,CAP[,EXTRA]",
        help="Repeatable; testcase must match *-perf.alias elif branch. Optional 5th field: extra suffix after -PARAM VALUE (merged with --extra-suffix)",
    )
    ap.add_argument(
        "--dimensions-file",
        type=Path,
        help="One dimension per line: testcase,param,baseline,cap (same as --dimension)",
    )
    ap.add_argument(
        "--timeout",
        type=int,
        default=120,
        help="Seconds per avrae-ls invocation (default: 120)",
    )
    ap.add_argument(
        "--max-binary",
        type=int,
        default=6,
        metavar="N",
        help="Max binary-search refinement steps between last pass and first fail (default: 6; use 16–24 when re-probing from an already-high baseline)",
    )
    ap.add_argument(
        "--extra-suffix",
        type=str,
        default="",
        help="Append to every probe line after -PARAM VALUE (e.g. '-reps \"10\"'). Row-specific extras from --dimension / file are merged after this.",
    )
    args = ap.parse_args()

    if args.no_preset_dimensions and not args.preset:
        ap.error("--no-preset-dimensions requires --preset")

    root = (args.root or _repo_root()).resolve()

    dimensions: list[tuple[str, str, int, int, str]] = []
    alias_dir: str | None = None
    stress_alias: str | None = None
    probe_filename: str | None = None

    if args.preset:
        cfg = PRESETS[args.preset]
        alias_dir = cfg["alias_dir"]
        stress_alias = cfg["stress_alias"]
        probe_filename = cfg["probe_filename"]
        if not args.no_preset_dimensions:
            dimensions = [_dim5(d) for d in cfg["dimensions"]]

    if args.alias_dir:
        alias_dir = args.alias_dir
    if args.stress_alias:
        stress_alias = args.stress_alias
    if args.probe_filename:
        probe_filename = args.probe_filename

    if args.dimensions_file:
        df = args.dimensions_file
        if not df.is_absolute():
            df = root / df
        text = df.read_text(encoding="utf-8")
        for line in text.splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            dimensions.append(parse_dimension(line))

    for d in args.dimension:
        dimensions.append(d)

    if not alias_dir or not stress_alias:
        ap.error("Provide --preset or both --alias-dir and --stress-alias")
    if not dimensions:
        ap.error("Provide dimensions via --preset, --dimension, or --dimensions-file")
    if not probe_filename:
        probe_filename = f"_probe.{stress_alias}.alias-test"

    probe_rel = Path(alias_dir) / probe_filename
    results: list[tuple[str, str, int]] = []
    try:
        for sub, param, low, cap, row_extra in dimensions:
            merged_suffix = f"{_norm_cli_extra(args.extra_suffix)}{_norm_cli_extra(row_extra)}"
            m = find_max(
                root,
                probe_rel,
                stress_alias,
                sub,
                param,
                low,
                cap,
                args.timeout,
                args.max_binary,
                extra_suffix=merged_suffix,
            )
            results.append((sub, param, m))
            print(f"{m}\t{sub[:52]}…", file=sys.stderr)
    finally:
        p = root / probe_rel
        if p.exists():
            p.unlink()

    for sub, param, m in results:
        print(f"{sub}\t{param}\t{m}")


if __name__ == "__main__":
    main()
