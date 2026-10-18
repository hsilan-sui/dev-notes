import {useEffect, useRef} from 'react';

// A quiet night for 訊號光年, drawn on a canvas: mostly tiny pinpoints, a few
// brighter stars that breathe at their own pace (the brightest with a faint
// glint), and now and then a thin meteor that is gone in under a second.
// Reduced motion: still stars, no meteors. Paused when off screen or hidden.
const COLORS = ['255, 255, 255', '220, 230, 255', '235, 240, 255', '255, 236, 205'];
const pick = (list) => list[Math.floor(Math.random() * list.length)];

function makeStars(width, height) {
  const count = Math.round((width * height) / 2600);
  return Array.from({length: count}, () => {
    const big = Math.random() < 0.06;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r: big ? 1 + Math.random() * 0.7 : 0.35 + Math.random() * 0.55,
      base: big ? 0.75 + Math.random() * 0.25 : 0.25 + Math.random() * 0.5,
      speed: 0.5 + Math.random() * 1.6,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() < 0.08 ? COLORS[3] : pick(COLORS.slice(0, 3)),
      glint: big && Math.random() < 0.5,
    };
  });
}

function makeMeteor(width, height) {
  const fromLeft = Math.random() < 0.5;
  const angle = (18 + Math.random() * 16) * (Math.PI / 180);
  const speed = 620 + Math.random() * 360;
  return {
    x: fromLeft ? Math.random() * width * 0.6 : width * 0.4 + Math.random() * width * 0.6,
    y: Math.random() * height * 0.45,
    dx: Math.cos(angle) * speed * (fromLeft ? 1 : -1),
    dy: Math.sin(angle) * speed,
    length: 90 + Math.random() * 90,
    life: 0.55 + Math.random() * 0.45,
    age: 0,
  };
}

export default function Starfield({className, style, meteors = true}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0, height = 0, stars = [], meteor = null;
    let nextMeteor = performance.now() + 3000 + Math.random() * 6000;
    let frame = 0, last = performance.now(), visible = true;

    function resize() {
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      stars = makeStars(width, height);
      draw(performance.now());
    }

    function draw(now) {
      const t = now / 1000;
      context.clearRect(0, 0, width, height);
      for (const star of stars) {
        const breath = reduced ? 1 : 0.62 + 0.38 * Math.sin(t * star.speed + star.phase);
        const alpha = star.base * breath;
        context.fillStyle = `rgba(${star.color}, ${alpha.toFixed(3)})`;
        context.beginPath();
        context.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        context.fill();
        if (star.glint && breath > 0.9) {
          const reach = star.r * 4.5 * (breath - 0.9) * 10;
          context.strokeStyle = `rgba(${star.color}, ${(alpha * 0.35).toFixed(3)})`;
          context.lineWidth = 0.6;
          context.beginPath();
          context.moveTo(star.x - reach, star.y); context.lineTo(star.x + reach, star.y);
          context.moveTo(star.x, star.y - reach); context.lineTo(star.x, star.y + reach);
          context.stroke();
        }
      }
      if (meteor) {
        const fade = Math.sin(Math.min(1, meteor.age / meteor.life) * Math.PI);
        const norm = Math.hypot(meteor.dx, meteor.dy);
        const tailX = meteor.x - (meteor.dx / norm) * meteor.length;
        const tailY = meteor.y - (meteor.dy / norm) * meteor.length;
        const gradient = context.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${(0.9 * fade).toFixed(3)})`);
        gradient.addColorStop(0.25, `rgba(220, 230, 255, ${(0.35 * fade).toFixed(3)})`);
        gradient.addColorStop(1, 'rgba(220, 230, 255, 0)');
        context.strokeStyle = gradient;
        context.lineWidth = 1.1;
        context.lineCap = 'round';
        context.beginPath();
        context.moveTo(meteor.x, meteor.y);
        context.lineTo(tailX, tailY);
        context.stroke();
      }
    }

    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (meteors && !meteor && now > nextMeteor) meteor = makeMeteor(width, height);
      if (meteor) {
        meteor.age += dt;
        meteor.x += meteor.dx * dt;
        // A slight dip, as if it were falling.
        meteor.dy += 40 * dt;
        meteor.y += meteor.dy * dt;
        if (meteor.age > meteor.life) {
          meteor = null;
          nextMeteor = now + 8000 + Math.random() * 10000;
        }
      }
      draw(now);
      frame = visible && !document.hidden ? requestAnimationFrame(tick) : 0;
    }

    function wake() {
      if (!reduced && visible && !document.hidden && !frame) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    }

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const seen = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; wake(); });
    seen.observe(canvas);
    document.addEventListener('visibilitychange', wake);
    wake();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      seen.disconnect();
      document.removeEventListener('visibilitychange', wake);
    };
  }, [meteors]);

  return <canvas ref={canvasRef} className={className} style={style} aria-hidden="true" />;
}
