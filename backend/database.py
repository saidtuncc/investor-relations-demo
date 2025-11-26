import sqlite3
from pathlib import Path

# DB dosyası: backend/tsgyo.db
DB_PATH = Path(__file__).resolve().parent / "tsgyo.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_connection()
    cur = conn.cursor()

    # KAP bildirimi tablosu
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS kap_notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_code TEXT NOT NULL,
            kap_id TEXT NOT NULL,
            type TEXT,
            title TEXT,
            publish_datetime TEXT,
            url TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            UNIQUE(company_code, kap_id)
        );
        """
    )

    # Finansal KPI tablosu
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS financial_kpi (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            period TEXT NOT NULL,
            total_assets REAL,
            equity REAL,
            investment_properties REAL,
            net_rental_income REAL,
            net_profit REAL
        );
        """
    )

    # 2025/06 için gerçek verilere dayalı seed (eğer tablo boşsa)
    cur.execute("SELECT COUNT(*) FROM financial_kpi;")
    count_kpi = cur.fetchone()[0] or 0

    if count_kpi == 0:
        period = "2025/06"
        total_assets = 6_119_000_000          # Aktif büyüklük ~6,1 milyar TL (30.06.2025) 
        investment_properties = 6_317_737_406 # Gayrimenkul portföyü toplam değeri (ekspertiz toplamı)
        equity = 5_902_367_910                # Net aktif değer tablosundan türetilmiş özkaynak 
        net_rental_income = None              # Şimdilik doldurmuyoruz
        net_profit = None                     # Şimdilik doldurmuyoruz

        cur.execute(
            """
            INSERT INTO financial_kpi
                (period, total_assets, equity, investment_properties, net_rental_income, net_profit)
            VALUES (?, ?, ?, ?, ?, ?);
            """,
            (period, total_assets, equity, investment_properties, net_rental_income, net_profit),
        )

    # PORTFÖY TABLOSU: 4 ana varlık (Fındıklı, Pendorya, Divan Adana, Tahir Han)
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS portfolio_properties (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            property_type TEXT,
            city TEXT,
            gross_area_sqm REAL,   -- kapalı alan
            gla_sqm REAL,          -- kiralanabilir alan (AVM için)
            rooms INTEGER,         -- otel için
            valuation_value_tl REAL,
            valuation_date TEXT
        );
        """
    )

    # Eğer portföy tablosu boşsa, gerçek veriye dayalı 4 satır ekle
    cur.execute("SELECT COUNT(*) FROM portfolio_properties;")
    count_portfolio = cur.fetchone()[0] or 0

    if count_portfolio == 0:
        portfolio_rows = [
            # Fındıklı Ofis Binaları
            # Kapalı alan ~17.827 m² 
            (
                "Fındıklı Ofis Binaları",
                "Ofis",
                "İstanbul",
                17_827,     # gross_area_sqm
                None,       # gla_sqm
                None,       # rooms
                3_307_537_942,
                "2025-06-30",
            ),
            # Pendorya AVM – kapalı alan ~80.648 m², kiralanabilir alan 30.573 m² 
            (
                "Pendorya AVM",
                "AVM",
                "İstanbul",
                80_648,
                30_573,
                None,
                1_531_336_185,
                "2025-06-30",
            ),
            # Divan Adana Oteli – 180 oda
            (
                "Divan Adana Oteli",
                "Otel",
                "Adana",
                None,       # gross area (raporda m² yerine oda sayısı ön planda)
                None,
                180,
                1_008_753_034,
                "2025-06-30",
            ),
            # Tahir Han – brüt alan ~3.198 m²
            (
                "Tahir Han",
                "Ofis/Han",
                "İstanbul",
                3_198,
                None,
                None,
                470_110_245,
                "2025-06-30",
            ),
        ]

        cur.executemany(
            """
            INSERT INTO portfolio_properties
                (name, property_type, city, gross_area_sqm, gla_sqm, rooms,
                 valuation_value_tl, valuation_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            """,
            portfolio_rows,
        )

    conn.commit()
    conn.close()



def fetch_all(query: str, params: tuple = ()) -> list[dict]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def execute(query: str, params: tuple = ()) -> int:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(query, params)
    conn.commit()
    rowcount = cur.rowcount
    conn.close()
    return rowcount
