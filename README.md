
Asuma Web Bot (demo)
====================

This project is a demo **Web-based bot UI** that mimics WhatsApp-bot behavior.
Features included:
- Nice UI with sidebar, music player, and chat area
- Typing indicator and delayed bot responses
- Buttons and menu
- Image (sticker) messages and video messages with download/share controls
- Backend endpoints to simulate fetching TikTok/video and sharing via WhatsApp
- Easy to extend: swap in MongoDB, real API calls, or connect your WA bot

How to run:
1. unzip or clone this project
2. install deps: npm install
3. start: npm start
4. open http://localhost:3000

Notes:
- This demo uses mocked video/image endpoints. Replace with your real API endpoints in index.js
- For production, use a database and secure the API properly.
