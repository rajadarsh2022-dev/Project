# SISTec IoT Application 2026

A beginner-level IoT web application for monitoring temperature and humidity using ESP8266 and displaying data on a web dashboard.

## Tech Stack
- Frontend: HTML, Tailwind CSS
- Backend: Express.js, Node.js
- Database: SQLite
- Hardware: ESP8266 with DHT11 and I2C LCD

## Features
- User registration and login
- Dashboard with latest sensor data and records table
- Save custom text for LCD display
- ESP8266 sends sensor data and fetches LCD text via HTTPS

## Setup and Run Locally
1. Install Node.js (https://nodejs.org/)
2. Clone or copy the project files
3. Run `npm install` in the project root
4. Run `npm start` to start the server on port 3000
5. Open http://localhost:3000 in browser

## Deployment on Render
1. Create a Render account (https://render.com/)
2. Connect your GitHub repo or upload files
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variable if needed (e.g., PORT)
6. Deploy and get the HTTPS URL

## ESP8266 Setup
1. Install Arduino IDE
2. Install ESP8266 board support
3. Install libraries: DHT, LiquidCrystal_I2C, ESP8266WiFi, ESP8266HTTPClient
4. Update WiFi SSID/password and Render URL in `esp8266_code.ino`
5. Upload code to ESP8266
6. Connect DHT11 to D5, LCD I2C to D1/D2 (address 0x27)

## APIs
- GET /save-data?temp=X&hum=Y : Save sensor data
- GET /get-lcd-text : Fetch LCD text

## Notes
- Timezone: Asia/Kolkata (+5:30)
- LCD text max 16 chars, overwrites on save
- No security best practices followed (beginner level)