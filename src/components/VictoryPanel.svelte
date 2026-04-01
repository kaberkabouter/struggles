<script lang="ts">
  import { slide } from 'svelte/transition';

  interface Props {
    onrestart: () => void;
  }

  let { onrestart }: Props = $props();
</script>

<div class="victory-panel" transition:slide={{ duration: 400 }}>
  <div class="victory-glyph">◎</div>
  <h2>Puzzle Complete</h2>
  <p>A moment of clarity. Well played.</p>
  <button class="restart-btn" onclick={onrestart}>New Puzzle</button>
</div>

<style>
  .victory-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.25rem 1rem;
    background: linear-gradient(135deg, rgba(63, 185, 80, 0.15), rgba(56, 161, 105, 0.08));
    border: 1px solid rgba(63, 185, 80, 0.35);
    color: var(--text-main);
    border-radius: 16px;
    text-align: center;
    width: 100%;
    max-width: var(--max-width);
    margin: 0 auto;
    box-sizing: border-box;
    gap: 0.35rem;
  }

  .victory-glyph {
    font-size: 2rem;
    color: var(--flash-valid);
    line-height: 1;
    margin-bottom: 0.1rem;
    animation: glyph-spin 2s linear infinite;
  }

  @keyframes glyph-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  h2 { margin: 0; font-size: 1.3rem; font-weight: 700; }
  p  { margin: 0; font-size: 0.82rem; color: var(--text-muted); }

  .restart-btn {
    margin-top: 0.6rem;
    background-color: var(--flash-valid);
    color: #fff;
    border: none;
    padding: 0.6rem 1.8rem;
    font-size: 0.9rem;
    font-weight: 700;
    border-radius: 20px;
    transition: transform 0.2s, opacity 0.2s;
  }

  .restart-btn:hover, .restart-btn:active { opacity: 0.88; transform: scale(1.04); }
</style>
