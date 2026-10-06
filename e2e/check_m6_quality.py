"""M6 checks: AC-NFR-1 (360 px, every page) and AC-NFR-2 (keyboard only, focus visible, labels)."""
import re, sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import SHOTS, Run, sync_playwright, expect
BASE = sys.argv[1]; run = Run(BASE)

LABEL_AUDIT = """() => {
  const fields = [...document.querySelectorAll('main input:not([type=hidden]), main select, main textarea')];
  return fields.filter(f => {
    const byFor = f.id && document.querySelector(`label[for="${f.id}"]`);
    const wrapped = f.closest('label');
    return !(byFor || wrapped);
  }).map(f => f.name || f.id || f.outerHTML.slice(0, 60));
}"""

FOCUS_STYLE = """() => { const el = document.activeElement; if (!el || el === document.body) return null;
  const s = getComputedStyle(el); return {tag: el.tagName, text: (el.innerText||el.value||el.name||'').slice(0,40), outline: s.outlineStyle, width: s.outlineWidth}; }"""

def login(page, email):
    page.goto(f"{BASE}/login"); page.wait_for_load_state("networkidle")
    page.get_by_label("Email").fill(email); page.get_by_label("Password").fill("grow-together-1")
    page.get_by_role("button", name="Log in").click(); page.wait_for_url(f"{BASE}/")

def tab_to(page, predicate, limit=60):
    """Press Tab until the focused element matches; check every stop has a visible outline."""
    for _ in range(limit):
        page.keyboard.press("Tab")
        info = page.evaluate(FOCUS_STYLE)
        if info is None: continue
        assert info["outline"] not in ("none", "") and info["width"] not in ("0px",), f"no visible focus on {info}"
        if predicate(info): return info
    raise AssertionError("never reached the target with Tab")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    def every_page_360():
        ctx = browser.new_context(viewport={"width": 360, "height": 780}); page = ctx.new_page()
        page.goto(f"{BASE}/"); page.wait_for_load_state("networkidle")
        page.get_by_role("link", name="Monstera", exact=True).click(); page.wait_for_url(re.compile(r"/plants/"))
        plant = page.url
        login(page, "alice@example.com")
        page.goto(f"{BASE}/shelf"); page.wait_for_load_state("networkidle")
        page.get_by_role("link", name="Edit Basil").click(); page.wait_for_url(re.compile(r"/edit$"))
        edit = page.url
        too_wide, unlabeled = [], []
        for path in ["/", plant, "/plants/new", edit, "/shelf", "/swaps"]:
            page.goto(path if path.startswith("http") else f"{BASE}{path}"); page.wait_for_load_state("networkidle")
            w = page.evaluate("document.documentElement.scrollWidth")
            if w > 360: too_wide.append((path, w))
            unlabeled += [(path, f) for f in page.evaluate(LABEL_AUDIT)]
            page.screenshot(path=f"{SHOTS}/m6-360{path.split(BASE)[-1].replace('/', '_') or '_home'}.png", full_page=True)
        ctx2 = browser.new_context(viewport={"width": 360, "height": 780}); pg = ctx2.new_page()
        for path in ["/register", "/login"]:
            pg.goto(f"{BASE}{path}"); pg.wait_for_load_state("networkidle")
            w = pg.evaluate("document.documentElement.scrollWidth")
            if w > 360: too_wide.append((path, w))
            unlabeled += [(path, f) for f in pg.evaluate(LABEL_AUDIT)]
        assert not too_wide, f"horizontal scroll: {too_wide}"
        assert not unlabeled, f"fields without a visible label: {unlabeled}"
    run.check("AC-NFR-1 / AC-NFR-2 labels: all 8 screens fit 360 px and every field has a visible label", every_page_360)

    def keyboard_flow():
        ctx = browser.new_context(viewport={"width": 1200, "height": 900}); page = ctx.new_page()
        # 1. register with the keyboard only
        page.goto(f"{BASE}/register"); page.wait_for_load_state("networkidle")
        tab_to(page, lambda i: i["tag"] == "INPUT")  # skip link, header links, then the first field
        page.keyboard.type("Erin"); page.keyboard.press("Tab")
        page.keyboard.type("erin@example.com"); page.keyboard.press("Tab")
        page.keyboard.type("Raleigh"); page.keyboard.press("Tab")
        page.keyboard.type("correct-horse-1"); page.keyboard.press("Enter")
        page.wait_for_url(f"{BASE}/shelf")
        # 2. list a plant with the keyboard only
        page.goto(f"{BASE}/plants/new"); page.wait_for_load_state("networkidle")
        tab_to(page, lambda i: i["tag"] == "INPUT")
        page.keyboard.type("Mint"); page.keyboard.press("Tab"); page.keyboard.press("Tab")       # botanical name left empty
        page.keyboard.press("ArrowDown"); page.keyboard.press("ArrowDown"); page.keyboard.press("ArrowDown")  # plant type: Herb
        page.keyboard.press("Tab"); page.keyboard.press("Space")                                # form: Cutting
        page.keyboard.press("Tab"); page.keyboard.press("Tab"); page.keyboard.press("Space")   # skip description, tick health
        tab_to(page, lambda i: i["text"].startswith("List this plant")); page.keyboard.press("Enter")
        page.wait_for_url(re.compile(r"/plants/[0-9a-f-]+$")); page.wait_for_load_state("networkidle")
        expect(page.get_by_role("heading", level=1)).to_have_text("Mint")
        expect(page.locator("dd", has_text="Herb")).to_be_visible()
        # 3. request a swap with the keyboard only
        page.goto(f"{BASE}/"); page.wait_for_load_state("networkidle")
        tab_to(page, lambda i: i["text"] == "Monstera"); page.keyboard.press("Enter")
        page.wait_for_url(re.compile(r"/plants/")); page.wait_for_load_state("networkidle")
        tab_to(page, lambda i: i["tag"] == "SELECT"); page.keyboard.press("ArrowDown")
        tab_to(page, lambda i: i["text"].startswith("Request swap")); page.keyboard.press("Enter")
        page.wait_for_url(f"{BASE}/swaps")
        # 4. Ben accepts with the keyboard only
        ben = browser.new_context(viewport={"width": 1200, "height": 900}).new_page()
        login(ben, "ben@example.com"); ben.goto(f"{BASE}/swaps"); ben.wait_for_load_state("networkidle")
        tab_to(ben, lambda i: i["tag"] == "BUTTON" and i["text"] == "Accept"); ben.keyboard.press("Enter")
        expect(ben.get_by_role("listitem").filter(has_text="Erin's Mint for your Monstera").get_by_text("Accepted", exact=True)).to_be_visible()
    run.check("AC-NFR-2: register, list a plant, request a swap and accept it with the keyboard only; focus always visible", keyboard_flow)
    browser.close()
sys.exit(run.report())
