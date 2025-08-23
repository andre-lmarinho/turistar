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

  // Use bounding boxes to derive the scroll offset. This avoids relying on
  // `offsetLeft`, which can misreport values when flex gaps or transforms are
  // involved. Clamp the offset so the last slide sits flush with the container.
  const parentRect = el.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const rawLeft = targetRect.left - parentRect.left + el.scrollLeft;
  const max = el.scrollWidth - el.clientWidth;
  const left = Math.min(rawLeft, max);

  el.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' });

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
