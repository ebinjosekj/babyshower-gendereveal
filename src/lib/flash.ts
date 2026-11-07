// Gives an element a short, smooth "notice me" pop with a glow ring (see .nudged in index.css).
export function flash(el: HTMLElement | null) {
  if (!el) return;
  el.classList.remove('nudged');
  void el.offsetWidth; // restart the animation if it is already running
  el.classList.add('nudged');
  window.setTimeout(() => el.classList.remove('nudged'), 1600);
}
