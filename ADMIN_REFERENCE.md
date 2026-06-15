# Admin Reference — Dr. Marwa Badr Platform
# ==========================================
# ⚠️ KEEP THIS FILE PRIVATE — DO NOT UPLOAD TO CLOUDFLARE

---

## 🔑 Admin Preview Secret
**Parameter:** `preview`
**Secret:** `drmarwabadr1984`

---

## 👁️ Course Preview Links (Ready to Copy & Paste)

### Live Site (Cloudflare):

| Course | Preview Link |
|--------|-------------|
| Healing Journey | https://drmarwabadr.drmarwa.workers.dev/course-healing-journey-program.html?preview=drmarwabadr1984 |
| DBT | https://drmarwabadr.drmarwa.workers.dev/course-dbt-course.html?preview=drmarwabadr1984 |
| CBT | https://drmarwabadr.drmarwa.workers.dev/course-cbt-course.html?preview=drmarwabadr1984 |
| ACT | https://drmarwabadr.drmarwa.workers.dev/course-act-course.html?preview=drmarwabadr1984 |
| Personality Disorders | https://drmarwabadr.drmarwa.workers.dev/course-personality-disorders-course.html?preview=drmarwabadr1984 |
| Tri-Therapy Bundle ⭐ | https://drmarwabadr.drmarwa.workers.dev/course-tri-therapy-bundle.html?preview=drmarwabadr1984 |

> ✅ Domain confirmed: `drmarwabadr.drmarwa.workers.dev`
> The domain appears on the Cloudflare Pages dashboard under your project name.

### Local Preview (when running locally):

| Course | Local Link |
|--------|-----------|
| Healing Journey | http://localhost:3000/course-healing-journey-program.html?preview=drmarwabadr1984 |
| DBT | http://localhost:3000/course-dbt-course.html?preview=drmarwabadr1984 |
| CBT | http://localhost:3000/course-cbt-course.html?preview=drmarwabadr1984 |
| ACT | http://localhost:3000/course-act-course.html?preview=drmarwabadr1984 |
| Personality Disorders | http://localhost:3000/course-personality-disorders-course.html?preview=drmarwabadr1984 |
| Tri-Therapy Bundle ⭐ | http://localhost:3000/course-tri-therapy-bundle.html?preview=drmarwabadr1984 |

---

## ☁️ Cloudflare Deployment Steps

### When to upload:
After any changes, run `npm run watch` (auto-rebuilds dist) then upload the `dist/` folder.

### How to upload (Manual via Dashboard):
1. Go to: https://dash.cloudflare.com
2. Click **Pages** → your project (e.g. `drmarwabadr`)
3. Click **Upload assets** or **Create new deployment**
4. Drag and drop the entire `dist/` folder
5. Click **Deploy**
6. Wait ~30 seconds → site is live ✅

### Faster: Direct Upload via CLI
```bash
# Install once:
npm install -g wrangler

# Upload dist folder:
wrangler pages deploy dist --project-name=drmarwabadr
```

---

## 🖥️ Backend API (Render)
URL: https://marwabackend.onrender.com
Deploy: Push changes to GitHub repo → Render auto-deploys
Manual: Go to https://dashboard.render.com → your service → **Manual Deploy**

---

## 🗄️ Supabase Project
URL: https://essanwtunejifzyuvgtu.supabase.co
Dashboard: https://supabase.com/dashboard/project/essanwtunejifzyuvgtu

---

## 📋 Quick Checklist Before Going Live
- [ ] Upload `dist/` to Cloudflare Pages
- [ ] Deploy `server.js` on Render
- [ ] Run SQL setup in Supabase (`supabase_purchases_setup.sql`)
- [ ] Set Supabase Redirect URL → your Cloudflare domain
- [ ] Test preview links above ✅
- [ ] Activate Gammal Tech payment gateway
