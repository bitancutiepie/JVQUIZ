function resetGameState() {
    questions = [];
    currentQIndex = 0;
    p1Score = 0;
    p2Score = 0;
    p1Answer = null;
    p2Answer = null;
    isRevealed = false;
    streak = 0;
    highestStreak = 0;
    myMistakes = [];
    renderMistakes();
    
    document.querySelectorAll('.preloaded-btn').forEach(b => b.classList.remove('selected'));
    
    if (dropLabel) dropLabel.innerHTML = 'Drop Quiz JSON Here<br>or Click';
    if (soloDropLabel) soloDropLabel.innerHTML = 'Drop Quiz JSON Here<br>or Click';
    
    if (hostStatus) hostStatus.innerHTML = `Waiting for player 2<span class="loading-dots"></span>`;
    if (soloStatus) soloStatus.innerHTML = `Ready to study...`;
    
    const hostPaste = document.getElementById('host-paste-box');
    if (hostPaste) hostPaste.value = '';
    const soloPaste = document.getElementById('solo-paste-box');
    if (soloPaste) soloPaste.value = '';
    
    if (btnStartGame) btnStartGame.style.display = 'none';
    if (btnStartSolo) btnStartSolo.style.display = 'none';
}

function resetSoloUI() {
    if (nextTimer) {
        clearInterval(nextTimer);
        nextTimer = null;
    }
    document.getElementById('solo-streak').style.display = 'none';
    document.getElementById('solo-progress-container').style.display = 'none';
    statP2.style.display = 'block';
    document.querySelector('.chat-container').style.display = 'flex';
}

function processFile(file, forSolo) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const parsed = parseContent(e.target.result);
        if (parsed.length > 0) {
            questions = parsed;
            if (forSolo) {
                soloDropLabel.innerHTML = `Loaded: ${file.name}<br>${parsed.length} questions ready! ✨`;
                btnStartSolo.style.display = 'inline-flex';
            } else {
                dropLabel.innerHTML = `Loaded: ${file.name}<br>${parsed.length} questions ready! ✨`;
                checkHostReady();
            }
        } else {
            const errorMsg = `<span style="color:var(--wrong-color)">Oops, bad file!</span><br>Try again ✨`;
            if (forSolo) soloDropLabel.innerHTML = errorMsg;
            else dropLabel.innerHTML = errorMsg;
        }
    };
    reader.readAsText(file);
}

function renderMistakes() {
    const grid = document.getElementById('mistakes-grid');
    const detailArea = document.getElementById('mistake-detail-area');
    const countBadge = document.getElementById('mistakes-count-badge');
    if (!grid || !detailArea) return;

    grid.innerHTML = '';
    if (myMistakes.length === 0) {
        if (countBadge) countBadge.textContent = '';
        detailArea.innerHTML = '<div style="text-align:center; color:var(--text-light); font-size:1.1rem; margin-top:10px;">No mistakes yet! Keep it up! ✨</div>';
        return;
    }

    if (countBadge) countBadge.textContent = ` (${myMistakes.length})`;
    const panel = document.getElementById('mistakes-panel');
    if (panel) panel.setAttribute('data-count', myMistakes.length);

    myMistakes.forEach((m, idx) => {
        const btn = document.createElement('button');
        btn.className = 'mistake-badge';
        btn.textContent = m.qNumber;
        btn.onclick = (e) => {
            e.stopPropagation();
            document.querySelectorAll('.mistake-badge').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            showMistakeDetail(m);
        };
        grid.appendChild(btn);
        if (idx === myMistakes.length - 1) btn.click();
    });
}

function addMistake(qObj, userAns) {
    if (!qObj) return;
    if (myMistakes.some(m => m.question === qObj.question)) return;

    myMistakes.push({
        qNumber: currentQIndex + 1,
        question: qObj.question,
        wrong: userAns || '(No timer/No answer)',
        correct: qObj.answer,
        fullQ: qObj
    });
    renderMistakes();
}

function showMistakeDetail(m) {
    const area = document.getElementById('mistake-detail-area');
    if (!area) return;
    const panel = document.getElementById('mistakes-panel');
    if (panel.classList.contains('minimized')) toggleMistakesMinimize();

    area.innerHTML = `
        <div class="mistake-item">
            <div class="mistake-q">#${m.qNumber}: ${m.question}</div>
            <div class="mistake-details">
                <span class="mistake-wrong">${m.wrong}</span>
                <span class="mistake-arrow">➜</span>
                <span class="mistake-correct">${m.correct}</span>
            </div>
        </div>
    `;
}

function toggleMistakesMinimize(event) {
    if (event) event.stopPropagation();
    const panel = document.getElementById('mistakes-panel');
    const btn = document.querySelector('.toggle-mistakes-btn');
    panel.classList.toggle('minimized');
    btn.textContent = panel.classList.contains('minimized') ? '+' : '_';
}

function renderQuestion(qObj) {
    questionText.innerHTML = qObj.question.replace(/\n/g, '<br>');
    choicesGrid.innerHTML = '';

    if (qObj.type === 'identification') {
        const container = document.createElement('div');
        container.style.width = '100%';
        container.style.textAlign = 'center';

        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'identification-input';
        input.placeholder = 'Type your answer... ✨';
        input.style.maxWidth = '400px';
        input.style.marginBottom = '15px';
        input.autocomplete = 'off';

        const subBtn = document.createElement('button');
        subBtn.className = 'btn btn-primary';
        subBtn.textContent = 'Submit Answer';
        subBtn.style.margin = '0 auto';
        subBtn.onclick = () => {
            const ans = input.value.trim();
            if (ans) {
                input.disabled = true;
                subBtn.disabled = true;
                selectAnswer(ans);
            }
        };
        input.onkeypress = (e) => { if (e.key === 'Enter') subBtn.click(); };

        container.appendChild(input);
        container.appendChild(subBtn);
        choicesGrid.appendChild(container);
        setTimeout(() => input.focus(), 100);
    } else {
        qObj.choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.innerHTML = `<span>${choice}</span><span class="choice-indicator"></span>`;
            btn.onclick = () => selectAnswer(choice);
            choicesGrid.appendChild(btn);
        });
    }

    battleMsg.textContent = "Your turn... ✨";
    battleMsg.className = 'battle-status';
    btnNextQ.style.display = 'none';
}

function selectAnswer(choiceStr) {
    if (isRevealed) return;

    if (isSolo) {
        if (p1Answer !== null) return;
        p1Answer = choiceStr;

        Array.from(choicesGrid.children).forEach(btn => {
            if (btn.firstChild.textContent === choiceStr) btn.classList.add('selected');
            else btn.disabled = true;
        });

        isRevealed = true;
        const correct = String(questions[currentQIndex].answer);
        if (p1Answer.toLowerCase() === correct.toLowerCase() ||
            p1Answer.toLowerCase().startsWith(correct.toLowerCase())) {
            p1Score++;
            streak++;
            if (streak > highestStreak) highestStreak = streak;
            showStreakPop();
            if (streak % 3 === 0) triggerHeartBurst();
            if (streak % 5 === 0) triggerConfetti();
        } else {
            streak = 0;
        }
        updateStreakUI();
        revealAnswers(correct);
        return;
    }

    const pAnswerState = (isHost) ? p1Answer : p2Answer;
    if (pAnswerState !== null) return;

    Array.from(choicesGrid.children).forEach(btn => {
        if (btn.firstChild.textContent === choiceStr) btn.classList.add('selected');
        else btn.disabled = true;
    });

    if (isHost) {
        p1Answer = choiceStr;
        battleMsg.innerHTML = `Waiting for ${opponentName || 'Player 2'}<span class="loading-dots"></span>`;
        checkAnswers();
    } else {
        p2Answer = choiceStr;
        conn.send({ type: 'ANSWER', value: choiceStr });
        battleMsg.innerHTML = `Sent! Waiting for ${opponentName || 'Host'}<span class="loading-dots"></span>`;
    }
}

function checkAnswers() {
    if (isSolo) return;
    if (p1Answer !== null && p2Answer !== null && !isRevealed) {
        isRevealed = true;
        const correct = String(questions[currentQIndex].answer);
        const isP1Correct = p1Answer.toLowerCase() === correct.toLowerCase() || p1Answer.toLowerCase().startsWith(correct.toLowerCase());
        const isP2Correct = p2Answer.toLowerCase() === correct.toLowerCase() || p2Answer.toLowerCase().startsWith(correct.toLowerCase());

        if (isP1Correct) p1Score++;
        if (isP2Correct) p2Score++;

        if (isHost && conn && conn.open) {
            conn.send({ type: 'RESULT', p1Score, p2Score, p1Ans: p1Answer, p2Ans: p2Answer, correct: correct });
        }
        revealAnswers(correct);
    }
}

function revealAnswers(correctAnswerStr) {
    if (!isSolo && (p1Answer === null || p2Answer === null)) return;

    const qObj = questions[currentQIndex];
    renderScore();

    const myAns = (isSolo || isHost) ? p1Answer : p2Answer;
    const myCorrect = myAns && (myAns.toLowerCase() === correctAnswerStr.toLowerCase() || myAns.toLowerCase().startsWith(correctAnswerStr.toLowerCase()));
    if (!myCorrect) addMistake(qObj, myAns);

    const p1CharIcon = isHost ? (myChar === 'ladybug' ? '🐞' : '🐈‍⬛') : (opponentChar === 'ladybug' ? '🐞' : '🐈‍⬛');
    const p2CharIcon = isHost ? (opponentChar === 'ladybug' ? '🐞' : '🐈‍⬛') : (myChar === 'ladybug' ? '🐞' : '🐈‍⬛');

    Array.from(choicesGrid.children).forEach(child => {
        if (qObj.type === 'identification') {
            const inputEl = document.getElementById('identification-input');
            if (inputEl) {
                inputEl.disabled = true;
                inputEl.value = `Correct: ${correctAnswerStr}`;
                inputEl.style.color = "var(--correct-color)";
            }

            const playersReveal = document.createElement('div');
            playersReveal.style.marginTop = '15px';
            playersReveal.style.fontSize = '1.4rem';

            const p1Text = p1Answer || '(No answer)';
            const p2Text = p2Answer || '(No answer)';
            const p1IsCorrect = p1Answer && (p1Answer.toLowerCase().startsWith(correctAnswerStr.toLowerCase()) || p1Answer.toLowerCase() === correctAnswerStr.toLowerCase());
            const p2IsCorrect = p2Answer && (p2Answer.toLowerCase().startsWith(correctAnswerStr.toLowerCase()) || p2Answer.toLowerCase() === correctAnswerStr.toLowerCase());

            const isMeP1 = (isSolo || isHost);
            const myText = isMeP1 ? p1Text : p2Text;
            const myCorrect = isMeP1 ? p1IsCorrect : p2IsCorrect;
            const myIdx = isMeP1 ? 1 : 2;

            const oppText = isMeP1 ? p2Text : p1Text;
            const oppCorrect = isMeP1 ? p2IsCorrect : p1IsCorrect;
            const oppIdx = isMeP1 ? 2 : 1;

            playersReveal.innerHTML = `
                <div class="${isMeP1 ? 'p1-color-text' : 'p2-color-text'}" style="margin-bottom:5px;">
                    [You]: ${myText}
                    ${myCorrect ? '⭐' : ((isHost || isSolo) ? `<button class="judge-btn" onclick="overrideJudge(${myIdx})">Mark Correct</button>` : '')}
                </div>
                ${!isSolo ? `
                    <div class="${!isMeP1 ? 'p1-color-text' : 'p2-color-text'}">
                        [Opponent]: ${oppText}
                        ${oppCorrect ? '⭐' : (isHost ? `<button class="judge-btn" onclick="overrideJudge(${oppIdx})">Mark Correct</button>` : '')}
                    </div>
                ` : ''}
            `;
            choicesGrid.appendChild(playersReveal);
            return;
        }

        const btn = child;
        if (!btn.querySelector('.choice-indicator')) return;
        const cText = btn.firstChild.textContent;
        const isCorrectChoice = cText.toLowerCase().startsWith(correctAnswerStr.toLowerCase()) || cText.toLowerCase() === correctAnswerStr.toLowerCase();

        btn.classList.remove('selected');
        let indicator = '';
        if (p1Answer && (cText.toLowerCase() === p1Answer.toLowerCase() || cText.toLowerCase().startsWith(p1Answer.toLowerCase()))) indicator += ` ${p1CharIcon}`;
        if (p2Answer && (cText.toLowerCase() === p2Answer.toLowerCase() || cText.toLowerCase().startsWith(p2Answer.toLowerCase()))) indicator += ` ${p2CharIcon}`;

        btn.querySelector('.choice-indicator').textContent = indicator;
        if (isCorrectChoice) btn.classList.add('correct');
        else btn.classList.add('wrong');
    });

    let msg = "";
    const p1c = (p1Answer && (p1Answer.startsWith(correctAnswerStr) || p1Answer === correctAnswerStr));
    const p2c = (p2Answer && (p2Answer.startsWith(correctAnswerStr) || p2Answer === correctAnswerStr));
    const n1 = isHost ? myName : opponentName;
    const n2 = isHost ? opponentName : myName;

    if (p1c && p2c) {
        msg = "Both got stars! ⭐⭐";
        triggerHeartBurst();
    }
    else if (p1c) msg = `${n1} got a star! ⭐`;
    else if (p2c) msg = `${n2} got a star! ⭐`;
    else msg = "No stars! 🙀";

    battleMsg.innerHTML = msg;
    battleMsg.className = 'battle-status highlight';

    if (isHost || isSolo) {
        btnNextQ.style.display = 'block';
        const isAutoNext = isSolo && qObj.type !== 'identification';
        btnNextQ.innerHTML = isAutoNext ? 'Next in 3s... ✨' : 'Next Question';

        if (isAutoNext) {
            if (nextTimer) clearInterval(nextTimer);
            let timeLeft = 3;
            nextTimer = setInterval(() => {
                timeLeft--;
                if (timeLeft > 0) btnNextQ.innerHTML = `Next in ${timeLeft}s... ✨`;
                else {
                    clearInterval(nextTimer);
                    nextTimer = null;
                    if (isSolo && btnNextQ.style.display === 'block') btnNextQ.click();
                }
            }, 1000);
        }
    }
    if (isSolo) updateProgressBar();
}

function handleNextQ() {
    if (!isSolo) {
        if (!isHost) return;
        if (!isRevealed || p1Answer === null || p2Answer === null) {
            battleMsg.innerHTML = `<span style="color:var(--wrong-color); font-weight:bold;">Wait! Both players must answer! ✨</span>`;
            return;
        }
    }

    currentQIndex++;
    if (currentQIndex >= questions.length) {
        if (isHost && conn && conn.open) conn.send({ type: 'END' });
        showResults();
    } else {
        btnNextQ.style.display = 'none';
        sendNextQuestion();
    }
}

function sendNextQuestion() {
    p1Answer = null; p2Answer = null; isRevealed = false;
    if (conn && conn.open) conn.send({ type: 'QUESTION', index: currentQIndex });
    renderQuestion(questions[currentQIndex]);
}

function overrideJudge(pIdx) {
    const correctStr = String(questions[currentQIndex].answer);
    if (pIdx === 1) p1Score++;
    else p2Score++;

    const isActuallyMe = (isSolo && pIdx === 1) || (isHost && pIdx === 1) || (!isHost && pIdx === 2);
    if (isActuallyMe) {
        myMistakes = myMistakes.filter(m => m.question !== questions[currentQIndex].question);
        renderMistakes();
    }

    if (!isSolo && isHost && conn && conn.open) {
        conn.send({ type: 'JUDGE_OVERRIDE', pIdx: pIdx, p1Score, p2Score });
    }
    renderScore();

    const btns = document.querySelectorAll('.judge-btn');
    btns.forEach(b => {
        const onclickStr = b.getAttribute('onclick') || "";
        if (onclickStr.includes(`(${pIdx})`)) {
            const parent = b.parentElement;
            if (parent) parent.innerHTML = parent.innerHTML.replace(b.outerHTML, isSolo ? '⭐ (Judged Correct)' : '⭐ (Judged Correct by Host)');
        }
    });

    const n1 = isHost ? myName : opponentName;
    const n2 = isHost ? opponentName : myName;
    const p1c_raw = (p1Answer && (p1Answer.toLowerCase().startsWith(correctStr.toLowerCase())));
    const p2c_raw = (p2Answer && (p2Answer.toLowerCase().startsWith(correctStr.toLowerCase())));
    const p1c = (pIdx === 1) ? true : p1c_raw;
    const p2c = (pIdx === 2) ? true : p2c_raw;

    let msg = "";
    if (p1c && p2c) msg = "Both got stars! ⭐⭐";
    else if (p1c) msg = `${n1} got a star! ⭐`;
    else if (p2c) msg = `${n2} got a star! ⭐`;
    else msg = "No stars! 🙀";
    battleMsg.innerHTML = msg;
}

function renderScore() {
    scoreP1.textContent = p1Score;
    scoreP2.textContent = p2Score;
}

function renderWait(msg) {
    questionText.innerHTML = "<em>" + msg + "</em>";
    choicesGrid.innerHTML = "";
    battleMsg.innerHTML = `<span class="loading-dots"></span>`;
    battleMsg.className = 'battle-status';
    btnNextQ.style.display = 'none';
}

function updateStreakUI() {
    const streakVal = document.getElementById('streak-val');
    const soloStreak = document.getElementById('solo-streak');
    if (streakVal) streakVal.textContent = streak;
    if (soloStreak) {
        soloStreak.style.display = streak > 0 ? 'inline-flex' : 'none';
        if (streak > 0) {
            soloStreak.style.animation = 'none';
            soloStreak.offsetHeight;
            soloStreak.style.animation = 'pulse 0.5s ease-in-out';
        }
    }
}

function updateProgressBar() {
    const fill = document.getElementById('solo-progress-fill');
    if (fill && questions.length > 0) {
        const pct = ((currentQIndex + 1) / questions.length) * 100;
        fill.style.width = pct + '%';
    }
}

function showStreakPop() {
    const pop = document.createElement('div');
    pop.className = 'streak-pop';
    const charIcon = myChar === 'ladybug' ? '🐞' : '🐈‍⬛';
    pop.textContent = streak >= 3 ? `${streak} STREAK!!! 🔥 ${charIcon}` : `+1 Star ✨ ${charIcon}`;
    const qBox = document.getElementById('question-text');
    qBox.appendChild(pop);
    setTimeout(() => pop.remove(), 1000);
}

function showResults() {
    showScreen('state-results');
    finalP1.textContent = p1Score;
    finalP2.textContent = p2Score;

    const n1 = isHost ? myName : opponentName;
    const n2 = isHost ? opponentName : myName;
    finalNameP1.textContent = n1;
    finalNameP2.textContent = n2;

    const p1Icon = isHost ? (myChar === 'ladybug' ? '🐞' : '🐈‍⬛') : (opponentChar === 'ladybug' ? '🐞' : '🐈‍⬛');
    const p2Icon = isHost ? (opponentChar === 'ladybug' ? '🐞' : '🐈‍⬛') : (myChar === 'ladybug' ? '🐞' : '🐈‍⬛');
    const p1Class = isHost ? (myChar === 'ladybug' ? 'p1-color-text' : 'p2-color-text') : (opponentChar === 'ladybug' ? 'p1-color-text' : 'p2-color-text');
    const p2Class = isHost ? (opponentChar === 'ladybug' ? 'p1-color-text' : 'p2-color-text') : (myChar === 'ladybug' ? 'p1-color-text' : 'p2-color-text');

    if (p1Score > p2Score) {
        winnerText.innerHTML = `${n1} Wins! 👑${p1Icon}`;
        winnerText.className = p1Class;
    } else if (p2Score > p1Score) {
        winnerText.innerHTML = `${n2} Wins! 👑${p2Icon}`;
        winnerText.className = p2Class;
    } else {
        winnerText.innerHTML = isSolo ? `Session Complete! ✨` : "It's a Tie! ✨✨";
        winnerText.className = "";
    }

    const soloExtra = document.getElementById('solo-result-extra');
    const p2Container = document.getElementById('final-score-p2-container');
    if (isSolo) {
        if (soloExtra) {
            soloExtra.style.display = 'block';
            document.getElementById('final-streak').textContent = highestStreak;
        }
        if (p2Container) p2Container.style.display = 'none';
        if (btnRetryMistakes) btnRetryMistakes.style.display = myMistakes.length > 0 ? 'inline-flex' : 'none';
    } else {
        if (soloExtra) soloExtra.style.display = 'none';
        if (p2Container) p2Container.style.display = 'block';
        if (btnRetryMistakes) btnRetryMistakes.style.display = 'none';
    }
}

function applyPlayerUI(statEl, nameEl, avatarEl, pName, pChar) {
    nameEl.textContent = pName;
    if (pChar === 'ladybug') {
        avatarEl.textContent = '🐞';
        nameEl.className = 'player-name p1-color-text';
        statEl.className = 'player-stat theme-ladybug';
    } else {
        avatarEl.textContent = '🐈‍⬛';
        nameEl.className = 'player-name p2-color-text';
        statEl.className = 'player-stat theme-catnoir';
    }
}

async function autoScan() {
    let manifest = PRELOADED_QUIZZES;
    try {
        const res = await fetch('quizzes.json');
        if (res.ok) {
            const dynamicManifest = await res.json();
            if (Array.isArray(dynamicManifest) && dynamicManifest.length > 0) {
                manifest = dynamicManifest;
                if (!manifest.includes('dbms.json')) manifest.unshift('dbms.json');
            }
        }
    } catch (e) { console.warn("Dynamic manifest failed."); }

    if (manifest && manifest.length > 0) {
        const hList = document.getElementById('host-preloaded-list');
        const sList = document.getElementById('solo-preloaded-list');
        if (hList) hList.innerHTML = '';
        if (sList) sList.innerHTML = '';

        manifest.forEach(path => {
            const filename = path.split('/').pop().replace('.json', '').replace('.txt', '');
            const hBtn = document.createElement('button');
            hBtn.className = 'preloaded-btn';
            hBtn.textContent = filename;
            hBtn.onclick = () => loadPreloadedQuiz(path, 'host', hBtn);
            if (hList) hList.appendChild(hBtn);

            const sBtn = document.createElement('button');
            sBtn.className = 'preloaded-btn';
            sBtn.textContent = filename;
            sBtn.onclick = () => loadPreloadedQuiz(path, 'solo', sBtn);
            if (sList) sList.appendChild(sBtn);
        });
        document.getElementById('host-preloaded-container').style.display = 'block';
        document.getElementById('solo-preloaded-container').style.display = 'block';
    }
}

function loadPreloadedQuiz(path, mode, btn) {
    const listId = mode === 'host' ? 'host-preloaded-list' : 'solo-preloaded-list';
    const list = document.getElementById(listId);
    if (list) Array.from(list.children).forEach(child => child.classList.remove('selected'));
    btn.classList.add('selected');

    const statusEl = mode === 'host' ? hostStatus : soloStatus;
    statusEl.innerHTML = `Loading ${path}... <span class="loading-dots"></span>`;

    fetch(path)
        .then(res => res.json())
        .then(parsed => {
            questions = parsed;
            if (mode === 'host') {
                hostStatus.innerHTML = `${parsed.length} questions loaded! ✨`;
                btnStartGame.style.display = 'block';
                dropLabel.innerHTML = `Loaded: ${path.split('/').pop()}`;
            } else {
                soloStatus.innerHTML = `${parsed.length} questions loaded! ✨`;
                btnStartSolo.style.display = 'block';
                soloDropLabel.innerHTML = `Loaded: ${path.split('/').pop()}`;
            }
        })
        .catch(() => { statusEl.innerHTML = `<span style="color:var(--wrong-color)">Error loading ${path} 😿</span>`; });
}
