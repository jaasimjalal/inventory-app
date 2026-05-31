# Setup Guide

## 1. Supabase (free cloud database)

1. Go to https://supabase.com and sign up (free)
2. Click **New project** → pick a name → set a database password → choose region nearest you → wait ~2 min
3. In the left sidebar, click **SQL Editor** → **New query**
4. Paste this query and click **Run**:

```sql
create table records (
  id text primary key,
  partNumber text not null,
  partName text not null,
  model text,
  chassis text,
  quantity integer default 1,
  availabilityStatus text default '',
  typeOfWork text,
  workerNumber text,
  received boolean default false,
  receivedDate text,
  createdDate text
);

ALTER TABLE records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON records FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON records TO anon;
```

This creates the table and allows public read/write from your app.

## 2. Get API keys

1. Go to left sidebar → **Project Settings** → **API**
2. Copy the **Project URL** (looks like `https://xxx.supabase.co`)
3. Copy the **anon public** key (starts with `eyJ...`)

## 3. Update index.html

Open `index.html` and find these lines near the bottom:

```html
<script id="supabase-config" type="application/json">
  {
    "url": "REPLACE_WITH_YOUR_SUPABASE_URL",
    "key": "REPLACE_WITH_YOUR_SUPABASE_ANON_KEY"
  }
</script>
```

Replace the placeholder values with your Supabase URL and anon key.

## 4. Deploy to GitHub Pages

1. Create a public GitHub repository (e.g. `inventory-app`)
2. Delete the old `.git` folder if present: `rm -rf .git`
3. Initialize git and push:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/inventory-app.git
   git push -u origin main
   ```
4. In your repo on GitHub → **Settings** → **Pages** → under "Branch" select `main` → **Save**
5. Wait 1-2 minutes. Your app is at `https://YOUR_USERNAME.github.io/inventory-app/`

## 5. Install on mobile

1. Open `https://YOUR_USERNAME.github.io/inventory-app/` in Chrome on Android
2. You'll see an **Install** banner at the bottom, or tap the menu → **Add to Home screen**
3. The app opens like a native app with teal icon

## Files structure

```
index.html         — main app
manifest.json      — PWA manifest
sw.js              — service worker
icon-192.png       — app icon
icon-512.png       — high-res icon
css/style.css      — styles
js/storage.js      — Supabase + in-memory cache
js/validation.js   — form validation
js/ui.js           — DOM rendering
js/app.js          — app orchestration
SETUP.md           — this guide
```
