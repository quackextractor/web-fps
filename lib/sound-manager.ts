import { WeaponType, PickupType, EnemyType } from "./fps-engine";

export class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== "undefined") {
      this.init();
    }
  }

  private init() {
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3; // Default volume
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn("AudioContext not supported or failed to initialize", e);
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (this.ctx && this.ctx.state === "suspended" && enabled) {
      this.ctx.resume();
    }
  }

  public playShoot(weapon: WeaponType) {
    if (!this.enabled || !this.ctx || !this.masterGain) return;
    this.ctx.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    switch (weapon) {
      case WeaponType.FIST:
        // Whoosh sound
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
        break;

      case WeaponType.PISTOL:
        // Sharp crack
        osc.type = "square";
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
        filter.frequency.setValueAtTime(1000, t);
        filter.frequency.linearRampToValueAtTime(100, t + 0.1);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
        break;

      case WeaponType.SHOTGUN:
        // Boom + noise
        const bufferSize = this.ctx.sampleRate * 0.5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = this.ctx.createGain();
        const noiseFilter = this.ctx.createBiquadFilter();

        noiseFilter.type = "lowpass";
        noiseFilter.frequency.setValueAtTime(1000, t);
        noiseFilter.frequency.exponentialRampToValueAtTime(100, t + 0.3);

        noiseGain.gain.setValueAtTime(1, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noise.start(t);
        break;

      case WeaponType.CHAINGUN:
        // Rapid fire pop
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;

      case WeaponType.CHAINSAW:
        // Buzzing saw
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(100, t);
        // Modulate pitch slightly for "revving" effect
        osc.frequency.linearRampToValueAtTime(150, t + 0.1);
        osc.frequency.linearRampToValueAtTime(100, t + 0.2);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.linearRampToValueAtTime(0.1, t + 0.2);

        osc.start(t);
        osc.stop(t + 0.25);
        break;
    }
  }

  public playHurt() {
    if (!this.enabled || !this.ctx || !this.masterGain) return;
    this.ctx.resume();
    const t = this.ctx.currentTime;

    // Grunt/Pain sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.linearRampToValueAtTime(80, t + 0.2);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  public playEnemyDeath(type: EnemyType) {
    if (!this.enabled || !this.ctx || !this.masterGain) return;
    this.ctx.resume();
    const t = this.ctx.currentTime;

    // Squelch/Scream
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.4);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.4);
  }

  public playPickup(type: PickupType) {
    if (!this.enabled || !this.ctx || !this.masterGain) return;
    this.ctx.resume();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";

    if (type === PickupType.WEAPON_SHOTGUN || type === PickupType.WEAPON_CHAINGUN || type === PickupType.WEAPON_CHAINSAW) {
      // Weapon pickup: "Click-Clack"
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.setValueAtTime(600, t + 0.1);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.2);
      osc.start(t);
      osc.stop(t + 0.2);
    } else {
      // Item pickup: High pitch ping
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.linearRampToValueAtTime(1200, t + 0.1);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.2);
      osc.start(t);
      osc.stop(t + 0.2);
    }

    osc.connect(gain);
    gain.connect(this.masterGain);
  }
}

export const soundManager = new SoundManager();
