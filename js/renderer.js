/* ==========================================================================
   MISSING TRUTH - 3D GRAPHICS RENDERER (THREE.JS) - REVISI 2 (SPRINT & JUMPSCARES)
   Features:
   - SPRINT SYSTEM (Shift Key / Sprint Button): Speed 26.0, fast head bobbing, FOV expansion
   - INTENSE RANDOM JUMPSCARES: Ghost phantom pops, corridor dashes, flashlight blackouts
   - ULTRA BRIGHT FLASHLIGHT & Ambient Fill
   - 360-Degree Pointer Lock Free Look
   ========================================================================== */

class MansionRenderer {
    constructor() {
        this.container = document.getElementById('game-container');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.flashlightLight = null;
        this.playerFillLight = null;

        // Player Controls & 360 Mouse Look
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.isShiftDown = false;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.yaw = 0;
        this.pitch = 0;
        this.isPointerLocked = false;

        // Head Bobbing & Footsteps
        this.bobTimer = 0;
        this.defaultCameraY = 1.7;
        this.lastFootstepPhase = false;

        // Raycaster for interactables
        this.raycaster = new THREE.Raycaster();
        this.mouseVector = new THREE.Vector2(0, 0);
        this.interactables = [];
        this.hoveredObject = null;

        // Room Objects & Lights
        this.objectsMap = {};
        this.flickerLights = [];

        // Ghost Jumpscare Entity
        this.ghostEntity = null;
        this.isJumpscareActive = false;
        this.triggeredScares = new Set();
        this.randomScareTimer = 0;
        this.nextScareInterval = 20 + Math.random() * 15; // Jumpscare every 20-35s

        // Outdoor Lightning Timer
        this.lightningTimer = 0;
        this.lightningLight = null;

        // Clock
        this.clock = new THREE.Clock();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050608);
        this.scene.fog = new THREE.FogExp2(0x050608, 0.045);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0, this.defaultCameraY, 5);

        // WebGL Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Ambient Fill Lighting
        const ambientLight = new THREE.AmbientLight(0x2a3240, 0.55);
        this.scene.add(ambientLight);

        // Player Point Fill Light
        this.playerFillLight = new THREE.PointLight(0xfffaed, 0.8, 10);
        this.scene.add(this.playerFillLight);

        // ULTRA BRIGHT FLASHLIGHT
        this.flashlightLight = new THREE.SpotLight(0xfff5db, 6.0);
        this.flashlightLight.angle = Math.PI / 3.2;
        this.flashlightLight.penumbra = 0.4;
        this.flashlightLight.decay = 1.5;
        this.flashlightLight.distance = 35;
        this.flashlightLight.castShadow = true;
        this.scene.add(this.flashlightLight);
        this.scene.add(this.flashlightLight.target);

        // Outdoor Lightning Light
        this.lightningLight = new THREE.DirectionalLight(0xb0d4ff, 0);
        this.lightningLight.position.set(0, 10, -20);
        this.scene.add(this.lightningLight);

        // Build Mansion Architecture & Ghost
        this.buildMansion();
        this.createGhostJumpscareEntity();

        // Bind Events
        this.bindEvents();

        // Start animation loop
        this.animate();
    }

    buildMansion() {
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.7 });
        const darkWallMat = new THREE.MeshStandardMaterial({ color: 0x222834, roughness: 0.8 });
        const wallpaperMat = new THREE.MeshStandardMaterial({ color: 0x2d3545, roughness: 0.7 });
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x1f232d, roughness: 0.9 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xe5b842, metalness: 0.8, roughness: 0.3 });
        const redCarpetMat = new THREE.MeshStandardMaterial({ color: 0x6e1818, roughness: 0.9 });
        const bookMats = [
            new THREE.MeshStandardMaterial({ color: 0x8b0000 }),
            new THREE.MeshStandardMaterial({ color: 0x00008b }),
            new THREE.MeshStandardMaterial({ color: 0x006400 }),
            new THREE.MeshStandardMaterial({ color: 0x8b8b00 })
        ];

        // Floor & Runner Carpet
        const floorGeo = new THREE.PlaneGeometry(32, 32);
        const floor = new THREE.Mesh(floorGeo, woodMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        const carpetRunner = new THREE.Mesh(new THREE.PlaneGeometry(4, 28), redCarpetMat);
        carpetRunner.rotation.x = -Math.PI / 2;
        carpetRunner.position.set(0, 0.01, 0);
        this.scene.add(carpetRunner);

        const ceiling = new THREE.Mesh(floorGeo, darkWallMat);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = 4.2;
        this.scene.add(ceiling);

        // Walls
        const wallGeo = new THREE.BoxGeometry(32, 4.2, 0.4);
        const backWall = new THREE.Mesh(wallGeo, wallpaperMat);
        backWall.position.set(0, 2.1, -16);
        this.scene.add(backWall);

        const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(14, 4.2, 0.4), wallpaperMat);
        frontWallLeft.position.set(-9, 2.1, 16);
        this.scene.add(frontWallLeft);

        const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry(14, 4.2, 0.4), wallpaperMat);
        frontWallRight.position.set(9, 2.1, 16);
        this.scene.add(frontWallRight);

        // MAIN EXIT DOOR
        const mainDoor = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.6, 0.3), new THREE.MeshStandardMaterial({ color: 0x24150b }));
        mainDoor.position.set(0, 1.8, 16);
        mainDoor.userData = { id: "main_door", name: "Pintu Utama Rumah (Terkunci)", actionText: "Coba Buka Pintu Utama" };
        this.scene.add(mainDoor);
        this.interactables.push(mainDoor);

        // Side Walls
        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.2, 32), wallpaperMat);
        leftWall.position.set(-16, 2.1, 0);
        this.scene.add(leftWall);

        const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.2, 32), wallpaperMat);
        rightWall.position.set(16, 2.1, 0);
        this.scene.add(rightWall);

        // Chandeliers
        this.createChandelier(0, 3.8, -8);
        this.createChandelier(0, 3.8, 4);
        this.createChandelier(-10, 3.8, -2);
        this.createChandelier(10, 3.8, -2);

        // Room 1: Fireplace & Items
        const fireplace = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 1.4), stoneMat);
        fireplace.position.set(0, 1.5, -15.2);
        fireplace.userData = { id: "fireplace", name: "Perapian tua (Dingin)", actionText: "Nyalakan Perapian" };
        this.scene.add(fireplace);
        this.interactables.push(fireplace);
        this.objectsMap.fireplace = fireplace;

        const coals = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 0.8), new THREE.MeshBasicMaterial({ color: 0xff6600 }));
        coals.position.set(0, 0.3, -14.7);
        coals.visible = false;
        this.scene.add(coals);
        this.objectsMap.coals = coals;

        const fireLight = new THREE.PointLight(0xff7700, 0, 10);
        fireLight.position.set(0, 0.9, -14.2);
        this.scene.add(fireLight);
        this.objectsMap.fireLight = fireLight;

        const couch = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.2, 1.6), new THREE.MeshStandardMaterial({ color: 0x5e1515 }));
        couch.position.set(0, 0.6, -9.5);
        this.scene.add(couch);

        const table = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 1.4), woodMat);
        table.position.set(-4.5, 0.4, -9.5);
        this.scene.add(table);

        const matchbox = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.2), goldMat);
        matchbox.position.set(-4.5, 0.88, -9.5);
        matchbox.userData = { id: "korek_api_item", name: "Korek Api Tua", actionText: "Ambil Korek Api" };
        this.scene.add(matchbox);
        this.interactables.push(matchbox);

        const clockMesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.4, 0.8), woodMat);
        clockMesh.position.set(-14.8, 1.7, -14);
        clockMesh.userData = { id: "clock", name: "Jam Dinding Kuno", actionText: "Dengarkan Detak Jam" };
        this.scene.add(clockMesh);
        this.interactables.push(clockMesh);

        // Room 2: Gramophone
        const musicDivider = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.2, 14), wallpaperMat);
        musicDivider.position.set(-6, 2.1, -2);
        this.scene.add(musicDivider);

        const gramophone = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.1, 1.2), woodMat);
        gramophone.position.set(-12, 1.05, -3);
        gramophone.userData = { id: "gramophone", name: "Gramofon Kuno", actionText: "Putar Musik Rahasia" };
        this.scene.add(gramophone);
        this.interactables.push(gramophone);
        this.objectsMap.gramophone = gramophone;

        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.3, 16), goldMat);
        horn.rotation.x = -Math.PI / 3;
        horn.position.set(-12, 1.9, -3);
        this.scene.add(horn);

        const gearItem = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.08, 12), goldMat);
        gearItem.position.set(-12, 0.55, 3);
        gearItem.userData = { id: "gear_item", name: "Gear Gramofon Karatan", actionText: "Ambil Gear Gramofon" };
        this.scene.add(gearItem);
        this.interactables.push(gearItem);

        // Room 3: Study Room & Safe
        const studyDivider = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.2, 14), wallpaperMat);
        studyDivider.position.set(6, 2.1, -2);
        this.scene.add(studyDivider);

        const studyDoor = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.4, 2.2), woodMat);
        studyDoor.position.set(6, 1.7, -6);
        studyDoor.userData = { id: "study_door", name: "Pintu Ruang Kerja (Terkunci)", actionText: "Gunakan Kunci Ruang Kerja" };
        this.scene.add(studyDoor);
        this.interactables.push(studyDoor);

        this.createBookshelf(14.8, 2, -10, bookMats);
        this.createBookshelf(14.8, 2, -4, bookMats);

        const desk = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1, 1.6), woodMat);
        desk.position.set(11, 0.5, -4);
        this.scene.add(desk);

        const safeBox = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.3, 0.9), new THREE.MeshStandardMaterial({ color: 0x2d3436, metalness: 0.9 }));
        safeBox.position.set(14.5, 1.4, -4);
        safeBox.userData = { id: "safe_box", name: "Brankas Besi Rahasia", actionText: "Masukkan Kode Brankas" };
        this.scene.add(safeBox);
        this.interactables.push(safeBox);
        this.objectsMap.safeBox = safeBox;

        const painting = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.8, 2.4), new THREE.MeshStandardMaterial({ color: 0x6e1818 }));
        painting.position.set(15.7, 2.3, -8);
        painting.userData = { id: "painting", name: "Lukisan Kuno Berdebu", actionText: "Periksa Simbol Lukisan" };
        this.scene.add(painting);
        this.interactables.push(painting);

        // Room 4: Basement & Altar
        const basementDoor = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.4, 0.3), wallpaperMat);
        basementDoor.position.set(10, 1.7, 15.8);
        basementDoor.userData = { id: "basement_door", name: "Pintu Basement (Terkunci)", actionText: "Buka Pintu Basement" };
        this.scene.add(basementDoor);
        this.interactables.push(basementDoor);

        const altar = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.9, 0.9, 8), stoneMat);
        altar.position.set(10, 0.45, 9);
        altar.userData = { id: "altar_pedestal", name: "Altar Segel Elemen", actionText: "Luruskan Simbol Altar" };
        this.scene.add(altar);
        this.interactables.push(altar);
        this.objectsMap.altar = altar;

        const altarLight = new THREE.PointLight(0x38a5d9, 1.5, 8);
        altarLight.position.set(10, 1.6, 9);
        this.scene.add(altarLight);
    }

    createChandelier(x, y, z) {
        const mat = new THREE.MeshStandardMaterial({ color: 0xe5b842, metalness: 0.8 });
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.08, 8, 16), mat);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(x, y, z);
        this.scene.add(ring);

        const candleLight = new THREE.PointLight(0xffaa33, 0.9, 7);
        candleLight.position.set(x, y - 0.2, z);
        this.scene.add(candleLight);
        this.flickerLights.push(candleLight);
    }

    createBookshelf(x, y, z, bookMats) {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3.6, 3), new THREE.MeshStandardMaterial({ color: 0x2b1c10 }));
        frame.position.set(x, y, z);
        this.scene.add(frame);

        for (let b = -1.2; b <= 1.2; b += 0.25) {
            const bookMat = bookMats[Math.floor(Math.random() * bookMats.length)];
            const book = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.18), bookMat);
            book.position.set(x - 0.1, y + 0.4, z + b);
            this.scene.add(book);
        }
    }

    createGhostJumpscareEntity() {
        const ghostGeo = new THREE.CylinderGeometry(0.4, 0.5, 1.9, 12);
        const ghostMat = new THREE.MeshStandardMaterial({ color: 0x030305, roughness: 1.0, transparent: true, opacity: 0.96 });
        this.ghostEntity = new THREE.Mesh(ghostGeo, ghostMat);

        const eyeGeo = new THREE.SphereGeometry(0.045, 8, 8);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(0.13, 0.75, 0.32);
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(-0.13, 0.75, 0.32);

        this.ghostEntity.add(leftEye);
        this.ghostEntity.add(rightEye);
        this.ghostEntity.position.set(0, -10, 0);
        this.ghostEntity.visible = false;
        this.scene.add(this.ghostEntity);
    }

    triggerJumpscare(type = "pop") {
        if (this.isJumpscareActive) return;
        this.isJumpscareActive = true;

        const pulse = document.getElementById('sanity-pulse');
        if (pulse) pulse.style.boxShadow = 'inset 0 0 180px rgba(217, 56, 56, 0.95)';

        if (window.horrorAudio) window.horrorAudio.playJumpscareSting();
        if (window.gameplay) window.gameplay.updateSanity(-15);

        if (type === "pop") {
            // Right in front of camera
            const dir = new THREE.Vector3();
            this.camera.getWorldDirection(dir);
            this.ghostEntity.position.copy(this.camera.position).add(dir.multiplyScalar(1.5));
            this.ghostEntity.visible = true;

            setTimeout(() => {
                this.ghostEntity.visible = false;
                this.ghostEntity.position.set(0, -10, 0);
                this.isJumpscareActive = false;
                if (pulse) pulse.style.boxShadow = '';
            }, 550);
        } else if (type === "dash") {
            // Dashes across room
            this.ghostEntity.position.copy(this.camera.position).add(new THREE.Vector3(-3, 0, -3));
            this.ghostEntity.visible = true;

            let startTime = performance.now();
            const animateDash = () => {
                const elapsed = (performance.now() - startTime) / 1000;
                if (elapsed < 0.45) {
                    this.ghostEntity.position.x += 12 * 0.016;
                    requestAnimationFrame(animateDash);
                } else {
                    this.ghostEntity.visible = false;
                    this.ghostEntity.position.set(0, -10, 0);
                    this.isJumpscareActive = false;
                    if (pulse) pulse.style.boxShadow = '';
                }
            };
            animateDash();
        }

        // Rapid Flashlight Flicker
        let flickerCount = 0;
        const flickerInterval = setInterval(() => {
            this.flashlightLight.visible = !this.flashlightLight.visible;
            flickerCount++;
            if (flickerCount > 6) {
                clearInterval(flickerInterval);
                this.flashlightLight.visible = window.gameplay ? window.gameplay.isFlashlightOn : true;
            }
        }, 70);
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        const canvas = this.renderer.domElement;
        canvas.addEventListener('click', () => {
            if (!this.isPointerLocked) {
                canvas.requestPointerLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = (document.pointerLockElement === canvas);
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isPointerLocked) {
                const sensitivity = 0.0022;
                this.yaw -= e.movementX * sensitivity;
                this.pitch -= e.movementY * sensitivity;
                this.pitch = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, this.pitch));
            }
        });

        window.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'KeyW': case 'ArrowUp': this.moveForward = true; break;
                case 'KeyS': case 'ArrowDown': this.moveBackward = true; break;
                case 'KeyA': case 'ArrowLeft': this.moveLeft = true; break;
                case 'KeyD': case 'ArrowRight': this.moveRight = true; break;
                case 'ShiftLeft': case 'ShiftRight': this.isShiftDown = true; break;
                case 'KeyF': this.toggleFlashlight(); break;
                case 'KeyE': this.triggerInteraction(); break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'KeyW': case 'ArrowUp': this.moveForward = false; break;
                case 'KeyS': case 'ArrowDown': this.moveBackward = false; break;
                case 'KeyA': case 'ArrowLeft': this.moveLeft = false; break;
                case 'KeyD': case 'ArrowRight': this.moveRight = false; break;
                case 'ShiftLeft': case 'ShiftRight': this.isShiftDown = false; break;
            }
        });
    }

    toggleFlashlight() {
        if (!window.gameplay) return;
        window.gameplay.isFlashlightOn = !window.gameplay.isFlashlightOn;
        this.flashlightLight.visible = window.gameplay.isFlashlightOn;

        if (window.horrorAudio) window.horrorAudio.playFlashlightClick();
        document.getElementById('battery-text').innerText = window.gameplay.isFlashlightOn ? "ON" : "OFF";
    }

    triggerInteraction() {
        if (this.hoveredObject) {
            const data = this.hoveredObject.userData;

            if (window.horrorAudio) window.horrorAudio.playKeypadClick();

            if (Math.random() < 0.3 && !this.triggeredScares.has(data.id)) {
                this.triggeredScares.add(data.id);
                this.triggerJumpscare("pop");
            }

            if (data.id === "korek_api_item") {
                window.gameplay.addItemToInventory({ id: "korek_api", name: "Korek Api Tua", icon: "🔥" });
                this.scene.remove(this.hoveredObject);
                this.hoveredObject = null;
                return;
            }

            if (data.id === "gear_item") {
                window.gameplay.addItemToInventory({ id: "gear_gramofon", name: "Gear Gramofon", icon: "⚙️" });
                this.scene.remove(this.hoveredObject);
                this.hoveredObject = null;
                return;
            }

            if (data.id === "fireplace") {
                if (window.gameplay.currentMissionIndex === 0) {
                    if (window.gameplay.hasItem("korek_api")) {
                        window.gameplay.useItem("korek_api");
                        this.objectsMap.coals.visible = true;
                        this.objectsMap.fireLight.intensity = 3.5;
                        window.gameplay.completeCurrentMission();
                    } else {
                        window.gameplay.showToast("Perapian dingin. Cari Korek Api terlebih dahulu.", "❄️");
                    }
                } else {
                    window.gameplay.showToast("Perapian menyala dengan hangat.", "🔥");
                }
                return;
            }

            if (data.id === "gramophone") {
                if (window.gameplay.currentMissionIndex === 1) {
                    if (window.gameplay.hasItem("gear_gramofon")) {
                        window.gameplay.useItem("gear_gramofon");
                        if (window.horrorAudio) window.horrorAudio.playClockChime();
                        window.gameplay.completeCurrentMission();
                    } else {
                        window.gameplay.showToast("Gramofon kehilangan gear utama. Cari gear di ruang musik.", "🎶");
                    }
                }
                return;
            }

            if (data.id === "safe_box") {
                if (window.gameplay.currentMissionIndex === 2) {
                    this.openKeypadPuzzle();
                } else {
                    window.gameplay.showToast("Brankas telah terbuka.", "🔓");
                }
                return;
            }

            if (data.id === "painting") {
                window.gameplay.showToast("Di balik lukisan terukir deretan angka: 7 - 4 - 2 - 9", "🎨");
                return;
            }

            if (data.id === "altar_pedestal") {
                if (window.gameplay.currentMissionIndex === 3) {
                    if (window.gameplay.hasItem("kunci_basement")) {
                        if (window.horrorAudio) window.horrorAudio.playDoorCreak();
                        window.gameplay.completeCurrentMission();
                    } else {
                        window.gameplay.showToast("Segel Altar membutuhkan Kunci Basement!", "🧿");
                    }
                }
                return;
            }

            if (data.id === "main_door") {
                if (window.gameplay.currentMissionIndex === 4) {
                    if (window.gameplay.hasItem("kunci_utama")) {
                        window.gameplay.completeCurrentMission();
                    } else {
                        window.gameplay.showToast("Pintu terantai rapat. Anda butuh Kunci Utama dari Altar!", "🔒");
                    }
                }
                return;
            }

            window.gameplay.showToast(`${data.name}`, "🔍");
        }
    }

    openKeypadPuzzle() {
        const modal = document.getElementById('puzzle-modal');
        const box = document.getElementById('puzzle-content-box');
        let currentInput = "";

        const renderKeypad = () => {
            box.innerHTML = `
                <h3 class="puzzle-title">🔒 BRANKAS RAHASIA</h3>
                <p class="puzzle-subtitle">Masukkan 4 digit kode angka dari pita kaset / lukisan</p>
                <div class="keypad-display" id="keypad-code">${currentInput.padEnd(4, '_')}</div>
                <div class="keypad-grid">
                    ${[1,2,3,4,5,6,7,8,9].map(n => `<button class="btn-keypad" onclick="window.mansionRenderer.inputDigit('${n}')">${n}</button>`).join('')}
                    <button class="btn-keypad action" onclick="window.mansionRenderer.clearKeypad()">C</button>
                    <button class="btn-keypad" onclick="window.mansionRenderer.inputDigit('0')">0</button>
                    <button class="btn-keypad submit" onclick="window.mansionRenderer.submitKeypad()">OK</button>
                </div>
                <button class="btn-hud" style="margin:0 auto;" onclick="document.getElementById('puzzle-modal').classList.remove('active')">BATAL</button>
            `;
        };

        this.inputDigit = (digit) => {
            if (currentInput.length < 4) {
                currentInput += digit;
                if (window.horrorAudio) window.horrorAudio.playKeypadClick();
                document.getElementById('keypad-code').innerText = currentInput.padEnd(4, '_');
            }
        };

        this.clearKeypad = () => {
            currentInput = "";
            document.getElementById('keypad-code').innerText = "____";
        };

        this.submitKeypad = () => {
            if (currentInput === "7429") {
                modal.classList.remove('active');
                window.gameplay.completeCurrentMission();
            } else {
                this.triggerJumpscare("pop");
                window.gameplay.showToast("Kode Salah! Coba periksa pita kaset / lukisan.", "❌");
                this.clearKeypad();
            }
        };

        renderKeypad();
        modal.classList.add('active');
    }

    updateRaycasting() {
        this.raycaster.setFromCamera(this.mouseVector, this.camera);
        const intersects = this.raycaster.intersectObjects(this.interactables, false);

        const crosshair = document.getElementById('crosshair');
        const actionText = document.getElementById('action-text');

        if (intersects.length > 0 && intersects[0].distance < 4.5) {
            this.hoveredObject = intersects[0].object;
            const data = this.hoveredObject.userData;

            crosshair.classList.add('active');
            if (actionText) actionText.innerText = data.actionText || data.name;
        } else {
            this.hoveredObject = null;
            crosshair.classList.remove('active');
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();

        // RANDOM PERIODIC JUMPSCARE TIMER (Every 20-35s)
        this.randomScareTimer += delta;
        if (this.randomScareTimer > this.nextScareInterval) {
            this.randomScareTimer = 0;
            this.nextScareInterval = 22 + Math.random() * 18;
            this.triggerJumpscare(Math.random() > 0.5 ? "pop" : "dash");
        }

        // Camera rotation
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch;

        if (this.playerFillLight) {
            this.playerFillLight.position.copy(this.camera.position);
        }

        if (this.flashlightLight) {
            const power = window.gameplay ? window.gameplay.flashlightPower : 1.0;
            this.flashlightLight.intensity = window.gameplay.isFlashlightOn ? 6.0 * power : 0;
            this.flashlightLight.position.copy(this.camera.position);

            const dir = new THREE.Vector3();
            this.camera.getWorldDirection(dir);
            this.flashlightLight.target.position.copy(this.camera.position).add(dir.multiplyScalar(10));
        }

        // Candle flickers
        this.flickerLights.forEach(light => {
            light.intensity = 0.7 + Math.sin(Date.now() * 0.01 + light.position.x) * 0.25;
        });

        // Lightning strikes
        this.lightningTimer += delta;
        if (this.lightningTimer > 8 + Math.random() * 12) {
            this.lightningTimer = 0;
            this.lightningLight.intensity = 4.5;
            if (window.horrorAudio) window.horrorAudio.playThunderStrike();
            setTimeout(() => { this.lightningLight.intensity = 0; }, 120);
        }

        // SPRINT MECHANIC LOGIC
        const isMoving = this.moveForward || this.moveBackward || this.moveLeft || this.moveRight;
        const canSprint = isMoving && this.isShiftDown && window.gameplay && window.gameplay.staminaLevel > 5;
        const isSprinting = canSprint;

        if (window.gameplay) {
            window.gameplay.updateStamina(delta, isSprinting);
        }

        // Smooth FOV shift for sprint feeling
        const targetFov = isSprinting ? 83 : 75;
        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, delta * 6);
        this.camera.updateProjectionMatrix();

        // Speed & Head-bobbing values
        const speed = isSprinting ? 26.0 : 14.0;
        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;

        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize();

        if (isMoving) {
            this.velocity.z -= this.direction.z * speed * delta;
            this.velocity.x -= this.direction.x * speed * delta;

            // Head Bobbing (Faster during Sprint)
            const bobFreq = isSprinting ? 17.5 : 11.0;
            const bobAmpY = isSprinting ? 0.11 : 0.07;
            this.bobTimer += delta * bobFreq;

            const bobY = Math.sin(this.bobTimer) * bobAmpY;
            const bobX = Math.cos(this.bobTimer * 0.5) * (bobAmpY * 0.6);

            this.camera.position.y = this.defaultCameraY + bobY;
            this.camera.position.x += bobX * 0.1;

            const currentPhase = Math.sin(this.bobTimer) < -0.4;
            if (currentPhase && !this.lastFootstepPhase) {
                if (window.horrorAudio) window.horrorAudio.playFootstep(isSprinting);
            }
            this.lastFootstepPhase = currentPhase;
        } else {
            this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, this.defaultCameraY, delta * 8);
        }

        this.camera.translateX(-this.velocity.x * delta);
        this.camera.translateZ(this.velocity.z * delta);

        this.camera.position.x = Math.max(-14.5, Math.min(14.5, this.camera.position.x));
        this.camera.position.z = Math.max(-14.5, Math.min(14.5, this.camera.position.z));

        this.updateRaycasting();
        this.renderer.render(this.scene, this.camera);
    }
}

window.mansionRenderer = new MansionRenderer();
