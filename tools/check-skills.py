#!/usr/bin/env python3
# Source: engineering-standards v1.0.0 tools/check_skills.py
"""check-skills: validate an agent skill catalog (ecosystem 15.1 and 15.5).

  python3 tools/check_skills.py --skills .agents/skills --claude-links .claude/skills
  python3 tools/check_skills.py --skills harness/skills            # this repository's catalog

Per skill directory:
  SKILL.md frontmatter: name == directory (lowercase, digits, hyphens, at most 64 chars);
    description at most 1024 chars containing "Use when" and "Not for" (or "Do not use for");
    metadata.owner, metadata.last-reviewed (YYYY-MM-DD, not older than --max-age-days),
    metadata.version; body at most 500 lines (warning above 150). A stale skill is a warning on PRs
    and an error with --strict-staleness (monthly scheduled check).
  evals/triggers.json: at least 10 queries, at least 3 positive and 3 negative, each with a
    train/validation split, validation share between 30% and 50%.
  evals/evals.json: at least 3 output evals, each with a prompt and non-empty assertions.
With --claude-links, every skill must have `.claude/skills/<name>` as a relative symlink to
`../../.agents/skills/<name>`, and no link may dangle. Exit 1 on errors. Stdlib only.
"""
from __future__ import annotations

import argparse
import datetime
import json
import os
import pathlib
import re
import sys

NAME_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")


def parse_frontmatter(text: str) -> tuple[dict, str]:
    """Minimal YAML subset: `key: value`, quoted strings, one level of nested mappings."""
    if not text.startswith("---\n"):
        raise ValueError("SKILL.md must start with a --- frontmatter block")
    end = text.find("\n---\n", 4)
    if end == -1:
        raise ValueError("frontmatter is not closed with ---")
    data: dict = {}
    parent = None
    for raw in text[4:end].splitlines():
        if not raw.strip() or raw.lstrip().startswith("#"):
            continue
        m = re.match(r"^(\s*)([A-Za-z0-9_-]+):\s*(.*)$", raw)
        if not m:
            raise ValueError(f"cannot parse frontmatter line: {raw!r}")
        indent, key, value = m.groups()
        value = value.strip()
        if value[:1] in "\"'" and value[-1:] == value[:1] and len(value) >= 2:
            value = json.loads(value) if value[0] == '"' else value[1:-1]
        if indent and parent is not None:
            data[parent][key] = value
        elif value == "":
            data[key], parent = {}, key
        else:
            data[key], parent = value, None
    return data, text[end + 5:]


def check_skill(sd: pathlib.Path, today: datetime.date, max_age: int,
                strict_staleness: bool = False) -> tuple[list[str], list[str]]:
    errors, warnings = [], []
    name = sd.name
    skill_md = sd / "SKILL.md"
    if not skill_md.is_file():
        return [f"{name}: SKILL.md missing"], warnings
    try:
        meta, body = parse_frontmatter(skill_md.read_text(encoding="utf-8"))
    except ValueError as exc:
        return [f"{name}: {exc}"], warnings
    if meta.get("name") != name:
        errors.append(f"{name}: frontmatter name {meta.get('name')!r} must equal the directory name")
    if not NAME_RE.match(name) or len(name) > 64:
        errors.append(f"{name}: name must be lowercase letters, digits and hyphens, at most 64 chars")
    desc = str(meta.get("description", ""))
    if not desc or len(desc) > 1024:
        errors.append(f"{name}: description must be 1-1024 characters (has {len(desc)})")
    if "Use when" not in desc:
        errors.append(f"{name}: description must say \"Use when ...\" (key trigger first)")
    if "Not for" not in desc and "Do not use for" not in desc:
        errors.append(f"{name}: description must say \"Not for ...\"")
    md = meta.get("metadata") if isinstance(meta.get("metadata"), dict) else {}
    for key in ("owner", "last-reviewed", "version"):
        if not md.get(key):
            errors.append(f"{name}: metadata.{key} missing")
    try:
        reviewed = datetime.date.fromisoformat(str(md.get("last-reviewed", "")))
        if reviewed > today:
            errors.append(f"{name}: last-reviewed {reviewed} is in the future")
        elif (today - reviewed).days > max_age:
            msg = f"{name}: last-reviewed {reviewed} is older than {max_age} days (review the skill)"
            (errors if strict_staleness else warnings).append(msg)
    except ValueError:
        if md.get("last-reviewed"):
            errors.append(f"{name}: metadata.last-reviewed must be YYYY-MM-DD")
    lines = body.count("\n")
    if lines > 500:
        errors.append(f"{name}: body has {lines} lines (hard cap 500)")
    elif lines > 150:
        warnings.append(f"{name}: body has {lines} lines (typical < 150)")
    if re.search(r"(?i)(api[_-]?key|secret|token)\s*[:=]\s*['\"]?[A-Za-z0-9_\-]{24,}", body):
        errors.append(f"{name}: body looks like it contains a secret")

    trig = sd / "evals" / "triggers.json"
    try:
        queries = json.loads(trig.read_text(encoding="utf-8"))["queries"]
        pos = [q for q in queries if q.get("should_trigger") is True]
        neg = [q for q in queries if q.get("should_trigger") is False]
        val = [q for q in queries if q.get("split") == "validation"]
        if len(queries) < 10:
            errors.append(f"{name}: triggers.json needs at least 10 queries (has {len(queries)})")
        if len(pos) < 3 or len(neg) < 3:
            errors.append(f"{name}: triggers.json needs at least 3 positive and 3 negative queries")
        if any(q.get("split") not in ("train", "validation") or not q.get("query") for q in queries):
            errors.append(f"{name}: every trigger query needs a query and split train|validation")
        if queries and not 0.3 <= len(val) / len(queries) <= 0.5:
            errors.append(f"{name}: validation share must be 30-50% (60/40 split)")
    except (OSError, ValueError, KeyError, TypeError) as exc:
        errors.append(f"{name}: evals/triggers.json invalid ({exc})")
    out = sd / "evals" / "evals.json"
    try:
        evals = json.loads(out.read_text(encoding="utf-8"))["evals"]
        if len(evals) < 3:
            errors.append(f"{name}: evals.json needs at least 3 output evals")
        if any(not e.get("prompt") or not e.get("assertions") for e in evals):
            errors.append(f"{name}: every output eval needs a prompt and assertions")
    except (OSError, ValueError, KeyError, TypeError) as exc:
        errors.append(f"{name}: evals/evals.json invalid ({exc})")
    return errors, warnings


def check_links(skills: pathlib.Path, links: pathlib.Path) -> list[str]:
    errors = []
    names = {p.name for p in skills.iterdir() if p.is_dir()}
    for name in sorted(names):
        link = links / name
        expected = f"../../.agents/skills/{name}" if skills.parent.name == ".agents" else None
        if not link.is_symlink():
            errors.append(f"{link}: must be a relative symlink to the canonical skill")
            continue
        target = os.readlink(link)
        if os.path.isabs(target) or (expected and target.rstrip("/") != expected):
            errors.append(f"{link}: points to {target!r}, expected {expected or 'a relative path'}")
        elif not link.resolve().is_dir():
            errors.append(f"{link}: dangling symlink")
    if links.is_dir():
        for extra in links.iterdir():
            if extra.name not in names and extra.is_symlink():
                errors.append(f"{extra}: links to a skill that does not exist in {skills}")
    return errors


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Validate an agent skill catalog.")
    parser.add_argument("--skills", type=pathlib.Path, default=pathlib.Path(".agents/skills"))
    parser.add_argument("--claude-links", type=pathlib.Path, default=None)
    parser.add_argument("--max-age-days", type=int, default=180)
    parser.add_argument("--strict-staleness", action="store_true",
                        help="stale skills are errors (use in the monthly scheduled check, not on PRs)")
    parser.add_argument("--today", default=None, help="override today's date (YYYY-MM-DD) for tests")
    args = parser.parse_args(argv)
    if not args.skills.is_dir():
        print(f"::error title=check-skills::{args.skills} is not a directory")
        return 1
    today = datetime.date.fromisoformat(args.today) if args.today else datetime.date.today()
    errors, warnings = [], []
    dirs = sorted(p for p in args.skills.iterdir() if p.is_dir())
    for sd in dirs:
        e, w = check_skill(sd, today, args.max_age_days, args.strict_staleness)
        errors += e
        warnings += w
    if args.claude_links:
        errors += check_links(args.skills, args.claude_links)
    for w in warnings:
        print(f"::warning title=check-skills::{w}")
    for e in errors:
        print(f"::error title=check-skills::{e}")
    print(f"check-skills: {len(dirs)} skill(s), {len(errors)} error(s), {len(warnings)} warning(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
