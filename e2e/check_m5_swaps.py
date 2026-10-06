"""M5 browser check: the full swap between two members in separate browser sessions (webapp-testing pattern)."""
import re, sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import SHOTS, Run, sync_playwright, expect
BASE = sys.argv[1]; run = Run(BASE)

def session(browser, email):
    ctx = browser.new_context(viewport={"width": 1200, "height": 1000}); page = ctx.new_page()
    page.goto(f"{BASE}/login"); page.wait_for_load_state("networkidle")
    page.get_by_label("Email").fill(email); page.get_by_label("Password").fill("grow-together-1")
    page.get_by_role("button", name="Log in").click(); page.wait_for_url(f"{BASE}/")
    return page

def open_plant(page, name):
    page.goto(f"{BASE}/"); page.wait_for_load_state("networkidle")
    page.get_by_role("link", name=name, exact=True).click(); page.wait_for_url(re.compile(r"/plants/[0-9a-f-]+$"))
    page.wait_for_load_state("networkidle")

def offer(page, requested, offered, message=""):
    open_plant(page, requested)
    select = page.get_by_label("Your plant to offer")
    label = next(t for t in select.locator("option").all_inner_texts() if t.startswith(offered))
    select.select_option(label=label)
    if message: page.get_by_label("Message (optional)").fill(message)
    page.get_by_role("button", name="Request swap").click()

def card(page, section, title_part):
    return page.get_by_role("region", name=section).get_by_role("listitem").filter(has_text=title_part)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    alice, ben, chidi = (session(browser, f"{n}@example.com") for n in ("alice", "ben", "chidi"))

    def chidi_offers():
        offer(chidi, "Monstera", "Sunflower"); chidi.wait_for_url(f"{BASE}/swaps")
    run.check("AC-SWAP-6 setup: Chidi offers Sunflower for Monstera", chidi_offers)

    def alice_offers():
        offer(alice, "Monstera", "Golden pothos", "Happy to meet at the farmers market"); alice.wait_for_url(f"{BASE}/swaps")
        c = card(alice, "Outgoing", "Ben's Monstera for your Golden pothos")
        expect(c).to_have_count(1)
        expect(c.get_by_text("Pending")).to_be_visible()
        expect(c.get_by_text("Happy to meet at the farmers market")).to_be_visible()
        expect(c.get_by_role("button", name=re.compile("^Cancel swap"))).to_be_visible()
        expect(c.get_by_role("button", name=re.compile("^Accept"))).to_have_count(0)
        offer(alice, "Lavender", "Golden pothos"); alice.wait_for_url(f"{BASE}/swaps")
        alice.screenshot(path=f"{SHOTS}/m5-alice-outgoing.png", full_page=True)
    run.check("AC-SWAP-1: Alice's offer appears under Outgoing with both plants, the message and only Cancel", alice_offers)

    def duplicate():
        offer(alice, "Monstera", "Basil")
        expect(alice.locator("main [role=alert]")).to_contain_text("already have a pending request")
    run.check("AC-SWAP-3: a second pending offer for Monstera is refused with a reason", duplicate)

    def ben_accepts():
        ben.goto(f"{BASE}/swaps"); ben.wait_for_load_state("networkidle")
        mine = card(ben, "Incoming", "Alice's Golden pothos for your Monstera")
        expect(mine.get_by_role("button", name=re.compile("^Accept"))).to_be_visible()
        expect(mine.get_by_role("button", name=re.compile("^Decline"))).to_be_visible()
        assert "alice@example.com" not in ben.content()
        ben.screenshot(path=f"{SHOTS}/m5-ben-incoming.png", full_page=True)
        mine.get_by_role("button", name=re.compile("^Accept")).click()
        expect(mine.get_by_text("Accepted", exact=True)).to_be_visible()
        expect(mine.get_by_role("link", name="alice@example.com")).to_be_visible()
        expect(card(ben, "Incoming", "Chidi's Sunflower for your Monstera").get_by_text("Cancelled", exact=True)).to_be_visible()
        ben.screenshot(path=f"{SHOTS}/m5-ben-accepted.png", full_page=True)
    run.check("AC-SWAP-6/12 / M5 done-when: Ben accepts; Alice's email appears; Chidi's competing offer is cancelled", ben_accepts)

    def chidi_sees_cancelled():
        chidi.goto(f"{BASE}/swaps"); chidi.wait_for_load_state("networkidle")
        expect(card(chidi, "Outgoing", "Ben's Monstera for your Sunflower").get_by_text("Cancelled", exact=True)).to_be_visible()
        html = chidi.content()
        assert "Golden pothos for your Monstera" not in html and "Monstera for your Golden pothos" not in html, "Alice and Ben's swap is visible to Chidi"
        assert "alice@example.com" not in html and "ben@example.com" not in html, "an email is visible to Chidi"
    run.check("AC-SWAP-6/13: Chidi sees his offer cancelled, no emails, and never sees Alice's swap", chidi_sees_cancelled)

    def alice_completes():
        alice.goto(f"{BASE}/swaps"); alice.wait_for_load_state("networkidle")
        c = card(alice, "Outgoing", "Ben's Monstera for your Golden pothos")
        expect(c.get_by_role("link", name="ben@example.com")).to_be_visible()
        expect(card(alice, "Outgoing", "Chidi's Lavender for your Golden pothos").get_by_text("Cancelled", exact=True)).to_be_visible()
        c.get_by_role("button", name=re.compile("^Mark completed")).click()
        expect(c.get_by_text("Completed", exact=True)).to_be_visible()
        expect(c.get_by_role("button")).to_have_count(0)
        expect(c.get_by_role("link", name="ben@example.com")).to_be_visible()
    run.check("AC-SWAP-10/12 / M5 done-when: Alice marks the swap completed; Ben's email stays; no actions remain", alice_completes)

    def after_completion():
        ben.goto(f"{BASE}/swaps"); ben.wait_for_load_state("networkidle")
        expect(card(ben, "Incoming", "Alice's Golden pothos for your Monstera").get_by_text("Completed", exact=True)).to_be_visible()
        ben.goto(f"{BASE}/"); ben.wait_for_load_state("networkidle")
        names = [h.inner_text() for h in ben.get_by_role("list", name="Available plants").get_by_role("heading").all()]
        assert "Monstera" not in names and "Golden pothos" not in names, names
        alice.goto(f"{BASE}/shelf"); alice.wait_for_load_state("networkidle")
        expect(alice.get_by_role("listitem").filter(has_text="Golden pothos").get_by_text("Swapped", exact=True)).to_be_visible()
    run.check("AC-SWAP-10: both plants leave the browse list and show as Swapped on the shelf", after_completion)

    def nothing_to_offer_and_visitor():
        dana_ctx = browser.new_context(); dana = dana_ctx.new_page()
        dana.goto(f"{BASE}/register"); dana.wait_for_load_state("networkidle")
        dana.get_by_label("Display name").fill("Dana"); dana.get_by_label("Email").fill("dana@example.com")
        dana.get_by_label("City").fill("Asheville"); dana.get_by_label("Password").fill("correct-horse-1")
        dana.get_by_role("button", name="Create account").click(); dana.wait_for_url(f"{BASE}/shelf")
        open_plant(dana, "Snake plant")
        expect(dana.get_by_text("You need an available plant of your own to offer in return.")).to_be_visible()
        expect(dana.get_by_role("link", name="List a plant", exact=True).last).to_have_attribute("href", "/plants/new")
        visitor = browser.new_context().new_page()
        open_plant(visitor, "Snake plant"); snake = visitor.url
        visitor.get_by_role("link", name="Log in to offer a swap").click(); visitor.wait_for_url(re.compile(r"/login\?next="))
        visitor.get_by_label("Email").fill("chidi@example.com"); visitor.get_by_label("Password").fill("grow-together-1")
        visitor.get_by_role("button", name="Log in").click(); visitor.wait_for_url(snake)
        expect(visitor.get_by_label("Your plant to offer")).to_be_visible()
    run.check("AC-SWAP-4 / F4: Dana with no plants sees why and a link to list one; a visitor logs in and returns to the plant", nothing_to_offer_and_visitor)
    browser.close()
sys.exit(run.report())
