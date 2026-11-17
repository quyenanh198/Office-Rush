// Procedural Web Audio API synthesizer for Office Rush 3D
class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  _ensureContext() {
    if (this.muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  _tone(freq, duration, type = 'sine', gainVal = 0.14, slideTo = null) {
    const ctx = this._ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    }

    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  playJump() {
    this._tone(240, 0.16, 'triangle', 0.15, 520);
  }

  playLaneSwitch() {
    this._tone(180, 0.07, 'sine', 0.08, 250);
  }

  playCollect(kind) {
    if (kind === 'coffee') {
      this._tone(523.25, 0.1, 'sine', 0.14, 783.99);
      setTimeout(() => this._tone(783.99, 0.12, 'triangle', 0.12), 60);
    } else if (kind === 'donut') {
      this._tone(440, 0.12, 'sine', 0.14, 659.25);
      setTimeout(() => this._tone(659.25, 0.14, 'sine', 0.12, 880), 80);
    } else {
      this._tone(660, 0.09, 'triangle', 0.12, 990);
    }
  }

  playFlowStart() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      setTimeout(() => this._tone(n, 0.14, 'square', 0.08), idx * 55);
    });
  }

  playSmash() {
    this._tone(160, 0.14, 'sawtooth', 0.14, 70);
  }

  playHit() {
    this._tone(200, 0.18, 'sawtooth', 0.18, 85);
    setTimeout(() => this._tone(130, 0.22, 'square', 0.12, 65), 70);
  }

  playGameOver() {
    const notes = [392, 349.23, 329.63, 261.63];
    notes.forEach((n, idx) => {
      setTimeout(() => this._tone(n, 0.22, 'triangle', 0.14), idx * 140);
    });
  }
}

export const sfx = new SoundFX();
