"""M4 browser check: browse, search, filters, plant page (webapp-testing skill pattern)."""
import re, subprocess, sys, urllib.request
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import SHOTS, Run, login, logout, sync_playwright, expect
BASE = sys.argv[1]; DB = sys.argv[2]; run = Run(BASE)

def sql(*statements):
    subprocess.run(["node", "--no-warnings", os.path.join(os.path.dirname(os.path.abspath(__file__)), "dbset.mjs"), DB, *statements], check=True)

def card_names(page):
    return [h.inner_text() for h in page.get_by_role("list", name="Available plants").get_by_role("heading").all()]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 1000})

    def visitor_sees_nine():
        page.goto(f"{BASE}/"); page.wait_for_load_state("networkidle")
        names = card_names(page)
        assert names == ["Sunflower", "Lavender", "Spider plant", "Snake plant", "Cherry tomato", "Monstera", "Aloe vera", "Basil", "Golden pothos"], names
        expect(page.get_by_text("9 plants")).to_be_visible()
        page.screenshot(path=f"{SHOTS}/m4-browse.png", full_page=True)
    run.check("AC-NFR-4 / REQ-BROWSE-1: a visitor sees the nine seeded plants, newest first", visitor_sees_nine)

    def done_when():
        page.get_by_label("Search by name").fill("plant")
        page.get_by_label("Plant type").select_option("HOUSEPLANT")
        page.get_by_label("Form").select_option("POTTED")
        page.get_by_label("City").select_option("Raleigh")
        page.get_by_role("button", name="Search").click()
        page.wait_for_url(re.compile(r"\?.*q=plant"))
        page.wait_for_load_state("networkidle")
        assert card_names(page) == ["Snake plant"], card_names(page)
        url = page.url
        page.reload(); page.wait_for_load_state("networkidle")
        assert card_names(page) == ["Snake plant"]
        expect(page.get_by_label("Search by name")).to_have_value("plant")
        expect(page.get_by_label("City")).to_have_value("Raleigh")
        expect(page.get_by_label("Form")).to_have_value("POTTED")
        assert page.url == url
    run.check("AC-BROWSE-3 / M4 done-when: search 'plant' + Houseplant + Potted plant + Raleigh finds only Snake plant, and survives a reload", done_when)

    def search_cases():
        for q, want in [("monstera", ["Monstera"]), ("PLANT", ["Spider plant", "Snake plant"]), ("ocimum", ["Basil"])]:
            page.goto(f"{BASE}/?q={q}"); page.wait_for_load_state("networkidle")
            assert card_names(page) == want, (q, card_names(page))
    run.check("AC-BROWSE-2: search matches common or botanical names, ignoring case", search_cases)

    def nothing_matches():
        page.goto(f"{BASE}/?q=zzzz"); page.wait_for_load_state("networkidle")
        expect(page.get_by_text("No plants match your search.")).to_be_visible()
        page.get_by_role("link", name="Clear search and filters").click()
        page.wait_for_url(f"{BASE}/"); page.wait_for_load_state("networkidle")
        assert len(card_names(page)) == 9
        page.goto(f"{BASE}/?q=zzzz"); page.screenshot(path=f"{SHOTS}/m4-empty.png", full_page=True)
    run.check("AC-BROWSE-4: no match says so and offers a link that clears the search", nothing_matches)

    def city_filter():
        page.goto(f"{BASE}/"); page.wait_for_load_state("networkidle")
        options = page.get_by_label("City").locator("option").all_inner_texts()
        assert options == ["Any city", "Charlotte", "Durham", "Raleigh"], options
        page.goto(f"{BASE}/?city=Durham"); page.wait_for_load_state("networkidle")
        assert card_names(page) == ["Sunflower", "Lavender", "Spider plant"], card_names(page)
    run.check("AC-BROWSE-8: the city filter offers Charlotte, Durham, Raleigh; Durham lists Chidi's three plants", city_filter)

    def plant_page_hides_email():
        page.goto(f"{BASE}/"); page.wait_for_load_state("networkidle")
        page.get_by_role("link", name="Monstera", exact=True).click(); page.wait_for_url(re.compile(r"/plants/"))
        page.wait_for_load_state("networkidle")
        for text in ["Monstera deliciosa", "Houseplant", "Cutting", "Available", "Ben, Raleigh", "Listed"]:
            expect(page.get_by_text(text, exact=False).first).to_be_visible()
        html = urllib.request.urlopen(page.url).read().decode()
        assert "ben@example.com" not in html
        assert "ben@example.com" not in page.content()
        page.screenshot(path=f"{SHOTS}/m4-plant-page.png", full_page=True)
    run.check("AC-BROWSE-5: Monstera's page shows its details, Ben and Raleigh, and never Ben's email", plant_page_hides_email)

    def own_plants_marked():
        login(page, BASE, "alice@example.com")
        pothos = page.get_by_role("list", name="Available plants").get_by_role("listitem").filter(has=page.get_by_role("heading", name="Golden pothos"))
        expect(pothos.get_by_text("Your plant")).to_be_visible()
        monstera = page.get_by_role("list", name="Available plants").get_by_role("listitem").filter(has=page.get_by_role("heading", name="Monstera"))
        expect(monstera.get_by_text("Your plant")).to_have_count(0)
        logout(page, BASE)
    run.check("AC-BROWSE-6: Alice's Golden pothos carries a 'Your plant' badge; Ben's Monstera does not", own_plants_marked)

    def unavailable_pages():
        page.goto(f"{BASE}/"); page.wait_for_load_state("networkidle")
        page.get_by_role("link", name="Monstera", exact=True).click(); page.wait_for_url(re.compile(r"/plants/"))
        monstera_url = page.url
        page.goto(f"{BASE}/"); page.get_by_role("link", name="Aloe vera", exact=True).click(); page.wait_for_url(re.compile(r"/plants/"))
        aloe_url = page.url
        sql("UPDATE plants SET status='RESERVED' WHERE commonName IN ('Monstera','Golden pothos')",
            "UPDATE plants SET status='REMOVED' WHERE commonName='Aloe vera'")
        page.goto(monstera_url); page.wait_for_load_state("networkidle")
        expect(page.get_by_text("Reserved", exact=True)).to_be_visible()
        page.goto(aloe_url); page.wait_for_load_state("networkidle")
        expect(page.get_by_role("heading", level=1)).to_have_text("Plant not found")
        page.goto(f"{BASE}/"); page.wait_for_load_state("networkidle")
        assert card_names(page) == ["Sunflower", "Lavender", "Spider plant", "Snake plant", "Cherry tomato", "Basil"], card_names(page)
    run.check("AC-BROWSE-7 / AC-BROWSE-1: a reserved plant shows Reserved; a removed one is not found; the list shows the other six", unavailable_pages)

    def narrow():
        pg = browser.new_page(viewport={"width": 360, "height": 800})
        pg.goto(f"{BASE}/"); pg.wait_for_load_state("networkidle")
        sw = pg.evaluate("document.documentElement.scrollWidth"); assert sw <= 360, f"scrollWidth {sw}"
        pg.screenshot(path=f"{SHOTS}/m4-browse-360.png", full_page=False)
    run.check("AC-NFR-1 (early look): browse fits 360 px", narrow)
    browser.close()
sys.exit(run.report())
