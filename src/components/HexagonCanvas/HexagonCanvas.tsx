import React, { useRef, useEffect } from 'react';
import type { Wall, ColorScheme, Particle } from '../../types';

interface Props {
  onGameOver: (score: string) => void;
  updateScore: (score: string) => void;
}

const SCHEMES: ColorScheme[] = [
  { bg: '#00cf2d', wall: '#ff3747', center: '#0f0f0f' },
  { bg: '#0037af', wall: '#ff3747', center: '#0f0f0f' },
  { bg: '#952ac4', wall: '#ff3747', center: '#0f0f0f' },
];

const lerpColor = (a: string, b: string, amount: number): string => {
  const ah = parseInt(a.replace(/#/g, ''), 16),
    ar = ah >> 16,
    ag = (ah >> 8) & 0xff,
    ab = ah & 0xff,
    bh = parseInt(b.replace(/#/g, ''), 16),
    br = bh >> 16,
    bg = (bh >> 8) & 0xff,
    bb = bh & 0xff,
    rr = ar + amount * (br - ar),
    rg = ag + amount * (bg - ag),
    rb = ab + amount * (bb - ab);
  return `rgb(${Math.round(rr)},${Math.round(rg)},${Math.round(rb)})`;
};

const HexagonCanvas: React.FC<Props> = ({ onGameOver, updateScore }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const spawnIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const state = useRef({
    walls: [] as Wall[],
    particles: [] as Particle[],
    playerAngle: 0,
    worldRotation: 0,
    targetRotationSpeed: 0.02,
    currentRotationSpeed: 0.02,
    lastDirectionChange: 0,
    startTime: 0,
    keys: {} as Record<string, boolean>,
    isAlive: true,
  });

  useEffect(() => {
    state.current.startTime = Date.now();
    state.current.lastDirectionChange = Date.now();
    const audio = new Audio('/audio/bgm.mp3');
    audio.loop = true;
    audio.volume = 0.4;
    const crashSound = new Audio('/audio/crash.mp3');
    crashSound.volume = 0.5;
    audio.play().catch(() => {});

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleKeyDown = (e: KeyboardEvent) => (state.current.keys[e.code] = true);
    const handleKeyUp = (e: KeyboardEvent) => (state.current.keys[e.code] = false);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    spawnIntervalRef.current = setInterval(() => {
      if (state.current.isAlive) {
        const sectors = 6;
        const angleStep = (Math.PI * 2) / sectors;
        const gapSector = Math.floor(Math.random() * sectors);
        const wallStartAngle = (gapSector + 1) * angleStep;
        const wallWidth = angleStep * (sectors - 1);

        state.current.walls.push({
          dist: Math.max(window.innerWidth, window.innerHeight),
          angle: wallStartAngle,
          width: wallWidth,
        });
      }
    }, 1200);

    const animate = () => {
      const s = state.current;
      const elapsed = (Date.now() - s.startTime) / 1000;
      const scoreStr = elapsed.toFixed(2);

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const pulse = s.isAlive ? Math.sin(elapsed * 10) * 4 : 0;
      const centerRadius = 42 + pulse;
      const playerDist = 55 + pulse;

      // ЛОГИКА
      if (s.isAlive) {
        updateScore(scoreStr);
        if (Date.now() - s.lastDirectionChange > 1000 + Math.random() * 4000) {
          s.targetRotationSpeed = -s.targetRotationSpeed * 1.005;
          s.lastDirectionChange = Date.now();
        }

        // Управление (увеличил скорость до 0.06, чтобы легче "бороться" с вращением)
        if (s.keys['KeyA'] || s.keys['ArrowLeft']) s.playerAngle -= 0.06;
        if (s.keys['KeyD'] || s.keys['ArrowRight']) s.playerAngle += 0.06;

        s.currentRotationSpeed += (s.targetRotationSpeed - s.currentRotationSpeed) * 0.05;
        s.worldRotation += s.currentRotationSpeed;
      }

      // ЦВЕТА
      const cycle = 10;
      const progress = (elapsed / cycle) % SCHEMES.length;
      const curIdx = Math.floor(progress);
      const nextIdx = (curIdx + 1) % SCHEMES.length;
      const theme = {
        bg: lerpColor(SCHEMES[curIdx].bg, SCHEMES[nextIdx].bg, progress - curIdx),
        wall: lerpColor(SCHEMES[curIdx].wall, SCHEMES[nextIdx].wall, progress - curIdx),
        center: lerpColor(SCHEMES[curIdx].center, SCHEMES[nextIdx].center, progress - curIdx),
      };

      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // ВРАЩАЮЩИЙСЯ СЛОЙ (Мир + Игрок)
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(s.worldRotation);

      // ЦЕНТР
      ctx.fillStyle = theme.center;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.lineTo(Math.cos(a) * centerRadius, Math.sin(a) * centerRadius);
      }
      ctx.fill();

      // СТЕНЫ
      ctx.fillStyle = theme.wall;
      for (let i = s.walls.length - 1; i >= 0; i--) {
        const w = s.walls[i];
        if (s.isAlive) w.dist -= 5 + elapsed / 15;

        const rInner = Math.max(0, w.dist);
        const rOuter = rInner + 22;
        const sectors = 6;
        const angleStep = (Math.PI * 2) / sectors;
        const numSegments = Math.round(w.width / angleStep);

        ctx.beginPath();
        for (let j = 0; j <= numSegments; j++) {
          const currAngle = w.angle + j * angleStep;
          const x = Math.cos(currAngle) * rInner;
          const y = Math.sin(currAngle) * rInner;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        for (let j = numSegments; j >= 0; j--) {
          const currAngle = w.angle + j * angleStep;
          const x = Math.cos(currAngle) * rOuter;
          const y = Math.sin(currAngle) * rOuter;
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        // КОЛЛИЗИЯ
        if (s.isAlive && Math.abs(w.dist - playerDist) < 15) {
          const pA = ((s.playerAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          const wStart = ((w.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          const wEnd = (wStart + w.width) % (Math.PI * 2);
          const hit = wStart < wEnd ? pA >= wStart && pA <= wEnd : pA >= wStart || pA <= wEnd;

          if (hit) {
            s.isAlive = false;
            crashSound.currentTime = 0;
            crashSound.play();
            audio.pause();
            const px = Math.cos(s.playerAngle) * playerDist;
            const py = Math.sin(s.playerAngle) * playerDist;
            for (let j = 0; j < 30; j++) {
              s.particles.push({
                x: px,
                y: py,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1.0,
              });
            }
            setTimeout(() => onGameOver(scoreStr), 1200);
          }
        }
        if (w.dist < -30) s.walls.splice(i, 1);
      }

      // ИГРОК
      if (s.isAlive) {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(
          Math.cos(s.playerAngle) * playerDist,
          Math.sin(s.playerAngle) * playerDist,
          6,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      // ЧАСТИЦЫ
      s.particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        ctx.fillStyle = `rgba(255, 255, 255, ${p.life})`;
        ctx.fillRect(p.x, p.y, 3, 3);
        if (p.life <= 0) s.particles.splice(index, 1);
      });

      ctx.restore();

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
      audio.pause();
      audio.src = '';
    };
  }, [onGameOver, updateScore]);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100vw', height: '100vh' }} />;
};

export default HexagonCanvas;
