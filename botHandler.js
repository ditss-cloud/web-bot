// lib/botHandler.js
import fetch from 'node-fetch';

const API_BASE = 'https://www.ditss.biz.id/api';

export async function handleBotCommand(command) {
  const parts = command.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();

  // Simulasi delay mengetik (1-2 detik)
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  try {
    if (cmd === '.brat' && parts.length > 1) {
      const text = parts.slice(1).join(' ');
      const url = `${API_BASE}/maker/brat?text=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.status && data.result?.url) {
        return { type: 'image', url: data.result.url };
      }
      throw new Error('Gagal generate gambar');
    }

    if (cmd === '.tt' && parts.length > 1) {
      const tiktokUrl = parts[1];
      const encoded = encodeURIComponent(tiktokUrl);
      const res = await fetch(`${API_BASE}/download/tiktok-v2?url=${encoded}`);
      const data = await res.json();
      
      if (data.status && data.result?.data) {
        const v = data.result.data;
        return {
          type: 'tiktok',
          title: v.title || 'Video TikTok',
          cover: (v.cover || v.origin_cover || '').trim(),
          videoUrl: (v.play || v.wmplay || '').trim()
        };
      }
      throw new Error('Gagal download TikTok');
    }

    if (cmd === '.pin' && parts.length > 1) {
      const query = parts.slice(1).join(' ');
      const res = await fetch(`${API_BASE}/search/pinterest?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      
      if (data.status && Array.isArray(data.result)) {
        return { type: 'pinterest', results: data.result.slice(0, 6) };
      }
      throw new Error('Tidak ada hasil Pinterest');
    }

    return {
      type: 'text',
      message: `Perintah tidak dikenali. Coba:\n• <code>.brat teks</code>\n• <code>.tt [url]</code>\n• <code>.pin [kata]</code>`
    };

  } catch (err) {
    console.error('Bot error:', err.message);
    return { type: 'text', message: '❌ Terjadi kesalahan saat memproses perintah.' };
  }
}
