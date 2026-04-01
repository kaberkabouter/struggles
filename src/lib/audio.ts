// Web Audio API — Zen ambient tones
// Off by default; toggled by user via mute button.

let _ctx: AudioContext | null = null;
let _enabled = false;

export function setAudioEnabled(enabled: boolean): void {
  _enabled = enabled;
  if (enabled && _ctx?.state === 'suspended') {
    _ctx.resume();
  }
}

export function isAudioEnabled(): boolean {
  return _enabled;
}

function _getCtx(): AudioContext | null {
  if (!_enabled || typeof window === 'undefined') return null;
  if (!_ctx) {
    _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

export function playPlacementTone(): void {
  const ac = _getCtx();
  if (!ac) return;

  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);

  // Soft descending sine — C5 → A4
  osc.type = 'sine';
  osc.frequency.setValueAtTime(523.25, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440, ac.currentTime + 0.15);

  gain.gain.setValueAtTime(0.07, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.35);

  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + 0.4);
}

export function playErrorTone(): void {
  const ac = _getCtx();
  if (!ac) return;

  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, ac.currentTime);

  gain.gain.setValueAtTime(0.04, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25);

  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + 0.3);
}
