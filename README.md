# Playwright Visual Diff Checker

A web application that compares visual differences between two web pages using Playwright for screenshots and Pixelmatch for pixel-level comparison. Features a modern React frontend and Express backend.

## Features

-  **Visual Screenshot Comparison**: Capture and compare screenshots of any two URLs
-  **Pixel-Perfect Diff Analysis**: Uses Pixelmatch to highlight differences between screenshots
-  **Custom Viewport**: Configurable viewport dimensions for screenshots
-  **Full Page Capture**: Automatically scrolls and captures full-page screenshots
-  **Modern UI**: Built with React, TailwindCSS, and shadcn/ui components
-  **Side-by-Side Comparison**: Interactive image comparison slider

## Tech Stack

### Frontend (Client)

-  React 19
-  Vite
-  TailwindCSS
-  shadcn/ui
-  Lucide React (icons)
-  react-compare-image

### Backend (Server)

-  Node.js
-  Express
-  Playwright (Chromium)
-  Pixelmatch
-  PNG.js

## Prerequisites

Before you begin, ensure you have the following installed:

-  **Node.js** (v18 or higher recommended)
-  **npm** (comes with Node.js)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd playwright-visual-diff-check
```

### 2. Install Server Dependencies

```bash
cd server
npm install
```

After installing, Playwright will download the Chromium browser automatically. If it doesn't, run:

```bash
npx playwright install chromium
```

### 3. Install Client Dependencies

```bash
cd ../client
npm install
```

### 4. Configure Environment Variables

Navigate to the server directory and create a `.env` file:

```bash
cd ../server
cp .env.example .env
```

The default configuration in `.env` should be:

```env
PORT=5001
NODE_ENV=development
```

You can modify the `PORT` if needed.

## Running the Application Locally

You need to run both the server and client simultaneously.

### Option 1: Using Two Terminal Windows

**Terminal 1 - Start the Server:**

```bash
cd server
node index.js
```

The server will start on `http://localhost:5001` (or the port specified in `.env`)

**Terminal 2 - Start the Client:**

```bash
cd client
npm run dev
```

The client will start on `http://localhost:5173` (default Vite port)

### Option 2: Using a Single Terminal with Background Process

```bash
# Start server in background
cd server && node index.js &

# Start client
cd ../client && npm run dev
```

## Accessing the Application

Once both services are running:

1. Open your browser and navigate to `http://localhost:5173`
2. Enter two URLs you want to compare
3. Optionally adjust the viewport dimensions
4. Click "Compare" to generate the visual diff

## Project Structure

```
playwright-visual-diff-check/
├── client/                 # Frontend React application
│   ├── src/               # React source files
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
│
├── server/                # Backend Express application
│   ├── index.js           # Main server file
│   ├── screenshots/       # Generated screenshots directory
│   ├── package.json       # Backend dependencies
│   ├── .env.example       # Environment variables template
│   └── .env              # Environment configuration (create this)
│
└── README.md             # This file
```

## Available Scripts

### Server (`/server`)

```bash
node index.js              # Start the server
```

### Client (`/client`)

```bash
npm run dev               # Start development server
npm run build             # Build for production
npm run preview           # Preview production build
npm run lint              # Run ESLint
```

## API Endpoints

### POST `/api/compare`

Compares two URLs and generates screenshot diffs.

**Request Body:**

```json
{
	"urlA": "https://example.com",
	"urlB": "https://example.org",
	"viewport": {
		"width": 1280,
		"height": 720
	}
}
```

**Response:**

```json
{
	"urlA": "https://example.com",
	"urlB": "https://example.org",
	"viewport": { "width": 1280, "height": 720 },
	"mismatchPixels": 15234,
	"totalPixels": 921600,
	"mismatchPercentage": 1.65,
	"similarityPercentage": 98.35,
	"screenshotAPath": "/screenshots/a-1234567890.png",
	"screenshotBPath": "/screenshots/b-1234567890.png",
	"diffImagePath": "/screenshots/diff-1234567890.png"
}
```

## How It Works

1. **User submits two URLs** through the React frontend
2. **Server receives the request** and launches a Playwright Chromium browser
3. **Screenshots are captured** with full-page scrolling to load all images
4. **Images are compared** using Pixelmatch to detect pixel-level differences
5. **Results are returned** including similarity percentage and diff visualization
6. **Frontend displays** side-by-side comparison with an interactive slider

## Troubleshooting

### Playwright Browser Issues

If you encounter browser-related errors:

```bash
cd server
npx playwright install chromium
```

### Port Already in Use

If port 5001 or 5173 is already in use:

-  **Server**: Change the `PORT` in `/server/.env`
-  **Client**: Vite will automatically try the next available port

### CORS Issues

The server is configured with CORS enabled. If you still face CORS errors, ensure:

-  Server is running on the correct port
-  Client is making requests to the correct server URL

### Module Not Found Errors

Ensure all dependencies are installed:

```bash
# Server
cd server && npm install

# Client
cd client && npm install
```

## Development Tips

-  Screenshots are stored in `/server/screenshots/` and are served statically
-  The server uses `networkidle` for better page load detection
-  Images are lazy-loaded by scrolling the page before capture
-  Adjust the `threshold` in `pixelmatch` (line 118 in `server/index.js`) for different sensitivity levels

## License

ISC

## Contributing

Feel free to submit issues and pull requests!
