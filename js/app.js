// App Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Background Heart Rain
    setInterval(createHeartRain, 400);

    // Initial scan for quizzes
    autoScan();

    // Event Listeners for Navigation
    btnCreateRoom.addEventListener('click', () => {
        myChar = getSelectedChar();
        let defName = myChar === 'ladybug' ? 'Lady Bug' : 'Cat Noir';
        myName = playerNameInput.value.trim() || defName;
        isHost = true;
        resetGameState();
        showScreen('state-host-lobby');
        initHostPeer();
    });

    btnJoinRoomBtn.addEventListener('click', () => {
        myChar = getSelectedChar();
        let defName = myChar === 'ladybug' ? 'Lady Bug' : 'Cat Noir';
        myName = playerNameInput.value.trim() || defName;
        isHost = false;
        isSolo = false;
        resetGameState();
        showScreen('state-join-lobby');
    });

    btnSoloMode.addEventListener('click', () => {
        myChar = getSelectedChar();
        let defName = myChar === 'ladybug' ? 'Lady Bug' : 'Cat Noir';
        myName = playerNameInput.value.trim() || defName;
        isHost = false;
        isSolo = true;
        resetGameState();
        showScreen('state-solo-lobby');
    });

    document.getElementById('btn-host-back').addEventListener('click', () => {
        if (peer) { peer.destroy(); peer = null; }
        resetGameState();
        showScreen('state-start');
    });

    document.getElementById('btn-join-back').addEventListener('click', () => {
        if (peer) { peer.destroy(); peer = null; }
        resetGameState();
        showScreen('state-start');
    });

    document.getElementById('btn-solo-back').addEventListener('click', () => {
        resetGameState();
        showScreen('state-start');
    });

    btnHome.addEventListener('click', () => {
        if (peer) { peer.destroy(); peer = null; }
        conn = null;
        resetSoloUI();
        resetGameState();
        showScreen('state-start');
    });

    // File Uploads
    fileDropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => { if (e.target.files.length > 0) processFile(e.target.files[0], false); });
    fileDropZone.addEventListener('dragover', (e) => { e.preventDefault(); fileDropZone.classList.add('dragover'); });
    fileDropZone.addEventListener('dragleave', () => fileDropZone.classList.remove('dragover'));
    fileDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        fileDropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) processFile(e.dataTransfer.files[0], false);
    });

    soloFileDropZone.addEventListener('click', () => soloFileInput.click());
    soloFileInput.addEventListener('change', (e) => { if (e.target.files.length > 0) processFile(e.target.files[0], true); });
    soloFileDropZone.addEventListener('dragover', (e) => { e.preventDefault(); soloFileDropZone.classList.add('dragover'); });
    soloFileDropZone.addEventListener('dragleave', () => soloFileDropZone.classList.remove('dragover'));
    soloFileDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        soloFileDropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) processFile(e.dataTransfer.files[0], true);
    });

    // Paste Content
    document.getElementById('btn-confirm-host-paste').addEventListener('click', () => {
        const val = document.getElementById('host-paste-box').value.trim();
        if (!val) { hostStatus.innerHTML = `<span style="color:var(--wrong-color)">Paste something first! ✨</span>`; return; }
        const parsed = parseContent(val);
        if (parsed.length > 0) { questions = parsed; hostStatus.innerHTML = `${parsed.length} questions loaded! ✨`; checkHostReady(); }
        else hostStatus.innerHTML = `<span style="color:var(--wrong-color)">Invalid JSON format! ✨</span>`;
    });

    document.getElementById('btn-confirm-solo-paste').addEventListener('click', () => {
        const val = document.getElementById('solo-paste-box').value.trim();
        if (!val) { soloStatus.innerHTML = `<span style="color:var(--wrong-color)">Paste something first! ✨</span>`; return; }
        const parsed = parseContent(val);
        if (parsed.length > 0) { questions = parsed; soloStatus.innerHTML = `${parsed.length} questions loaded! ✨`; btnStartSolo.style.display = 'inline-flex'; }
        else soloStatus.innerHTML = `<span style="color:var(--wrong-color)">Invalid JSON format! ✨</span>`;
    });

    // Networking
    btnConnect.addEventListener('click', () => {
        const code = joinRoomInput.value.trim().toUpperCase();
        if (!code) return;
        btnConnect.disabled = true;
        joinStatus.innerHTML = `Connecting<span class="loading-dots"></span>`;
        peer = new Peer();
        peer.on('open', () => { conn = peer.connect('burricat-' + code); setupConnection(); });
        peer.on('error', (err) => { btnConnect.disabled = false; joinStatus.innerHTML = `Error: ${err.message} ✨`; });
    });

    btnStartGame.addEventListener('click', () => {
        conn.send({ type: 'START', questions, hostName: myName, hostChar: myChar });
        applyPlayerUI(statP1, nameP1, avatarP1, myName, myChar);
        applyPlayerUI(statP2, nameP2, avatarP2, opponentName, opponentChar);
        showScreen('state-battle');
        p1Score = 0; p2Score = 0; currentQIndex = 0;
        myMistakes = []; renderMistakes(); renderScore(); sendNextQuestion();
    });

    btnStartSolo.addEventListener('click', () => {
        statP2.style.display = 'none';
        document.querySelector('.chat-container').style.display = 'none';
        document.getElementById('solo-streak').style.display = 'inline-flex';
        document.getElementById('solo-progress-container').style.display = 'block';
        applyPlayerUI(statP1, nameP1, avatarP1, myName, myChar);
        showScreen('state-battle');
        p1Score = 0; p2Score = 0; currentQIndex = 0; streak = 0; highestStreak = 0;
        myMistakes = []; renderMistakes(); updateStreakUI(); updateProgressBar(); renderScore();
        p1Answer = null; p2Answer = null; isRevealed = false;
        renderQuestion(questions[currentQIndex]);
    });

    btnNextQ.addEventListener('click', () => {
        if (nextTimer) { clearInterval(nextTimer); nextTimer = null; }
        handleNextQ();
    });

    // Chat and GIF
    btnSendChat.addEventListener('click', sendChat);
    chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendChat(); });

    document.getElementById('btn-open-gifs')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const picker = document.getElementById('gif-picker');
        if (picker.style.display === 'none') {
            picker.style.display = 'block';
            if (!gifsLoaded || document.getElementById('gif-search-picker').value.trim() === '') {
                fetchGifs(`https://g.tenor.com/v1/trending?key=LIVDSRZULELA&limit=8`);
            }
        } else picker.style.display = 'none';
    });

    document.getElementById('gif-search-picker')?.addEventListener('input', (e) => {
        clearTimeout(gifTimeout);
        const query = e.target.value.trim();
        gifTimeout = setTimeout(() => {
            if (query) fetchGifs(`https://g.tenor.com/v1/search?key=LIVDSRZULELA&q=${encodeURIComponent(query)}&limit=8`);
            else fetchGifs(`https://g.tenor.com/v1/trending?key=LIVDSRZULELA&limit=8`);
        }, 500);
    });

    document.addEventListener('click', (e) => {
        const picker = document.getElementById('gif-picker');
        if (picker && !picker.contains(e.target) && e.target !== document.getElementById('btn-open-gifs')) {
            picker.style.display = 'none';
        }
    });

    // Voice Recording
    const btnRecordVoice = document.getElementById('btn-record-voice');
    if (btnRecordVoice) {
        btnRecordVoice.addEventListener('mousedown', startRecording);
        btnRecordVoice.addEventListener('mouseup', stopRecording);
        btnRecordVoice.addEventListener('mouseleave', stopRecording);
        btnRecordVoice.addEventListener('touchstart', (e) => { e.preventDefault(); startRecording(); });
        btnRecordVoice.addEventListener('touchend', (e) => { e.preventDefault(); stopRecording(); });
    }

    // Audio and Theme
    bgmVolume.addEventListener('input', (e) => { bgmAudio.volume = e.target.value; });
    bgmSelect.addEventListener('change', (e) => {
        const track = e.target.value;
        playBGM(track);
        if (conn && conn.open) conn.send({ type: 'CHANGE_BGM', track: track });
    });

    musicPlayerUI.addEventListener('click', (e) => {
        if (window.innerWidth <= 600) {
            if (e.target.id === 'bgm-select' || e.target.id === 'bgm-volume') return;
            musicPlayerUI.classList.toggle('expanded');
            const toggle = document.getElementById('music-player-toggle');
            toggle.textContent = musicPlayerUI.classList.contains('expanded') ? '✕' : '🎵';
        }
    });

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('plain-theme');
        if (document.body.classList.contains('plain-theme')) {
            themeToggle.innerHTML = '✨ Switch to Secret';
            bgmAudio.pause();
            musicPlayerUI.classList.remove('playing');
        } else {
            themeToggle.innerHTML = '🌙 Switch to Plain';
        }
    });

    // Modals
    const kylaSticker = document.getElementById('st-kyla');
    const kylaModal = document.getElementById('kyla-modal');
    const btnCloseKyla = document.getElementById('btn-close-kyla');
    const poemAudio = document.getElementById('poem-audio');
    const playPoemBtn = document.getElementById('play-poem-audio');

    if (kylaSticker) {
        kylaSticker.addEventListener('click', () => {
            kylaModal.classList.add('active');
            if (poemAudio && poemAudio.paused) {
                poemAudio.play().catch(e => console.log("Autoplay blocked:", e));
                if (playPoemBtn) { playPoemBtn.textContent = '⏸️'; playPoemBtn.style.animation = 'none'; }
            }
        });
    }

    if (btnCloseKyla) {
        btnCloseKyla.addEventListener('click', () => {
            kylaModal.classList.remove('active');
            if (poemAudio) { poemAudio.pause(); poemAudio.currentTime = 0; }
            if (playPoemBtn) { playPoemBtn.textContent = '🔊'; playPoemBtn.style.animation = 'pulse 2s infinite'; }
        });
    }

    if (playPoemBtn && poemAudio) {
        playPoemBtn.addEventListener('click', () => {
            if (poemAudio.paused) { poemAudio.play(); playPoemBtn.textContent = '⏸️'; playPoemBtn.style.animation = 'none'; }
            else { poemAudio.pause(); playPoemBtn.textContent = '🔊'; playPoemBtn.style.animation = 'pulse 2s infinite'; }
        });
        poemAudio.onended = () => { playPoemBtn.textContent = '🔊'; playPoemBtn.style.animation = 'pulse 2s infinite'; };
    }

    const mailSticker = document.getElementById('st-mail');
    const mailModal = document.getElementById('mail-modal');
    const btnCloseMail = document.getElementById('btn-close-mail');

    if (mailSticker) {
        mailSticker.addEventListener('click', (e) => {
            for (let i = 0; i < 20; i++) {
                const flower = document.createElement('div');
                flower.className = 'flower-particle';
                flower.textContent = ['🌺', '🌸', '🌼', '🌷', '🌹'][Math.floor(Math.random() * 5)];
                flower.style.left = e.clientX + 'px';
                flower.style.top = e.clientY + 'px';
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 150 + 50;
                flower.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
                flower.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
                flower.style.setProperty('--rot', (Math.random() * 360) + 'deg');
                document.body.appendChild(flower);
                setTimeout(() => flower.remove(), 1000);
            }
            mailModal.classList.add('active');
            currentMailPage = 2;
            document.getElementById('mail-page-1').style.display = 'none';
            document.getElementById('mail-page-2').style.display = 'block';
            document.getElementById('btn-toggle-mail').innerHTML = 'Flip Page 📖';
        });
    }

    if (btnCloseMail) btnCloseMail.addEventListener('click', () => mailModal.classList.remove('active'));

    document.getElementById('btn-challenge-proceed')?.addEventListener('click', () => showScreen('state-start'));

    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const nextBtn = document.getElementById('btn-next-q');
            if (document.activeElement !== chatInput && nextBtn && nextBtn.style.display === 'block') nextBtn.click();
        }
    });

    // Auto-advance challenge screen
    setTimeout(() => {
        if (document.getElementById('state-challenge').classList.contains('active')) showScreen('state-start');
    }, 7000);
});

// Mail toggle
let currentMailPage = 2;
function toggleMailPage() {
    const p1 = document.getElementById('mail-page-1');
    const p2 = document.getElementById('mail-page-2');
    const btn = document.getElementById('btn-toggle-mail');
    if (currentMailPage === 1) {
        p1.style.display = 'none'; p2.style.display = 'block';
        currentMailPage = 2; btn.innerHTML = 'Flip Page 📖';
    } else {
        p1.style.display = 'block'; p2.style.display = 'none';
        currentMailPage = 1; btn.innerHTML = 'Go Back 📖';
    }
}

// Global functions for inline onclicks
window.handleMistakePanelClick = (e) => {
    const panel = document.getElementById('mistakes-panel');
    if (panel && panel.classList.contains('minimized')) toggleMistakesMinimize(e);
};
window.toggleMistakesMinimize = toggleMistakesMinimize;
window.toggleMailPage = toggleMailPage;
window.togglePaste = (mode) => {
    const box = document.getElementById(mode + '-paste-box');
    const confirmBtn = document.getElementById('btn-confirm-' + mode + '-paste');
    const drop = mode === 'host' ? fileDropZone : soloFileDropZone;
    if (box.style.display === 'block') {
        box.style.display = 'none'; confirmBtn.style.display = 'none'; drop.style.display = 'block';
    } else {
        box.style.display = 'block'; confirmBtn.style.display = 'inline-flex'; drop.style.display = 'none'; box.focus();
    }
};
window.overrideJudge = overrideJudge;
