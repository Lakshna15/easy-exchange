"""Shared helpers for the browser checks (imported webapp-testing skill: Python Playwright, headless Chromium)."""
import os, re, sys
from playwright.sync_api import sync_playwright, expect

HERE = os.path.dirname(os.path.abspath(__file__))
SHOTS = os.environ.get("SHOTS", os.path.join(HERE, "screenshots"))
os.makedirs(SHOTS, exist_ok=True)


class Run:
    def __init__(self, base): self.base, self.results = base, []
    def check(self, name, fn):
        try: fn(); self.results.append(("PASS", name))
        except Exception as e:
            text = (str(e).strip().splitlines() or [repr(e)])[0]
            self.results.append(("FAIL", f"{name}: {text[:220]}"))
    def report(self):
        for s, n in self.results: print(f"{s}  {n}")
        return 0 if all(s == "PASS" for s, _ in self.results) else 1

def login(page, base, email, password="grow-together-1"):
    page.goto(f"{base}/login"); page.wait_for_load_state("networkidle")
    page.get_by_label("Email").fill(email); page.get_by_label("Password").fill(password)
    page.get_by_role("button", name="Log in").click(); page.wait_for_url(f"{base}/")

def logout(page, base):
    page.get_by_role("button", name="Log out").click(); page.wait_for_url(f"{base}/")
