#!/usr/bin/env python3
"""Full WP → Postgres migration. Users first, then everything else."""
import json, os, re, uuid, sys
from datetime import datetime, timedelta
from html import unescape
import psycopg2

DB = "postgresql://postgres:525dab5fd9ccfe92e36a7a0f585f13e6@maglev.proxy.rlwy.net:57782/railway"
DATA = "/Users/craig/Projects/yeshe-norbu/migration/extracted"

def load(n):
    with open(f"{DATA}/{n}") as f: return json.load(f)

def parse_dt(s):
    if not s: return None
    try: return datetime.fromisoformat(s.replace('Z','+00:00'))
    except:
        try: return datetime.strptime(s[:19], '%Y-%m-%d %H:%M:%S')
        except: return None

def slugify(s):
    s = (s or '').lower().replace('å','a').replace('ä','a').replace('ö','o')
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')[:120]

conn = psycopg2.connect(DB)
conn.autocommit = False
cur = conn.cursor()

# ========== 1. USERS (from wc_customers) ==========
print("1. Users...")
customers = load('wc_customers.json')
email_to_uid = {}

# Keep existing
cur.execute("SELECT id, email FROM users")
for uid, em in cur.fetchall():
    email_to_uid[em.lower()] = uid

inserted = 0
for c in customers:
    em = (c.get('email') or '').lower().strip()
    if not em or em in email_to_uid: continue
    uid = str(uuid.uuid4())
    fn = c.get('first_name','') or ''
    ln = c.get('last_name','') or ''
    created = parse_dt(c.get('date_created')) or datetime.now()
    try:
        cur.execute("""INSERT INTO users (id, email, first_name, last_name, password_hash, created_at, updated_at)
                       VALUES (%s,%s,%s,%s,'NEEDS_RESET',%s,%s)""",
                    (uid, em, fn, ln, created, created))
        email_to_uid[em] = uid
        inserted += 1
    except:
        conn.rollback()
conn.commit()
print(f"  Inserted {inserted} users (total {len(email_to_uid)} in email map)")

# ========== 2. MEMBERSHIP PLANS ==========
print("2. Membership plans...")
levels = load('pmpro_levels.json')
plan_map = {}
for lv in levels:
    pid = str(uuid.uuid4())
    name = lv.get('name','')
    amt = float(lv.get('initial_payment','0') or '0')
    cycle = int(lv.get('cycle_number','12') or '12')
    try:
        cur.execute("""INSERT INTO membership_plans (id, slug, name_sv, name_en, price_sek, interval_months, stripe_price_id)
                       VALUES (%s,%s,%s,%s,%s,%s,'')
                       ON CONFLICT DO NOTHING""",
                    (pid, slugify(name) or f'plan-{lv["id"]}', name, name, amt, cycle))
        plan_map[str(lv['id'])] = pid
    except:
        conn.rollback()
conn.commit()
# Re-read plan_map from DB
cur.execute("SELECT slug, id FROM membership_plans")
plan_slug_map = dict(cur.fetchall())
print(f"  {len(plan_slug_map)} plans")

# ========== 3. MEMBERSHIPS (from SQL dump PMPro data) ==========
# We need to get PMPro members from the SQL dump. Let's check if we have a parsed file.
# For now, use wc_subscriptions as proxy for memberships
print("3. Memberships from subscriptions...")
subs = load('wc_subscriptions.json')
mem_count = 0
for s in subs:
    billing = s.get('billing') or {}
    em = (billing.get('email') or '').lower().strip()
    uid = email_to_uid.get(em)
    if not uid: continue
    
    status_map = {'active':'active','on-hold':'paused','cancelled':'cancelled','expired':'expired','pending-cancel':'cancelled'}
    st = status_map.get(s.get('status',''), 'expired')
    
    start = parse_dt(s.get('date_created')) or datetime.now()
    end = parse_dt(s.get('next_payment_date')) or (start + timedelta(days=365))
    
    # Pick first plan
    plan_id = None
    for pid in plan_slug_map.values():
        plan_id = pid
        break
    if not plan_id: continue
    
    mid = str(uuid.uuid4())
    try:
        cur.execute("""INSERT INTO memberships (id, user_id, plan_id, status, current_period_start, current_period_end, created_at)
                       VALUES (%s,%s,%s,%s,%s,%s,%s)""",
                    (mid, uid, plan_id, st, start, end, start))
        mem_count += 1
    except:
        conn.rollback()
conn.commit()
print(f"  {mem_count} memberships")

# ========== 4. ORDERS ==========
print("4. Orders...")
orders = load('wc_orders.json')
status_map = {
    'completed':'confirmed','processing':'confirmed','on-hold':'pending',
    'pending':'pending','cancelled':'cancelled','refunded':'refunded','failed':'failed','trash':'cancelled',
}
ord_count = 0
batch = []
for o in orders:
    total = float(o.get('total','0') or '0')
    discount = float(o.get('discount_total','0') or '0')
    net = total - discount
    st = status_map.get(o.get('status','pending'), 'pending')
    billing = o.get('billing') or {}
    em = (billing.get('email') or '').lower().strip()
    uid = email_to_uid.get(em)
    created = parse_dt(o.get('date_created')) or datetime.now()
    oid = str(uuid.uuid4())
    batch.append((oid, uid, st, total, discount, net, created, created))

# Bulk insert
for i in range(0, len(batch), 500):
    chunk = batch[i:i+500]
    args = ','.join(cur.mogrify("(%s,%s,'online',%s,%s,%s,%s,'SEK',%s,%s)", r).decode() for r in chunk)
    try:
        cur.execute(f"INSERT INTO orders (id, user_id, channel, status, total_sek, discount_sek, net_sek, currency, created_at, updated_at) VALUES {args}")
        ord_count += len(chunk)
    except Exception as ex:
        conn.rollback()
        print(f"  Order batch error at {i}: {ex}")
conn.commit()
print(f"  {ord_count} orders")

# ========== 5. Summary ==========
print("\n=== Final counts ===")
for t in ['users','events','event_categories','orders','memberships','membership_plans']:
    cur.execute(f"SELECT count(*) FROM {t}")
    print(f"  {t}: {cur.fetchone()[0]}")

conn.close()
print("Done!")
