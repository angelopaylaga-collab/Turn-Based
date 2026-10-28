# 🦊 Emoji Astral: Turn-Based RPG

A tactical turn-based RPG inspired by *Honkai: Star Rail* with single-emoji heroes, elemental shields, toughness breaks, 9 Paths, 8 Elements, and PWA mobile offline support.

---

## 🚀 How to Play the Game

### Method 1: Instant Play in Browser or on Phone (Recommended — 0 Setup)
You do **not** need to install Node.js, run terminal commands, or unzip files to play!

Open the live game directly:
👉 **[Open Live Game](https://ais-pre-pbdjde6nzrvvunxx4kxrr3-873081854110.asia-east1.run.app)**

#### How to Install as an App on your Phone:
1. Open the link above in **Google Chrome** (Android) or **Safari** (iOS iPhone/iPad).
2. Tap the **Install** button inside the game, or tap your browser's menu (⋮ on Chrome, Share on Safari).
3. Select **"Add to Home Screen"** or **"Install App"**.
4. The game will now appear on your home screen with its own icon and works completely offline with full sound and auto-saved progress!

---

### Method 2: Running Locally on Windows
If you downloaded the project as a `.zip` file:
1. Extract the `.zip` file to a folder.
2. Ensure you have [Node.js](https://nodejs.org/) installed on your PC.
3. Double-click **`start.bat`**.
4. The launcher will automatically install dependencies and open the game in your browser at `http://localhost:3000`.

---

### Method 3: Running Locally on Mac / Linux / Terminal
1. Open Terminal in the unzipped project folder.
2. Run:
   ```bash
   npm install
   npm run dev
   ```
3. Open `http://localhost:3000` in your web browser.

---

### ❓ Why double-clicking `index.html` directly doesn't work:
Modern web applications built with **React**, **TypeScript**, and **Vite** are compiled modular apps (`<script type="module">`). Web browsers (Chrome, Safari, Edge, Firefox) block JavaScript modules loaded directly over the `file:///` protocol due to browser security (CORS) rules. They must be served through an HTTP server (such as Vite's local dev server via `start.bat` or hosted on the web).

---

## 🎮 Key Features
- **Portrait Battle UI**: Inspired by HSR mechanics with Turn Order timeline ladder on the left, upper enemy positions with Toughness bars and Elemental Weaknesses, and party cards with dedicated "ULT" buttons.
- **Skill Points (SP) Management**: Team shares a pool of up to 5 SP. Basic Attacks generate +1 SP and +20 Energy; Skills consume 1 SP and +30 Energy.
- **Decoupled Ultimate Interrupts**: Tap the glowing "ULT" button on any character with full energy to immediately interrupt the turn order!
- **Targeting**: Choose an ally to heal, shield, or buff, and choose which enemies to target.
- **HSR Warp (Gacha) System**: Multiple banners (Event Warps, 20% off Departure Warp, Stellar Warp), exact HSR probabilities (0.6% 5★, 5.1% 4★, 94.3% 3★), pity counters (90-pull hard pity, soft pity at 74), and hyperspace warp animations!
- **Auto-Save Persistence**: All player progress, currencies, levels, cleared stages, and roster data auto-save locally to your device.
