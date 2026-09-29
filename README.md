# PERSAKA 26/27 · Memory Codebreaker (Arcade Edition)

A Pac-Man-styled memory puzzle game built for the PERSAKA 26/27 booth challenge (UTM Faculty of Computing).
Players match tech cards, collect secret letters, and unscramble them into a tech word across 5 stages.
Every run is saved to an online leaderboard with the player's name, score and time.

- **Frontend:** Vue 3 + Vite
- **Backend:** PHP 8.1+ with Slim 4
- **Database:** MySQL / MariaDB (Laragon + HeidiSQL)

---

## 1. About the game

### How to play

1. **Enter your name.** Before the game starts, type the name you want on the leaderboard. It's remembered for next time.
2. **Match the cards.** Each stage has a board of face-down cards. Flip two per turn to find a tech logo and its matching name (for example the snake and `PYTHON`).
3. **Collect letters.** Every successful match drops secret letters into the *Letters* tray at the bottom.
4. **Crack the code.** When every pair is matched, the letters are scrambled. Tap them in the right order to spell one tech word before the timer runs out.
5. **Advance.** Solve the word to clear the stage. Run out of time and the game is over.
6. **See your score.** When the run ends (win or lose), the score is saved automatically under the name you entered, and your rank pops up right away — nothing more to type.

### Stages

The game gets harder each stage: more cards, longer words and less time.

| Stage | Card pairs | Word length | Code timer |
|-------|-----------:|------------:|-----------:|
| 1     | 3          | 5 letters   | 40 s       |
| 2     | 4          | 5 letters   | 35 s       |
| 3     | 4          | 6 letters   | 30 s       |
| 4     | 5          | 6 letters   | 25 s       |
| 5     | 5          | 7 letters   | 20 s       |

Clearing all 5 stages wins the game. A failed stage ends the run, but the points from the stages you already cleared are kept and saved.

---

## 2. Score calculation

Points are awarded **only when you clear a stage**. Each cleared stage adds three parts:

| Part | Formula | What it rewards |
|------|---------|-----------------|
| **Clear bonus** | `1000 × stage number` | Getting further (stage 5 is worth 5000) |
| **Memory bonus** | `150 × pairs − 25 × wasted moves` (never below 0) | Matching cards with few mistakes |
| **Speed bonus** | `25 × seconds left on the code timer` | Solving the word quickly |

- A *move* is one turn of flipping two cards.
- *Wasted moves* = `moves − pairs`. A perfect stage uses exactly as many moves as there are pairs, so nothing is deducted.
- Your **total score** is the sum of all cleared stages.

### Worked example (Stage 1)

You clear stage 1 (3 pairs) in 3 moves, with 39 seconds left on the timer:

```
Clear bonus  = 1000 × 1                 = 1000
Memory bonus = 150 × 3 − 25 × (3 − 3)   =  450
Speed bonus  = 25 × 39                  =  975
                                          ------
Stage score                             = 2425
```

If you had needed 6 moves instead, the memory bonus would drop to `450 − 25 × 3 = 375`.

### Best possible score per stage

| Stage | Clear | Memory (max) | Speed (max, full timer) | Total |
|------:|------:|-------------:|------------------------:|------:|
| 1     | 1000  | 450          | 1000                    | 2450  |
| 2     | 2000  | 600          | 875                     | 3475  |
| 3     | 3000  | 600          | 750                     | 4350  |
| 4     | 4000  | 750          | 625                     | 5375  |
| 5     | 5000  | 750          | 500                     | 6250  |
| **All** |     |              |                         | **21,900** |

In practice the maximum is lower, because solving the word takes at least a moment. The API accepts scores up to 30,000 as a safety limit.

### Time on the leaderboard

The saved **time** is active play time only: the memory phase plus the code phase of each stage. The pause on the "Stage cleared" screen is not counted.

### Ranking

1. Higher **score** ranks first.
2. If two scores are equal, the **faster time** ranks first.

The scoring formula lives in `frontend/src/config.js` (`stageScore`) if you want to adjust it.

---

## 3. Project structure

```
memorybreaker/
├── frontend/          Vue 3 game (Pac-Man theme, PERSAKA logo)
│   ├── src/
│   │   ├── components/    Start screen, board, overlays, leaderboard
│   │   ├── composables/   useGame.js (game logic)
│   │   ├── config.js      Tech pool, words, stages, scoring
│   │   ├── api.js         Calls to the backend
│   │   └── style.css      Arcade theme
│   └── vite.config.js
├── backend/           Slim 4 REST API
│   ├── public/index.php   Routes
│   ├── src/               Database, repository, controller, CORS
│   ├── config.php         Settings + .env loader
│   └── .env               Your local database login (not committed)
└── database/
    └── schema.sql         MySQL schema (creates the database and scores table)
```

---

## 4. Run it locally

### Requirements

- **Laragon** (with MySQL and PHP 8.1 or newer)
- **Composer**
- **Node.js 18+**

### Step 1: Create the database

The schema is in [`database/schema.sql`](database/schema.sql). It creates the `persaka_codebreaker` database and the `scores` table. It is safe to run more than once.

1. Open Laragon and click **Start All**.
2. Click **Database** to open HeidiSQL and connect to your MySQL server.
3. Import the schema using either method:

   **Option A: HeidiSQL**
   - Go to **File → Run SQL file...** and choose `database/schema.sql`.
   - Or open the file with **File → Load SQL file...**, then press `F9` to run it.

   **Option B: command line**
   ```powershell
   mysql -u root -p < database/schema.sql
   ```
   (Laragon's `mysql.exe` must be on your PATH, or use Laragon's terminal.)

4. In HeidiSQL, right-click the server in the left panel and choose **Refresh**. You should see `persaka_codebreaker` with a `scores` table.

The table has these columns:

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT, auto increment | Primary key |
| `player_name` | VARCHAR(12) | Name entered by the player |
| `score` | INT | Total score of the run |
| `time_ms` | INT | Active play time in milliseconds |
| `stages_cleared` | TINYINT | Stages cleared (0 to 5) |
| `created_at` | TIMESTAMP | When the score was saved |

An index on `(score, time_ms)` keeps the leaderboard query fast.

### Step 2: Configure the backend

Create a file named exactly `.env` inside the `backend` folder (next to `config.php`). A template is provided at `backend/.env.example` — copy it and fill in your password:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=persaka_codebreaker
DB_USER=root
DB_PASS=your_password_here

APP_DEBUG=false
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Use no spaces around `=` and no quotes. Make sure Windows did not save it as `.env.txt`.

### Step 3: Start the backend

```powershell
cd backend
composer install
composer start
```

`composer start` runs `php -S localhost:8000 -t public` and is already configured with an unlimited process timeout, so the server won't stop itself after 5 minutes.

Check that it works by opening `http://localhost:8000/api/health`. You should see:

```json
{"status":"ok","entries":0}
```

### Step 4: Start the frontend

In `frontend/vite.config.js`, the proxy must point to the same port as the backend:

```js
proxy: { '/api': 'http://localhost:8000' }
```

Then, in a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** and play. Open the game from this address, not through Laragon's own web address.

---

## 5. API reference

| Method | Path               | Description                                   |
|--------|--------------------|-----------------------------------------------|
| GET    | `/api/health`      | Status check and number of saved scores       |
| GET    | `/api/leaderboard` | Top scores. Optional `?limit=10` (1 to 100)   |
| POST   | `/api/scores`      | Save a score                                  |

Example request body for `POST /api/scores`:

```json
{ "name": "AINA", "score": 15020, "time_ms": 140200, "stages_cleared": 4 }
```

A successful save returns `201` with the saved entry and its `rank`. Invalid input returns `422` with a message for each field.

Validation rules: name 1 to 12 characters (letters, numbers, space, `.`, `-`, `_`), score 0 to 30,000, time between 3 seconds and 1 hour, stages cleared 0 to 5.

---

## 6. Troubleshooting

| Problem | Fix |
|---------|-----|
| `Failed to listen on localhost:8080 ... forbidden by its access permissions` | Windows reserves some ports. Use another port (for example 8000) in both `composer.json` and `vite.config.js`. |
| `Access denied for user 'root' ... (using password: NO)` | The password is not being read. Check that `.env` is named exactly `.env`, sits in `backend`, and that `config.php` contains the `.env` loader. |
| `Access denied ... (using password: YES)` | Wrong username or password. Test the same login in HeidiSQL. |
| `Unknown database` | `database/schema.sql` was not imported (Step 1), or the database name differs from `DB_NAME`. |
| `could not find driver` | In Laragon: Menu → PHP → Extensions → enable `pdo_mysql`, then restart. |
| `Connection refused` | MySQL is not running. Click **Start All** in Laragon. |
| `The process ... exceeded the timeout of 300 seconds` | Composer stopped the server after 5 minutes. This is already fixed in `backend/composer.json`; if you still see it, run `php -S localhost:8000 -t public` directly instead. |
| "Cannot read properties of null" when saving a score | The `/api` request is not reaching the Slim backend. Check the proxy port and restart `npm run dev`. |
| Edits to backend files seem to be ignored | The project is inside OneDrive. Move it to a plain folder such as `C:\laragon\www\memorybreaker`. |

---

## 7. Production notes

1. Run `npm run build` in `frontend` and serve `frontend/dist` as static files.
2. Serve `backend/public` with PHP so that `/api/*` reaches `public/index.php`. An Apache `.htaccess` is included. For nginx, use `try_files $uri /index.php$is_args$args;`.
3. If the frontend and API share an origin, no extra setup is needed. Otherwise build the frontend with `VITE_API_URL=https://your-host/api` and set `ALLOWED_ORIGINS` to the frontend URL.
4. Use a dedicated MySQL user with its own password instead of `root`.

### A note on cheating

Scores are calculated in the browser, so the API can only check that values are within sensible ranges. A determined player could still post a fake score. For a booth event this is usually acceptable. If it matters, move the scoring to the server.
