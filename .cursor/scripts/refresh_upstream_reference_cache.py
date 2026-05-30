#!/usr/bin/env python3
"""Download cached upstream Avrae RST and avrae-ls Markdown using `.cursor/reference-cache.json`.

Updates `last_fetch` (ISO date) for the section refreshed. After `--avrae-ls`, bump
`tracked_avrae_ls_version` in the JSON when you have validated against a new `avrae-ls` release.
"""
from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


def _repo_root() -> Path:
    here = Path(__file__).resolve()
    for p in here.parents:
        if (p / "src" / "gvars").is_dir():
            return p
    return Path.cwd()


def _load_cache(root: Path) -> dict:
    path = root / ".cursor" / "reference-cache.json"
    return json.loads(path.read_text(encoding="utf-8"))


def _save_cache(root: Path, data: dict) -> None:
    path = root / ".cursor" / "reference-cache.json"
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def _fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "westmarch-generic-reference-cache-refresh"})
    with urllib.request.urlopen(req, timeout=120) as resp:
        return resp.read()


def cmd_avrae_rst(root: Path) -> None:
    data = _load_cache(root)
    section = data["avrae_rst"]
    for ent in section["entries"]:
        rel = ent["repo_path"]
        url = ent["source_url"]
        out = root / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        body = _fetch(url)
        out.write_bytes(body)
        print(f"Wrote {rel}", file=sys.stderr)
    section["last_fetch"] = datetime.now(timezone.utc).date().isoformat()
    _save_cache(root, data)
    print(f"Set avrae_rst.last_fetch={section['last_fetch']}", file=sys.stderr)


def cmd_avrae_ls(root: Path) -> None:
    data = _load_cache(root)
    section = data["avrae_ls_upstream"]
    for ent in section["entries"]:
        rel = ent["repo_path"]
        url = ent["source_url"]
        out = root / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        try:
            body = _fetch(url)
        except urllib.error.HTTPError as e:
            raise SystemExit(f"HTTP {e.code} fetching {url!r}") from e
        out.write_bytes(body)
        print(f"Wrote {rel}", file=sys.stderr)
    section["last_fetch"] = datetime.now(timezone.utc).date().isoformat()
    _save_cache(root, data)
    print(f"Set avrae_ls_upstream.last_fetch={section['last_fetch']}", file=sys.stderr)
    print(
        "If you validated against a new avrae-ls release, bump "
        "`avrae_ls_upstream.tracked_avrae_ls_version` in .cursor/reference-cache.json",
        file=sys.stderr,
    )


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.strip())
    ap.add_argument(
        "target",
        choices=("avrae-rst", "avrae-ls"),
        help="Which cache block in reference-cache.json to refresh",
    )
    ap.add_argument("--root", type=Path, default=None, help="Repository root (default: auto-detect)")
    args = ap.parse_args()
    root = (args.root or _repo_root()).resolve()
    if not (root / ".cursor" / "reference-cache.json").is_file():
        raise SystemExit(f"Missing {root / '.cursor' / 'reference-cache.json'}")
    if args.target == "avrae-rst":
        cmd_avrae_rst(root)
    else:
        cmd_avrae_ls(root)


if __name__ == "__main__":
    main()
