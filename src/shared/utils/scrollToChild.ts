// src/shared/utils/scrollToChild.ts

export function scrollToChild(
  el: HTMLUListElement,
  idx: number,
  opts: { smooth?: boolean; disableSnap?: boolean } = {}
) {
  const { smooth = true, disableSnap = true } = opts;
  const target = el.children[idx] as HTMLElement | undefined;
  if (!target) return;

  if (disableSnap) el.classList.add('no-snap');
  el.scrollTo({ left: target.offsetLeft, behavior: smooth ? 'smooth' : 'auto' });

  if (disableSnap) {
    let raf: number | null = null;
    let last = -1;
    const tick = () => {
      const cur = el.scrollLeft;
      if (Math.abs(cur - last) < 0.5) {
        el.classList.remove('no-snap');
        if (raf) cancelAnimationFrame(raf);
        raf = null;
        return;
      }
      last = cur;
      raf = requestAnimationFrame(tick);
    };
    tick();
  }
}
