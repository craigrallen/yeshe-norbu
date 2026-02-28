#!/usr/bin/env python3
"""
Full data extraction from yeshinnorbu.se WordPress site.
Pulls: events, users (public), WC orders, WC products, WC customers,
       memberships (PMPro), LearnDash courses (via REST), subscriptions.
"""
import json, os, time, sys
from urllib.request import urlopen, Request
from urllib.parse import urlencode
from urllib.error import HTTPError
from base64 import b64encode

BASE = "https://yeshinnorbu.se/wp-json"
WC_KEY = "ck_8aa870d7a852db83be15404683b72240511b90d5"
WC_SECRET = "cs_e383b598b663fba36fd6bca20abee3b87ef9a24d"
OUT = os.path.join(os.path.dirname(__file__), "extracted")
os.makedirs(OUT, exist_ok=True)

def wc_auth():
    creds = b64encode(f"{WC_KEY}:{WC_SECRET}".encode()).decode()
    return {"Authorization": f"Basic {creds}"}

def fetch_all(endpoint, params=None, auth_headers=None, max_pages=200):
    items = []
    page = 1
    while True:
        p = {"per_page": 100, "page": page, **(params or {})}
        url = f"{BASE}/{endpoint}?{urlencode(p)}"
        req = Request(url, headers={**(auth_headers or {}), "User-Agent": "Claw/1.0"})
        try:
            resp = urlopen(req, timeout=30)
            data = json.loads(resp.read())
        except HTTPError as e:
            print(f"  HTTP {e.code} on page {page}: {e.read()[:200]}")
            break
        if not data:
            break
        if isinstance(data, dict):  # tribe events format
            items.extend(data.get("events", data.get("results", [])))
            total_pages = data.get("total_pages", 1)
            print(f"  Page {page}/{total_pages} — {len(items)} so far")
            if page >= total_pages or page >= max_pages:
                break
        else:
            items.extend(data)
            print(f"  Page {page} — {len(items)} so far")
            if len(data) < 100:
                break
        page += 1
        time.sleep(0.3)
    return items

def save(name, data):
    path = os.path.join(OUT, f"{name}.json")
    with open(path, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False, default=str)
    print(f"  Saved {len(data) if isinstance(data, list) else 1} records → {path}")

print("=== Yeshe Norbu WP Data Extraction ===\n")

# 1. Events (public tribe API)
print("1. Events...")
events = fetch_all("tribe/events/v1/events", params={"status": "publish,private,draft"})
save("events", events)

# 2. Event venues
print("2. Venues...")
venues = fetch_all("tribe/events/v1/venues")
save("venues", venues)

# 3. Event organizers
print("3. Organizers...")
organizers = fetch_all("tribe/events/v1/organizers")
save("organizers", organizers)

# 4. Tickets (tribe)
print("4. Tickets...")
tickets = fetch_all("tribe/tickets/v1/tickets")
save("tickets", tickets)

# 5. Attendees
print("5. Attendees...")
attendees = fetch_all("tribe/tickets/v1/attendees")
save("attendees", attendees)

# 6. WC Orders
print("6. WC Orders...")
orders = fetch_all("wc/v3/orders", params={"status": "any"}, auth_headers=wc_auth())
save("wc_orders", orders)

# 7. WC Products
print("7. WC Products...")
products = fetch_all("wc/v3/products", params={"status": "any"}, auth_headers=wc_auth())
save("wc_products", products)

# 8. WC Customers
print("8. WC Customers...")
customers = fetch_all("wc/v3/customers", auth_headers=wc_auth())
save("wc_customers", customers)

# 9. WC Subscriptions
print("9. WC Subscriptions...")
subscriptions = fetch_all("wc/v3/subscriptions", params={"status": "any"}, auth_headers=wc_auth())
save("wc_subscriptions", subscriptions)

# 10. WC Coupons
print("10. WC Coupons...")
coupons = fetch_all("wc/v3/coupons", auth_headers=wc_auth())
save("wc_coupons", coupons)

# 11. PMPro Membership Levels
print("11. PMPro Membership Levels...")
levels = fetch_all("pmpro/v1/membership_levels")
save("pmpro_levels", levels)

# 12. PMPro Recent Memberships
print("12. PMPro Recent Memberships...")
recent = fetch_all("pmpro/v1/recent_memberships")
save("pmpro_recent_memberships", recent)

# 13. WP Users (public fields only)
print("13. WP Users (public)...")
users = fetch_all("wp/v2/users")
save("wp_users_public", users)

# 14. WP Pages
print("14. WP Pages...")
pages = fetch_all("wp/v2/pages", params={"status": "any"})
save("wp_pages", pages)

# 15. WP Posts
print("15. WP Posts...")
posts = fetch_all("wp/v2/posts", params={"status": "any"})
save("wp_posts", posts)

# 16. LearnDash Courses (sfwd-courses CPT)
print("16. LearnDash Courses...")
courses = fetch_all("wp/v2/sfwd-courses", params={"status": "any"})
save("ld_courses", courses)

# 17. LearnDash Lessons
print("17. LearnDash Lessons...")
lessons = fetch_all("wp/v2/sfwd-lessons", params={"status": "any"})
save("ld_lessons", lessons)

# 18. WC Product Categories
print("18. WC Product Categories...")
cats = fetch_all("wc/v3/products/categories", auth_headers=wc_auth())
save("wc_product_categories", cats)

# 19. Event categories
print("19. Event Categories...")
ecats = fetch_all("wp/v2/tribe_events_cat")
save("event_categories", ecats)

# Summary
print("\n=== EXTRACTION COMPLETE ===")
for f in sorted(os.listdir(OUT)):
    if f.endswith(".json"):
        path = os.path.join(OUT, f)
        with open(path) as fp:
            data = json.load(fp)
        count = len(data) if isinstance(data, list) else "object"
        size = os.path.getsize(path)
        print(f"  {f}: {count} records ({size/1024:.1f} KB)")
