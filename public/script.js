const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');
const statusEl = document.getElementById('status');
const downloadLink = document.getElementById('downloadLink');

// Deteksi apakah di Vercel atau lokal
const API_URL = window.location.hostname.includes('vercel.app') 
  ? '/api/bot' 
  : 'http://localhost:3000/api/bot';

function addMessage(content, isSent = false) {
  const div = document.createElement('div');
  div.className = `message ${isSent ? 'sent' : 'received'}`;
  
  if (typeof content === 'string') {
    div.innerHTML = `<div class="message-text">${content}</div>`;
  } else if (content.type === 'image') {
    div.innerHTML = `
      <div class="image-message">
        <img src="${content.url}" alt="Result">
      </div>
      <div class="image-actions">
        <button class="download-btn" data-url="${content.url}">Download</button>
        <button class="share-btn" data-url="${content.url}">Share</button>
      </div>
    `;
  } else if (content.type === 'tiktok') {
    div.innerHTML = `
      <div class="message-text"><strong>${content.title}</strong></div>
      <div class="image-message">
        <img src="${content.cover}" alt="TikTok">
      </div>
      <div class="image-actions">
        <button class="download-btn" data-url="${content.videoUrl}">Download Video</button>
        <button class="share-btn" data-url="${content.videoUrl}">Share</button>
      </div>
    `;
  } else if (content.type === 'pinterest') {
    let grid = '<div class="pinterest-grid">';
    content.results.forEach(item => {
      const img = `https://api.pikwy.com/render?url=${encodeURIComponent(item.pin_url)}&width=300&height=400`;
      grid += `<div class="pinterest-item"><img src="${img}" alt="${item.title}"></div>`;
    });
    grid += '</div>';
    div.innerHTML = `<div class="message-text">Hasil Pinterest:</div>${grid}`;
  }

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Event untuk tombol
  div.querySelectorAll('.download-btn').forEach(btn => {
    btn.onclick = () => {
      const url = btn.dataset.url;
      downloadLink.href = url;
      downloadLink.download = 'file';
      downloadLink.click();
    };
  });

  div.querySelectorAll('.share-btn').forEach(btn => {
    btn.onclick = async () => {
      if (navigator.share) {
        try {
          await navigator.share({ title: 'Hasil', url: btn.dataset.url });
        } catch (e) {
          if (e.name !== 'AbortError') alert('Gagal share');
        }
      }
    };
  });
}

async function sendMessage() {
  const msg = messageInput.value.trim();
  if (!msg) return;

  addMessage(msg, true);
  messageInput.value = '';
  messageInput.blur();

  // Tampilkan typing indicator
  typingIndicator.style.display = 'flex';
  statusEl.textContent = 'Mengetik...';

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: msg })
    });

    const data = await res.json();
    
    // Sembunyikan typing
    typingIndicator.style.display = 'none';
    statusEl.textContent = 'Online';

    if (res.ok) {
      addMessage(data);
    } else {
      addMessage('❌ ' + (data.error || 'Terjadi kesalahan'));
    }
  } catch (err) {
    typingIndicator.style.display = 'none';
    statusEl.textContent = 'Online';
    addMessage('⚠️ Gagal terhubung ke server');
  }
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') sendMessage();
});

messageInput.focus();
