# Playwright Visual Diff Checker

A web application that compares visual differences between two web pages using Playwright for screenshots and Pixelmatch for pixel-level comparison.

## Installation

### 1. Install Server Dependencies

cd server
npm install

After installing, Playwright will download the Chromium browser automatically. If it doesn't, run:

npx playwright install chromium

### 2. Install Client Dependencies

cd ../client
npm install

### 4. Configure Environment Variables

Navigate to the server directory and create a `.env` file:

cd ../server
cp .env.example .env

The default configuration in `.env` should be:

PORT=5001
NODE_ENV=development

You can modify the `PORT` if needed.

## Running the Application Locally

You need to run both the server and client simultaneously.

### Option 1: Using Two Terminal Windows

**Terminal 1 - Start the Server:**

cd server
node index.js

The server will start on `http://localhost:5001` (or the port specified in `.env`)

**Terminal 2 - Start the Client:**

cd client
npm run dev
