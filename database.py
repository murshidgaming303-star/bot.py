import sqlite3
import threading
from datetime import datetime, timedelta
from config import DB_PATH, FREE_TRIAL_DAYS


class Database:
    def __init__(self):
        self._lock = threading.Lock()
        self.conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        self._init_tables()

    def _execute(self, query, params=()):
        with self._lock:
            c = self.conn.cursor()
            c.execute(query, params)
            self.conn.commit()
            return c

    def _fetchone(self, query, params=()):
        with self._lock:
            c = self.conn.cursor()
            c.execute(query, params)
            return c.fetchone()

    def _fetchall(self, query, params=()):
        with self._lock:
            c = self.conn.cursor()
            c.execute(query, params)
            return c.fetchall()

    def _init_tables(self):
        with self._lock:
            c = self.conn.cursor()
            c.executescript('''
                CREATE TABLE IF NOT EXISTS users (
                    user_id     INTEGER PRIMARY KEY,
                    username    TEXT,
                    full_name   TEXT,
                    plan        TEXT    DEFAULT 'free',
                    expiry      TEXT,
                    is_banned   INTEGER DEFAULT 0,
                    joined_at   TEXT    DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS servers (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                    name        TEXT NOT NULL,
                    country     TEXT NOT NULL,
                    flag        TEXT NOT NULL,
                    endpoint    TEXT NOT NULL,
                    public_key  TEXT NOT NULL,
                    dns         TEXT    DEFAULT '1.1.1.1',
                    is_premium  INTEGER DEFAULT 0,
                    is_active   INTEGER DEFAULT 1
                );

                CREATE TABLE IF NOT EXISTS user_configs (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id     INTEGER NOT NULL,
                    server_id   INTEGER NOT NULL,
                    private_key TEXT NOT NULL,
                    public_key  TEXT NOT NULL,
                    assigned_ip TEXT NOT NULL,
                    created_at  TEXT    DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id, server_id)
                );
            ''')
            self.conn.commit()
        self._seed_demo_servers()

    def _seed_demo_servers(self):
        count = self._fetchone("SELECT COUNT(*) FROM servers")[0]
        if count == 0:
            demo = [
                ("USA - New York",     "United States", "🇺🇸", "us1.vpnbot.example:51820", "ABC123PublicKeyUSA1==",     "1.1.1.1", 0),
                ("Germany - Frankfurt","Germany",        "🇩🇪", "de1.vpnbot.example:51820", "ABC123PublicKeyDE1==",     "1.1.1.1", 0),
                ("UK - London",        "United Kingdom", "🇬🇧", "uk1.vpnbot.example:51820", "ABC123PublicKeyUK1==",     "8.8.8.8", 0),
                ("Japan - Tokyo",      "Japan",          "🇯🇵", "jp1.vpnbot.example:51820", "ABC123PublicKeyJP1==",     "1.1.1.1", 1),
                ("Singapore",          "Singapore",      "🇸🇬", "sg1.vpnbot.example:51820", "ABC123PublicKeySG1==",     "1.1.1.1", 1),
                ("Netherlands",        "Netherlands",    "🇳🇱", "nl1.vpnbot.example:51820", "ABC123PublicKeyNL1==",     "1.1.1.1", 1),
                ("Canada - Toronto",   "Canada",         "🇨🇦", "ca1.vpnbot.example:51820", "ABC123PublicKeyCA1==",     "1.1.1.1", 1),
                ("France - Paris",     "France",         "🇫🇷", "fr1.vpnbot.example:51820", "ABC123PublicKeyFR1==",     "1.1.1.1", 1),
            ]
            with self._lock:
                c = self.conn.cursor()
                c.executemany(
                    "INSERT INTO servers (name,country,flag,endpoint,public_key,dns,is_premium) VALUES (?,?,?,?,?,?,?)",
                    demo
                )
                self.conn.commit()

    # ---- User methods ----

    def add_user(self, user_id, username, full_name):
        expiry = (datetime.now() + timedelta(days=FREE_TRIAL_DAYS)).strftime('%Y-%m-%d')
        self._execute(
            "INSERT OR IGNORE INTO users (user_id,username,full_name,plan,expiry) VALUES (?,?,?,?,?)",
            (user_id, username or '', full_name or 'User', 'free', expiry)
        )

    def get_user(self, user_id):
        row = self._fetchone("SELECT * FROM users WHERE user_id=?", (user_id,))
        if not row:
            return None
        keys = ['user_id', 'username', 'full_name', 'plan', 'expiry', 'is_banned', 'joined_at']
        return dict(zip(keys, row))

    def is_subscription_active(self, user_id):
        user = self.get_user(user_id)
        if not user or user['is_banned']:
            return False
        if user['plan'] == 'premium':
            if not user['expiry']:
                return True
            return datetime.strptime(user['expiry'], '%Y-%m-%d') >= datetime.now()
        if user['expiry']:
            return datetime.strptime(user['expiry'], '%Y-%m-%d') >= datetime.now()
        return False

    def upgrade_user(self, user_id, days=30):
        user = self.get_user(user_id)
        if user and user['plan'] == 'premium' and user['expiry']:
            base = datetime.strptime(user['expiry'], '%Y-%m-%d')
            new_expiry = (base + timedelta(days=days)).strftime('%Y-%m-%d')
        else:
            new_expiry = (datetime.now() + timedelta(days=days)).strftime('%Y-%m-%d')
        self._execute(
            "UPDATE users SET plan='premium', expiry=? WHERE user_id=?",
            (new_expiry, user_id)
        )

    def ban_user(self, user_id):
        self._execute("UPDATE users SET is_banned=1 WHERE user_id=?", (user_id,))

    def unban_user(self, user_id):
        self._execute("UPDATE users SET is_banned=0 WHERE user_id=?", (user_id,))

    def get_all_user_ids(self):
        rows = self._fetchall("SELECT user_id FROM users WHERE is_banned=0")
        return [r[0] for r in rows]

    def get_stats(self):
        total   = self._fetchone("SELECT COUNT(*) FROM users")[0]
        premium = self._fetchone("SELECT COUNT(*) FROM users WHERE plan='premium'")[0]
        banned  = self._fetchone("SELECT COUNT(*) FROM users WHERE is_banned=1")[0]
        servers = self._fetchone("SELECT COUNT(*) FROM servers WHERE is_active=1")[0]
        configs = self._fetchone("SELECT COUNT(*) FROM user_configs")[0]
        return {'total': total, 'premium': premium, 'free': total - premium,
                'banned': banned, 'servers': servers, 'configs': configs}

    # ---- Server methods ----

    def get_servers(self, premium_access=False):
        if premium_access:
            return self._fetchall("SELECT * FROM servers WHERE is_active=1 ORDER BY is_premium, name")
        return self._fetchall("SELECT * FROM servers WHERE is_premium=0 AND is_active=1 ORDER BY name")

    def get_all_servers(self):
        return self._fetchall("SELECT * FROM servers ORDER BY is_premium, name")

    def get_server(self, server_id):
        return self._fetchone("SELECT * FROM servers WHERE id=?", (server_id,))

    def add_server(self, name, country, flag, endpoint, public_key, dns, is_premium):
        self._execute(
            "INSERT INTO servers (name,country,flag,endpoint,public_key,dns,is_premium) VALUES (?,?,?,?,?,?,?)",
            (name, country, flag, endpoint, public_key, dns, is_premium)
        )

    def toggle_server(self, server_id):
        current = self._fetchone("SELECT is_active FROM servers WHERE id=?", (server_id,))
        if current:
            new_val = 0 if current[0] else 1
            self._execute("UPDATE servers SET is_active=? WHERE id=?", (new_val, server_id))
            return new_val

    # ---- Config methods ----

    def save_config(self, user_id, server_id, private_key, public_key, assigned_ip):
        self._execute(
            """INSERT INTO user_configs (user_id,server_id,private_key,public_key,assigned_ip)
               VALUES (?,?,?,?,?)
               ON CONFLICT(user_id,server_id) DO UPDATE SET
               private_key=excluded.private_key,
               public_key=excluded.public_key,
               assigned_ip=excluded.assigned_ip,
               created_at=CURRENT_TIMESTAMP""",
            (user_id, server_id, private_key, public_key, assigned_ip)
        )

    def get_config(self, user_id, server_id):
        return self._fetchone(
            "SELECT * FROM user_configs WHERE user_id=? AND server_id=?",
            (user_id, server_id)
        )
