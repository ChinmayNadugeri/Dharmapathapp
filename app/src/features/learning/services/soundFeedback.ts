/**
 * SoundFeedback — lightweight web-audio & haptic feedback generator.
 * Works seamlessly on Web (Web Audio API synthesis) and native devices (Vibration)
 * without requiring external sound asset files.
 */
import { Platform, Vibration } from 'react-native';

class SoundFeedbackService {
  private audioCtx: any = null;

  private getAudioContext(): any {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!this.audioCtx) {
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Duolingo-style crisp, uplifting chime for correct answers (two ascending harmonic notes).
   */
  playCorrect() {
    try {
      if (Platform.OS !== 'web') {
        Vibration.vibrate([0, 40, 60, 60]);
      }
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      
      // Note 1: E5 (659 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.18);

      // Note 2: A5 (880 Hz) - higher celebration
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.1);
      gain2.gain.setValueAtTime(0.22, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.35);
    } catch {
      // Audio autoplay policy or hardware muted — degrade gracefully
    }
  }

  /**
   * Low, gentle dampening buzz for incorrect answers.
   */
  playIncorrect() {
    try {
      if (Platform.OS !== 'web') {
        Vibration.vibrate(120);
      }
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(130, now + 0.22);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {}
  }

  /**
   * Ascending bell fan-fare for lesson completion and leveling up.
   */
  playLevelUp() {
    try {
      if (Platform.OS !== 'web') {
        Vibration.vibrate([0, 70, 80, 100, 100, 180]);
      }
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        const now = ctx.currentTime + idx * 0.09;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.32);
      });
    } catch {}
  }

  /**
   * Subtle click for hint reveal.
   */
  playHint() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }
}

export const SoundFeedback = new SoundFeedbackService();
