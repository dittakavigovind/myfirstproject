# Way2Astro

Way2Astro is a premium astrology platform connecting users with astrologers for chat/call consultations and providing accurate Vedic astrology reports (Kundli, Panchang).

## Project Structure
- **backend/**: Node.js + Express server for Astrology Engine and API.
- **frontend/**: Next.js + Tailwind CSS for the User Interface.

## Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
# Ensure you have 'swisseph' ephemeris files if detailed calculation looks off, 
# although 'swisseph' package often includes basics.
```

**Environment Variables**:
Create `backend/.env` (already created with placeholders):
```env
MONGO_URI=mongodb://localhost:27017/way2astro
JWT_SECRET=your_secret
GOOGLE_MAPS_API_KEY=your_key
```

**Run Server**:
```bash
npm start
# Server runs on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

**Run Client**:
```bash
npm run dev
# App runs on http://localhost:3000
```

## Features Implemented
- **Astrology Engine**: High-precision Swiss Ephemeris calculations (Sidereal/Lahiri).
- **Panchang**: Daily Tithi, Nakshatra, Yoga, Karana, Samvat (Vikram/Shaka).
- **Auth**: JWT-based secure authentication (Signup/Login).
- **Dashboard**: User profile and wallet summary.
- **Astrologers**: Listing interface and real-time chat (Socket.io).

## Testing
- Run `node backend/scripts/verify_calculations.js` to test Kundli logic.
- Run `node backend/scripts/verify_panchang.js` to test Panchang logic.
