#!/usr/bin/env python3
"""Migrate WP extracted JSON data into Railway Postgres."""
import json, os, sys, re, uuid
from datetime import datetime
import psycopg2
from psycopg2.extras import execute_values
from html import unescape

DB_URL = "postgresql://postgres:525dab5fd9ccfe92e36a7a0f585f13e6@maglev.proxy.rlwy.net:57782/railway"
DATA = "/Users/craig/Projects/yeshe-norbu/migration/extracted"

def load(name):
    with open(f"{DATA}/{name}") as f:
        return json.load(f)

def clean_html(s):
    if not s: return ''
    s = unescape(s)
    s = re.sub(r'<[^>]+>', '', s)
    return s.strip()

def slugify(s):
    s = s.lower().replace('å','a').replace('ä','a').replace('ö','o')
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s[:120]

def parse_dt(s):
    if not s: return None
    try: return datetime.fromisoformat(s.replace('Z','+00:00'))
    except: return datetime.strptime(s[:19], '%Y-%m-%d %H:%M:%S')

conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

# --- Event Categories ---
print("Migrating event categories...")
events_data = load('events.json')
cats = {}
for e in events_data:
    for c in (e.get('categories') or []):
        slug = c.get('slug','')
        if slug and slug not in cats:
            cats[slug] = c.get('name', slug)

for slug, name in cats.items():
    cid = str(uuid.uuid4())
    cur.execute("""INSERT INTO event_categories (id, slug, name_sv, name_en) 
                   VALUES (%s,%s,%s,%s) ON CONFLICT (slug) DO NOTHING""",
                (cid, slug, name, name))
conn.commit()
print(f"  {len(cats)} categories")

# Get category map
cur.execute("SELECT slug, id FROM event_categories")
cat_map = dict(cur.fetchall())

# --- Events ---
print("Migrating events...")
seen_slugs = set()
evt_count = 0
for e in events_data:
    slug = e.get('slug','') or slugify(e.get('title','event'))
    if slug in seen_slugs:
        slug = f"{slug}-{e['id']}"
    seen_slugs.add(slug)
    
    title = clean_html(e.get('title',''))
    desc = e.get('description','') or ''
    venue_data = e.get('venue') or {}
    venue_name = venue_data.get('venue','') if isinstance(venue_data, dict) else str(venue_data)
    venue_addr = venue_data.get('address','') if isinstance(venue_data, dict) else ''
    
    cat_id = None
    for c in (e.get('categories') or []):
        if c.get('slug') in cat_map:
            cat_id = cat_map[c['slug']]
            break
    
    starts = parse_dt(e.get('utc_start_date') or e.get('start_date'))
    ends = parse_dt(e.get('utc_end_date') or e.get('end_date'))
    
    img = None
    if e.get('image') and isinstance(e['image'], dict):
        img = e['image'].get('url')
    
    is_online = bool(e.get('is_virtual'))
    published = e.get('status') == 'publish'
    
    eid = str(uuid.uuid4())
    cur.execute("""INSERT INTO events (id, slug, title_sv, title_en, description_sv, description_en,
                   category_id, starts_at, ends_at, venue, venue_address, is_online,
                   featured_image_url, published)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                   ON CONFLICT (slug) DO UPDATE SET
                   title_sv=EXCLUDED.title_sv, title_en=EXCLUDED.title_en,
                   description_sv=EXCLUDED.description_sv, description_en=EXCLUDED.description_en,
                   starts_at=EXCLUDED.starts_at, ends_at=EXCLUDED.ends_at,
                   venue=EXCLUDED.venue, published=EXCLUDED.published""",
                (eid, slug, title, title, desc, desc, cat_id, starts, ends,
                 venue_name, venue_addr, is_online, img, published))
    evt_count += 1

conn.commit()
print(f"  {evt_count} events")

# --- WooCommerce Orders ---
print("Migrating orders...")
orders_data = load('wc_orders.json')
ord_count = 0
status_map = {
    'completed': 'confirmed', 'processing': 'confirmed', 'on-hold': 'pending',
    'pending': 'pending', 'cancelled': 'cancelled', 'refunded': 'refunded',
    'failed': 'failed', 'trash': 'cancelled',
}

for o in orders_data:
    total = float(o.get('total','0') or '0')
    discount = float(o.get('discount_total','0') or '0')
    net = total - discount
    status = status_map.get(o.get('status','pending'), 'pending')
    
    billing = o.get('billing') or {}
    email = billing.get('email','')
    
    # Find user by email
    user_id = None
    if email:
        cur.execute("SELECT id FROM users WHERE LOWER(email) = LOWER(%s) LIMIT 1", (email,))
        row = cur.fetchone()
        if row: user_id = row[0]
    
    created = parse_dt(o.get('date_created'))
    
    oid = str(uuid.uuid4())
    try:
        cur.execute("""INSERT INTO orders (id, user_id, channel, status, total_sek, discount_sek, net_sek, currency, created_at, updated_at)
                       VALUES (%s,%s,'online',%s,%s,%s,%s,'SEK',%s,%s)""",
                    (oid, user_id, status, total, discount, net, created, created))
        ord_count += 1
    except Exception as ex:
        conn.rollback()
        # Skip bad records
        continue

conn.commit()
print(f"  {ord_count} orders")

# --- Memberships from PMPro (already seeded, but let's verify) ---
cur.execute("SELECT count(*) FROM memberships")
mem_count = cur.fetchone()[0]
print(f"  Memberships already in DB: {mem_count}")

# --- Products ---
print("Migrating products...")
products_data = load('wc_products.json')

# Check if products table exists
cur.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products')")
has_products = cur.fetchone()[0]

if has_products:
    prod_count = 0
    for p in products_data:
        pid = str(uuid.uuid4())
        name = p.get('name','')
        slug = p.get('slug','') or slugify(name)
        price = float(p.get('price','0') or '0')
        status = p.get('status','publish')
        desc = p.get('description','') or ''
        short_desc = p.get('short_description','') or ''
        
        try:
            cur.execute("""INSERT INTO products (id, slug, name_sv, name_en, description_sv, description_en,
                           price_sek, published, created_at)
                           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,NOW())
                           ON CONFLICT DO NOTHING""",
                        (pid, slug, name, name, desc, desc, price, status == 'publish'))
            prod_count += 1
        except Exception as ex:
            conn.rollback()
            continue
    conn.commit()
    print(f"  {prod_count} products")
else:
    print("  Products table doesn't exist yet — skipping")

print("\n=== Migration complete ===")
cur.execute("SELECT 'users' as t, count(*) FROM users UNION ALL SELECT 'events', count(*) FROM events UNION ALL SELECT 'orders', count(*) FROM orders UNION ALL SELECT 'memberships', count(*) FROM memberships")
for row in cur.fetchall():
    print(f"  {row[0]}: {row[1]}")

conn.close()
