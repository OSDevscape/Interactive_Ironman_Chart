IRON EDITION

Replace index.html, styles.css, script.js and README.txt in your existing project.
Keep your existing assets folder unchanged:
  assets/ironman-helm.png
  assets/hardcore-ironman-helm.png

Open index.html in SPCK preview or serve on a static host. No build step.

Features: original main progression, optional retirement sequence, skill-level
and Slayer-reward filters, optional item labels, centered tile rows, completion
tracking, next incomplete navigation, local theme-specific helmet artwork,
silver/black dark mode, light parchment/oxblood theme, header settings dropdown,
and item dialog with close button, Escape, and outside-tap dismissal.

Progress uses ladlor-iron-edition-v1. Preferences use ladlor-iron-options-v1.
Storage is browser/origin-specific; use the same project origin to retain saves.
Search/status filters do not affect progress totals. Category filters do.
Hidden-item completion remains saved. No original-site save import or cloud sync.

Internet required for chart data and item artwork. Header helmets are local.
Remote data source: https://github.com/Madssb/InteractiveGearProg (main)
  data/logic/milestone-sequence-main.json
  data/logic/milestone-sequence-retirement.json
  data/generated/milestone-metadata.json
Images use metadata paths resolved against https://ladlorchart.com/.
Unavailable images fall back to item names. Data is not bundled or pinned.

Redesign by OSDevscape. Original chart by Ladlor and the Ironscape community.
Original repository copyright (c) 2025 Mads S. Balto, MIT license.
OSRS Wiki artwork separately CC BY-NC-SA 3.0:
https://oldschool.runescape.wiki/
https://creativecommons.org/licenses/by-nc-sa/3.0/
Preserve source/license attribution and observe artwork license requirements.
Not affiliated with Jagex. New renderer; chart builder and alternate charts not included.
Browser testing has not been performed in this environment.
