
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// typing delay helper
const wait = ms => new Promise(r => setTimeout(r, ms));

// central command handler
app.post('/api/command', async (req, res) => {
  const { text } = req.body;
  const t = (text || '').trim();
  await wait(400); // server thinking base

  const cmd = t.split(' ')[0].toLowerCase();

  try {
    switch(cmd) {
      case '.menu':
        return res.json({
          type: 'buttons',
          delay: 700,
          text: '📋 Pilih salah satu menu di bawah:',
          buttons: [
            { id: '.tt', title: 'Download TikTok' },
            { id: '.brat', title: 'Buat Brat Sticker' },
            { id: '.about', title: 'Tentang Asuma' }
          ]
        });
      case '.about':
        return res.json({ type: 'text', delay: 400, text: 'Asuma Web Bot — versi advanced. Ketik .menu untuk lihat menu.' });
      case '.brat': {
        const textArg = t.split(' ').slice(1).join(' ') || 'hello';
        const apiUrl = `https://www.ditss.biz.id/api/maker/brat?text=${encodeURIComponent(textArg)}`;
        // try fetch JSON response; some endpoints may return image directly
        try {
          const r = await fetch(apiUrl);
          const ct = r.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const j = await r.json();
            if (j && j.url) {
              return res.json({ type: 'image', delay: 700, data: { url: j.url, caption: `Brat: ${textArg}` } });
            }
          }
        } catch(e){
          console.error('brat fetch error', e);
        }
        // fallback: use direct api url as image src
        return res.json({ type: 'image', delay: 700, data: { url: apiUrl, caption: `Brat: ${textArg}` } });
      }
      case '.tt': {
        const urlArg = t.split(' ')[1];
        if (!urlArg) return res.json({ type: 'text', delay: 300, text: '❗ Kirim .tt <url_tiktok>' });
        const api = `https://www.ditss.biz.id/api/download/tiktok-v2?url=${encodeURIComponent(urlArg)}`;
        const r = await fetch(api);
        const j = await r.json();
        if (!j || !j.status || !j.result || !j.result.data) {
          return res.json({ type: 'text', delay: 400, text: '❌ Gagal mengambil data dari API TikTok.' });
        }
        const d = j.result.data;
        const videoUrl = d.hdplay || d.play || d.wmplay || null;
        const cover = d.cover || d.origin_cover || d.ai_dynamic_cover || '';
        return res.json({
          type: 'video',
          delay: 900,
          data: {
            title: d.title || 'TikTok Video',
            cover,
            videoUrl,
            downloadUrl: videoUrl,
            duration: d.duration || 0,
            author: d.author || {}
          },
          buttons: [
            { id: 'download', title: '⬇️ Download', url: videoUrl },
            { id: 'share', title: '📤 Share ke WhatsApp', url: `https://wa.me/?text=${encodeURIComponent(d.title + ' ' + (videoUrl||''))}` }
          ]
        });
      }
      default:
        return res.json({ type: 'text', delay: 300, text: '❌ Command tidak dikenal. Ketik .menu' });
    }
  } catch (err) {
    console.error('Command error', err);
    return res.json({ type: 'text', delay: 300, text: '❌ Terjadi error di server.' });
  }
});

app.post('/api/fetch-tt', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url required' });
  try {
    const r = await fetch(`https://www.ditss.biz.id/api/download/tiktok-v2?url=${encodeURIComponent(url)}`);
    const j = await r.json();
    return res.json(j);
  } catch(e) {
    return res.status(500).json({ error: 'fetch failed' });
  }
});

app.get('*', (req,res)=>{
  res.sendFile(path.join(__dirname,'public','index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Server running on http://localhost:${PORT}`));
