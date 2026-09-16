# 🚀 Deploying to GoDaddy Linux Shared Hosting (cPanel)

This application is engineered specifically to work seamlessly on **GoDaddy Shared Hosting (Linux with cPanel)** as a high-performance webapp with client-side Firestore connection, smart offline caching, and responsive vertical webtoon reading.

---

## 📦 Step 1: Export / Download the App
You have two easy ways:

### Option A: Direct Production Build (Recommended for cPanel)
1. Run the build command in the terminal or container:
   ```bash
   npm run build
   ```
2. The production files are bundled into the `dist/` directory.
3. Compress the contents of `dist/` (which contains `index.html`, `assets/`, and `.htaccess`) into a `.zip` file (e.g. `manhwa-reader-dist.zip`).
   - *Note: Make sure `index.html` is at the root of the ZIP, not nested inside another folder.*

### Option B: AI Studio ZIP Export
- In the Google AI Studio top menu, click the **Settings / Export** icon and select **Download ZIP** or **Export to GitHub**.

---

## 🌐 Step 2: Upload to GoDaddy cPanel

1. **Log in** to your GoDaddy account and navigate to **Web Hosting** -> **cPanel Admin**.
2. Under the **Files** section, click on **File Manager**.
3. Open the **`public_html`** directory (or your chosen addon domain / subdomain directory).
4. Click the **Upload** button in the top toolbar.
5. Select your zip file (e.g. `manhwa-reader-dist.zip`) and wait for the upload progress bar to turn green (100%).
6. Return to File Manager, click on the uploaded zip file, and click **Extract** in the top toolbar.
7. Verify that:
   - `index.html` is directly in `public_html/`
   - `assets/` folder is in `public_html/assets/`
   - `.htaccess` is present (if hidden, enable "Show Hidden Files (dotfiles)" in File Manager Settings at top right).

---

## 🔥 Step 3: Firebase Configuration (Optional but Recommended)
The app runs immediately with local storage and demo manhwa data (10 chapters × 6 episodes × 100 panels per episode).

To connect your own real Firebase database:
1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Enable **Cloud Firestore** and **Firebase Authentication** (Google sign-in or Anonymous).
3. Copy your Firebase web config credentials.
4. In the manhwa app, open the **Admin / Database** modal (or Settings) and paste your Firebase configuration. It will automatically save and sync all chapters, episodes, and reading progress directly to Firestore!

---

## ⚡ Key Highlights for GoDaddy cPanel:
- **No Node.js daemon required on GoDaddy**: The compiled client runs at pure static CDN speeds on Apache!
- **SPA Routing (.htaccess included)**: Refreshing URLs like `/episode/...` will not trigger 404 errors because `.htaccess` redirects cleanly to `index.html`.
- **Panel Virtualization & Lazy-Loading**: Handles 100+ high-res panels without browser memory exhaustion.
- **Batch Panel Importer**: Paste 100 image URLs at once from your Cloud Storage or CDN into any episode.
