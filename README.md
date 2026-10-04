# ⚡ Daily Battle — Color Rush (Telegram Mini App MVP)

> A fast-paced, addictive 30-second reflex battle game built with **React**, **TypeScript**, and **Vite**, engineered for **Telegram Mini Apps (TMA)** and modern web browsers.

---

## 🎮 1. Project Overview

**Daily Battle** is a competitive casual gaming platform for Telegram. Its flagship game mode, **Color Rush**, challenges players with rapid-fire color matching under a strict 30-second countdown.

### Key Highlights:
- **Core Game Loop**: 30-second high-intensity color identification rounds.
- **Dynamic Difficulty**: Automatically scales from 4 colors (Warm Up) to 5 colors (Rush) to 6 colors (Overdrive) as the timer progresses.
- **Scoring Engine**: Base points (+100), combo multipliers (up to 2.5x), reaction speed bonuses (`<250ms` lightning bonus), and penalties (-50, floored at 0).
- **Anti-Cheat & Fairness**: Strict input debounce and lockouts preventing rapid multi-touch spam, predictable controlled palettes, and client/server validation design.
- **Audio & Haptics**: Pure Web Audio API synthesized procedural sounds (dynamic pitch chimes, error buzz, countdown beeps, fanfare) + Telegram HapticFeedback integration.
- **Full Meta-Game**: Daily streaks, Coin Vault (cosmetics shop for avatars and frames), career stats, achievements, and Daily/Weekly Hall of Fame leaderboards.
- **State Persistence**: Progress, stats, coins, streaks, and customizations are preserved across browser refreshes via `localStorage`.
- **Hybrid Platform Architecture**: Runs standalone in any desktop/mobile browser with mock Telegram context, and automatically unlocks native Telegram WebApp features when launched inside Telegram.

---

## 🕹️ 2. Game Mechanics

| Metric | Rule / Formula |
|---|---|
| **Round Duration** | Exactly **30 seconds** countdown |
| **Colors** | Starts with 4 high-contrast colors (`LVL 1`), scales to 5 (`LVL 2`), and 6 (`LVL 3`) |
| **Base Score** | **+100 points** per correct tap |
| **Combo Multiplier** | Consecutive hits scale multiplier: `2x (+20%)`, `4x (+50%)`, `7x (+100%)`, `10x+ (+150%)` |
| **Speed Bonus** | `⚡ LIGHTNING (<250ms)`: **+80 bonus pts**<br>`⚡ FAST (<350ms)`: **+40 bonus pts** |
| **Penalty** | **-50 points** on wrong tap (resets combo to 0, score floored at 0) |
| **Coin Yield** | `Math.max(10, Math.floor(Score / 90) + ComboBonus)` |
| **Lifecycle** | `IDLE` ➔ `COUNTDOWN (3-2-1-GO)` ➔ `PLAYING` ➔ `GAME_OVER (TIME'S UP!)` ➔ `RESULTS` |

---

## 📱 3. Screens & Architecture

1. **Home Screen**:
   - Player identity header (Avatar with equipped frame, Level, Coin balance).
   - Interactive streak badge with daily coin claim bonus.
   - Today's challenge showcase: **COLOR RUSH** with player's personal best score.
   - Large pulsing **PLAY NOW** CTA.
   - Quick navigation to Leaderboard, Shop, and Profile.
2. **Game Screen**:
   - 30-second live countdown timer and animated visual depletion bar.
   - Real-time score counter and combo multiplier badge.
   - Central target color display with high-contrast text and glowing preview orb.
   - Touch-optimized color grid with desktop keyboard hints (`[1]` to `[6]`).
   - Floating score popups (`+180 ⚡LIGHTNING!`, `-50`).
   - Full-screen "TIME'S UP!" splash banner on match conclusion.
3. **Results (Game Over) Screen**:
   - Satisfying rolling score count-up animation with tick audio and confetti explosions.
   - Detailed telemetry: Final score, Accuracy %, Correct/Total ratio, Best & Average reaction time (ms), Highest combo, Coins awarded, and Global rank estimation.
   - **Play Again**, **Challenge Friend**, **Share Result**, and **Home** action buttons.
4. **Leaderboard Screen**:
   - Timeframe toggles for **Daily Rush** and **Weekly Elite**.
   - Top 3 championship podium (#1 Gold, #2 Silver, #3 Bronze) featuring competitors: `NeonWolf`, `SpeedFox`, `PixelKing`, `Nova`, `ShadowTap`, `Rocket`, `CyberCat`, and `Blaze`.
   - Distinctive visual highlighting of the current player with persistent sticky ranking footer.
   - Clear demo data disclosure banner.
5. **Shop Screen (Coin Vault)**:
   - Fictional **Coin** economy (explicitly separated from future Telegram Stars).
   - Filterable categories: **Avatars**, **Profile Frames**, and **Game Effects**.
   - Real-time inventory check, purchase confirmation, and dynamic equip system.
6. **Profile Screen**:
   - Player avatar, username, current level, and XP progression bar.
   - Career statistics: Best score, Win rate / accuracy %, current streak, longest streak, and total matches.
   - Achievement showcase with coin rewards (First Rush, Speed Demon, Combo King, Sharp Shooter, etc.).

---

## 🛠️ 4. Project Structure

```
Daily Battle/
├── client/
│   ├── index.html                 # HTML shell with Google Fonts & Telegram WebApp SDK
│   ├── package.json               # React 19, TypeScript, Vite, Lucide Icons, canvas-confetti
│   ├── tsconfig.json              # TypeScript project reference configs
│   ├── vite.config.ts             # Vite configuration
│   ├── .env.example               # Frontend environment variables template
│   └── src/
│       ├── App.tsx                # App root, modal guard, and screen router
│       ├── index.css              # Cyberpunk neon dark gaming design system
│       ├── components/
│       │   ├── Header.tsx         # User status, coins, and audio mute toggle
│       │   ├── BottomNav.tsx      # Mobile sticky bottom tab navigation
│       │   ├── Confetti.tsx       # Canvas confetti celebrations
│       │   └── Toast.tsx          # Real-time toast notification system
│       ├── screens/
│       │   ├── HomeScreen.tsx     # Hero banner, streak claim, play button
│       │   ├── GameScreen.tsx     # Active 30s game loop, HUD, and buttons
│       │   ├── GameOverScreen.tsx # Score roll-up, telemetry, share buttons
│       │   ├── LeaderboardScreen.tsx # Podium, daily/weekly competitor ranks
│       │   ├── ShopScreen.tsx     # Coin vault cosmetics shop & equip
│       │   └── ProfileScreen.tsx  # Career statistics & badge achievements
│       ├── game/
│       │   ├── colorPalette.ts    # High-contrast accessible color definitions
│       │   └── useColorRush.ts    # Core game loop engine hook (5 states)
│       ├── services/
│       │   ├── soundService.ts    # Web Audio API procedural synthesizer
│       │   ├── telegramService.ts # Telegram WebApp SDK abstraction layer
│       │   ├── userService.ts     # User progression, XP, coins, streaks
│       │   ├── scoreService.ts    # Score submission & anti-cheat contracts
│       │   ├── leaderboardService.ts # Leaderboard ranking logic
│       │   ├── shopService.ts     # Cosmetics inventory & purchase service
│       │   └── storageService.ts  # LocalStorage persistence layer
│       ├── types/                 # TypeScript interfaces (game, user, shop, telegram)
│       └── data/                  # Demo competitors, achievements, shop items
├── server/
│   ├── package.json               # Express server dependencies (express, cors, dotenv, pg)
│   ├── server.js                  # Node.js backend with Telegram initData HMAC validation
│   ├── db.js                      # PostgreSQL pool with auto-migration & in-memory fallback
│   ├── schema.sql                 # Production PostgreSQL schema (users, scores, purchases)
│   ├── .env                       # Server runtime configuration
│   └── .env.example               # Server environment variables template
├── .env                           # Root configuration
├── .env.example                   # Unified environment configuration example
└── README.md                      # Comprehensive project documentation
```

---

## 🚀 5. Getting Started (Local Development)

### Prerequisites:
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### Step 1: Install Dependencies
Open your terminal and install packages for both client and optional server:

```bash
# Install Client Dependencies
cd "client"
npm install

# (Optional) Install Server Dependencies
cd "../server"
npm install
cd ".."
```

### Step 2: Configure Environment Variables
Copy `.env.example` in `client`:

```bash
cd "client"
cp .env.example .env
```

Contents of `client/.env`:
```env
# Backend API URL (leave blank to run purely offline with mock data)
VITE_API_URL=

# Telegram Bot Username (for generating t.me challenge links)
VITE_TELEGRAM_BOT_USERNAME=DailyBattleBot
```

### Step 3: Run the Frontend
From the `client/` directory:

```bash
npm run dev
```

The app will start on **`http://localhost:5173`** (or the port Vite allocates). Open this link in Chrome, Safari, Firefox, or your mobile browser.

### Step 4: Validate Build & Linting
```bash
# Check code style and type safety
npm run lint

# Compile production bundle
npm run build
```

---

## 🌐 6. How Telegram Integration Works

The app implements a modular `telegramService.ts` abstraction that isolates all Telegram-specific APIs:

1. **Automatic Environment Detection**:
   - Inside Telegram: uses `window.Telegram.WebApp`. Automatically expands viewport (`expand()`), signals readiness (`ready()`), and utilizes native `HapticFeedback`.
   - Outside Telegram (browser/dev): automatically defaults to mock user data (`@cyber_ace`) and browser vibration/share APIs without throwing errors.
2. **Deep-Linked Referral & Challenge Flow**:
   - On the Results screen, tapping **Challenge Friend** triggers `telegramService.shareChallenge(score)`.
   - In Telegram: opens Telegram's native share modal with pre-filled challenge text:
     `https://t.me/share/url?url=https://t.me/DailyBattleBot/app?startapp=challenge_<SCORE>&text=...`
   - In desktop/mobile browsers: copies the challenge link to the clipboard and displays a toast notification.
3. **Closing the App**:
   - `telegramService.closeApp()` safely triggers Telegram's native close protocol.

---

## 🔒 7. Security & Production Anti-Cheat Architecture

In a real-money or competitive Telegram game, **all client-side data is treated as untrusted**. The project is structured with strict separation of concerns for server-side validation:

```
[ Telegram WebApp Client ]
          │
          │ 1. POST /api/match/start (auth: Telegram initData)
          ▼
   [ Node.js Backend ] ────> Generates sessionToken + encrypted round seed
          │
          │ 2. Client plays 30s match, recording input vector
          ▼
[ Client Submits Results ]
   - matchToken
   - [{ roundId, targetColorId, pickedColorId, tapDeltaMs }]
          │
          │ 3. POST /api/match/finish
          ▼
   [ Node.js Backend Verification ]
   ├── A. HMAC-SHA256 signature verification of Telegram initData using Bot Token.
   ├── B. Elapsed time validation (must be between 30.0s and 30.5s).
   ├── C. Human reaction feasibility check (flags impossible robotic taps < 100ms).
   ├── D. Deterministic re-simulation using the initial match seed.
   └── E. Write verified score to PostgreSQL / Redis leaderboard.
```

The sample server implementation in `server/server.js` already includes the exact `HMAC-SHA256` `verifyTelegramInitData` function ready for deployment.

---

## 🚢 8. Production Deployment

### Deploying the Frontend:
The frontend compiles to standard static HTML, CSS, and JS:
```bash
cd client
npm run build
```
The resulting `dist/` directory can be deployed directly to:
- **Cloudflare Pages** (Zero-cost global CDN)
- **Vercel** (`vercel --prod`)
- **Netlify** (`netlify deploy --prod --dir=dist`)
- **GitHub Pages** or **AWS S3 / CloudFront**

### Connecting to a Telegram Bot:
1. Open [@BotFather](https://t.me/BotFather) on Telegram.
2. Create a bot using `/newbot` (e.g. `@DailyBattleBot`).
3. Create a Mini App using `/newapp`.
4. Point the Web App URL to your deployed HTTPS frontend URL (e.g. `https://dailybattle.pages.dev`).
5. Set the short name to `app`.
6. Users can now launch the game directly inside Telegram via `https://t.me/DailyBattleBot/app`!

---

## 🔮 9. Production Roadmap

- [ ] **Persistent Database**: Connect PostgreSQL with Prisma/Drizzle for cross-device player state.
- [ ] **Telegram Stars Integration**: Implement Telegram Stars invoice API (`openInvoice`) for purchasing premium cosmetics.
- [ ] **Real-time 1v1 PvP**: WebSocket room matchmaker allowing friends to duel synchronously in 30-second battles.
- [ ] **Daily Tournament Seasons**: Weekly automated resets with trophy awards and Telegram channel leaderboards.

---

## 📄 License
MIT License. Built for high performance and addictive casual gameplay.
