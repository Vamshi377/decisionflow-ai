# Automated Screenshot Automation

This folder contains Playwright script automation to launch the interface and capture snapshots for the documentation.

## Running the Automation

1. **Install Playwright**:
   ```bash
   npm install -g playwright
   npm install playwright
   ```

2. **Start the local server**:
   Ensure Vite development server is running locally at `http://localhost:5173` using `npm run dev`.

3. **Run the script**:
   ```bash
   node capture_screenshots.js
   ```

4. The script will save `login_page.png` and `customer_portal.png` directly into this folder.