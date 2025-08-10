import React, { useEffect, useRef, useState } from "react";

export function ConfettiBurst({ trigger }: { trigger: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = (canvas.width = canvas.offsetWidth);
    const H = (canvas.height = canvas.offsetHeight);
    const colors = ["#22c55e", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899"];
    const pieces = Array.from({ length: 90 }, () => ({
      x: W / 2,
      y: H / 2,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 1) * 5 - 2,
      size: 4 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
      maxLife: 50 + Math.random() * 30,
    }));
    setVisible(true);
    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pieces.forEach((p) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      if (pieces.some((p) => p.life < p.maxLife && p.y < H + 40)) {
        raf = requestAnimationFrame(draw);
      } else {
        setVisible(false);
      }
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      setVisible(false);
    };
  }, [trigger]);
  return <canvas ref={canvasRef} className={`pointer-events-none absolute inset-0 z-50 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`} />;
}
