function showScreen(id) {
    screens.forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');

    // Special case for challenge screen hidden state
    const chall = document.getElementById('state-challenge');
    if (chall && id !== 'state-challenge') {
        chall.classList.remove('active');
    }

    if (id === 'state-start') {
        resetSoloUI();
    }

    // Sync mistakes panel visibility
    const mPanel = document.getElementById('mistakes-panel');
    if (mPanel) {
        if (id === 'state-battle' || id === 'state-results') {
            mPanel.classList.add('active');
        } else {
            mPanel.classList.remove('active');
        }
    }
}

function triggerConfetti() {
    for (let i = 0; i < 30; i++) {
        const c = document.createElement('div');
        c.className = 'confetti';
        c.innerHTML = ['✨', '⭐', '🌸', '🐞', '🎉'][Math.floor(Math.random() * 5)];
        c.style.left = Math.random() * 100 + 'vw';
        c.style.top = '-5vh';
        c.style.fontSize = (Math.random() * 20 + 10) + 'px';
        c.style.animationDuration = (Math.random() * 2 + 1) + 's';
        c.style.opacity = Math.random();
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 2000);
    }
}

function triggerHeartBurst() {
    if (document.body.classList.contains('plain-theme')) return; // Disable in plain theme
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (let i = 0; i < 40; i++) {
        const h = document.createElement('div');
        const hearts = ['💖', '💜', '💗', '💥', '✨'];
        h.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
        h.className = 'heart-burst';
        h.style.left = centerX + 'px';
        h.style.top = centerY + 'px';

        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 200 + 100;
        h.style.setProperty('--tx', `calc(-50% + ${Math.cos(angle) * dist}px)`);
        h.style.setProperty('--ty', `calc(-50% + ${Math.sin(angle) * dist}px)`);

        document.body.appendChild(h);

        setTimeout(() => h.remove(), 1000);
    }
}

function createHeartRain() {
    if (window.innerWidth <= 600) return; 
    if (document.body.classList.contains('plain-theme')) return; 
    const h = document.createElement('div');
    const hearts = ['💖', '💜', '💗'];
    h.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
    h.className = 'heart-rain';
    h.style.left = Math.random() * 100 + 'vw';
    h.style.animationDuration = (Math.random() * 5 + 5) + 's';
    h.style.fontSize = (Math.random() * 15 + 10) + 'px';
    document.body.appendChild(h);

    h.addEventListener('animationend', () => {
        h.remove();
    });
}

// Heart Cursor Trail
let lastTrailTime = 0;
document.addEventListener('mousemove', (e) => {
    if (window.innerWidth <= 600) return; 
    if (document.body.classList.contains('plain-theme')) return; 
    const now = Date.now();
    if (now - lastTrailTime < 30) return; 
    lastTrailTime = now;

    if (Math.random() > 0.6) {
        const h = document.createElement('div');
        const hearts = ['💖', '💜', '💗', '🤍'];
        h.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
        h.className = 'heart-trail';
        h.style.left = e.clientX + 'px';
        h.style.top = e.clientY + 'px';
        document.body.appendChild(h);

        setTimeout(() => h.remove(), 1000);
    }
});

// Sticker flowers
const stickers = document.querySelectorAll('.sticker');
stickers.forEach(st => {
    st.addEventListener('click', (e) => {
        for (let i = 0; i < 5; i++) {
            const flower = document.createElement('div');
            flower.className = 'flower-particle';
            flower.textContent = '🌺';
            flower.style.filter = 'hue-rotate(240deg)'; 

            flower.style.left = e.clientX + 'px';
            flower.style.top = e.clientY + 'px';

            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 80 + 40;
            flower.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
            flower.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
            flower.style.setProperty('--rot', (Math.random() * 180 - 90) + 'deg');

            document.body.appendChild(flower);
            setTimeout(() => flower.remove(), 1000);
        }
    });
});
