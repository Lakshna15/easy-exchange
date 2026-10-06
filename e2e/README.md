# Browser checks

Scripted checks of the running app in a real browser, written with the imported `webapp-testing` skill (Python Playwright, headless Chromium). They cover the parts of the scenarios that unit tests cannot: redirects, forms keeping their input, what a page shows, three members swapping in separate sessions, 360 px layouts and keyboard-only use.

They are not part of `npm test` and Playwright is not a project dependency (`docs/specs/04-architecture.md`, "Testing").

| Script | Milestone | Scenarios |
|--------|-----------|-----------|
| `check_m2_accounts.py` | M2 | AC-AUTH-1, -4, -5, -6, -7; REQ-AUTH-6 |
| `check_m3_listings.py` | M3 | AC-PLANT-1, -2, -3, -4, -6 |
| `check_m4_browse.py` | M4 | AC-BROWSE-1 to -8, AC-NFR-4 (browse part) |
| `check_m5_swaps.py` | M5 | AC-SWAP-1, -3, -4, -6, -10, -12, -13 and the M5 "Done when" line |
| `check_m6_quality.py` | M6 | AC-NFR-1, AC-NFR-2 |

Run them all (macOS or Linux, or Git Bash on Windows):

```bash
pip install playwright && python -m playwright install chromium
bash e2e/run-all.sh
```

Each check starts from a fresh copy of the demo data in a temporary database, so your own `data/` folder is not touched. Screenshots are saved in `e2e/screenshots/` (ignored by git).
