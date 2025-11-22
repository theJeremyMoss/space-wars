export default class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.init();
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    playShootSound() {
        if (!this.audioContext) return;
        this.resume();

        const t = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Laser chirp: high to low frequency
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(800, t);
        oscillator.frequency.exponentialRampToValueAtTime(100, t + 0.15);

        // Envelope: sharp attack, quick decay
        gainNode.gain.setValueAtTime(0.1, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

        oscillator.start(t);
        oscillator.stop(t + 0.15);
    }

    playExplosionSound() {
        if (!this.audioContext) return;
        this.resume();

        const t = this.audioContext.currentTime;
        const duration = 0.5;

        // Create noise buffer
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;

        // Filter for "rumble"
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, t);
        filter.frequency.linearRampToValueAtTime(100, t + duration);

        const gainNode = this.audioContext.createGain();

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Envelope
        gainNode.gain.setValueAtTime(0.3, t);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + duration);

        noise.start(t);
    }
}
