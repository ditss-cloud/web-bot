// index.js
import express from 'express';
import cors from 'cors';
import { handleBotCommand } from './lib/botHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Endpoint bot (sama seperti Vercel)
app.post('/api/bot', async (req, res) => {
  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ error: 'Command required' });
  }
  const result = await handleBotCommand(command);
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
