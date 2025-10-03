
const input = document.getElementById('input');
const form = document.getElementById('composer');
const messages = document.getElementById('messages');
const tplText = document.getElementById('tpl-text');
const tplUser = document.getElementById('tpl-user');
const tplButtons = document.getElementById('tpl-buttons');
const tplImage = document.getElementById('tpl-image');
const tplVideo = document.getElementById('tpl-video');

// music controls
const music = document.getElementById('music');
const playBtn = document.getElementById('playBtn');
const nowPlaying = document.getElementById('nowPlaying');
playBtn && playBtn.addEventListener('click', ()=>{
  if(music.paused){ music.play(); playBtn.textContent='Pause'; nowPlaying.textContent='Now Playing'; }
  else { music.pause(); playBtn.textContent='Play'; nowPlaying.textContent='Paused'; }
});

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

function appendButtons(text, buttons){
  const n = tplButtons.content.cloneNode(true);
  n.querySelector('.txt').innerHTML = text.replace(/\n/g, '<br/>');
  const list = n.querySelector('.button-list');
  buttons.forEach(b => {
    const btn = document.createElement('div');
    btn.className = 'btn-wa';
    btn.innerHTML = `<span>${escapeHtml(b.title)}</span><span class="copy">Copy</span>`;
    btn.addEventListener('click', ()=>{
      // simulate single-select: fill input with payload (id) or open url if present
      if(b.url){
        window.open(b.url, '_blank');
      } else {
        input.value = b.id;
        input.focus();
      }
    });
    btn.querySelector('.copy').addEventListener('click', (e)=>{
      e.stopPropagation();
      navigator.clipboard.writeText(b.id).then(()=>{
        btn.querySelector('.copy').textContent = 'Copied';
        setTimeout(()=>btn.querySelector('.copy').textContent = 'Copy',1200);
      });
    });
    list.appendChild(btn);
  });
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

function appendVideo(data){
  const n = tplVideo.content.cloneNode(true);
  n.querySelector('.media-thumb').src = data.cover || '';
  n.querySelector('.caption').textContent = data.title || '';
  const controls = n.querySelector('.controls');
  const btnPlay = document.createElement('button');
  btnPlay.textContent = 'Play in new tab';
  btnPlay.onclick = ()=>{ window.open(data.videoUrl, '_blank'); };
  const btnDownload = document.createElement('button');
  btnDownload.textContent = 'Download';
  btnDownload.onclick = ()=>{ window.open(data.downloadUrl || data.videoUrl, '_blank'); };
  const btnShare = document.createElement('button');
  btnShare.textContent = 'Share via WhatsApp';
  btnShare.onclick = ()=>{
    const wa = `https://wa.me/?text=${encodeURIComponent((data.title||'')+' '+(data.videoUrl||''))}`;
    window.open(wa,'_blank');
  };
  controls.appendChild(btnPlay);
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
function appendReplyButtons(text, options) {
  const n = tplBot.content.cloneNode(true);
  n.querySelector('.txt').innerHTML = text.replace(/\n/g, "<br/>");

  const wrapper = document.createElement('div');
  wrapper.className = 'reply-buttons';

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'reply-btn';
    btn.textContent = opt.title;
    btn.onclick = () => {
      input.value = opt.payload; 
      form.dispatchEvent(new Event("submit")); 
    };
    wrapper.appendChild(btn);
  });

  n.querySelector('.time').textContent = timeNow();
  n.querySelector('.msg').appendChild(wrapper);

  messages.appendChild(n);
  messages.scrollTop = messages.scrollHeight;
}
function escapeHtml(unsafe){ return unsafe ? unsafe.replace(/[&<"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','"':'&quot;',"'":'&#039;'})[m]; }) : ''; }

async function sendCommand(text){
  appendUser(text);
  showTyping();
  try{
    const res = await fetch('/api/command', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    if(data.delay) await new Promise(r=>setTimeout(r, data.delay));
    hideTyping();
    if(data.type === 'text') appendTextBot(data.text);
    else if(data.type === 'buttons') appendButtons(data.text, data.buttons || []);
    else if(data.type === 'image') appendImage(data.data.url, data.data.caption);
    else if(data.type === 'video') appendVideo(data.data);
    else appendTextBot('Response not understood');
  }catch(e){
    hideTyping();
    appendTextBot('❌ Server error');
    console.error(e);
  }
}

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const v = input.value.trim();
  if(!v) return;
  sendCommand(v);
  input.value = '';
});

document.querySelectorAll('.menu-btn').forEach(b=>{
  b.addEventListener('click', ()=>{
    sendCommand(b.getAttribute('data-cmd'));
  });
});

appendTextBot('Selamat datang di Asuma Bot — ketik .menu untuk memulai.');
      
