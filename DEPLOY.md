# Way2Astro Deployment Guide

## 1. Prerequisites
- **Node.js** v18+ installed
- **MongoDB** Atlas account (or local instance)
- **Firebase** project for Authentication
- **Vercel** account (for Frontend)
- **VPS** (DigitalOcean/AWS/Render) for Backend

## 2. Backend Deployment (VPS/Render)

### Step 2.1: Environment Setup
1. Upload the `backend` folder to your server.
2. Create `backend/.env` with production values:
   ```env
   NODE_ENV=production
   PORT=8080
   MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/way2astro
   ```

### Step 2.2: Install Dpendencies
```bash
cd backend
npm install
```
*Note: Ensure `swisseph` compiles correctly. You may need `build-essential` or `python` installed on Linux VPS.*

### Step 2.3: Ephemeris Files
Download Swiss Ephemeris data files (`*.se1`) from [astro.com/ftp/swisseph/ephe/](https://www.astro.com/ftp/swisseph/ephe/) and place them in `backend/ephe/`.

### Step 2.4: Start the Server
```bash
# Using PM2 for process management
npm install -g pm2
pm2 start server.js --name "way2astro-backend"
```

## 3. Frontend Deployment (Vercel)

### Step 3.1: Config
Update `frontend/src/lib/api.js` (create if needed) to point to your VPS IP/Domain.
```js
export const API_BASE_URL = "https://api.way2astro.com"; // Your Backend URL
```

### Step 3.2: Deploy
1. Push your code to GitHub.
2. Import the repo in Vercel.
3. Set Root Directory to `frontend`.
4. Deploy! Vercel handles the build automatically.

## 4. Verification
- Access frontend URL.
- Open Developer Tools -> Network to ensure API calls go to your backend.
- Test "Generate Kundli" to verify `swisseph` is working entirely on the server.
