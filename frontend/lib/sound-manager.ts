import { WeaponType, PickupType, EnemyType } from "./fps-engine";
import { logger } from "./logger";

export class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private masterVolume: number = 0.5;
  private sfxVolume: number = 1;
  private musicVolume: number = 1;
  private musicActive: boolean = false;
  private musicMode: "unknown" | "sequence" | "full" | "none" = "unknown";
  private musicLoadPromise: Promise<void> | null = null;

  private startBuffer: AudioBuffer | null = null;
  private loopBuffer: AudioBuffer | null = null;
  private endBuffer: AudioBuffer | null = null;
  private fullBuffer: AudioBuffer | null = null;
  private hitmarkTemplate: HTMLAudioElement | null = null;

  private activeMusicNode: AudioBufferSourceNode | null = null;
  private loopMusicNode: AudioBufferSourceNode | null = null;
  private activeMusicTimeoutId: ReturnType<typeof setTimeout> | null = null;

  private readonly audioSources = {
    start: "/sounds/start.mp3",
    loop: "/sounds/loop.mp3",
    end: "/sounds/end.mp3",
    full: "/sounds/full.mp3",
    hitmark: "/sounds/hitmark.mp3",
  };

  constructor() {
    // AudioContext initialization deferred to public init() method
  }

  public init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();

      this.masterGain.gain.value = this.masterVolume;
      this.sfxGain.gain.value = this.sfxVolume;
      this.musicGain.gain.value = this.musicVolume;

      this.sfxGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
      
      // Proactively load music assets
      void this.ensureMusicLoaded();
    } catch (e) {
      logger.warn("AudioContext not supported or failed to initialize", e);
    }
  }

  public setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.masterVolume;
    }
  }

  public setSfxVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.sfxVolume;
    }
  }

  public setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicGain) {
      this.musicGain.gain.value = this.musicVolume;
    }
  }

  public setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
    if (this.ctx && this.ctx.state === "suspended" && enabled) {
      this.ctx.resume();
    }
    if (this.sfxGain) {
      this.sfxGain.gain.value = enabled ? this.sfxVolume : 0;
    }
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (this.musicGain) {
      this.musicGain.gain.value = enabled ? this.musicVolume : 0;
    }
    if (!enabled) {
      this.stopMusic(false);
      return;
    }
    if (this.musicActive) {
      void this.playDynamicMusic();
    }
  }

  public setEnabled(enabled: boolean) {
    this.setSfxEnabled(enabled);
  }

  public setVolume(volume: number) {
    this.setSfxVolume(volume);
  }

  private safePlay(audio: HTMLAudioElement) {
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch((e) => {
        logger.warn("Audio playback blocked or failed", e);
      });
    }
  }

  private async probeAudio(src: string): Promise<boolean> {
    return new Promise((resolve) => {
      const audio = new Audio();
      let settled = false;
      const finish = (value: boolean) => {
        if (settled) return;
        settled = true;
        audio.oncanplaythrough = null;
        audio.onerror = null;
        resolve(value);
      };
      const timeout = window.setTimeout(() => {
        window.clearTimeout(timeout);
        finish(false);
      }, 1800);
      audio.oncanplaythrough = () => {
        window.clearTimeout(timeout);
        finish(true);
      };
      audio.onerror = () => {
        window.clearTimeout(timeout);
        finish(false);
      };
      audio.preload = "auto";
      audio.src = src;
      audio.load();
    });
  }

  private async loadAudioBuffer(src: string): Promise<AudioBuffer | null> {
    if (!this.ctx) return null;
    try {
      const response = await fetch(src);
      if (!response.ok) return null;
      const arrayBuffer = await response.arrayBuffer();
      return await this.ctx.decodeAudioData(arrayBuffer);
    } catch (e) {
      logger.warn(`Failed to load or decode audio from ${src}`, e);
      return null;
    }
  }

  private async ensureMusicLoaded() {
    if (typeof window === "undefined" || !this.ctx) {
      this.musicMode = "none";
      return;
    }
    if (this.musicMode !== "unknown") {
      return;
    }
    if (this.musicLoadPromise) {
      await this.musicLoadPromise;
      return;
    }

    this.musicLoadPromise = (async () => {
      try {
        const [startBuf, loopBuf, endBuf, fullBuf, hitmarkOk] = await Promise.all([
          this.loadAudioBuffer(this.audioSources.start),
          this.loadAudioBuffer(this.audioSources.loop),
          this.loadAudioBuffer(this.audioSources.end),
          this.loadAudioBuffer(this.audioSources.full),
          this.probeAudio(this.audioSources.hitmark),
        ]);

        if (hitmarkOk) {
          this.hitmarkTemplate = new Audio(this.audioSources.hitmark);
          this.hitmarkTemplate.preload = "auto";
        }

        this.startBuffer = startBuf;
        this.loopBuffer = loopBuf;
        this.endBuffer = endBuf;
        this.fullBuffer = fullBuf;

        if (startBuf && loopBuf && endBuf) {
          this.musicMode = "sequence";
        } else if (fullBuf) {
          this.musicMode = "full";
        } else {
          this.musicMode = "none";
          logger.warn("No playable music assets found (start/loop/end or full)");
        }
      } catch (e) {
        this.musicMode = "none";
        logger.warn("Music/SFX loading failed", e);
      } finally {
        this.musicLoadPromise = null;
      }
    })();

    await this.musicLoadPromise;
  }

  private stopCurrentMusicTracks() {
    if (this.activeMusicNode) {
      try { this.activeMusicNode.stop(); } catch (e) { void e; }
      this.activeMusicNode = null;
    }
    if (this.loopMusicNode) {
      try { this.loopMusicNode.stop(); } catch (e) { void e; }
      this.loopMusicNode = null;
    }
    if (this.activeMusicTimeoutId !== null) {
      clearTimeout(this.activeMusicTimeoutId);
      this.activeMusicTimeoutId = null;
    }
  }

  public async startMusic() {
    await this.playDynamicMusic();
  }

  public stopMusic(playEndClip: boolean = true) {
    if (typeof window === "undefined") return;
    this.musicActive = false;
    
    if (playEndClip && this.musicEnabled && this.musicMode === "sequence" && this.ctx && this.musicGain) {
      this.playEndMusic();
    } else {
      this.stopCurrentMusicTracks();
    }
  }

  public async playDynamicMusic() {
    if (typeof window === "undefined" || !this.ctx || !this.musicGain) return;
    this.musicActive = true;
    if (!this.musicEnabled) return;
    
    await this.ensureMusicLoaded();
    if (!this.musicActive || !this.musicEnabled || this.musicMode === "none") return;

    this.stopCurrentMusicTracks();
    
    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }

    const t = this.ctx.currentTime;

    if (this.musicMode === "sequence" && this.startBuffer && this.loopBuffer) {
      this.activeMusicNode = this.ctx.createBufferSource();
      this.activeMusicNode.buffer = this.startBuffer;
      this.activeMusicNode.connect(this.musicGain);
      
      this.loopMusicNode = this.ctx.createBufferSource();
      this.loopMusicNode.buffer = this.loopBuffer;
      this.loopMusicNode.loop = true;
      this.loopMusicNode.connect(this.musicGain);
      
      this.activeMusicNode.start(t);
      this.loopMusicNode.start(t + 21.0);
    } else if (this.musicMode === "full" && this.fullBuffer) {
      this.activeMusicNode = this.ctx.createBufferSource();
      this.activeMusicNode.buffer = this.fullBuffer;
      this.activeMusicNode.loop = true;
      this.activeMusicNode.connect(this.musicGain);
      this.activeMusicNode.start(t);
    }
  }

  public playEndMusic() {
    if (typeof window === "undefined" || !this.ctx || !this.musicGain) return;
    this.musicActive = true;

    this.stopCurrentMusicTracks();
    
    if (!this.musicEnabled || this.musicMode !== "sequence" || !this.endBuffer) {
      return;
    }

    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }

    this.activeMusicNode = this.ctx.createBufferSource();
    this.activeMusicNode.buffer = this.endBuffer;
    this.activeMusicNode.connect(this.musicGain);
    this.activeMusicNode.start(this.ctx.currentTime);
    
    this.activeMusicTimeoutId = setTimeout(() => {
      this.activeMusicTimeoutId = null;
      if (this.musicActive) {
        void this.playDynamicMusic();
      }
    }, 55000);
  }

  public playShoot(weapon: WeaponType) {
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    this.ctx.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    switch (weapon) {
      case WeaponType.FIST:
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

      case WeaponType.SHOTGUN: {
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
        noiseGain.connect(this.sfxGain);
        noise.start(t);
        break;
      }

      case WeaponType.CHAINGUN:
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;

      case WeaponType.CHAINSAW:
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.linearRampToValueAtTime(150, t + 0.1);
        osc.frequency.linearRampToValueAtTime(100, t + 0.2);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.linearRampToValueAtTime(0.1, t + 0.2);

        osc.start(t);
        osc.stop(t + 0.25);
        break;
    }
  }

  public playHitmark() {
    if (!this.sfxEnabled) return;

    // Try to play from audio file first
    if (this.hitmarkTemplate) {
      const audio = this.hitmarkTemplate.cloneNode(true) as HTMLAudioElement;
      audio.volume = this.masterVolume * this.sfxVolume * 0.5; // Adjust hitmark relative volume
      this.safePlay(audio);
      return;
    }

    // Fallback to oscillator if file is missing or failed to load
    if (!this.ctx || !this.sfxGain) return;
    this.ctx.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(1600, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.04);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  public playHurt() {
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    this.ctx.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.linearRampToValueAtTime(80, t + 0.2);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  public playEnemyDeath(type: EnemyType) {
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    this.ctx.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.4);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.4);
  }

  public playPickup(type: PickupType) {
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    this.ctx.resume();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";

    if (type === PickupType.WEAPON_SHOTGUN || type === PickupType.WEAPON_CHAINGUN || type === PickupType.WEAPON_CHAINSAW) {
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.setValueAtTime(600, t + 0.1);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.2);
      osc.start(t);
      osc.stop(t + 0.2);
    } else {
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.linearRampToValueAtTime(1200, t + 0.1);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.2);
      osc.start(t);
      osc.stop(t + 0.2);
    }

    osc.connect(gain);
    gain.connect(this.sfxGain);
  }
}

export const soundManager = new SoundManager();
