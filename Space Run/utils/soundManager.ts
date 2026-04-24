// Simple Web Audio API sound manager
class SoundManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private music: { osc: OscillatorNode; gain: GainNode }[] = [];
  private musicGain: GainNode | null = null;

  constructor() {
    // Initialize on first user interaction due to browser autoplay policies
    if (typeof window !== 'undefined') {
      document.addEventListener('click', () => this.initAudio(), { once: true });
      document.addEventListener('keydown', () => this.initAudio(), { once: true });
    }
  }

  private initAudio() {
    if (this.audioContext) return;
    
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.3; // Master volume
      
      // Create separate gain for music (lower volume)
      this.musicGain = this.audioContext.createGain();
      this.musicGain.connect(this.masterGain);
      this.musicGain.gain.value = 0.15; // Music is quieter than SFX
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  private playOscillator(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    if (!this.audioContext || !this.masterGain || this.isMuted) return;

    try {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.type = type;
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      
      osc.start(this.audioContext.currentTime);
      osc.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      console.warn('Error playing sound:', e);
    }
  }

  playJump() {
    // Ascending pitch for jump
    this.playOscillator(400, 0.1, 'sine');
    setTimeout(() => this.playOscillator(600, 0.1, 'sine'), 50);
  }

  playSlide() {
    // Lower descending pitch for slide
    this.playOscillator(300, 0.15, 'triangle');
  }

  playCollision() {
    // Harsh sound for collision
    this.playOscillator(150, 0.2, 'square', 0.2);
    setTimeout(() => this.playOscillator(100, 0.1, 'square', 0.15), 100);
  }

  playMenuClick() {
    // Short beep for menu interaction
    this.playOscillator(800, 0.05, 'sine');
  }

  playLevelComplete() {
    // Victory fanfare
    this.playOscillator(523, 0.15, 'sine'); // C5
    setTimeout(() => this.playOscillator(659, 0.15, 'sine'), 150); // E5
    setTimeout(() => this.playOscillator(784, 0.2, 'sine'), 300); // G5
  }

  playGameStart() {
    // Start sound
    this.playOscillator(440, 0.1, 'sine');
    setTimeout(() => this.playOscillator(550, 0.15, 'sine'), 100);
  }

  startBackgroundMusic() {
    if (!this.audioContext || !this.musicGain || this.isMuted) return;
    
    // Stop existing music first
    this.stopBackgroundMusic();

    try {
      // Create ambient background music loop with space/sci-fi vibe
      const playMusicLoop = () => {
        const notes = [
          { freq: 110, duration: 0.8 },  // A2 - deep bass
          { freq: 165, duration: 0.4 },  // E3 
          { freq: 110, duration: 0.8 },  // A2
          { freq: 220, duration: 0.6 },  // A3
        ];

        let time = this.audioContext!.currentTime;
        
        notes.forEach(note => {
          // Bass layer
          const osc1 = this.audioContext!.createOscillator();
          const gain1 = this.audioContext!.createGain();
          
          osc1.connect(gain1);
          gain1.connect(this.musicGain!);
          
          osc1.type = 'sine';
          osc1.frequency.value = note.freq;
          gain1.gain.setValueAtTime(0.1, time);
          gain1.gain.exponentialRampToValueAtTime(0.01, time + note.duration);
          
          osc1.start(time);
          osc1.stop(time + note.duration);
          
          // Pad layer (higher octave)
          const osc2 = this.audioContext!.createOscillator();
          const gain2 = this.audioContext!.createGain();
          
          osc2.connect(gain2);
          gain2.connect(this.musicGain!);
          
          osc2.type = 'triangle';
          osc2.frequency.value = note.freq * 2;
          gain2.gain.setValueAtTime(0.05, time);
          gain2.gain.exponentialRampToValueAtTime(0.01, time + note.duration);
          
          osc2.start(time);
          osc2.stop(time + note.duration);
          
          this.music.push({ osc: osc1, gain: gain1 });
          this.music.push({ osc: osc2, gain: gain2 });
          
          time += note.duration;
        });

        // Schedule next loop (total duration ~3 seconds)
        this.musicLoopTimeout = window.setTimeout(playMusicLoop, 3000);
      };

      playMusicLoop();
    } catch (e) {
      console.warn('Error playing background music:', e);
    }
  }

  stopBackgroundMusic() {
    if (this.musicLoopTimeout) {
      clearTimeout(this.musicLoopTimeout);
      this.musicLoopTimeout = null;
    }
    
    // Stop all music oscillators
    this.music.forEach(({ osc, gain }) => {
      try {
        gain.gain.setValueAtTime(gain.gain.value, this.audioContext!.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 0.2);
        osc.stop(this.audioContext!.currentTime + 0.2);
      } catch (e) {
        // Already stopped
      }
    });
    this.music = [];
  }

  private musicLoopTimeout: number | null = null;

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  isSoundEnabled() {
    return !this.isMuted && this.audioContext !== null;
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
