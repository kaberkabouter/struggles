<script lang="ts">
  import { setAudioEnabled, isAudioEnabled } from '../lib/audio';

  type Theme = 'default' | 'oled' | 'newspaper';
  const THEMES: Theme[] = ['default', 'oled', 'newspaper'];
  const THEME_ICONS: Record<Theme, string> = {
    default: '🌙',
    oled: '⬛',
    newspaper: '📰',
  };
  const THEME_LABELS: Record<Theme, string> = {
    default: 'Dark',
    oled: 'OLED',
    newspaper: 'Paper',
  };

  let currentTheme = $state<Theme>('default');
  let audioOn = $state(false);

  function applyTheme(theme: Theme) {
    document.documentElement.dataset.theme = theme === 'default' ? '' : theme;
    localStorage.setItem('zen-theme', theme);
    currentTheme = theme;
  }

  function cycleTheme() {
    const next = THEMES[(THEMES.indexOf(currentTheme) + 1) % THEMES.length];
    applyTheme(next);
  }

  function toggleAudio() {
    audioOn = !audioOn;
    setAudioEnabled(audioOn);
    localStorage.setItem('zen-audio', audioOn ? '1' : '0');
  }

  $effect(() => {
    // Restore persisted theme
    const saved = localStorage.getItem('zen-theme') as Theme | null;
    if (saved && THEMES.includes(saved)) applyTheme(saved);
    // Audio stays off by default
    const savedAudio = localStorage.getItem('zen-audio');
    if (savedAudio === '1') {
      audioOn = true;
      setAudioEnabled(true);
    }
  });
</script>

<div class="toolbar-controls">
  <button class="icon-btn" onclick={cycleTheme} aria-label="Cycle theme: {THEME_LABELS[currentTheme]}">
    <span class="btn-icon">{THEME_ICONS[currentTheme]}</span>
    <span class="btn-label">{THEME_LABELS[currentTheme]}</span>
  </button>

  <button class="icon-btn" class:active={audioOn} onclick={toggleAudio} aria-label="Toggle audio">
    <span class="btn-icon">{audioOn ? '🔔' : '🔕'}</span>
    <span class="btn-label">{audioOn ? 'Sound' : 'Muted'}</span>
  </button>
</div>

<style>
  .toolbar-controls {
    display: flex;
    gap: 0.25rem;
  }

  .icon-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.1rem;
    padding: 0.3rem 0.5rem;
    border-radius: 8px;
    color: var(--text-muted);
    transition: color 0.2s, background-color 0.2s;
    min-width: 48px;
  }

  .icon-btn:hover,
  .icon-btn.active {
    color: var(--text-main);
    background-color: var(--highlight-bg);
  }

  .btn-icon {
    font-size: 1.1rem;
    line-height: 1;
  }

  .btn-label {
    font-size: 0.55rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
</style>
