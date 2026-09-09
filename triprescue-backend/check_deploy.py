import httpx
import json

import os

SERVICE_ID = "srv-daga7dou01pc738nrub0"
API_KEY = os.environ.get("RENDER_API_KEY", "rnd_zJcWK2TdkxnV8LSjhz2F27IK27s4")
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Accept": "application/json"
}

def check_status():
    url = f"https://api.render.com/v1/services/{SERVICE_ID}/deploys?limit=1"
    r = httpx.get(url, headers=HEADERS)
    deploys = r.json()
    if deploys:
        latest = deploys[0]["deploy"]
        print("Deploy ID:", latest["id"])
        print("Status:", latest["status"])
    else:
        print("No deploys found")

if __name__ == "__main__":
    check_status()
