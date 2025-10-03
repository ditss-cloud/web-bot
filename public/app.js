
const input = document.getElementById('input');
const form = document.getElementById('composer');
const messages = document.getElementById('messages');
const tplText = document.getElementById('tpl-text');
const tplUser = document.getElementById('tpl-user');
const tplImage = document.getElementById('tpl-image');
const tplVideo = document.getElementById('tpl-video');

// music
const music = document.getElementById('music');
const playBtn = document.getElementById('playBtn');
const nowPlaying = document.getElementById('nowPlaying');
playBtn && playBtn.addEventListener('click', ()=>{
  if(music.paused){ music.play(); playBtn.textContent='Pause'; nowPlaying.textContent='T-Rex roar'; }
  else { music.pause(); playBtn.textContent='Play'; nowPlaying.textContent='Paused'; }
});

// helper render
function timeNow(){ return new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); }

function appendUser(text){
  const n = tplUser.content.cloneNode(true);
  n.querySelector('.txt').innerHTML = escapeHtml(text);
  n.querySelector('.time').textContent = timeNow();
  messages.appendChild(n);
  messages.scrollTop = messages.scrollHeight;
}

function appendTextBot(text){
  const n = tplText.content.cloneNode(true);
  n.querySelector('.txt').innerHTML = text.replace(/\n/g, '<br/>');
  n.querySelector('.time').textContent = timeNow();
  messages.appendChild(n);
  messages.scrollTop = messages.scrollHeight;
}

function appendImage(url, caption){
  const n = tplImage.content.cloneNode(true);
  n.querySelector('.media-img').src = url;
  n.querySelector('.caption').textContent = caption || '';
  const controls = n.querySelector('.controls');
  const btnDownload = document.createElement('button');
  btnDownload.textContent = 'Download';
  btnDownload.onclick = ()=>{ window.open(url, '_blank'); };
  controls.appendChild(btnDownload);
  messages.appendChild(n);
  messages.scrollTop = messages.scrollHeight;
}

function appendVideo(obj){
  const n = tplVideo.content.cloneNode(true);
  const vid = n.querySelector('.media-video');
  vid.src = obj.videoUrl;
  n.querySelector('.caption').textContent = obj.title || '';
  const controls = n.querySelector('.controls');
  const btnDownload = document.createElement('button');
  btnDownload.textContent = 'Download';
  btnDownload.onclick = ()=>{ window.open(obj.downloadUrl || obj.videoUrl, '_blank'); };
  const btnShare = document.createElement('button');
  btnShare.textContent = 'Share via WhatsApp';
  btnShare.onclick = ()=>{
    const wa = `https://wa.me/?text=${encodeURIComponent(obj.title + ' ' + (obj.videoUrl || ''))}`;
    window.open(wa,'_blank');
  };
  controls.appendChild(btnDownload);
  controls.appendChild(btnShare);
  messages.appendChild(n);
  messages.scrollTop = messages.scrollHeight;
}

// typing indicator
let typingEl = null;
function showTyping(){
  typingEl = document.createElement('div');
  typingEl.className = 'typing';
  typingEl.textContent = 'Asuma is typing...';
  messages.appendChild(typingEl);
  messages.scrollTop = messages.scrollHeight;
}
function hideTyping(){ if(typingEl){ typingEl.remove(); typingEl = null; } }

// escape html
function escapeHtml(unsafe) {
    return unsafe ? unsafe.replace(/[&<"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','"':'&quot;',"'":'&#039;'})[m]; }) : '';
}

// send command to backend
async function sendCommand(text){
  appendUser(text);
  showTyping();
  try{
    const res = await fetch('/api/command', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    // wait additional server-intended delay for better UX
    if(data.delay) await new Promise(r=>setTimeout(r, data.delay));
    hideTyping();
    handleResponse(data);
  }catch(err){
    hideTyping();
    appendTextBot('❌ Server error: ' + err.message);
  }
}

function handleResponse(data){
  if(!data) return;
  switch(data.type){
    case 'text':
      appendTextBot(data.text);
      break;
    case 'menu':
      appendTextBot(data.title + '\n' + data.items.map(it=>`• ${it.label} -> ${it.payload}`).join('\n'));
      break;
    case 'image':
      appendImage(data.data.url, data.data.alt);
      break;
    case 'video':
      appendVideo({ videoUrl: data.data.videoUrl, downloadUrl: data.data.videoUrl, title: data.data.title });
      break;
    default:
      appendTextBot('Response not understood');
  }
}

// initial welcome
appendTextBot('Welcome to Asuma Web Bot — try .menu, .tt <url>, .brat (sticker)');
// send form
form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const v = input.value.trim();
  if(!v) return;
  sendCommand(v);
  input.value = '';
});

// menu buttons
document.querySelectorAll('.menu-btn').forEach(b=>{
  b.addEventListener('click', ()=>{
    const cmd = b.getAttribute('data-cmd');
    sendCommand(cmd);
  });
});

