# Nebula Chat — Uncensored AI Assistant

A production-ready, GitHub-deployable AI chatbot web application. The frontend is built with plain HTML / CSS / vanilla JavaScript (no frameworks). The backend is a small Node.js + Express server that proxies streaming chat completions to the **OrcaRouter API** and keeps credentials secure.

All conversations persist only in the user's browser via `localStorage`. API keys **never** leave the backend server.

---

## ✨ Features

- ChatGPT-style streaming UI (tokens appear progressively)
- Sidebar with chat history, search, rename, delete, new chat
- Dark + light themes with CSS variables
- Mobile-first responsive layout (drawer sidebar on small screens)
- Markdown rendering (GFM, headings, lists, tables, blockquotes, inline code)
- Syntax-highlighted code blocks with a **Copy code** button
- Auto-growing textarea, Enter-to-send, Shift+Enter for newline
- "Stop generating" button while AI is responding
- Settings modal: theme, clear all chats, model info, connection status
- Custom confirm dialogs, toast notifications, keyboard shortcuts
- localStorage persistence for chats + active chat + theme
- XSS-safe rendering via `DOMPurify` on any generated HTML
- Basic backend rate limiting, CORS, Helmet security headers
- Render-deployable single web service (backend serves static frontend)
- `/api/health` endpoint for monitoring and UI status
- Graceful error handling (network, auth, rate limit, empty response, stream interruption)

---

## 📁 Project Structure

```
uncensored-ai-chatbot/
│
├── frontend/
│   ├── index.html
│   │
│   ├── css/
│   │   └── custom.css
│   │
│   ├── js/
│   │   ├── app.js
│   │   ├── chat.js
│   │   ├── api.js
│   │   └── ui.js
│   │
│   └── assets/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── .gitignore
├── render.yaml               # Render Blueprint spec (auto-deploy config)
└── README.md
```

---

## 🚀 Run Locally

### 1. Prerequisites

- **Node.js** ≥ 18 (uses the built-in `fetch` + readable streams)
- An **OrcaRouter API key** (sign up at [orcarouter.ai](https://orcarouter.ai/))

### 2. Clone the repository

```bash
git clone <your-repo-url>
cd uncensored-ai-chatbot
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Configure environment variables

```bash
# Inside the `backend/` folder
copy .env.example .env          # Windows (PowerShell)
# — or —
cp .env.example .env            # macOS / Linux
```

Then open `.env` and paste your key:

```env
ORCA_API_KEY=sk-orca-xxxxxxxxxxxxxxxxxxxxx
PORT=3000
```

Optional overrides (all have sensible defaults):

```env
MODEL_NAME=obsidian/Qwen3.8-27B
ORCA_API_BASE_URL=https://api.orcarouter.ai/v1
MAX_TOKENS=4096
TEMPERATURE=0.7
NODE_ENV=development
```

### 5. Start the server

```bash
# Inside backend/
npm start
# or for development with auto-restart:
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables — Complete List

| Variable | Required | Default Value | Type | Description | Kahaan Se Milta Hai? |
|---|---|---|---|---|---|
| `ORCA_API_KEY` | ✅ YES | — | String | OrcaRouter API authentication key | **Neeche step-by-step diya hai** ↓ |
| `PORT` | ❌ | `10000` (Render) / `30000` (Local) | Number | Server listen port | Render auto-set karta hai, local me aap apni marzi ka de sakte ho |
| `NODE_ENV` | ❌ | `development` | String | Runtime environment flag | `production` set karo Render pe, local me `development` rehne do |
| `MODEL_NAME` | ❌ | `obsidian/Qwen3.8-27B` | String | Model slug jo OrcaRouter pe run karna hai | [orcarouter.ai](https://orcarouter.ai/) ke dashboard me available models ki list se exact slug copy karo |
| `ORCA_API_BASE_URL` | ❌ | `https://api.orcarouter.ai/v1` | String (URL) | OrcaRouter API ka base endpoint | OrcaRouter ke docs me diya hua hai. Default hi use karo, tab tak change ki need na ho |
| `MAX_TOKENS` | ❌ | `4096` | Integer | Maximum tokens in AI response | Aapki marzi — `2048`, `4096`, `8192` (model ke according) |
| `TEMPERATURE` | ❌ | `0.7` | Float (0.0 – 2.0) | Response randomness/creativity | `0.0` = exact/factual, `1.0+` = creative/random |

---

## 🪪 ORCA_API_KEY Kahaan Se Le? (Step-by-Step)

`ORCA_API_KEY` **sabse important variable hai** — bina ye chatbot kaam nahi karega.

### Step 1: OrcaRouter par Sign Up

1. Browser me jao: **[https://orcarouter.ai/](https://orcarouter.ai/)**
2. "Sign Up" / "Get Started" button pe click karo
3. Email ya Google/GitHub se sign up karo

### Step 2: Dashboard me Jaakar API Key Generate Karo

1. Sign up ke baad dashboard me redirect honge
2. Sidebar se **"API Keys"** ya **"Settings"** section khojo
3. **"Create New API Key"** / **"Generate Key"** button pe click karo
4. Key ko ek naam do (jaise: `nebula-chat-render`, `my-chatbot-key`)
5. Generate hone par **ek hi baar** dikhegi — isko **copy karke safe jagah save kar lo** (baad me dobara nahi milegi)
6. Key ka format kuch aisa hoga: `sk-orca-xxxxx...`

### Step 3: Dashboard Se Model Name Confirm Karo

1. OrcaRouter dashboard me **"Models"** ya **"Playground"** section jao
2. Uncensored Qwen3.8 27B model ko dhoondo
3. Exact `slug` / `identifier` copy karo
4. Yehi value `MODEL_NAME` variable me use hogi. Default `obsidian/Qwen3.8-27B` hai, agar aapke dashboard me alag slug hai to wo use karo.

> ⚠️ **Important:** API key kabhi bhi public me mat share karo, `.env` ya Render ke Environment Variables me hi rakho. `.gitignore` already `.env` ko exclude karta hai, so GitHub pe upload nahi hoga.

---

## 🆕 Git First-Time Setup (Windows — Abhi Install Kiya Hai?)

Git abhi-abhi install kiya hai? Pehle **one-time setup** karna zaroori hai, warna `git commit` / `git push` error dega.

### Step 0: Verify Git Installed (Check Karo)

**Pehli baar use karne se pehle yeh confirm karo:**

1. **Start Menu** → search "PowerShell" → **Windows PowerShell** kholo
2. Yeh command run karo:
   ```powershell
   git --version
   ```
   Output kuch aisa aana chahiye:
   ```
   git version 2.47.0.windows.1
   ```
   ✅ Version number dikh raha hai → **Git installed correctly.**
   ❌ "not recognized" error aaya → Git install nahi hua / PATH me add nahi hua. Dobara installer run karo → **"Add to PATH"** option definitely tick karo → PC restart karo.

### Step 1: Git Me Apna Naam Aur Email Set Karo (One-Time Only)

Har commit me aapka naam aur email store hota hai — ye `git config` se set karo (PowerShell me hi run karo):

```powershell
# 1. Apna global naam set karo (GitHub display name)
git config --global user.name "Apna Naam Yahan"

# 2. Wahi email set karo jisse GitHub par signup kiya hai
git config --global user.email "tumhara.email@example.com"

# 3. Optional — default branch "main" set karo
git config --global init.defaultBranch main

# 4. Verify sab set hua hai ya nahi
git config --list
```
> ⚠️ **Important:** Email **exactly wahi** honi chahiye jisse aapne GitHub account banaya hai, warna commits "Unknown Author" dikhayenge.

### Step 2: Git Credential Manager (GCM) Setup (Automatic)

Windows ke Git installer ke saath **Git Credential Manager for Windows** automatically install hota hai — isko manually setup karne ki need nahi. Jab aap pehli baar `git push` karoge, tab:

- Aapko GitHub login window popup hogi (browser me)
- Ya **PAT (Personal Access Token)** maangega → neeche step-by-step diya hai

> Jab browser se login popup aaye → `Authorize GitCredentialManager` pe click karo → bas ho gaya! Future pushes me dobara login nahi puchhega.

### Step 3: Optional — Personal Access Token (PAT) Create Karo

Browser se login nahi hota, ya command line me password maangta hai → **PAT use karo**. Ye password ki jagah kaam karta hai:

1. GitHub login karo → top-right me profile picture → **Settings**
2. Left sidebar ke last me → **Developer settings**
3. **Personal access tokens** → **Tokens (classic)**
4. **Generate new token** → **Generate new token (classic)**
5. **Note:** "Git Push on Windows" (ya kuch aur naam)
6. **Expiration:** 90 days (ya `No expiration` — risky but convenient)
7. **Select scopes:** ↙️ **tick ONLY yeh**:
   - ✅ `repo` (Full control of private repositories — sub-options auto-check ho jayenge)
8. Neeche **"Generate token"** par click
9. Ek token aayega `ghp_xxxxxx...` format me → **YEH EK HI BAAR DIKHETI HAI, COPY KAR KE SAFE JAGAH SAVE KAR LO**
10. Jab `git push` me password maange → is **PAT token ko paste karo** (password ki jagah PAT use hota hai)

---

## 🐙 GitHub Par Upload Karne Ke Steps

Pehle poora project GitHub pe push karna zaroori hai — Render wahi se code lega.

### 1. GitHub Par Naya Repository Banaye

1. **[https://github.com/](https://github.com/)** par jao aur login karo
2. Right-top corner me **"+"** → **"New repository"** par click
3. Repository naam daalo (jaise: `nebula-chat`, `uncensored-ai-chatbot`)
4. **Public** ya **Private** rakho (Render dono se connect ho sakta hai)
5. ❌ "Initialize with README" ko mat tick karo (hamara project already hai)
6. **"Create repository"** par click

### 2. Local Project Ko GitHub Se Connect Kare (Step-by-Step, PowerShell Me)

Project ke **root folder** me PowerShell kholo (jisme `README.md`, `render.yaml`, `backend/`, `frontend/` sab files hain):

#### ✅ Terminal Kaise Khole (Root Folder Me)?
Folder jaise `uncensored-ai-chatbot/` ke **andar** PowerShell kholo:
1. File Explorer me us folder par jao jisme code hai
2. **Address bar** (top me path dikhta hai) par click karo → sabse end me `powershell` type karo → **Enter** press karo
3. Yahi right method hai — cd ki need nahi padegi

#### Run These Commands EXACTLY, Ek Ke Baad Ek:

```powershell
# ============================================================
# STEP 1 — Git initialize karo (ek baar hi run karo)
# ============================================================
git init

# Output hoga: "Initialized empty Git repository in C:\...\uncensored-ai-chatbot\.git\"

# ============================================================
# STEP 2 — Saari files ko "stage" karo (upload ke liye taiyaar)
# ============================================================
git add .

# (Yahan koi nahi aayega — chup chap ho gaya to matlab OK)

# ============================================================
# STEP 3 — Check karo kya stage hua hai (optional, verify)
# ============================================================
git status

# Sab files ke aage green me "new file:" likhna chahiye.
# Agar kuch RED me dikh raha hai to matlab add nahi hua.

# ============================================================
# STEP 4 — Pehla "commit" banao (snapshot le lo)
# ============================================================
git commit -m "Initial commit: Nebula Chat ready for Render"

# Output me line aayegi jaise:
# [main (root-commit) ab12cd3] Initial commit: Nebula Chat ready for Render
#   12 files changed, 456 insertions(+)

# ============================================================
# STEP 5 — Branch name "main" set karo (recommended)
# ============================================================
git branch -M main

# ============================================================
# STEP 6 — Local repo ko GitHub se connect karo
# ⚠️ <your-username> aur <your-repo-name> KO APNE SE REPLACE KARO!
# ============================================================
# Example: agar tumhara username "sahil" aur repo "nebula-chat" hai →
# git remote add origin https://github.com/sahil/nebula-chat.git
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# ============================================================
# STEP 7 — GitHub pe code PUSH karo (FINAL STEP)
# ============================================================
git push -u origin main
```

#### Jab Push Karoge Tab Yeh Hoga (Expected):
- **PEHLI BAAR:** GitHub login ka popup window khulega browser me → login karo → **Authorize** button dabao → wapas PowerShell me aao → sab kuch automatically ho jayega
- **Nahi khulta popup:** Command line me username maange → GitHub username dalo → **Password maange → PAT token paste karo** (jo upar Step 3 me banaya tha)
- **Success hote hi:** Aapko output me `To https://github.com/...` line dikhegi → `* [new branch]      main -> main`

✅ **Ho Gaya!** Ab browser me apni GitHub repo ka URL open karo → saari files wahan dikhni chahiye.

---

### Future Me Code Change Karne Ke Baad — 3 Simple Commands

Ab se jitni baar bhi code me kuch badlao aur upload karna ho, sirf ye 3 lines run karo (root folder me PowerShell me):

```powershell
# 1. Changes stage karo
git add .

# 2. Message ke saath commit banao (message ko apne hisaab se change karo)
git commit -m "Bug fix: chat streaming delay"

# 3. GitHub pe push karo
git push
```
Bas! Yeh 3 commands routine hogi. Sabse pehli baar ke steps (init, remote add) sirf ek baar karne hote hain.

---

### ⚠️ Common Git Errors + Fixes

| Error | Reason | Fix |
|---|---|---|
| `fatal: not a git repository` | `git init` nahi chala ya galat folder me terminal khola | Sahi root folder me jao → `git init` dobara run karo |
| `fatal: remote origin already exists` | Pehle se `origin` set hai | `git remote remove origin` run karo → phir `git remote add origin ...` |
| `error: src refspec main does not match any` | `git commit` successfully nahi hua | Pehle `git add .` → `git commit -m "..."` proper run karo |
| `fatal: Authentication failed` | Password/PAT galat dala | Credential Manager se cache clear karo → ya naya PAT banake use karo |
| `error: failed to push some refs` | GitHub repo me pehle se kuch file hai (jaise auto-generated README) | `git pull origin main --allow-unrelated-histories` run karo → phir `git push` |

---

## ☁️ Render Par Deploy Karne Ke Steps (2 Methods)

Render pe deploy karne ke **2 tareeke** hain — dono ka result same hoga. **Method A (Blueprint)** easiest hai kyunki hamara `render.yaml` already configure hai.

---

### ⚡ Method A — Blueprint Deploy (1-Click Jaisa, Recommended)

Ye method `render.yaml` file ko use karke automatically sab settings configure karega.

#### Step 1: Render Par Sign Up / Login

1. **[https://render.com/](https://render.com/)** par jao
2. GitHub account se sign up/login karo (sabse aasan)

#### Step 2: Naya Blueprint Instance Banaye

1. Render dashboard ke top navigation se **"Blueprints"** par click
2. **"New Blueprint Instance"** button pe click
3. Aapka GitHub account select karo, jisme project upload kiya hai
4. Repository list me aapka **uncensored-ai-chatbot** repo select karo
5. Branch: `main` (ya jisme code hai)
6. **"Apply"** / **"Continue"** par click

#### Step 3: Blueprint Settings Confirm Kare

Render `render.yaml` file ko automatically read karega aur service create karega.
- Service Name: `uncensored-ai-chatbot` (ya kuch aur)
- Runtime: `Node`
- Plan: **Free** (start karo, baad me upgrade kar sakte ho)

#### Step 4: Environment Variables Set Kare (IMPORTANT 🔥)

Blueprint create hone ke baad:

1. Render dashboard se aapki **Web Service** par jao
2. Left sidebar se **"Environment"** tab par click
3. Neeche "Environment Variables" section me jao
4. **"Add Environment Variable"** button se sabse pehle ye variable add karo:

   | Key | Value |
   |---|---|
   | `ORCA_API_KEY` | `sk-orca-xxxx` (OrcaRouter se copy ki hui real key paste karo) |

   > Baaki sab variables (`PORT`, `NODE_ENV`, `MODEL_NAME`, etc.) `render.yaml` me already set hain, unko aap override kar sakte ho agar chahiye.

5. **"Save Changes"** par click karo

#### Step 5: Deploy Hone Ka Intezaar Kare

1. Environment save karte hi Render automatically **redeploy** karega
2. **"Events"** tab me deploy ka progress dekh sakte ho
3. Deploy hone me **2–5 minute** lagte hain
4. Top par ek URL milega jaise: `https://uncensored-ai-chatbot-xyz123.onrender.com`
5. ✅ URL open karo — chatbot live hai!

---

### ✋ Method B — Manual Web Service Deploy

Blueprint se issue aaye to ye tareeka apnao. Sab settings manually karni padengi.

#### Step 1: New Web Service Create Kare

1. Render dashboard → **"New"** → **"Web Service"** par click
2. GitHub account select kare → aapka `uncensored-ai-chatbot` repo select kare
3. **"Connect"** par click

#### Step 2: Service Settings Configure Kare

Yeh fields **exactly** fill kare:

| Field | Value | Kyun? |
|---|---|---|
| **Name** | `uncensored-ai-chatbot` (ya apna naam) | Unique hona chahiye, isse URL banta hai |
| **Runtime** | `Node` | Hamara backend Node.js pe hai |
| **Region** | `Oregon (US West)` ya nearest | Free plan me sirf yahi option hota hai |
| **Branch** | `main` | Jisme aapka code hai |
| **Root Directory** | `backend` | ⚠️ **YEH ZAROORI HAI** — backend folder me `package.json` hai |
| **Build Command** | `npm install` | Dependencies install karega |
| **Start Command** | `npm start` | Server start karega |
| **Instance Type** | `Free` (Starter) | Start ke liye free enough hai |

#### Step 3: Environment Variables Sab Add Kare

**"Advanced"** section me jaake, ya service banane ke baad **Environment** tab me:

| Key | Value | Kaam |
|---|---|---|
| `NODE_ENV` | `production` | Production mode enable karega, CORS settings sahi hogi |
| `ORCA_API_KEY` | `sk-orca-xxxxxxxxxxx` | 🔥 **SABSE ZAROORI** — OrcaRouter ki real API key paste karo |
| `PORT` | `10000` | Render ka convention hai, ise hi rakho |
| `MODEL_NAME` | `obsidian/Qwen3.8-27B` | Model slug — OrcaRouter dashboard se confirm karke exact value daalo |
| `ORCA_API_BASE_URL` | `https://api.orcarouter.ai/v1` | Default hi rakho, unless OrcaRouter ne kuch alag diya ho |
| `MAX_TOKENS` | `4096` | Response length control |
| `TEMPERATURE` | `0.7` | Creativity level |

#### Step 4: Health Check Path Set Kare (Advanced Section)

Advanced options me scroll karo → **Health Check Path** me ye paste kare:

```
/api/health
```

Render har 5 minute me is endpoint ko call karke service ki health check karega.

#### Step 5: Deploy Kare

**"Create Web Service"** / **"Deploy"** button par click karo.

- Deploy hone me 2–5 min lagenge
- Live URL top par dikhega: `https://<service-name>-<random>.onrender.com`
- Open karo, type karo, chat start karo! 🎉

---

## ✅ Deploy Ho Gaya? Verification Steps

1. Open `https://your-app.onrender.com/api/health` — JSON response aana chahiye:
   ```json
   {
     "status": "ok",
     "model": "obsidian/Qwen3.8-27B",
     "apiKeyConfigured": true,
     "..."
   }
   ```
   Agar `apiKeyConfigured: false` hai → `ORCA_API_KEY` set nahi hua, dubara check karo.

2. Chatbot page khole → sidebar footer me **connection indicator** hona chahiye:
   - 🟢 Green = Sab theek hai, API key valid hai
   - 🔴 Red = Koi issue hai (check logs / variables)

3. Ek test message bhejo → response aana chahiye streaming me.

---

## 📜 Render Logs Kaise Dekhe? (Debug Karo)

Agar kuch kaam nahi kar raha ho:

1. Render dashboard → aapki Web Service open kare
2. **"Logs"** tab par click kare
3. Yahan har server log dikhega — deploy logs, runtime errors, API errors, etc.
4. Common errors:
   - `ORCA_API_KEY is not set` → Environment me key nahi dali
   - `401 Unauthorized` → API key galat/expired hai
   - `Module not found` → `npm install` run nahi hua (ya Root Directory galat set hai)
   - `PORT` error → PORT `10000` set karo

---

## 💡 Free Plan Ki Limitations (Render Free Tier)

Render ka free plan portfolio / testing ke liye perfect hai, lekin:

| Limitation | Detail |
|---|---|
| **Spin-down** | 15 minute inactive hone par service sleep ho jati hai |
| **Wake-up delay** | Sleep ke baad pehla request me 30–60 sec lagte hain |
| **RAM limit** | 512 MB RAM |
| **Monthly hours** | 750 hours / month (single service ke liye poora month chal jata hai) |

**Solution:** Thoda budget hai to **Starter ($7/month)** plan upgrade kar lo — 24×7 active, no spin-down.

---

## 🔄 Custom Domain Lagana Chahte Ho? (Optional)

1. Render service → **"Custom Domains"** tab
2. **"Add Custom Domain"** → aapka domain daalo (jaise `chat.merawebsite.com`)
3. Render aapko **CNAME record** dega
4. Apne domain registrar (GoDaddy, Cloudflare, Hostinger, etc.) ke DNS settings me ye CNAME add karo
5. Render automatically SSL certificate install kar dega (HTTPS ready ✅)

---

## 🛠️ API Endpoints (Backend)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/` | Frontend serve karta hai (`frontend/index.html`) |
| `GET` | `/api/health` | Server status, model, API-key health return kare |
| `POST` | `/api/chat` | SSE streaming response (ya JSON if `stream: false`) |

### `POST /api/chat` Request Body

```json
{
  "messages": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi there!" },
    { "role": "user", "content": "Tell me more." }
  ],
  "stream": true
}
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Enter` | Send message (composer me) |
| `Shift+Enter` | New line (composer me) |
| `Ctrl/Cmd + N` | New chat start kare |
| `Ctrl/Cmd + /` | Composer pe focus kare |
| `Ctrl/Cmd + B` | Sidebar toggle kare (mobile me kaam aayega) |
| `Esc` | Modal / sidebar close kare |

---

## 🔒 Security Notes

- **API key sirf server pe** rehti hai — kabhi bhi frontend / HTML / JS me nahi aati
- Backend request validation karta hai (messages array, role whitelist, size caps)
- Rate limiting: `/api/chat` (30/min per IP) aur `/api/health` (120/min per IP)
- `helmet` se security headers set hain
- Frontend me Markdown → HTML **DOMPurify.sanitize(...)** ke baad hi render hota hai
- `.env` already `.gitignore` me hai — kabhi GitHub pe upload nahi hoga

---

## ❓ FAQ / Troubleshooting

### Q: "API key missing" ya connection indicator red hai?

- Kya `ORCA_API_KEY` Render ke **Environment** tab me add kiya hai? Dashboard me save karo → manual redeploy karo (**"Manual Deploy" → "Clear build cache & deploy"**)
- Kya key sahi format me hai? `sk-orca-` se start hona chahiye
- Logs me check karo — agar `ORCA_API_KEY is not set` likha aa raha hai → variable save nahi hua

### Q: Model kaun sa use karu? Exact slug kya hai?

OrcaRouter ke dashboard me **Models** section jao → Uncensored Qwen3.8 27B FP8 ka exact `slug` copy karo. 2 common options:

1. **Default:** `obsidian/Qwen3.8-27B`
2. **Alternative:** `orcarouter/Qwen3.8-27B-Uncensored-FP8` (agar OrcaRouter direct expose karta hai)

### Q: Deploy ho gaya par pehla message bahut late aata hai?

Free tier hai — 15 minute me sleep ho jata hai. Pehla request usko wake-up karta hai (30–60 sec). Baaki sab fast honge. Ya paid plan upgrade kar lo.

### Q: Kya OrcaRouter ki jagah koi aur OpenAI-compatible provider use kar sakte hain?

**Haan!** Bas 3 variables change karo:
- `ORCA_API_BASE_URL` = us provider ka API endpoint (jaise: `https://api.openai.com/v1`)
- `ORCA_API_KEY` = us provider ki API key
- `MODEL_NAME` = us provider ka model name (jaise: `gpt-4o-mini`)

Backend standard `/chat/completions` + streaming use karta hai — sab OpenAI-compatible providers ke saath kaam karega.

### Q: System prompt kahan change karu?

[backend/server.js](./backend/server.js) ke **top me** `SYSTEM_PROMPT` constant hai — wahi edit karo, redeploy karo.

---

## 📝 Quick Recap — 6 Steps Me Deploy

| # | Step | Kahan Karna Hai? |
|---|---|---|
| 1 | `ORCA_API_KEY` generate kar lo | [orcarouter.ai](https://orcarouter.ai/) Dashboard → API Keys |
| 2 | Project GitHub pe push kar do | `git init → add → commit → push` |
| 3 | Render par signup/login | GitHub account se |
| 4 | Blueprint ya Manual Web Service create karo | Render Dashboard |
| 5 | Environment variables set karo — especially `ORCA_API_KEY` | Render → Service → Environment tab |
| 6 | Deploy hone ka wait karo → URL pe jaake chat karo | 🎉 LIVE! |

---

## 📝 License

MIT — do what you want, no warranty.
