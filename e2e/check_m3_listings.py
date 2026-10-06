"""M3 browser check: plant listings (webapp-testing skill pattern)."""
import re, sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import SHOTS, Run, login, logout, sync_playwright, expect
BASE = sys.argv[1]; run = Run(BASE)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    login(page, BASE, "alice@example.com")

    def invalid_listing():
        page.goto(f"{BASE}/plants/new"); page.wait_for_load_state("networkidle")
        page.get_by_label("Common name").fill("Peace lily")
        page.get_by_label("Botanical name (optional)").fill("Spathiphyllum wallisii")
        page.get_by_role("button", name="List this plant").click()
        expect(page.get_by_text("Choose a plant type from the list.")).to_be_visible()
        expect(page.get_by_text("Choose a form from the list.")).to_be_visible()
        expect(page.get_by_text("Confirm that the plant shows no visible pests or disease.")).to_be_visible()
        expect(page.get_by_label("Common name")).to_have_value("Peace lily")
        expect(page.get_by_label("Botanical name (optional)")).to_have_value("Spathiphyllum wallisii")
        page.screenshot(path=f"{SHOTS}/m3-new-errors.png", full_page=True)
    run.check("AC-PLANT-2: a listing missing type, form and health confirmation shows those errors and keeps the names", invalid_listing)

    def list_peace_lily():
        page.get_by_label("Plant type").select_option("HOUSEPLANT")
        page.get_by_label("Potted plant").check()
        page.get_by_label("No visible pests or disease").check()
        page.get_by_role("button", name="List this plant").click()
        page.wait_for_url(re.compile(r"/plants/[0-9a-f-]+$"))
        expect(page.get_by_role("heading", level=1)).to_have_text("Peace lily")
        expect(page.get_by_text("Your plant")).to_be_visible()
        page.screenshot(path=f"{SHOTS}/m3-plant-page.png", full_page=True)
        page.goto(f"{BASE}/shelf"); page.wait_for_load_state("networkidle")
        first = page.get_by_role("list", name="Your plants").get_by_role("listitem").first
        expect(first.get_by_role("heading")).to_have_text("Peace lily")
        expect(first.get_by_text("Available")).to_be_visible()
        page.screenshot(path=f"{SHOTS}/m3-shelf.png", full_page=True)
    run.check("AC-PLANT-1 / M3 done-when: Alice lists Peace lily, lands on its page, and it is first on her shelf", list_peace_lily)

    def edit_basil():
        page.get_by_role("link", name="Edit Basil").click(); page.wait_for_url(re.compile(r"/edit$"))
        page.get_by_label("Potted plant").check()
        page.get_by_role("button", name="Save changes").click()
        expect(page.get_by_text("Confirm that the plant shows no visible pests or disease.")).to_be_visible()
        page.get_by_label("Potted plant").check()
        page.get_by_label("No visible pests or disease").check()
        page.get_by_role("button", name="Save changes").click()
        page.wait_for_url(re.compile(r"/plants/[0-9a-f-]+$"))
        expect(page.locator("dd", has_text="Potted plant")).to_be_visible()
    run.check("AC-PLANT-3 / M3 done-when: Alice edits Basil; without the health confirmation it is refused first", edit_basil)

    def remove_aloe():
        page.goto(f"{BASE}/shelf"); page.wait_for_load_state("networkidle")
        page.get_by_role("link", name="Edit Aloe vera").click(); page.wait_for_url(re.compile(r"/edit$"))
        aloe_url = page.url.replace("/edit", "")
        page.get_by_role("button", name="Remove plant").click()
        page.get_by_role("button", name="Yes, remove it").click()
        page.wait_for_url(f"{BASE}/shelf")
        expect(page.get_by_role("heading", name="Aloe vera")).to_have_count(0)
        page.goto(aloe_url); page.wait_for_load_state("networkidle")
        expect(page.get_by_role("heading", level=1)).to_have_text("Plant not found")
    run.check("AC-PLANT-6 / M3 done-when: Alice removes Aloe vera after confirming; its page reports not found", remove_aloe)

    def ben_cannot_edit():
        page.goto(f"{BASE}/shelf"); page.wait_for_load_state("networkidle")
        page.get_by_role("link", name="Edit Golden pothos").click(); page.wait_for_url(re.compile(r"/edit$"))
        edit_url = page.url
        logout(page, BASE); login(page, BASE, "ben@example.com")
        page.goto(edit_url); page.wait_for_load_state("networkidle")
        expect(page.locator("main [role=alert]")).to_have_text("Only the owner can edit this plant.")
        expect(page.get_by_role("button", name="Save changes")).to_have_count(0)
    run.check("AC-PLANT-4 / M3 done-when: Ben opening the edit page of Alice's Golden pothos sees that only the owner can edit it", ben_cannot_edit)

    def narrow():
        pg = browser.new_page(viewport={"width": 360, "height": 800})
        login(pg, BASE, "alice@example.com")
        for path in ["/shelf", "/plants/new"]:
            pg.goto(f"{BASE}{path}"); pg.wait_for_load_state("networkidle")
            sw = pg.evaluate("document.documentElement.scrollWidth"); assert sw <= 360, f"{path} scrollWidth {sw}"
        pg.goto(f"{BASE}/shelf"); pg.wait_for_load_state("networkidle"); pg.screenshot(path=f"{SHOTS}/m3-shelf-360.png", full_page=True)
    run.check("AC-NFR-1 (early look): shelf and the listing form fit 360 px", narrow)
    browser.close()
sys.exit(run.report())
