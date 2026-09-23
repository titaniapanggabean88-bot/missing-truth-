/* ==========================================================================
   MISSING TRUTH - PROCEDURAL AUDIO SYNTHESIZER (WEB AUDIO API) - REVISI 2
   Generates rich atmospheric horror sounds, dynamic heartbeat, footsteps, 
   creaking doors, wind howling, grandfather clock chimes, reward fanfares,
   AND terrifying sudden jumpscare screeches & sprinting breath audio!
   ========================================================================== */

class HorrorAudioEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.isInitialized = false;

        // Sound Nodes
        this.ambientGain = null;
        this.ambientOsc = null;
        this.ambientOsc2 = null;
        this.heartbeatTimer = null;
        this.heartbeatRate = 1200; // ms per beat

        this.windGain = null;
        this.windNoiseNode = null;
    }

    init() {
        if (this.isInitialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.isInitialized = true;
            this.startAmbientDrone();
            this.startWindAmbience();
            this.startHeartbeatLoop();
            console.log("Horror Audio Engine initialized successfully.");
        } catch (e) {
            console.warn("Web Audio API not supported or blocked:", e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // 1. Deep Atmospheric Drone
    startAmbientDrone() {
        if (!this.ctx || this.isMuted) return;

        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

        this.ambientOsc = this.ctx.createOscillator();
        this.ambientOsc.type = 'sine';
        this.ambientOsc.frequency.setValueAtTime(45, this.ctx.currentTime);

        this.ambientOsc2 = this.ctx.createOscillator();
        this.ambientOsc2.type = 'sawtooth';
        this.ambientOsc2.frequency.setValueAtTime(53.4, this.ctx.currentTime);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(190, this.ctx.currentTime);

        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);

        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(60, this.ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        this.ambientOsc.connect(filter);
        this.ambientOsc2.connect(filter);
        filter.connect(this.ambientGain);
        this.ambientGain.connect(this.ctx.destination);

        this.ambientOsc.start();
        this.ambientOsc2.start();
        lfo.start();
    }

    // 2. Wind Howling Ambience
    startWindAmbience() {
        if (!this.ctx || this.isMuted) return;

        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        this.windNoiseNode = this.ctx.createBufferSource();
        this.windNoiseNode.buffer = noiseBuffer;
        this.windNoiseNode.loop = true;

        const bandpass = this.ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(320, this.ctx.currentTime);
        bandpass.Q.setValueAtTime(4.0, this.ctx.currentTime);

        const windLfo = this.ctx.createOscillator();
        windLfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);

        const windLfoGain = this.ctx.createGain();
        windLfoGain.gain.setValueAtTime(140, this.ctx.currentTime);

        windLfo.connect(windLfoGain);
        windLfoGain.connect(bandpass.frequency);

        this.windGain = this.ctx.createGain();
        this.windGain.gain.setValueAtTime(0.03, this.ctx.currentTime);

        this.windNoiseNode.connect(bandpass);
        bandpass.connect(this.windGain);
        this.windGain.connect(this.ctx.destination);

        this.windNoiseNode.start();
        windLfo.start();
    }

    // 3. Dynamic Heartbeat Generator
    startHeartbeatLoop() {
        const beat = () => {
            if (!this.isMuted && this.ctx) {
                this.playHeartbeatPulse();
            }
            this.heartbeatTimer = setTimeout(beat, this.heartbeatRate);
        };
        beat();
    }

    setHeartbeatIntensity(rateMs) {
        this.heartbeatRate = Math.max(400, Math.min(1600, rateMs));
    }

    playHeartbeatPulse() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.frequency.setValueAtTime(85, now);
        osc1.frequency.exponentialRampToValueAtTime(30, now + 0.12);
        gain1.gain.setValueAtTime(0.5, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.13);

        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.frequency.setValueAtTime(75, now + 0.16);
        osc2.frequency.exponentialRampToValueAtTime(25, now + 0.26);
        gain2.gain.setValueAtTime(0.35, now + 0.16);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now + 0.16);
        osc2.stop(now + 0.27);
    }

    // 4. Wooden Footsteps SFX (Supports Sprinting Pitch & Speed)
    playFootstep(isSprinting = false) {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const bufferSize = this.ctx.sampleRate * (isSprinting ? 0.04 : 0.06);
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.18));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime((isSprinting ? 450 : 300) + Math.random() * 120, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(isSprinting ? 0.45 : 0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (isSprinting ? 0.06 : 0.09));

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
    }

    // 5. INTENSE JUMPSCARE SCREECH SFX (Multi-layered terror scream)
    playJumpscareSting() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Layer 1: High Screeching Sawtooth
        const osc1 = this.ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(1600, now);
        osc1.frequency.exponentialRampToValueAtTime(350, now + 0.5);

        const filter1 = this.ctx.createBiquadFilter();
        filter1.type = 'highpass';
        filter1.frequency.setValueAtTime(900, now);

        const gain1 = this.ctx.createGain();
        gain1.gain.setValueAtTime(0.85, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        osc1.connect(filter1);
        filter1.connect(gain1);
        gain1.connect(this.ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.56);

        // Layer 2: Harsh Noise Burst
        const bufferSize = this.ctx.sampleRate * 0.4;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1);
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(2200, now);
        noiseFilter.Q.setValueAtTime(3, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.7, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        noise.start(now);

        // Layer 3: Sub Impact Drop
        const subOsc = this.ctx.createOscillator();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(150, now);
        subOsc.frequency.exponentialRampToValueAtTime(20, now + 0.5);

        const subGain = this.ctx.createGain();
        subGain.gain.setValueAtTime(0.9, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        subOsc.connect(subGain);
        subGain.connect(this.ctx.destination);

        subOsc.start(now);
        subOsc.stop(now + 0.52);
    }

    // 6. Creaking Door SFX
    playDoorCreak() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.setValueAtTime(8, now);

        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(320, now + 0.4);
        osc.frequency.linearRampToValueAtTime(210, now + 0.9);

        filter.frequency.setValueAtTime(280, now);
        filter.frequency.linearRampToValueAtTime(650, now + 0.4);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 1.12);
    }

    // 7. Thunder Strike
    playThunderStrike() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const bufferSize = this.ctx.sampleRate * 1.5;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.65, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
    }

    // 8. Flashlight Click
    playFlashlightClick() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.035);
    }

    // 9. Reward Fanfare
    playRewardFanfare() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const notes = [261.63, 329.63, 392.00, 523.25];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.15);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.001, now + idx * 0.15);
            gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.15 + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 1.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + idx * 0.15);
            osc.stop(now + idx * 0.15 + 1.25);
        });
    }

    // 10. Keypad Click
    playKeypadClick() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(650, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.055);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.ambientGain) {
            this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);
        }
        if (this.windGain) {
            this.windGain.gain.setValueAtTime(this.isMuted ? 0 : 0.03, this.ctx.currentTime);
        }
        return this.isMuted;
    }
}

window.horrorAudio = new HorrorAudioEngine();
