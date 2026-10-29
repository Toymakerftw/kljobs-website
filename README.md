# 🌴 KLJobs — Kerala Tech Job Radar & Application Tracker

A fun, quirky, and powerful job tracker website built for Kerala's IT ecosystem (**Infopark Kochi**, **Technopark Trivandrum**, and **Cyberpark Kozhikode**).

Connects directly to your scraping pipeline at:
`https://github.com/Toymakerftw/kljob/raw/refs/heads/main/data/jobs.json`

---

## ✨ Features

- **⚡ Live Pipeline Sync**: Fetches directly from your raw GitHub JSON with cache-busting, background revalidation, and bundled fallback.
- **🧠 Smart Title & Data Normalizer**: Automatically detects and repairs scraped titles (e.g. Infopark jobs where role was set to company name), extracts experience level, detects walk-in drives, and tags key skills (React, Python, AWS, Docker, AI/ML, etc.).
- **🌴 Mallu Techie Mode**: Quirky cultural quotes, jokes, and Kerala tech park wisdom (toggleable to clean corporate mode).
- **🔊 Interactive Sound FX**: Lightweight Web Audio API synthesizer for boops, chimes, and confetti celebration on applications.
- **✉️ 1-Click Cold Email Assistant**: Auto-fills recipient HR email, role title, company, and generates customized email drafts (*Professional*, *Fresher Supercharge*, *Warm Kerala Vibe*) with 1-click `mailto:` launch and copy.
- **📊 Kanban Application Tracker**: Move applications across stages (*Wishlist / Saved*, *Applied*, *In Interview*, *Offer Received 🎉*, *Ghosted / Rejected*) with private notes and JSON backup export.
- **☕ Chai-Break Job Matcher**: 3-step interactive quiz brewing you personalized job platters based on tech park, stack, and experience.
- **📈 Kerala Tech Pulse Analytics**: Real-time charts on tech park distribution, top in-demand skills, top hiring companies, and fresher accessibility.

---

## 🚀 Quick Start Locally

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

---

## 🌐 Deploying to Vercel

### Option 1: Vercel CLI
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy directly from directory
vercel
```

### Option 2: Connect GitHub Repository
1. Push this repository to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/kljobs.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import the repo — Vercel detects Vite automatically!
4. Click **Deploy**. The `vercel.json` rewrite file is already pre-configured for seamless SPA routing!
