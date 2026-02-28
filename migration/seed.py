import json, os, hashlib, uuid as uuidlib
from datetime import datetime
import psycopg2
from psycopg2.extras import execute_values

DATABASE_URL = os.environ.get('DATABASE_URL')
EXTRACTED = os.path.dirname(__file__) + '/extracted'

def load(name):
    path = f"{EXTRACTED}/{name}.json"
    if not os.path.exists(path): return []
    return json.load(open(path))

def ts(val):
    if not val or str(val) in ('0000-00-00 00:00:00', 'NULL', 'None', '', '0000-00-00'): return None
    try: return datetime.strptime(str(val)[:19], '%Y-%m-%d %H:%M:%S')
    except:
        try: return datetime.strptime(str(val)[:10], '%Y-%m-%d')
        except: return None

print("Connecting...")
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()
print("Connected!")

# ── Users ───────────────────────────────────────────────────────────────────
print("\n[1/3] Seeding users...")
users = load('wp_users')
wp_id_to_uuid = {}
user_rows = []
seen_emails = set()

for u in users:
    wp_id = str(u.get('ID') or u.get('id', ''))
    email = (u.get('user_email') or '').strip().lower()
    if not email or '@' not in email or email in seen_emails:
        continue
    seen_emails.add(email)

    display = (u.get('display_name') or u.get('user_login') or '').strip()
    parts = display.split(' ', 1)
    first = parts[0] if parts else 'Unknown'
    last = parts[1] if len(parts) > 1 else ''
    registered = ts(u.get('user_registered'))
    stable_uuid = str(uuidlib.uuid5(uuidlib.NAMESPACE_DNS, f"wp_user_{wp_id}"))
    wp_id_to_uuid[wp_id] = stable_uuid

    user_rows.append((
        stable_uuid, email, True,
        hashlib.sha256(f"wp_migrated_{wp_id}".encode()).hexdigest(),
        first, last,
        None, None, 'sv', None,
        False, None, False, None,
        registered or datetime.now(), datetime.now()
    ))

print(f"  Inserting {len(user_rows)} users...")
execute_values(cur, """
    INSERT INTO users (
        id, email, email_verified, password_hash,
        first_name, last_name, phone, consent_marketing_at, locale, stripe_customer_id,
        consent_marketing, consent_analytics_at, consent_analytics, consent_marketing_at,
        created_at, updated_at
    ) VALUES %s ON CONFLICT (email) DO NOTHING
""", user_rows)

# Simpler approach without the double consent_marketing_at:
cur.execute("ROLLBACK"); conn.rollback()

user_rows2 = [(r[0],r[1],r[2],r[3],r[4],r[5],r[14],r[15]) for r in user_rows]
execute_values(cur, """
    INSERT INTO users (id, email, email_verified, password_hash, first_name, last_name, created_at, updated_at)
    VALUES %s ON CONFLICT (email) DO NOTHING
""", user_rows2)
conn.commit()

cur.execute("SELECT COUNT(*) FROM users")
print(f"  ✅ Users in DB: {cur.fetchone()[0]}")

# ── Membership tiers ─────────────────────────────────────────────────────────
print("\n[2/3] Seeding membership tiers...")
cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='membership_tiers' ORDER BY ordinal_position")
print("  Tier columns:", [r[0] for r in cur.fetchall()])

# Check what's there
cur.execute("SELECT COUNT(*) FROM membership_tiers")
existing = cur.fetchone()[0]
print(f"  Existing tiers: {existing}")

if existing == 0:
    TIERS = [
        (str(uuidlib.uuid4()), 'non-profit-yearly',  'Icke-vinstdrivande',  'Non-Profit Yearly',   250,   'year',  False, datetime.now(), datetime.now()),
        (str(uuidlib.uuid4()), 'mental-gym-monthly', 'Mentalgym Månadsvis', 'Mental Gym Monthly',  950,   'month', True,  datetime.now(), datetime.now()),
        (str(uuidlib.uuid4()), 'mental-gym-yearly',  'Mentalgym Årsvis',    'Mental Gym Annual',   9500,  'year',  False, datetime.now(), datetime.now()),
        (str(uuidlib.uuid4()), 'guardian',            'Väktare',             'Guardian',            0,     None,    False, datetime.now(), datetime.now()),
        (str(uuidlib.uuid4()), 'supporter',           'Stödjare',            'Supporter',           0,     None,    False, datetime.now(), datetime.now()),
    ]
    # Try inserting - check actual columns first
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='membership_tiers'")
    cols = [r[0] for r in cur.fetchall()]
    print(f"  Available cols: {cols}")
    conn.commit()

# ── Events ───────────────────────────────────────────────────────────────────
print("\n[3/3] Seeding events...")
cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='events' ORDER BY ordinal_position")
event_cols = [r[0] for r in cur.fetchall()]
print("  Event columns:", event_cols[:10], "...")

em_events = load('wp_em_events')
event_rows = []
for ev in em_events:
    eid = str(uuidlib.uuid4())
    title = ev.get('event_name', 'Untitled')
    sd = ev.get('event_start_date', '2024-01-01')
    st = ev.get('event_start_time') or '00:00:00'
    ed = ev.get('event_end_date') or sd
    et = ev.get('event_end_time') or '23:59:59'
    start = ts(f"{sd} {st}")
    end = ts(f"{ed} {et}")
    content = ev.get('post_content') or ''
    spaces = int(ev.get('event_spaces') or 30)
    event_rows.append((eid, title, title, content, content, start, end, 'Yeshe Norbu, Stockholm', spaces, 100, 'published', datetime.now(), datetime.now()))

if event_rows:
    execute_values(cur, """
        INSERT INTO events (id, title_sv, title_en, description_sv, description_en,
            starts_at, ends_at, location, capacity, price_sek, status, created_at, updated_at)
        VALUES %s ON CONFLICT DO NOTHING
    """, event_rows)
conn.commit()
cur.execute("SELECT COUNT(*) FROM events")
print(f"  ✅ Events in DB: {cur.fetchone()[0]}")

print("\n✅ Seed complete!")
cur.close(); conn.close()
