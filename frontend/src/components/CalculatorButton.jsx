import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const CalculatorButton = memo(({
    label,
    onClick,
    variant = 'default',
    className = '',
    colSpan = 1
}) => {
    const { soundEnabled } = useTheme();

    const getStyle = () => {
        switch (variant) {
            case 'operator':
                return {
                    backgroundColor: 'var(--color-secondary)',
                    color: '#ffffff',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    border: 'none'
                };
            case 'action':
                return {
                    backgroundColor: 'var(--color-bg-base)',
                    color: 'var(--color-text-main)',
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                    border: '1px solid var(--color-border)'
                };
            case 'accent':
                return {
                    backgroundImage: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                    color: '#ffffff',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                    border: 'none'
                };
            default:
                return {
                    backgroundColor: 'var(--color-bg-panel)',
                    color: 'var(--color-text-main)',
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                    border: '1px solid var(--color-border)'
                };
        }
    };

    const playSound = () => {
        if (!soundEnabled || !window.AudioContext) return;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const masterGain = ctx.createGain();
            masterGain.connect(ctx.destination);

            const osc = ctx.createOscillator();
            osc.type = 'sine';
            
            if (variant === 'operator' || variant === 'accent') {
                osc.frequency.setValueAtTime(500, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
            } else {
                osc.frequency.setValueAtTime(300, ctx.currentTime);
            }
            
            osc.connect(masterGain);
            masterGain.gain.setValueAtTime(0.05, ctx.currentTime);
            masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        } catch {
            // Ignore audio errors gracefully
        }
    };

    const handleClick = () => {
        playSound();
        onClick(label);
    };

    const hoverScale = variant === 'accent' || variant === 'operator' ? 1.05 : 1.02;

    return (
        <motion.button
            onClick={handleClick}
            style={getStyle()}
            className={`
                relative flex items-center justify-center font-medium rounded-[1.25rem]
                transition-all duration-200 overflow-hidden select-none active:brightness-90
                ${colSpan === 2 ? 'col-span-2' : ''}
                ${variant === 'operator' ? 'font-extrabold text-[clamp(1.5rem,4vh,1.875rem)]' : 'text-[clamp(1.25rem,3.5vh,1.5rem)]'}
                ${className}
            `}
            whileHover={{ scale: hoverScale, y: -2 }}
            whileTap={{ scale: 0.95, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            <span className="relative z-10">{label}</span>
        </motion.button>
    );
});

export default CalculatorButton;
