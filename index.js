
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Simple in-memory "db" (demo). Replace with MongoDB in production.
const DB = {
  users: [],
  chats: []
};

function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Helper to simulate delay (ms)
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// POST /api/command  -- central command handler
app.post('/api/command', async (req, res) => {
  const { text } = req.body;
  const t = (text || '').trim();

  // small server-side processing delay to simulate bot thinking
  await wait(700);

  // basic command switch
  const cmd = t.split(' ')[0].toLowerCase();

  switch(cmd) {
    case '.menu':
      return res.json({
        type: 'menu',
        delay: 900, // frontend will show typing for this ms
        title: 'Menu Utama',
        items: [
          { id: '1', label: 'Games', payload: '.games' },
          { id: '2', label: 'AI Tools', payload: '.ai' },
          { id: '3', label: 'Get TikTok Video', payload: '.tt <url>' }
        ]
      });
    case '.halo':
    case '.hi':
      return res.json({ type: 'text', delay: 500, text: '👋 Halo! Ada yang bisa aku bantu?' });
    case '.time':
      return res.json({ type: 'text', delay: 400, text: `🕒 Server time: ${new Date().toLocaleString()}` });
    case '.clear':
      DB.chats = [];
      return res.json({ type: 'text', delay: 300, text: '🧹 Chat cleared.' });
    case '.tt':
      // format: .tt https://www.tiktok.com/...
      const url = t.split(' ')[1] || '';
      if (!url) return res.json({ type: 'text', delay: 300, text: '❗ Kirim .tt <url_tiktok>' });
      // in real app call your web API to fetch video; here we mock
      await wait(600);
      return res.json({
        type: 'video',
        delay: 900,
        data: {
          title: 'Sample TikTok Video (mock)',
          videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
          thumb: 'https://picsum.photos/seed/tiktokthumb/480/270'
        }
      });
    case '.brat':
      // send sticker/image
      await wait(400);
      return res.json({
        type: 'image',
        delay: 600,
        data: {
          url: 'https://picsum.photos/seed/sticker/400/400',
          alt: 'Sticker mock'
        }
      });
    default:
      return res.json({ type: 'text', delay: 400, text: '❌ Command tidak dikenal. Ketik .menu untuk daftar perintah.' });
  }
});

// Mock endpoints for API integration examples (for frontend buttons to call)
// /api/fetch-tt  - simulate fetching metadata / download links for a TikTok url
app.post('/api/fetch-tt', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url required' });
  // simulate external API processing
  await wait(800);
  res.json({
    ok: true,
    title: 'Mock TikTok Video',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    downloadUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    thumb: 'https://picsum.photos/seed/tt/640/360'
  });
});

// /api/send-whatsapp (demo) - returns wa.me link for sharing
app.post('/api/send-whatsapp', (req, res) => {
  const { phone, text } = req.body;
  if (!phone || !text) return res.status(400).json({ error: 'phone & text required' });
  const wa = `https://wa.me/${encodeURIComponent(phone)}?text=${encodeURIComponent(text)}`;
  return res.json({ ok: true, wa });
});

// Fallback: serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
