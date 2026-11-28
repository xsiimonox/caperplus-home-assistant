# Aquarium Designsprache 0.2.0

Türkiser Akzent, helle und dunkle Palette, 16-Pixel-Kartenradien und mindestens 44 Pixel hohe Standardbedienelemente. Die Gestaltung ist lokal in die Panelquelle eingebettet. Geräteprotokolle und Aktionshandler bleiben unverändert.

`studio.css` und `tokens.json` sind die mitgelieferten Designquellen. `python3 tools/validate_design.py` prüft die Übereinstimmung mit der eingebetteten Panelquelle. HA gibt den Theme-Modus vor; eigenständige ESP-Oberflächen folgen dem Browser. Bei Änderungen am gemeinsamen Editor auch die zugehörige Bridge neu bauen und versionieren.
