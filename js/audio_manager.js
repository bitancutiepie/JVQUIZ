// Global sounds
const clickSound = new Audio('sound.wav');
const bgmAudio = new Audio();
bgmAudio.loop = true;

document.addEventListener('click', (e) => {
    if (e.target.closest('button') || e.target.closest('.choice-btn') || e.target.closest('.btn')) {
        clickSound.currentTime = 0;
        clickSound.play().catch(err => console.log("Audio prevented before interaction:", err));
    }
});

function playBGM(trackPath) {
    const cassetteTitle = document.querySelector('.cassette-title');
    if (!trackPath) {
        bgmAudio.pause();
        bgmSelect.value = '';
        musicPlayerUI.classList.remove('playing');
        if (cassetteTitle) cassetteTitle.textContent = 'kylalala';
    } else {
        bgmAudio.src = trackPath;
        bgmAudio.play().catch(err => console.log('BGM Error:', err));
        bgmSelect.value = trackPath;
        musicPlayerUI.classList.add('playing');

        if (cassetteTitle && bgmSelect.selectedIndex >= 0) {
            const selectedText = bgmSelect.options[bgmSelect.selectedIndex].text;
            cassetteTitle.textContent = selectedText.replace('🎵 ', '');
        }
    }
}
