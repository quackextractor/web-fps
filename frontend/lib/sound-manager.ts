import { WeaponType, PickupType, EnemyType } from "./fps-engine";
import { logger } from "./logger";

export class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private sfxEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private masterVolume: number = 0.5;
  private sfxVolume: number = 1;
  private musicVolume: number = 1;
  private musicActive: boolean = false;
  private musicMode: "unknown" | "sequence" | "full" | "none" = "unknown";
  private musicLoadPromise: Promise<void> | null = null;
  private startTemplate: HTMLAudioElement | null = null;
  private loopTemplate: HTMLAudioElement | null = null;
  private endTemplate: HTMLAudioElement | null = null;
  private fullTemplate: HTMLAudioElement | null = null;
  private hitmarkTemplate: HTMLAudioElement | null = null;
  private sequenceStartAudio: HTMLAudioElement | null = null;
  private sequenceLoopAudio: HTMLAudioElement | null = null;
  private fallbackPrimary: HTMLAudioElement | null = null;
  private fallbackSecondary: HTMLAudioElement | null = null;
  private fallbackIntervalId: number | null = null;
  private fallbackFadeMs = 220;
  private fallbackCrossfadeActive = false;
  private readonly audioSources = {
    start: "/audio/start.mp3",
    loop: "/audio/loop.mp3",
    end: "/audio/end.mp3",
    full: "/audio/full.mp3",
    hitmark: "/audio/hitmark.mp3",
  };

  constructor() {
    if (typeof window !== "undefined") {
      this.init();
    }
  }

  private init() {
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);
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
    this.applyMusicVolumes();
  }

  public setSfxVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.sfxVolume;
    }
  }

  public setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.applyMusicVolumes();
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
    if (!enabled) {
      this.stopMusic(false);
      return;
    }
    this.applyMusicVolumes();
    if (this.musicActive) {
      this.startMusic();
    }
  }

  public setEnabled(enabled: boolean) {
    this.setSfxEnabled(enabled);
  }

  public setVolume(volume: number) {
    this.setSfxVolume(volume);
  }

  private getMusicElementVolume(): number {
    if (!this.musicEnabled) {
      return 0;
    }
    return this.masterVolume * this.musicVolume;
  }

  private applyMusicVolumes() {
    const volume = this.getMusicElementVolume();
    const active = [
      this.sequenceStartAudio,
      this.sequenceLoopAudio,
      this.fallbackPrimary,
      this.fallbackSecondary,
    ];
    for (const audio of active) {
      if (audio) {
        audio.volume = volume;
      }
    }
  }

  private safePlay(audio: HTMLAudioElement) {
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch((e) => {
        logger.warn("Audio playback blocked or failed", e);
      });
    }
  }

  private rampVolume(audio: HTMLAudioElement, from: number, to: number, durationMs: number) {
    const steps = Math.max(1, Math.round(durationMs / 20));
    let step = 0;
    const intervalId = window.setInterval(() => {
      step += 1;
      const ratio = Math.min(1, step / steps);
      audio.volume = from + (to - from) * ratio;
      if (ratio >= 1) {
        window.clearInterval(intervalId);
      }
    }, 20);
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

  private async ensureMusicLoaded() {
    if (typeof window === "undefined") {
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
        const [startOk, loopOk, endOk, fullOk, hitmarkOk] = await Promise.all([
          this.probeAudio(this.audioSources.start),
          this.probeAudio(this.audioSources.loop),
          this.probeAudio(this.audioSources.end),
          this.probeAudio(this.audioSources.full),
          this.probeAudio(this.audioSources.hitmark),
        ]);

        if (hitmarkOk) {
          this.hitmarkTemplate = new Audio(this.audioSources.hitmark);
          this.hitmarkTemplate.preload = "auto";
        }

        if (startOk && loopOk && endOk) {
          this.musicMode = "sequence";
          this.startTemplate = new Audio(this.audioSources.start);
          this.loopTemplate = new Audio(this.audioSources.loop);
          this.endTemplate = new Audio(this.audioSources.end);
          this.startTemplate.preload = "auto";
          this.loopTemplate.preload = "auto";
          this.endTemplate.preload = "auto";
        } else if (fullOk) {
          this.musicMode = "full";
          this.fullTemplate = new Audio(this.audioSources.full);
          this.fullTemplate.preload = "auto";
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
    const tracks = [
      this.sequenceStartAudio,
      this.sequenceLoopAudio,
      this.fallbackPrimary,
      this.fallbackSecondary,
    ];
    for (const track of tracks) {
      if (!track) continue;
      track.pause();
      track.currentTime = 0;
      track.onended = null;
      track.ontimeupdate = null;
    }
    this.sequenceStartAudio = null;
    this.sequenceLoopAudio = null;
    this.fallbackPrimary = null;
    this.fallbackSecondary = null;
    if (this.fallbackIntervalId !== null) {
      window.clearInterval(this.fallbackIntervalId);
      this.fallbackIntervalId = null;
    }
    this.fallbackCrossfadeActive = false;
  }

  public async startMusic() {
    if (typeof window === "undefined") {
      return;
    }
    this.musicActive = true;
    if (!this.musicEnabled) {
      return;
    }
    await this.ensureMusicLoaded();
    if (!this.musicActive || !this.musicEnabled) {
      return;
    }

    if (this.musicMode === "sequence") {
      this.startSequenceMusic();
      return;
    }
    if (this.musicMode === "full") {
      this.startFullFallbackMusic();
      return;
    }
  }

  public stopMusic(playEndClip: boolean = true) {
    if (typeof window === "undefined") {
      return;
    }
    const shouldPlayEnd = playEndClip && this.musicEnabled && this.musicMode === "sequence" && !!this.endTemplate;
    this.musicActive = false;
    this.stopCurrentMusicTracks();

    if (shouldPlayEnd && this.endTemplate) {
      const ending = this.endTemplate.cloneNode(true) as HTMLAudioElement;
      ending.volume = this.getMusicElementVolume();
      this.safePlay(ending);
    }
  }

  private startSequenceMusic() {
    if (!this.startTemplate || !this.loopTemplate) {
      return;
    }
    this.stopCurrentMusicTracks();
    const volume = this.getMusicElementVolume();
    this.sequenceStartAudio = this.startTemplate.cloneNode(true) as HTMLAudioElement;
    this.sequenceLoopAudio = this.loopTemplate.cloneNode(true) as HTMLAudioElement;
    this.sequenceStartAudio.volume = volume;
    this.sequenceLoopAudio.volume = volume;
    this.sequenceLoopAudio.loop = true;
    this.sequenceStartAudio.currentTime = 0;
    this.sequenceLoopAudio.currentTime = 0;

    this.sequenceStartAudio.onended = () => {
      if (!this.musicActive || !this.musicEnabled || !this.sequenceLoopAudio) {
        return;
      }
      this.sequenceLoopAudio.currentTime = 0;
      this.safePlay(this.sequenceLoopAudio);
    };

    this.safePlay(this.sequenceStartAudio);
  }

  private startFullFallbackMusic() {
    if (!this.fullTemplate) {
      return;
    }
    this.stopCurrentMusicTracks();

    this.fallbackPrimary = this.fullTemplate.cloneNode(true) as HTMLAudioElement;
    this.fallbackSecondary = this.fullTemplate.cloneNode(true) as HTMLAudioElement;
    this.fallbackPrimary.loop = false;
    this.fallbackSecondary.loop = false;
    this.fallbackPrimary.currentTime = 0;
    this.fallbackSecondary.currentTime = 0;
    this.fallbackPrimary.volume = 0;
    this.fallbackSecondary.volume = 0;

    const targetVolume = this.getMusicElementVolume();
    this.safePlay(this.fallbackPrimary);
    this.rampVolume(this.fallbackPrimary, 0, targetVolume, this.fallbackFadeMs);

    this.fallbackIntervalId = window.setInterval(() => {
      if (!this.musicActive || !this.musicEnabled || !this.fallbackPrimary || !this.fallbackSecondary) {
        return;
      }
      const current = this.fallbackPrimary;
      const next = this.fallbackSecondary;
      if (!Number.isFinite(current.duration) || current.duration <= 0) {
        return;
      }
      const crossfadeWindow = this.fallbackFadeMs / 1000;
      if (this.fallbackCrossfadeActive) {
        return;
      }
      if (current.currentTime < current.duration - crossfadeWindow) {
        return;
      }

      this.fallbackCrossfadeActive = true;
      next.currentTime = 0;
      next.volume = 0;
      this.safePlay(next);
      this.rampVolume(next, 0, targetVolume, this.fallbackFadeMs);
      this.rampVolume(current, current.volume, 0, this.fallbackFadeMs);

      window.setTimeout(() => {
        current.pause();
        current.currentTime = 0;
        this.fallbackPrimary = next;
        this.fallbackSecondary = current;
        this.fallbackCrossfadeActive = false;
      }, this.fallbackFadeMs + 20);
    }, 90);
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
