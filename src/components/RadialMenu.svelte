<script lang="ts">
  import { game, handleRadialInput } from '../lib/gameState.svelte';
  import { getRelatedIndices } from '../lib/sudoku';

  interface Props {
    cellIndex: number;
    x: number; // screen centre-x (px)
    y: number; // screen centre-y (px)
    onclose: () => void;
  }

  let { cellIndex, x, y, onclose }: Props = $props();

  // SVG viewport constants (1 SVG unit = 1 screen pixel, menu is 220×220)
  const SZ = 220;
  const CX = 110;
  const CY = 110;
  const OUTER_R = 96;
  const INNER_R = 34;
  const GAP_DEG = 2;

  // Numbers already in related cells → dim those slices
  const relatedValues = $derived.by(() => {
    const vals = new Set<number>();
    for (const ri of getRelatedIndices(cellIndex)) {
      const v = game.grid[ri]?.value;
      if (v && v !== 0) vals.add(v);
    }
    return vals;
  });

  // Geometry helpers
  function toRad(deg: number) { return (deg * Math.PI) / 180; }

  function polar(r: number, deg: number) {
    const rad = toRad(deg);
    return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
  }

  function arcPath(outerR: number, innerR: number, startDeg: number, endDeg: number): string {
    const p1 = polar(outerR, startDeg);
    const p2 = polar(outerR, endDeg);
    const p3 = polar(innerR, endDeg);
    const p4 = polar(innerR, startDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return [
      `M ${p1.x} ${p1.y}`,
      `A ${outerR} ${outerR} 0 ${large} 1 ${p2.x} ${p2.y}`,
      `L ${p3.x} ${p3.y}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${p4.x} ${p4.y}`,
      'Z',
    ].join(' ');
  }

  // 9 slices: 1 at top (-90°), clockwise, 40° each
  const slices = Array.from({ length: 9 }, (_, i) => {
    const num = i + 1;
    const mid   = -90 + i * 40;
    const start = mid - 20 + GAP_DEG;
    const end   = mid + 20 - GAP_DEG;
    const lp    = polar((OUTER_R + INNER_R) / 2, mid);
    return { num, mid, path: arcPath(OUTER_R, INNER_R, start, end), lp };
  });

  // Mouse-over highlighting — updated on mousemove over the SVG
  let hoveredNum = $state<number | null>(null);

  function sliceFromScreen(px: number, py: number): number | null {
    const dx = px - x;
    const dy = py - y;
    const r  = Math.sqrt(dx * dx + dy * dy);
    if (r < INNER_R || r > OUTER_R) return null;

    let deg = Math.atan2(dy, dx) * (180 / Math.PI);
    deg = ((deg % 360) + 360) % 360;

    for (const s of slices) {
      const sMidScreen = (s.mid + 90 + 360) % 360;
      let diff = Math.abs(deg - sMidScreen);
      if (diff > 180) diff = 360 - diff;
      if (diff <= 20) return s.num;
    }
    return null;
  }

  // Hover: highlight the slice under the cursor (no commitment yet)
  function onMouseMove(e: MouseEvent) {
    hoveredNum = sliceFromScreen(e.clientX, e.clientY);
  }

  // Click on a slice → place the number and close
  function onSliceClick(num: number) {
    if (relatedValues.has(num)) return;
    handleRadialInput(cellIndex, num);
    onclose();
  }

  // Click on the overlay (outside the SVG menu) → cancel
  function onOverlayClick(e: MouseEvent) {
    // Only close if the click target is the overlay itself, not the SVG
    if (e.target === e.currentTarget) onclose();
  }

  // Centre button: toggle pencil mode, keep menu open
  function onCenterClick(e: MouseEvent) {
    e.stopPropagation();
    game.notesMode = !game.notesMode;
    // don't close — let user pick a number in the new mode
  }

  // Escape key to cancel (captured on the overlay div)
  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose();
  }

  // Clamp so menu never overflows viewport
  const left = $derived(Math.min(Math.max(x - SZ / 2, 4), window.innerWidth  - SZ - 4));
  const top  = $derived(Math.min(Math.max(y - SZ / 2, 4), window.innerHeight - SZ - 4));
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="radial-overlay"
  role="dialog"
  aria-label="Number input"
  tabindex="-1"
  onclick={onOverlayClick}
  onkeydown={onKeyDown}
  onmousemove={onMouseMove}
>
  <div class="radial-wrap" style="left:{left}px; top:{top}px; width:{SZ}px; height:{SZ}px;">
    <svg viewBox="0 0 {SZ} {SZ}" width={SZ} height={SZ}>
      <!-- Background disc -->
      <circle cx={CX} cy={CY} r={OUTER_R + 4} class="bg-disc" />

      <!-- Slices -->
      {#each slices as s}
        {@const disabled = relatedValues.has(s.num)}
        {@const hovered  = hoveredNum === s.num && !disabled}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <path
          d={s.path}
          class="slice"
          class:hovered
          class:disabled
          class:notes-active={game.notesMode && hovered}
          onclick={() => onSliceClick(s.num)}
        />
        <text
          x={s.lp.x}
          y={s.lp.y}
          class="slice-label"
          class:disabled
          dominant-baseline="central"
          text-anchor="middle"
        >{s.num}</text>
      {/each}

      <!-- Centre: pencil-mode toggle -->
      <circle cx={CX} cy={CY} r={INNER_R - 1} class="center-bg" />
      <!-- svelte-ignore a11y_interactive_supports_focus a11y_no_static_element_interactions -->
      <circle
        cx={CX} cy={CY} r={INNER_R - 1}
        fill="transparent"
        role="button"
        aria-label="Toggle pencil mode"
        onclick={onCenterClick}
        style="cursor:pointer;"
      />
      <text x={CX} y={CY} class="center-icon" dominant-baseline="central" text-anchor="middle">
        {game.notesMode ? '✎' : '✒'}
      </text>

      <!-- Mode label below centre -->
      <text x={CX} y={CY + INNER_R + 11} class="mode-label" text-anchor="middle">
        {game.notesMode ? 'notes' : 'solid'}
      </text>
    </svg>
  </div>
</div>

<style>
  .radial-overlay {
    position: fixed;
    inset: 0;
    z-index: 900;
    touch-action: manipulation;
    /* No background — overlay is transparent; clicking empty space closes it */
  }

  .radial-wrap {
    position: absolute;
    pointer-events: none;
    filter: drop-shadow(0 8px 28px rgba(0, 0, 0, 0.6));
    animation: radial-pop 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  .radial-wrap svg {
    pointer-events: all;
    overflow: visible;
  }

  @keyframes radial-pop {
    from { transform: scale(0.72); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }

  .bg-disc {
    fill: var(--bg-color);
    opacity: 0.92;
  }

  /* ── Slices ──────────────────────────────────────── */
  .slice {
    fill: var(--radial-slice-bg);
    stroke: var(--bg-color);
    stroke-width: 2;
    cursor: pointer;
    transition: fill 0.1s ease;
  }

  .slice.hovered {
    fill: var(--primary);
  }

  .slice.notes-active {
    fill: var(--accent-notes);
  }

  .slice.disabled {
    fill: var(--radial-slice-disabled);
    cursor: not-allowed;
  }

  .slice-label {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    font-weight: 700;
    fill: var(--text-main);
    pointer-events: none;
    user-select: none;
  }

  .slice-label.disabled {
    fill: var(--text-muted);
    opacity: 0.35;
  }

  /* ── Centre ──────────────────────────────────────── */
  .center-bg {
    fill: var(--surface-raised);
    stroke: var(--border-light);
    stroke-width: 1.5;
    transition: fill 0.15s ease;
  }

  .center-icon {
    font-size: 18px;
    fill: var(--primary);
    pointer-events: none;
    user-select: none;
  }

  .mode-label {
    font-family: 'Inter', sans-serif;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    fill: var(--text-muted);
    pointer-events: none;
    user-select: none;
  }
</style>
