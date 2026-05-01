function appendChat(name, text, senderChar) {
    const div = document.createElement('div');
    div.className = 'chat-msg';
    const colorClass = (senderChar === 'ladybug') ? 'p1-color-text' : 'p2-color-text';
    div.innerHTML = `<span class="${colorClass}">[${name}]</span> ${text}`;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function sendChat() {
    const txt = chatInput.value.trim();
    if (!txt) return;
    appendChat(myName, txt, myChar);
    if (conn && conn.open) conn.send({ type: 'CHAT', text: txt, senderChar: myChar });
    chatInput.value = '';
}

function appendGif(name, url, senderChar) {
    const div = document.createElement('div');
    div.className = 'chat-msg';
    const colorClass = (senderChar === 'ladybug') ? 'p1-color-text' : 'p2-color-text';
    div.innerHTML = `<span class="${colorClass}">[${name}]</span> <br>
        <img src="${url}" alt="GIF" style="max-width:200px; max-height:200px; border:3px solid var(--border-color); border-radius:4px; margin-top:5px; box-shadow: 2px 2px 0px rgba(0,0,0,0.1);">`;
    chatLog.appendChild(div);

    const img = div.querySelector('img');
    img.onload = () => { chatLog.scrollTop = chatLog.scrollHeight; };
    chatLog.scrollTop = chatLog.scrollHeight;

    const popup = document.createElement('img');
    popup.src = url;
    popup.className = 'gif-popup-extra';
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 4000);
}

let gifsLoaded = false;
let gifTimeout = null;

function fetchGifs(url) {
    const gifGrid = document.getElementById('gif-grid');
    gifGrid.innerHTML = '<em>Loading... ✨</em>';
    fetch(url).then(res => res.json()).then(json => {
        gifGrid.innerHTML = '';
        const data = json.results || [];
        if (data.length === 0) {
            gifGrid.innerHTML = '<em>No GIFs found!</em>';
            return;
        }
        data.forEach(item => {
            const imgUrl = item.media[0].tinygif.url;
            const img = document.createElement('img');
            img.src = imgUrl;
            img.style.width = '100%';
            img.style.height = '100px';
            img.style.objectFit = 'cover';
            img.style.cursor = 'pointer';
            img.style.border = '2px solid var(--border-color)';
            img.style.borderRadius = '4px';
            img.onclick = () => {
                appendGif(myName, imgUrl, myChar);
                if (conn && conn.open) conn.send({ type: 'GIF', url: imgUrl, senderChar: myChar });
                document.getElementById('gif-picker').style.display = 'none';
                document.getElementById('gif-search-picker').value = '';
            };
            gifGrid.appendChild(img);
        });
        gifsLoaded = true;
    }).catch(() => {
        gifGrid.innerHTML = '<em>Failed to load GIFs 😿</em>';
    });
}

function appendVoice(name, base64data, senderChar) {
    const div = document.createElement('div');
    div.className = 'chat-msg';
    const colorClass = (senderChar === 'ladybug') ? 'p1-color-text' : 'p2-color-text';
    const btnColor = (senderChar === 'ladybug') ? 'var(--p1-color)' : 'var(--p2-color)';

    div.innerHTML = `<span class="${colorClass}">[${name}]</span> <br>
        <div class="chat-voice-msg">
            <button class="voice-play-btn" style="background: ${btnColor}">▶</button>
            <div class="voice-wave">🔊 Voice Memo</div>
            <audio src="data:audio/webm;base64,${base64data}" style="display:none;"></audio>
        </div>`;

    const playBtn = div.querySelector('.voice-play-btn');
    const audioEl = div.querySelector('audio');
    const wave = div.querySelector('.voice-wave');

    playBtn.addEventListener('click', () => {
        if (audioEl.paused) {
            audioEl.play().catch(e => console.log("Audio play err:", e));
            playBtn.textContent = '⏸';
            wave.textContent = '🔊 Playing...';
        } else {
            audioEl.pause();
            playBtn.textContent = '▶';
            wave.textContent = '🔊 Voice Memo';
        }
    });

    audioEl.addEventListener('ended', () => {
        playBtn.textContent = '▶';
        wave.textContent = '🔊 Voice Memo';
    });

    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
}

let mediaRecorder = null;
let voiceChunks = [];

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        voiceChunks = [];
        mediaRecorder.ondataavailable = e => { if (e.data.size > 0) voiceChunks.push(e.data); };
        mediaRecorder.onstop = () => {
            if (voiceChunks.length === 0) return;
            const blob = new Blob(voiceChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64str = reader.result.split(',')[1];
                appendVoice(myName, base64str, myChar);
                if (conn && conn.open) conn.send({ type: 'VOICE', data: base64str, senderChar: myChar });
            };
            reader.readAsDataURL(blob);
            stream.getTracks().forEach(t => t.stop());
        };
        mediaRecorder.start();
        document.getElementById('btn-record-voice').style.background = '#dda0dd';
    } catch (err) {
        appendChat('System', '🎙 Mic permission denied.', 'catnoir');
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        document.getElementById('btn-record-voice').style.background = '#ffb6c1';
    }
}
