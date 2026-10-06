"""M2 browser check (webapp-testing skill pattern). Each check names the scenario it covers."""
import re, sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import SHOTS, sync_playwright, expect

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3300"
results = []

def check(name, fn):
    try:
        fn(); results.append(("PASS", name))
    except Exception as e:  # report and continue
        results.append(("FAIL", f"{name}: {str(e).splitlines()[0][:200]}"))

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    def visitor_blocked():
        page.goto(f"{BASE}/shelf"); page.wait_for_load_state("networkidle")
        assert "/login?next=%2Fshelf" in page.url, page.url
    check("REQ-AUTH-6: a visitor opening /shelf is sent to the login page", visitor_blocked)

    def register_keeps_input():
        page.goto(f"{BASE}/register"); page.wait_for_load_state("networkidle")
        page.screenshot(path=f"{SHOTS}/m2-register.png", full_page=True)
        page.get_by_label("Display name").fill("Dana")
        page.get_by_label("Email").fill("dana@example.com")
        page.get_by_label("Password").fill("short")
        page.get_by_role("button", name="Create account").click()
        expect(page.get_by_text("Enter your city, so neighbours know where to meet.")).to_be_visible()
        expect(page.get_by_text("Use a password of 8 to 72 characters.")).to_be_visible()
        expect(page.get_by_label("Display name")).to_have_value("Dana")
        expect(page.get_by_label("Email")).to_have_value("dana@example.com")
        expect(page.get_by_label("Password")).to_have_value("")
        page.screenshot(path=f"{SHOTS}/m2-register-errors.png", full_page=True)
    check("AC-AUTH-7: registration errors show on city and password and keep name and email", register_keeps_input)

    def register_dana():
        page.get_by_label("City").fill(" Asheville ")
        page.get_by_label("Password").fill("correct-horse-1")
        page.get_by_role("button", name="Create account").click()
        page.wait_for_url(re.compile(r"/shelf$"))
        expect(page.get_by_role("navigation", name="Main").get_by_text("Dana")).to_be_visible()
        page.screenshot(path=f"{SHOTS}/m2-shelf.png", full_page=True)
    check("AC-AUTH-1: Dana registers and lands on her empty shelf, signed in", register_dana)

    def logout_then_shelf():
        page.get_by_role("button", name="Log out").click()
        page.wait_for_url(re.compile(r"/$"))
        expect(page.get_by_role("link", name="Log in")).to_be_visible()
        page.goto(f"{BASE}/shelf"); page.wait_for_load_state("networkidle")
        assert "/login" in page.url, page.url
    check("AC-AUTH-6: after logging out, /shelf sends Dana to the login page", logout_then_shelf)

    def login_failures():
        for email, pw in [("nobody@example.com", "anything-1"), ("alice@example.com", "wrong-password")]:
            page.goto(f"{BASE}/login"); page.wait_for_load_state("networkidle")
            page.get_by_label("Email").fill(email); page.get_by_label("Password").fill(pw)
            page.get_by_role("button", name="Log in").click()
            expect(page.locator("main [role=alert]")).to_have_text("Email or password is incorrect.")
            expect(page.get_by_label("Email")).to_have_value(email)
    check("AC-AUTH-4: unknown email and wrong password show the same message", login_failures)

    def login_returns():
        page.goto(f"{BASE}/shelf"); page.wait_for_load_state("networkidle")
        page.get_by_label("Email").fill("dana@example.com"); page.get_by_label("Password").fill("correct-horse-1")
        page.get_by_role("button", name="Log in").click()
        page.wait_for_url(re.compile(r"/shelf$"))
    check("AC-AUTH-5 / M2 done-when: Dana logs back in and returns to /shelf", login_returns)

    def evil_return():
        ctx = browser.new_context(); pg = ctx.new_page()
        for bad in ["https://evil.example", "//evil.example"]:
            pg.goto(f"{BASE}/login?next={bad}"); pg.wait_for_load_state("networkidle")
            pg.get_by_label("Email").fill("alice@example.com"); pg.get_by_label("Password").fill("grow-together-1")
            pg.get_by_role("button", name="Log in").click()
            pg.wait_for_url(f"{BASE}/")
            pg.get_by_role("button", name="Log out").click(); pg.wait_for_url(f"{BASE}/")
        ctx.close()
    check("AC-AUTH-5: a return address outside the app leads to /", evil_return)

    def narrow():
        ctx = browser.new_context(viewport={"width": 360, "height": 740}); pg = ctx.new_page()
        for path in ["/", "/login", "/register"]:
            pg.goto(f"{BASE}{path}"); pg.wait_for_load_state("networkidle")
            sw = pg.evaluate("document.documentElement.scrollWidth")
            assert sw <= 360, f"{path} scrollWidth {sw}"
        pg.screenshot(path=f"{SHOTS}/m2-register-360.png", full_page=True)
        ctx.close()
    check("AC-NFR-1 (early look): login, register and home fit 360 px", narrow)

    browser.close()

for status, name in results: print(f"{status}  {name}")
sys.exit(0 if all(s == "PASS" for s, _ in results) else 1)
