/* ==========================================================================
   MISSING TRUTH - MAIN BOOTSTRAPPER & UI CONTROLLER
   Hooks up start buttons, modal events, HUD triggers, and game resets.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing Missing Truth Horror Engine...");

    // 1. Initialize 3D Renderer
    if (window.mansionRenderer) {
        window.mansionRenderer.init();
    }

    // 2. Start Game Button
    const btnStart = document.getElementById('btn-start-game');
    if (btnStart) {
        btnStart.addEventListener('click', () => {
            // Audio Web Context start
            if (window.horrorAudio) {
                window.horrorAudio.init();
                window.horrorAudio.resume();
            }

            // Hide Splash Screen
            document.getElementById('start-screen').classList.remove('active');

            // Initialize Gameplay UI
            if (window.gameplay) {
                window.gameplay.updateMissionUI();
                window.gameplay.renderInventoryUI();
                window.gameplay.showToast("Terjebak di Rumah Tua... Temukan Kebenaran!", "🕯️");
            }
        });
    }

    // 3. Claim Reward Button (Modal Hadiah Misi)
    const btnClaimReward = document.getElementById('btn-claim-reward');
    if (btnClaimReward) {
        btnClaimReward.addEventListener('click', () => {
            document.getElementById('reward-modal').classList.remove('active');
            if (window.gameplay) {
                window.gameplay.showToast("Hadiah & Potongan Jurnal Berhasil Disimpan!", "🎁");
            }
        });
    }

    // 4. Open Journal Modal Button
    const btnJournal = document.getElementById('btn-journal');
    if (btnJournal) {
        btnJournal.addEventListener('click', () => {
            if (window.gameplay) {
                window.gameplay.renderJournalUI();
                document.getElementById('journal-modal').classList.add('active');
            }
        });
    }

    // 5. Close Journal Modal Button
    const btnCloseJournal = document.getElementById('btn-close-journal');
    if (btnCloseJournal) {
        btnCloseJournal.addEventListener('click', () => {
            document.getElementById('journal-modal').classList.remove('active');
        });
    }

    // 6. Audio Toggle Button
    const btnToggleSound = document.getElementById('btn-toggle-sound');
    if (btnToggleSound) {
        btnToggleSound.addEventListener('click', () => {
            if (window.horrorAudio) {
                const isMuted = window.horrorAudio.toggleMute();
                btnToggleSound.innerHTML = isMuted ? '<span class="icon">🔇</span> Audio: OFF' : '<span class="icon">🔊</span> Audio: ON';
            }
        });
    }

    // 7. Help Button
    const btnHelp = document.getElementById('btn-help');
    if (btnHelp) {
        btnHelp.addEventListener('click', () => {
            if (window.gameplay) {
                window.gameplay.showToast("Kontrol: WASD (Jalan), Drag Mouse (Lihat), E/Klik (Interaksi), F (Senter)", "🎮");
            }
        });
    }

    // 8. Restart / New Game+ Button
    const btnRestart = document.getElementById('btn-restart-game');
    if (btnRestart) {
        btnRestart.addEventListener('click', () => {
            location.reload();
        });
    }
});
