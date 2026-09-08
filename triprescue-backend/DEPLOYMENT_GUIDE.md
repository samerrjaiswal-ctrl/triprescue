# TripRescue — Render Deployment Guide

Yeh guide backend ko **Render.com** par deploy karne ke liye hai.

---

## ⚡ Option 1: Render GitHub Blueprint (1-Click Deployment - Recommended)

Render me `render.yaml` already configured hai!

1. Apne project ko GitHub repo me push karo:
   ```bash
   git init
   git add .
   git commit -m "feat: complete TripRescue frontend and FastAPI backend"
   git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
   git branch -M main
   git push -u origin main
   ```
2. **[dashboard.render.com](https://dashboard.render.com/)** par jao.
3. **New +** button par click karo aur **Blueprint** select karo.
4. Apni GitHub repository choose karo.
5. Render automatically `render.yaml` ko detect karega aur service create kar dega:
   - **Runtime**: Python 3.11
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Click **Apply**. Kuch hi minutes me tumhara backend live URL mil jayega (e.g. `https://triprescue-backend.onrender.com`).

---

## 🐳 Option 2: Render Web Service (Manual)

1. Render Dashboard me **New + > Web Service** click karo.
2. Root directory: `triprescue-backend`
3. Environment: `Python` (ya `Docker` using the included `Dockerfile`)
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

## 🤖 Option 3: Render MCP Setup (AI Direct Control)

Agar tumhe agent ke saath Render MCP server connect karna hai:

1. Render Dashboard se apna **Personal API Key** generate karo:
   - **Settings** -> **API Keys** -> **Create API Key**.
2. Render MCP config add karo:
   ```json
   {
     "mcpServers": {
       "render": {
         "command": "npx",
         "args": ["-y", "@niyogi/render-mcp"],
         "env": {
           "RENDER_API_KEY": "rnd_your_api_key_here"
         }
       }
     }
   }
   ```
3. Once configured, AI directly Render par services deploy aur monitor kar sakega!
