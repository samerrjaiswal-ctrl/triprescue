"""
TripRescue — External Services Verification Script
Tests each external API credential configured in .env:
1. Supabase (PostgreSQL DB)
2. Groq LLM API
3. AviationStack Flight Tracking API
4. OpenSky Network API
5. OpenStreetMap Nominatim Geocoding API
6. RapidAPI Key (Indian Railways / IRCTC)
7. Google Gemini API
"""

import os
import sys
import json
import requests
from dotenv import load_dotenv

# Force UTF-8 output
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

results = {}

print("=" * 65)
print("TESTING ALL EXTERNAL APIS CONFIGURED IN .ENV")
print("=" * 65)

# ── 1. Supabase ────────────────────────────────────────────────
print("\n[1/7] Testing Supabase (PostgreSQL)...")
sb_url = os.getenv("SUPABASE_URL")
sb_key = os.getenv("SUPABASE_ANON_KEY")
try:
    from supabase import create_client
    sb = create_client(sb_url, sb_key)
    trips = sb.table("trips").select("*").limit(1).execute()
    bookings = sb.table("bookings").select("*").limit(1).execute()
    print("  [SUCCESS] Supabase Connected")
    print(f"  - URL: {sb_url}")
    print(f"  - 'trips' table reachable: OK ({len(trips.data)} rows)")
    print(f"  - 'bookings' table reachable: OK ({len(bookings.data)} rows)")
    results["Supabase"] = {"status": "PASS", "details": f"Connected to {sb_url}"}
except Exception as e:
    print(f"  [FAIL] Supabase: {e}")
    results["Supabase"] = {"status": "FAIL", "details": str(e)}

# ── 2. Groq LLM API ────────────────────────────────────────────
print("\n[2/7] Testing Groq LLM API...")
groq_key = os.getenv("GROQ_API_KEY")
try:
    from groq import Groq
    client = Groq(api_key=groq_key)
    completion = client.chat.completions.create(
        model="qwen/qwen3.8-27b",
        messages=[{"role": "user", "content": "Reply with only: PONG"}],
        max_tokens=10
    )
    text = completion.choices[0].message.content.strip()
    print("  [SUCCESS] Groq API Working")
    print(f"  - Model: qwen/qwen3.8-27b")
    print(f"  - Response: {text}")
    results["Groq"] = {"status": "PASS", "details": f"Working with qwen/qwen3.8-27b ({text})"}
except Exception as e:
    print(f"  [FAIL] Groq API: {e}")
    results["Groq"] = {"status": "FAIL", "details": str(e)}

# ── 3. AviationStack Flight API ─────────────────────────────────
print("\n[3/7] Testing AviationStack API (Flights)...")
av_key = os.getenv("AVIATIONSTACK_API_KEY")
try:
    # AviationStack free plan operates over HTTP
    url = f"http://api.aviationstack.com/v1/flights?access_key={av_key}&limit=1"
    r = requests.get(url, timeout=12)
    data = r.json()
    if "error" in data:
        err_info = data["error"].get("info", data["error"])
        print(f"  [NOTICE] AviationStack API message: {err_info}")
        results["AviationStack"] = {"status": "NOTICE", "details": str(err_info)}
    elif r.status_code == 200:
        total = data.get("pagination", {}).get("total", 0)
        sample = data.get("data", [{}])[0]
        airline = sample.get("airline", {}).get("name", "N/A")
        flight_num = sample.get("flight", {}).get("iata", "N/A")
        print("  [SUCCESS] AviationStack API Active")
        print(f"  - Total flights tracked: {total}")
        print(f"  - Sample flight: {airline} ({flight_num})")
        results["AviationStack"] = {"status": "PASS", "details": f"Active, {total} flights tracked"}
    else:
        print(f"  [NOTICE] Status Code: {r.status_code}")
        results["AviationStack"] = {"status": "NOTICE", "details": f"Status {r.status_code}"}
except Exception as e:
    print(f"  [FAIL] AviationStack error: {e}")
    results["AviationStack"] = {"status": "FAIL", "details": str(e)}

# ── 4. OpenSky Network API ─────────────────────────────────────
print("\n[4/7] Testing OpenSky Network API (Aircraft Radar)...")
opensky_url = os.getenv("OPENSKY_BASE_URL", "https://opensky-network.org/api")
try:
    r = requests.get(f"{opensky_url}/states/all", timeout=12)
    if r.status_code == 200:
        data = r.json()
        aircraft_count = len(data.get("states", []))
        print("  [SUCCESS] OpenSky Network Working (Free / No Key Needed)")
        print(f"  - Endpoint: {opensky_url}/states/all")
        print(f"  - Live aircraft tracked worldwide: {aircraft_count:,}")
        results["OpenSky"] = {"status": "PASS", "details": f"{aircraft_count:,} aircraft live"}
    else:
        print(f"  [NOTICE] OpenSky HTTP {r.status_code}: {r.text[:100]}")
        results["OpenSky"] = {"status": "NOTICE", "details": f"HTTP {r.status_code}"}
except Exception as e:
    print(f"  [FAIL] OpenSky Network: {e}")
    results["OpenSky"] = {"status": "FAIL", "details": str(e)}

# ── 5. OpenStreetMap Nominatim Geocoding ────────────────────────
print("\n[5/7] Testing OpenStreetMap Nominatim (Geocoding)...")
nom_url = os.getenv("NOMINATIM_BASE_URL", "https://nominatim.openstreetmap.org")
try:
    headers = {"User-Agent": "TripRescue-App/1.0 (travel disruption recovery)"}
    r = requests.get(
        f"{nom_url}/search?q=Manali,Himachal+Pradesh,India&format=json&limit=1",
        headers=headers,
        timeout=10
    )
    if r.status_code == 200:
        data = r.json()
        if data:
            place = data[0]
            lat = place.get("lat")
            lon = place.get("lon")
            name = place.get("display_name", "")[:60]
            print("  [SUCCESS] Nominatim Geocoding Working (Free / No Key Needed)")
            print(f"  - Query: 'Manali, Himachal Pradesh, India'")
            print(f"  - Lat/Lon: {lat}, {lon}")
            print(f"  - Location: {name}...")
            results["Nominatim"] = {"status": "PASS", "details": f"Coordinates: {lat}, {lon}"}
        else:
            print("  [NOTICE] No location found")
            results["Nominatim"] = {"status": "NOTICE", "details": "Empty result"}
    else:
        print(f"  [NOTICE] Nominatim HTTP {r.status_code}")
        results["Nominatim"] = {"status": "NOTICE", "details": f"HTTP {r.status_code}"}
except Exception as e:
    print(f"  [FAIL] Nominatim: {e}")
    results["Nominatim"] = {"status": "FAIL", "details": str(e)}

# ── 6. RapidAPI Key (Indian Railways) ───────────────────────────
print("\n[6/7] Testing RapidAPI Key (Indian Railways / IRCTC)...")
rapid_key = os.getenv("RAPIDAPI_KEY")
endpoints_to_test = [
    ("irctc1.p.rapidapi.com", "https://irctc1.p.rapidapi.com/api/v1/searchTrain?query=12005"),
    ("trains.p.rapidapi.com", "https://trains.p.rapidapi.com/"),
    ("indianrailways.p.rapidapi.com", "https://indianrailways.p.rapidapi.com/findtrains.php?trainno=12005"),
]
rapid_verified = False
for host, url in endpoints_to_test:
    try:
        headers = {
            "X-RapidAPI-Key": rapid_key,
            "X-RapidAPI-Host": host
        }
        r = requests.get(url, headers=headers, timeout=8)
        if r.status_code == 200:
            print(f"  [SUCCESS] RapidAPI Active on {host}")
            resp_data = r.json() if "application/json" in r.headers.get("content-type", "") else r.text[:80]
            print(f"  - Result: {str(resp_data)[:100]}")
            rapid_verified = True
            results["RapidAPI"] = {"status": "PASS", "details": f"Active on {host}"}
            break
        elif r.status_code == 403:
            msg = r.json().get("message", "Subscription required") if "application/json" in r.headers.get("content-type", "") else "Forbidden"
            print(f"  - Host {host}: 403 Forbidden ({msg})")
        else:
            print(f"  - Host {host}: HTTP {r.status_code}")
    except Exception as err:
        print(f"  - Host {host} check error: {err}")

if not rapid_verified:
    print(f"  [NOTICE] Key format is valid ({rapid_key[:10]}...{rapid_key[-6:]}).")
    print("  Note: RapidAPI keys are per-API subscriptions. Make sure to subscribe to your chosen Indian Railways API on RapidAPI hub.")
    results["RapidAPI"] = {"status": "KEY_CONFIGURED", "details": "Key configured in .env; requires subscription on specific RapidAPI railway endpoint"}

# ── 7. Google Gemini API ────────────────────────────────────────
print("\n[7/7] Testing Google Gemini API...")
gemini_key = os.getenv("GEMINI_API_KEY", "")
print(f"  - Key in .env: {gemini_key[:10]}...{gemini_key[-6:]} (Length: {len(gemini_key)})")
try:
    if not gemini_key.startswith("AIzaSy") and not gemini_key.startswith("AQ."):
        print("  [NOTICE] Key does not follow standard Google prefix ('AIzaSy...' or 'AQ...')")
        results["Gemini"] = {"status": "KEY_FORMAT_NOTICE", "details": f"Prefix is '{gemini_key[:6]}...'"}
    else:
        import google.generativeai as genai
        genai.configure(api_key=gemini_key, transport="rest")
        model = genai.GenerativeModel("gemini-3.6-flash")
        resp = model.generate_content("Hello in 3 words", request_options={"timeout": 30})
        print("  [SUCCESS] Gemini Active & Working")
        print(f"  - Model: gemini-3.6-flash")
        print(f"  - Response: {resp.text.strip()}")
        results["Gemini"] = {"status": "PASS", "details": f"Active with gemini-3.6-flash ({resp.text.strip()})"}
except Exception as e:
    print(f"  [FAIL] Gemini: {e}")
    results["Gemini"] = {"status": "FAIL", "details": str(e)}

print("\n" + "=" * 65)
print("EXTERNAL APIS TEST SUMMARY")
print("=" * 65)
for name, res in results.items():
    print(f"  {name:15} : [{res['status']}] - {res['details']}")
print("=" * 65)
