import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const SYMBOLS = ['+', '-', '×', '÷', '%', '√', 'π', '∑', '∫', '∞', '2+2', 'x²', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'E=mc²'];
const SHAPES = ['circle', 'triangle', 'square'];

const FloatingBackground = () => {
    const canvasRef = useRef(null);
    const { isDarkMode } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let particles = [];
        let mouse = { x: null, y: null, radius: 150 }; // Radius for repulsion

        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleMouseLeave = () => {
            mouse.x = null;
            mouse.y = null;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        const createParticle = (x, y, isSpawned = false) => {
            return {
                x: x !== undefined ? x : Math.random() * canvas.width,
                y: y !== undefined ? y : Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                size: isSpawned ? Math.random() * 6 + 10 : Math.random() * 12 + 14,
                text: Math.random() > 0.3 ? SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] : null,
                shape: Math.random() <= 0.3 ? SHAPES[Math.floor(Math.random() * SHAPES.length)] : null,
                opacity: isSpawned ? Math.random() * 0.5 + 0.5 : Math.random() * 0.25 + 0.1,
                isSpawned,
                life: isSpawned ? 80 : Infinity, // Spawned particles live for short time
                maxLife: 80
            };
        };

        const initParticles = () => {
            particles = [];
            // Increase base number for rich background
            const numParticles = Math.min(Math.floor(window.innerWidth / 12), 120);
            for (let i = 0; i < numParticles; i++) {
                particles.push(createParticle());
            }
        };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Darker for light theme (high visibility, contrast)
            // Brighter for dark theme (white-ish blue/cyan glow)
            const baseColor = isDarkMode ? '150, 200, 255' : '65, 80, 100';

            for (let i = 0; i < particles.length; i++) {
                let p = particles[i];

                ctx.save();
                ctx.globalAlpha = p.opacity;
                ctx.fillStyle = `rgba(${baseColor}, 1)`;
                ctx.strokeStyle = `rgba(${baseColor}, 1)`;

                // Keep soft but noticeable glow
                ctx.shadowBlur = p.isSpawned ? 15 : 10;
                ctx.shadowColor = `rgba(${baseColor}, 0.8)`;

                if (p.text) {
                    ctx.font = `${p.size}px 'Arial', sans-serif`;
                    ctx.fillText(p.text, p.x, p.y);
                } else if (p.shape === 'circle') {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size / 2, 0, 2 * Math.PI);
                    ctx.fill();
                } else if (p.shape === 'square') {
                    ctx.fillRect(p.x, p.y, p.size, p.size);
                } else if (p.shape === 'triangle') {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y - p.size / 2);
                    ctx.lineTo(p.x + p.size / 2, p.y + p.size / 2);
                    ctx.lineTo(p.x - p.size / 2, p.y + p.size / 2);
                    ctx.fill();
                }
                ctx.restore();

                // Mouse Repulsion Physics
                if (mouse.x != null && mouse.y != null) {
                    let dx = p.x - mouse.x; // Vector pointing away from mouse
                    let dy = p.y - mouse.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < mouse.radius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;

                        // Push away strength, stronger closer to mouse
                        const force = (mouse.radius - distance) / mouse.radius;

                        // Smoothly push objects
                        p.vx += forceDirectionX * force * 0.4;
                        p.vy += forceDirectionY * force * 0.4;
                    }
                }

                // Add gentle friction so they don't fly out of control
                p.vx *= 0.98;
                p.vy *= 0.98;

                // Minimum drift to keep them floating
                const minDrift = 0.2;
                if (Math.abs(p.vx) < minDrift) p.vx += (Math.random() - 0.5) * 0.05;
                if (Math.abs(p.vy) < minDrift) p.vy += (Math.random() - 0.5) * 0.05;

                // Update position
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around edges smoothly
                if (p.x < -p.size) p.x = canvas.width + p.size;
                if (p.x > canvas.width + p.size) p.x = -p.size;
                if (p.y < -p.size) p.y = canvas.height + p.size;
                if (p.y > canvas.height + p.size) p.y = -p.size;

                // Life cycle for spawned particles
                if (p.isSpawned) {
                    p.life--;
                    p.opacity = (p.life / p.maxLife) * 0.8;
                    if (p.life <= 0) {
                        particles.splice(i, 1);
                        i--;
                    }
                }
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        draw();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isDarkMode]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ opacity: 0.8 }}
        />
    );
};

export default FloatingBackground;
