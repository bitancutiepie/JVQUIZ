function initHostPeer() {
    const shortId = generateShortId();
    hostRoomCode.textContent = '...';

    peer = new Peer('burricat-' + shortId);

    peer.on('open', (id) => {
        hostRoomCode.textContent = shortId;
    });

    peer.on('connection', (c) => {
        if (conn && conn.open) { 
            c.on('open', () => c.send({type: 'ERROR', msg: 'Host is already in a match!'}));
            setTimeout(() => c.close(), 500);
            return; 
        }
        conn = c;
        setupConnection();
        checkHostReady();
    });

    peer.on('error', (err) => {
        if (err.type === 'unavailable-id') {
            initHostPeer();
        } else {
            hostStatus.innerHTML = `Error: ${err.message} ✨`;
        }
    });
}

function checkHostReady() {
    if (conn && conn.open) {
        if (questions.length > 0) {
            btnStartGame.style.display = 'inline-flex';
            hostStatus.innerHTML = `Ready to start with ${opponentName || 'Player 2'}! ✨`;
        } else {
            btnStartGame.style.display = 'none';
            hostStatus.innerHTML = `<span style="color:var(--p1-color)">${opponentName || 'Player 2'} joined! Now load a quiz set below to start. ✨</span>`;
        }
    } else {
        btnStartGame.style.display = 'none';
        if (isHost) hostStatus.innerHTML = `Waiting for player 2<span class="loading-dots"></span>`;
    }
}

function setupConnection() {
    conn.on('open', () => {
        if (!isHost) {
            joinStatus.innerHTML = `Connected! Waiting for host... ✨`;
            conn.send({ type: 'JOIN_INFO', name: myName, char: myChar });
        } else {
            checkHostReady();
        }
    });

    conn.on('data', (data) => {
        handleNetworkData(data);
    });

    conn.on('close', () => {
        alert("Connection lost! Returning to menu. ✨");
        location.reload();
    });

    conn.on('error', (err) => {
        console.error("Connection error:", err);
        const status = isHost ? hostStatus : joinStatus;
        status.innerHTML = `<span style="color:var(--wrong-color)">Connection error! ✨</span>`;
    });
}

function handleNetworkData(data) {
    if (data.type === 'JOIN_INFO') {
        opponentName = data.name;
        opponentChar = data.char;
        checkHostReady();
    }
    else if (data.type === 'ERROR') {
        joinStatus.innerHTML = `<span style="color:var(--wrong-color)">${data.msg}</span>`;
        if (peer) peer.destroy();
    }
    else if (data.type === 'START') {
        questions = data.questions;
        opponentName = data.hostName;
        opponentChar = data.hostChar;

        applyPlayerUI(statP1, nameP1, avatarP1, opponentName, opponentChar);
        applyPlayerUI(statP2, nameP2, avatarP2, myName, myChar);

        p1Score = 0; p2Score = 0;
        currentQIndex = 0;
        showScreen('state-battle');
        renderScore();
        renderWait(`Waiting for ${opponentName}...`);
    }
    else if (data.type === 'QUESTION') {
        currentQIndex = data.index;
        p1Answer = null; p2Answer = null; isRevealed = false;
        renderQuestion(questions[currentQIndex]);
    }
    else if (data.type === 'ANSWER') {
        if (isHost) {
            p2Answer = data.value;
            checkAnswers();
        }
    }
    else if (data.type === 'RESULT') {
        p1Score = data.p1Score;
        p2Score = data.p2Score;
        p1Answer = data.p1Ans;
        p2Answer = data.p2Ans;
        revealAnswers(data.correct);
    }
    else if (data.type === 'JUDGE_OVERRIDE') {
        p1Score = data.p1Score;
        p2Score = data.p2Score;
        renderScore();
        const btns = document.querySelectorAll('.judge-btn');
        btns.forEach(b => {
            const onclickStr = b.getAttribute('onclick') || "";
            if (onclickStr.includes(`(${data.pIdx})`)) {
                const parent = b.parentElement;
                if (parent) {
                    parent.innerHTML = parent.innerHTML.replace(b.outerHTML, '⭐ (Judged Correct by Host)');
                }
            }
        });
        if (data.pIdx === 2) {
            myMistakes = myMistakes.filter(m => m.question !== questions[currentQIndex].question);
            renderMistakes();
        }
    }
    else if (data.type === 'END') {
        showResults();
    }
    else if (data.type === 'CHAT') {
        appendChat(opponentName, data.text, opponentChar);
    }
    else if (data.type === 'VOICE') {
        appendVoice(opponentName, data.data, opponentChar);
    }
    else if (data.type === 'GIF') {
        appendGif(opponentName, data.url, opponentChar);
    }
    else if (data.type === 'CHANGE_BGM') {
        playBGM(data.track);
    }
}
