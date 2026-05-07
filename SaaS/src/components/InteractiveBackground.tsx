"use client";

import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseX: number;
  baseY: number;
  density: number;
  color: string;
  phase: number;
  isHex: boolean;
  hasCore: boolean;
}

export const InteractiveBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDark, setIsDark] = useState(false);

  // 🛡️ OBSERVADOR SÊNIOR: Monitorar mudança de tema no HTML root
  useEffect(() => {
    const targetNode = document.documentElement;
    const config = { attributes: true, attributeFilter: ['class'] };

    const callback = (mutationsList: MutationRecord[]) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          setIsDark(targetNode.classList.contains('dark'));
        }
      }
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    // Initial check
    setTimeout(() => {
      setIsDark(targetNode.classList.contains('dark'));
    }, 0);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    const mouse = {
      x: null as number | null,
      y: null as number | null,
      radius: 120
    };

    const colors = [
      'rgba(16, 185, 129, 0.7)', 
      'rgba(5, 150, 105, 0.5)',  
      'rgba(0, 0, 0, 0.2)'       
    ];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.x;
      mouse.y = event.y;
    };

    const init = () => {
      particles = [];
      const numberOfParticles = (canvas.width * canvas.height) / 10000;
      for (let i = 0; i < numberOfParticles; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2 + 1;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size,
          baseX: x,
          baseY: y,
          density: (Math.random() * 20) + 1,
          color,
          phase: Math.random() * Math.PI * 2,
          isHex: Math.random() > 0.8,
          hasCore: Math.random() > 0.7
        });
      }
    };

    const drawHex = (x: number, y: number, size: number) => {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            ctx.lineTo(x + size * Math.cos(i * Math.PI / 3), y + size * Math.sin(i * Math.PI / 3));
        }
        ctx.closePath();
    };

    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      time += 0.01;
      // 🚀 APENAS LIMPAMOS O CANVAS (Foco na transparência para o CSS brilhar)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x > canvas.width || p.x < 0) p.vx *= -1;
        if (p.y > canvas.height || p.y < 0) p.vy *= -1;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            p.x -= (dx / distance) * force * 3;
            p.y -= (dy / distance) * force * 3;
          }
        }

        const heartbeat = Math.sin(time * 2 + p.phase) * 0.2 + 1;
        const currentSize = p.size * heartbeat;

        let drawColor = p.color;
        if (isDark && p.color.includes('rgba(0, 0, 0')) {
            drawColor = 'rgba(255, 255, 255, 0.15)';
        } else if (!isDark && p.color.includes('rgba(0, 0, 0')) {
            drawColor = 'rgba(0, 0, 0, 0.05)'; // Super sutil no light mode
        }

        ctx.fillStyle = drawColor;
        
        if (p.isHex) {
            drawHex(p.x, p.y, currentSize);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
            ctx.fill();
        }

        if (p.hasCore) {
            ctx.fillStyle = isDark ? 'rgba(16, 185, 129, 0.8)' : 'rgba(16, 185, 129, 0.4)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, currentSize * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        for (let j = i; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
                const lineOpacity = isDark ? 0.12 : 0.08;
                ctx.strokeStyle = `rgba(16, 185, 129, ${lineOpacity * (1 - dist/100)})`;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]); // Re-start animation when theme changes to ensure fresh colors

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none bg-transparent transition-colors duration-500"
    />
  );
};
