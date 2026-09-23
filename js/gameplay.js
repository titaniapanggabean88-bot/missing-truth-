/* ==========================================================================
   MISSING TRUTH - GAMEPLAY & MISSION SYSTEM - REVISI 2
   Handles 5 story missions, rewards, inventory, stamina/sprint system, 
   sanity tracker, and truth journal archive.
   ========================================================================== */

class GameplaySystem {
    constructor() {
        // Player State
        this.batteryLevel = 100;
        this.sanityLevel = 100;
        this.staminaLevel = 100;
        this.isSprinting = false;
        this.isFlashlightOn = true;
        this.flashlightPower = 1.0;

        // Inventory
        this.inventory = [];

        // Current Mission Index (0 to 4)
        this.currentMissionIndex = 0;

        // Journal / Truth Pieces collected
        this.truthPieces = [];

        // Define 5 Main Missions
        this.missions = [
            {
                id: 1,
                title: "Nyalakan Harapan",
                desc: "Cari Korek Api tua di Ruang Tamu untuk menyalakan Perapian dan membuka dokumen kebenaran pertama.",
                targetObject: "fireplace",
                requiredItem: "korek_api",
                reward: {
                    toolTitle: "Senter Ultra-Lumen",
                    toolIcon: "🔦",
                    toolDesc: "Cahaya senter kini 2x lebih terang dan mampu menembus kegelapan pekat.",
                    truthTitle: "Catatan #1: Pesan Terakhir Sang Ibu",
                    truthSnippet: "12 Oktober 1988: 'Ada suara aneh dari balik dinding ruang kerja... Ayah menyembunyikan kunci ruang kerja di dalam kotak jam tua di ruang tamu.'"
                }
            },
            {
                id: 2,
                title: "Harmoni Berdarah",
                desc: "Gunakan Kunci Ruang Kerja untuk masuk, lalu temukan Gear Gramofon untuk memutar piringan hitam misterius.",
                targetObject: "gramophone",
                requiredItem: "gear_gramofon",
                reward: {
                    toolTitle: "Set Lockpick Kuno",
                    toolIcon: "🔓",
                    toolDesc: "Dapat digunakan untuk membobol kunci brankas dan pintu kuno.",
                    truthTitle: "Catatan #2: Rekaman Pita Kaset Kuno",
                    truthSnippet: "Suara Bisikan: 'Kode brankas rahasia di ruang kerja tersembunyi di balik jumlah warna merah pada 4 lukisan kuno: 7 - 4 - 2 - 9.'"
                }
            },
            {
                id: 3,
                title: "Terkunci Dalam Gelap",
                desc: "Buka Brankas Rahasia di Ruang Kerja menggunakan kode rahasia dari pita kaset.",
                targetObject: "safe_box",
                requiredItem: "kode_brankas",
                reward: {
                    toolTitle: "Amulet Ketenangan (Sanity Shield)",
                    toolIcon: "🧿",
                    toolDesc: "Mengurangi dampak penurunan Sanity dan mencegah halusinasi dalam gelap.",
                    truthTitle: "Catatan #3: Surat Perjanjian Rahasia",
                    truthSnippet: "24 November 1988: 'Kami mengunci rahasia eksperimen keluarga di Ruang Bawah Tanah. Hanya Kunci Segel Altar yang dapat membukanya.'"
                }
            },
            {
                id: 4,
                title: "Altar Kuno & Segel Elemen",
                desc: "Buka Pintu Ruang Bawah Tanah dan luruskan 4 Batu Altar Kuno sesuai simbol elemen.",
                targetObject: "altar_pedestal",
                requiredItem: "altar_align",
                reward: {
                    toolTitle: "Kunci Utama Gerbang Depan",
                    toolIcon: "🔑",
                    toolDesc: "Kunci besi berat yang digunakan untuk membuka Pintu Utama Rumah Tua.",
                    truthTitle: "Catatan #4: Laporan Kepolisian Rahasia 1988",
                    truthSnippet: "Laporan Polisi: 'Penghuni rumah tua tidak pernah hilang... mereka terjebak dalam jebakan ciptaan mereka sendiri saat mencoba melindungi kebenaran.'"
                }
            },
            {
                id: 5,
                title: "Pelarian & Kebenaran Sejati",
                desc: "Bawa Kunci Utama ke Pintu Depan dan tinggalkan rumah tua untuk membagikan kebenaran kepada dunia.",
                targetObject: "main_door",
                requiredItem: "kunci_utama",
                reward: {
                    toolTitle: "Lencana Pembuat Sejarah",
                    toolIcon: "🎖️",
                    toolDesc: "Anda berhasil mengungkap kebenaran sempurna!",
                    truthTitle: "Catatan #5: Pengakuan Sejati",
                    truthSnippet: "Kebenaran Utuh: 'Terima kasih telah mengungkap rahasia kami. Kegelapan telah sirna.'"
                }
            }
        ];

        // Journal Archive
        this.journalDatabase = [
            { id: 1, title: "Pesan Terakhir Sang Ibu", text: "12 Oktober 1988:\n\nRumah ini terasa kian dingin. Perapian di ruang tamu memegang rahasia kunci ruang kerja. Ayah menaruh korek api di meja vintage dekat jam kuno. Jika perapian dinyalakan, udara hangat akan membuka slot rahasia.", locked: true },
            { id: 2, title: "Rekaman Pita Kaset Kuno", text: "Pita kaset yang diputar pada gramofon tua menghasilkan suara misterius:\n\n'Kode brankas rahasia di ruang kerja tersembunyi di balik 4 lukisan. Kodenya adalah: 7 - 4 - 2 - 9.'", locked: true },
            { id: 3, title: "Surat Perjanjian Rahasia", text: "24 November 1988:\n\nSertifikat tanah dan pengakuan dosa keluarga kami simpan di Ruang Bawah Tanah (Basement). Pintu bawah tanah memerlukan Kunci Segel Altar.", locked: true },
            { id: 4, title: "Laporan Kepolisian Rahasia 1988", text: "Dokumen Resmi POLRI / Detektif:\n\n'Kasus hilangnya keluarga rumah tua akhirnya terpecahkan melalui artefak ini. Mereka meninggalkan kunci utama di altar bawah tanah.'", locked: true },
            { id: 5, title: "Pengakuan Sejati", text: "Kebenaran akhir:\n\nKeluarga ini tidak hilang karena hantu, melainkan sengaja mengunci rumah untuk menjaga penemuan sejarah agar tidak jatuh ke tangan jahat. Anda telah membebaskan jiwa rumah ini.", locked: true }
        ];

        this.initDefaultInventory();
    }

    initDefaultInventory() {
        this.inventory = [];
    }

    addItemToInventory(item) {
        const existing = this.inventory.find(i => i.id === item.id);
        if (existing) {
            existing.count = (existing.count || 1) + 1;
        } else {
            this.inventory.push({ ...item, count: 1 });
        }
        this.renderInventoryUI();
        this.showToast(`Memperoleh Item: ${item.name}`, item.icon);
    }

    hasItem(itemId) {
        return this.inventory.some(i => i.id === itemId);
    }

    useItem(itemId) {
        const idx = this.inventory.findIndex(i => i.id === itemId);
        if (idx !== -1) {
            if (this.inventory[idx].count > 1) {
                this.inventory[idx].count--;
            } else {
                this.inventory.splice(idx, 1);
            }
            this.renderInventoryUI();
            return true;
        }
        return false;
    }

    renderInventoryUI() {
        const container = document.getElementById('inventory-slots');
        if (!container) return;
        container.innerHTML = '';

        for (let i = 0; i < 6; i++) {
            const slot = document.createElement('div');
            slot.className = 'slot';

            if (this.inventory[i]) {
                const item = this.inventory[i];
                slot.innerHTML = `
                    <span class="item-icon">${item.icon}</span>
                    <span class="item-count">${item.count > 1 ? item.count : ''}</span>
                `;
                slot.title = item.name;
                slot.onclick = () => this.showToast(`Item: ${item.name}`, item.icon);
            } else {
                slot.classList.add('empty');
                slot.innerHTML = `<span class="item-icon" style="opacity:0.2;">📦</span>`;
            }
            container.appendChild(slot);
        }
    }

    getCurrentMission() {
        return this.missions[this.currentMissionIndex];
    }

    updateMissionUI() {
        const m = this.getCurrentMission();
        if (!m) return;

        document.getElementById('mission-step-count').innerText = `Misi ${m.id} / 5`;
        document.getElementById('mission-title').innerText = m.title;
        document.getElementById('mission-desc').innerText = m.desc;

        const progressPercent = ((m.id - 1) / 5) * 100;
        document.getElementById('mission-progress-bar').style.width = `${progressPercent}%`;
    }

    completeCurrentMission() {
        const m = this.getCurrentMission();
        if (!m) return;

        if (window.horrorAudio) {
            window.horrorAudio.playRewardFanfare();
        }

        if (this.journalDatabase[this.currentMissionIndex]) {
            this.journalDatabase[this.currentMissionIndex].locked = false;
            this.truthPieces.push(this.journalDatabase[this.currentMissionIndex]);
            document.getElementById('journal-count').innerText = this.truthPieces.length;
        }

        if (m.id === 1) {
            this.flashlightPower = 2.0;
            this.addItemToInventory({ id: "kunci_kerja", name: "Kunci Ruang Kerja", icon: "🔑" });
        } else if (m.id === 2) {
            this.addItemToInventory({ id: "lockpick", name: "Set Lockpick", icon: "🔓" });
            this.addItemToInventory({ id: "kaset", name: "Pita Kaset Rahasia", icon: "📼" });
        } else if (m.id === 3) {
            this.addItemToInventory({ id: "kunci_basement", name: "Kunci Basement", icon: "🗝️" });
            this.addItemToInventory({ id: "amulet", name: "Amulet Ketenangan", icon: "🧿" });
        } else if (m.id === 4) {
            this.addItemToInventory({ id: "kunci_utama", name: "Kunci Utama Gerbang", icon: "🔑" });
        }

        document.getElementById('reward-mission-name').innerText = `Misi ${m.id}: ${m.title}`;
        document.getElementById('reward-tool-icon').innerText = m.reward.toolIcon;
        document.getElementById('reward-tool-title').innerText = m.reward.toolTitle;
        document.getElementById('reward-tool-desc').innerText = m.reward.toolDesc;
        document.getElementById('reward-truth-title').innerText = m.reward.truthTitle;
        document.getElementById('reward-truth-desc').innerText = "Potongan dokumen penting terdistribusi ke Jurnal Kebenaran Anda.";
        document.getElementById('reward-truth-content').innerText = `"${m.reward.truthSnippet}"`;

        document.getElementById('reward-modal').classList.add('active');

        this.currentMissionIndex++;
        if (this.currentMissionIndex >= this.missions.length) {
            setTimeout(() => {
                this.showGameEnding();
            }, 1000);
        } else {
            this.updateMissionUI();
        }
    }

    showGameEnding() {
        document.getElementById('reward-modal').classList.remove('active');
        document.getElementById('ending-modal').classList.add('active');
    }

    renderJournalUI() {
        const list = document.getElementById('journal-list');
        const readerTitle = document.getElementById('journal-reader-title');
        const readerContent = document.getElementById('journal-reader-content');

        list.innerHTML = '';

        this.journalDatabase.forEach((entry, idx) => {
            const btn = document.createElement('div');
            btn.className = `journal-tab ${entry.locked ? 'locked' : ''}`;
            btn.innerHTML = `
                <span class="tab-title">${entry.locked ? '🔒 Dokumen Terkunci' : entry.title}</span>
                <span class="tab-date">${entry.locked ? 'Selesaikan Misi ' + (idx + 1) : 'Potongan #' + (idx + 1)}</span>
            `;

            if (!entry.locked) {
                btn.onclick = () => {
                    document.querySelectorAll('.journal-tab').forEach(t => t.classList.remove('active'));
                    btn.classList.add('active');
                    readerTitle.innerText = entry.title;
                    readerContent.innerText = entry.text;
                };
            }
            list.appendChild(btn);
        });
    }

    showToast(message, icon = "📜") {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span style="font-size:1.2rem;">${icon}</span> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(30px)';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    updateSanity(amount) {
        this.sanityLevel = Math.max(0, Math.min(100, this.sanityLevel + amount));
        const fill = document.getElementById('sanity-fill');
        const text = document.getElementById('sanity-text');
        const pulse = document.getElementById('sanity-pulse');

        if (fill) fill.style.width = `${this.sanityLevel}%`;

        if (this.sanityLevel < 40) {
            text.innerText = "Cemas";
            pulse.classList.add('active');
            if (window.horrorAudio) window.horrorAudio.setHeartbeatIntensity(500);
        } else if (this.sanityLevel < 70) {
            text.innerText = "Gelisah";
            pulse.classList.remove('active');
            if (window.horrorAudio) window.horrorAudio.setHeartbeatIntensity(850);
        } else {
            text.innerText = "Tenang";
            pulse.classList.remove('active');
            if (window.horrorAudio) window.horrorAudio.setHeartbeatIntensity(1200);
        }
    }

    updateStamina(delta, isSprinting) {
        if (isSprinting) {
            this.staminaLevel = Math.max(0, this.staminaLevel - delta * 35);
        } else {
            this.staminaLevel = Math.min(100, this.staminaLevel + delta * 22);
        }

        const fill = document.getElementById('stamina-fill');
        const text = document.getElementById('stamina-text');
        if (fill) fill.style.width = `${this.staminaLevel}%`;
        if (text) text.innerText = isSprinting ? "LARI" : "STAMINA";
    }
}

window.gameplay = new GameplaySystem();
