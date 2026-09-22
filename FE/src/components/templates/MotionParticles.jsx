import React, { useEffect, useRef } from 'react';

export const MotionParticles = ({ effect = 'petals', count = 35 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!effect || effect === 'none') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    let particleCount = count;
    if (effect === 'confetti') particleCount = Math.floor(count * 1.4);
    if (effect === 'snow') particleCount = Math.floor(count * 1.5);
    if (effect === 'fireflies') particleCount = Math.floor(count * 0.8);
    if (effect === 'cyber-grid') particleCount = Math.min(30, count);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 8 + 3,
        speedY:
          effect === 'bubbles' || effect === 'sparkles'
            ? -(Math.random() * 1.2 + 0.3) // floating upwards
            : effect === 'fireflies'
            ? (Math.random() - 0.5) * 0.8
            : Math.random() * 1.5 + 0.5, // falling downwards
        speedX:
          effect === 'fireflies'
            ? (Math.random() - 0.5) * 0.8
            : Math.random() * 1.2 - 0.6,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 2 - 1,
        opacity: Math.random() * 0.5 + 0.3,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        color: getColorForEffect(effect)
      });
    }

    function getColorForEffect(type) {
      if (type === 'confetti') {
        const colors = ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#fbbf24', '#a855f7'];
        return colors[Math.floor(Math.random() * colors.length)];
      }
      if (type === 'petals') {
        const colors = ['#fecdd3', '#fda4af', '#f43f5e', '#ffe4e6', '#fbcfe8'];
        return colors[Math.floor(Math.random() * colors.length)];
      }
      if (type === 'sparkles') {
        const colors = ['#fef08a', '#fde047', '#ffffff', '#fed7aa', '#facc15'];
        return colors[Math.floor(Math.random() * colors.length)];
      }
      if (type === 'snow') {
        return '#ffffff';
      }
      if (type === 'bubbles') {
        const colors = ['#bae6fd', '#e0f2fe', '#c7d2fe', '#a5f3fc'];
        return colors[Math.floor(Math.random() * colors.length)];
      }
      if (type === 'fireflies') {
        const colors = ['#facc15', '#fef08a', '#a3e635', '#4ade80'];
        return colors[Math.floor(Math.random() * colors.length)];
      }
      if (type === 'cyber-grid') {
        const colors = ['#00f0ff', '#38bdf8', '#818cf8', '#ec4899'];
        return colors[Math.floor(Math.random() * colors.length)];
      }
      return '#cbd5e1';
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Special rendering for cyber-grid: connect close nodes
      if (effect === 'cyber-grid') {
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              ctx.strokeStyle = `rgba(0, 240, 255, ${0.2 * (1 - dist / 120)})`;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      particles.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        // Opacity pulsing for sparkles and fireflies
        if (effect === 'sparkles' || effect === 'fireflies') {
          p.opacity += p.pulseSpeed;
          if (p.opacity > 0.9 || p.opacity < 0.2) {
            p.pulseSpeed = -p.pulseSpeed;
          }
          ctx.globalAlpha = Math.max(0.1, Math.min(1, p.opacity));
        } else {
          ctx.globalAlpha = p.opacity;
        }

        // Render shapes based on effect
        if (effect === 'confetti') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (effect === 'petals') {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (effect === 'sparkles') {
          // 4-point sparkle star
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.quadraticCurveTo(0, 0, p.size, 0);
          ctx.quadraticCurveTo(0, 0, 0, p.size);
          ctx.quadraticCurveTo(0, 0, -p.size, 0);
          ctx.quadraticCurveTo(0, 0, 0, -p.size);
          ctx.fill();
        } else if (effect === 'snow') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else if (effect === 'bubbles') {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.7, 0, Math.PI * 2);
          ctx.stroke();
          // subtle specular highlight
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.5;
          ctx.beginPath();
          ctx.arc(-p.size * 0.25, -p.size * 0.25, p.size * 0.15, 0, Math.PI * 2);
          ctx.fill();
        } else if (effect === 'fireflies') {
          // glowing orb with outer halo
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 1.5);
          gradient.addColorStop(0, p.color);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (effect === 'cyber-grid') {
          ctx.fillRect(-2, -2, 4, 4);
        }

        ctx.restore();

        // Movement update
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        // Boundaries wrap
        if (p.speedY > 0 && p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        } else if (p.speedY < 0 && p.y < -20) {
          p.y = canvas.height + 20;
          p.x = Math.random() * canvas.width;
        }

        if (p.x > canvas.width + 20) {
          p.x = -20;
        } else if (p.x < -20) {
          p.x = canvas.width + 20;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [effect, count]);

  if (!effect || effect === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
    />
  );
};

export default MotionParticles;
