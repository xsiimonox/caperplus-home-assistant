#!/usr/bin/env python3
"""Validate the locally shipped Aquarium design without HA or device access."""
import ast
import json
from pathlib import Path
import re
ROOT = Path(__file__).resolve().parents[1]
metadata = json.loads((ROOT / "design/module.json").read_text())
css = (ROOT / "design/studio.css").read_text()
for rel in metadata["panels"]:
    source = (ROOT / rel).read_text()
    match = re.search(r'const AQUARIUM_DESIGN_CSS = ("(?:\\.|[^"\\])*");', source)
    assert match and json.loads(match.group(1)) == css, "Embedded design differs from shipped source"
    assert "data-aquarium-theme" in source
for file in (ROOT / "custom_components").rglob("*.py"):
    ast.parse(file.read_text(), filename=str(file))
print("Aquarium design " + metadata["version"] + ": embedded CSS and Python syntax valid")
