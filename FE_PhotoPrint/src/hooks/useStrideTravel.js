import { useEffect, useRef, useState } from 'react';

const clamp = value => Math.min(1, Math.max(0, value));
const ease = value => (1 - Math.cos(Math.PI * value)) / 2;
const interpolate = (start, end, progress) => start + (end - start) * progress;

export function useStrideMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const change = event => setReduced(event.matches);
    query?.addEventListener?.('change', change);
    return () => query?.removeEventListener?.('change', change);
  }, []);
  return reduced;
}

export default function useStrideTravel({ active, reduced, enabled, catalogReady }) {
  const hero = useRef(null);
  const inside = useRef(null);
  const insideTarget = useRef(null);
  const traveller = useRef(null);
  const [step, setStep] = useState(0);
  const [part, setPart] = useState('hero');

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    let lastStep = -1;
    let lastPart = '';
    const shop = document.getElementById('shop');
    const card = document.getElementById('stride-card-' + active);

    function draw() {
      frame = 0;
      const canvas = traveller.current;
      if (!canvas || !hero.current || !inside.current || !insideTarget.current) return;
      const viewport = window.innerHeight;
      const origin = hero.current.getBoundingClientRect();
      const section = inside.current.getBoundingClientRect();
      const destination = insideTarget.current.getBoundingClientRect();
      const shopRect = shop?.getBoundingClientRect();
      const cardRect = card?.getBoundingClientRect();
      const phase = section.top <= 0 ? shopRect?.top < viewport * 0.72 && cardRect ? 'shop' : 'inside' : 'hero';
      const scroll = clamp(-section.top / Math.max(1, section.height - viewport));
      const sceneStep = Math.min(3, Math.floor(scroll / 0.19));
      if (sceneStep !== lastStep) { lastStep = sceneStep; setStep(sceneStep); }
      if (phase !== lastPart) { lastPart = phase; setPart(phase); }
      const enter = ease(clamp(1 - section.top / viewport));
      const land = cardRect ? ease(clamp((viewport - shopRect.top) / (0.7 * viewport))) : 0;
      const center = rect => [rect.left + rect.width / 2, rect.top + rect.height / 2, rect.width];
      const start = center(origin), middle = center(destination), end = cardRect ? center(cardRect) : middle;
      const [x, y, width] = start.map((value, index) => interpolate(interpolate(value, middle[index], enter), end[index], land));
      const rotation = interpolate(14 * enter, 0, land);
      canvas.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%) rotate(${rotation}deg)`;
      canvas.style.width = width + 'px';
      canvas.style.visibility = land < 0.98 && y > -viewport && y < viewport * 2 ? 'visible' : 'hidden';
      if (card) card.dataset.travelling = String(land > 0.1 && land < 0.98);
    }

    const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
    [hero.current, inside.current, insideTarget.current, shop, card].forEach(node => { if (node) observer?.observe(node); });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    draw();
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (card) delete card.dataset.travelling;
    };
  }, [active, enabled, reduced, catalogReady]);

  function goToStep(index) {
    setStep(index);
    if (enabled && !reduced && inside.current) {
      const { height, top } = inside.current.getBoundingClientRect();
      window.scrollTo({ top: window.scrollY + top + (height - window.innerHeight) * (index * 0.19 + 0.018), behavior: 'smooth' });
    }
  }
  return { hero, inside, insideTarget, traveller, step, part, goToStep };
}
