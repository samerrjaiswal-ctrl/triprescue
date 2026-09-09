import httpx
import json

import os

SERVICE_ID = "srv-daga7dou01pc738nrub0"
API_KEY = os.environ.get("RENDER_API_KEY", "rnd_zJcWK2TdkxnV8LSjhz2F27IK27s4")
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}

def fix_start_command():
    url = f"https://api.render.com/v1/services/{SERVICE_ID}"
    # In python raw string $PORT won't be modified
    payload = {
        "serviceDetails": {
            "envSpecificDetails": {
                "buildCommand": "pip install -r requirements.txt",
                "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
            }
        }
    }
    r = httpx.patch(url, json=payload, headers=HEADERS)
    print("Patch status:", r.status_code)
    print(r.text)

def trigger_deploy():
    url = f"https://api.render.com/v1/services/{SERVICE_ID}/deploys"
    r = httpx.post(url, json={"clearCache": "do_not_clear"}, headers=HEADERS)
    print("Deploy status:", r.status_code)
    print(r.text)

if __name__ == "__main__":
    fix_start_command()
    trigger_deploy()
