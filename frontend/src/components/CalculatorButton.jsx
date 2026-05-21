import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const CalculatorButton = ({
    label,
    onClick,
    variant = 'default', // default, operator, action, accent
    className = '',
    colSpan = 1
}) => {
    const { soundEnabled } = useTheme();
    const [ripples, setRipples] = useState([]);

    // Style configurations based on variant
    const getStyle = () => {
        switch (variant) {
            case 'operator':
                return {
                    backgroundColor: 'var(--color-secondary)',
                    color: '#ffffff',
                    boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)'
                };
            case 'action':
                return {
                    backgroundColor: 'var(--color-bg-base)',
                    color: 'var(--color-text-main)',
                    border: '1px solid var(--color-border)'
                };
            case 'accent':
                return {
                    backgroundImage: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                    color: '#ffffff',
                    boxShadow: '0 4px 14px 0 rgba(0,0,0,0.15)'
                };
            default: // default/number
                return {
                    backgroundColor: 'var(--color-bg-panel)',
                    color: 'var(--color-text-main)',
                    border: '1px solid var(--color-border)'
                };
        }
    };

    const getGlowColor = () => {
        switch (variant) {
            case 'operator': return 'var(--color-secondary)';
            case 'accent': return 'var(--color-primary)';
            case 'action': return 'var(--color-text-muted)';
            default: return 'var(--color-text-muted)';
        }
    };

    const playSound = () => {
        if (!soundEnabled || !window.AudioContext) return;
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const masterGain = ctx.createGain();
        masterGain.connect(ctx.destination);

        if (variant === 'operator') {
            // slightly distinct high pitch
            const osc = ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(500, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
            osc.connect(masterGain);
            masterGain.gain.setValueAtTime(0.08, ctx.currentTime);
            masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } else if (variant === 'accent') {
            // unique equals sound (dual tone)
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            osc1.type = 'sine';
            osc2.type = 'sine';
            osc1.frequency.setValueAtTime(400, ctx.currentTime);
            osc2.frequency.setValueAtTime(600, ctx.currentTime);
            osc1.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
            osc2.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.2);
            osc1.connect(masterGain);
            osc2.connect(masterGain);
            masterGain.gain.setValueAtTime(0.05, ctx.currentTime);
            masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc1.start();
            osc2.start();
            osc1.stop(ctx.currentTime + 0.2);
            osc2.stop(ctx.currentTime + 0.2);
        } else if (variant === 'action') {
            // Low dull thud
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
            osc.connect(masterGain);
            masterGain.gain.setValueAtTime(0.1, ctx.currentTime);
            masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } else {
            // Numbers: soft pop
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            osc.connect(masterGain);
            masterGain.gain.setValueAtTime(0.05, ctx.currentTime);
            masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        }
    };

    const handleClick = (e) => {
        playSound();

        // Add ripple
        const rect = e.currentTarget.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const newRipple = { x, y, size, id: Date.now() };
        setRipples(prev => [...prev, newRipple]);

        // Cleanup ripple after animation
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 500);

        onClick(label);
    };

    const glowColor = getGlowColor();
    const hoverScale = variant === 'accent' || variant === 'operator' ? 1.08 : 1.05;

    return (
        <motion.button
            onClick={handleClick}
            style={getStyle()}
            className={`
                relative flex items-center justify-center font-medium rounded-2xl
                transition-shadow duration-200 overflow-hidden select-none
                ${colSpan === 2 ? 'col-span-2' : ''}
                ${variant === 'operator' ? 'text-2xl sm:text-3xl font-extrabold' : 'text-xl sm:text-2xl'}
                ${className}
            `}
            whileHover={{
                scale: hoverScale,
                y: -3,
                boxShadow: `0 10px 25px -5px color-mix(in srgb, ${glowColor} 40%, transparent)`
            }}
            whileTap={{ scale: 0.95, y: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
        >
            <span className="relative z-10">{label}</span>

            {/* Ripples */}
            <AnimatePresence>
                {ripples.map(ripple => (
                    <motion.span
                        key={ripple.id}
                        initial={{ opacity: 0.5, scale: 0 }}
                        animate={{ opacity: 0, scale: 2 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="absolute bg-white/30 rounded-full pointer-events-none z-0"
                        style={{
                            left: ripple.x,
                            top: ripple.y,
                            width: ripple.size,
                            height: ripple.size,
                        }}
                    />
                ))}
            </AnimatePresence>
        </motion.button>
    );
};

export default CalculatorButton;
