import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RobotAssistant = ({ state = 'idle', message = "Ready to calculate!" }) => {
    // states: idle, happy, excited, confused, sleep, prime, curious, nerd

    const [blink, setBlink] = useState(false);
    const [isWink, setIsWink] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);
    const [displayMsg, setDisplayMsg] = useState(message);
    const [msgVisible, setMsgVisible] = useState(false);

    // Auto-fade speech bubble when message changes
    useEffect(() => {
        if (message && message !== '...') {
            setDisplayMsg(message);
            setMsgVisible(true);
            const timer = setTimeout(() => {
                setMsgVisible(false);
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Random blinking & winking
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            const rand = Math.random();
            if (rand > 0.6) {
                if (state === 'idle' && rand > 0.9) {
                    setIsWink(true);
                    setTimeout(() => setIsWink(false), 500);
                } else {
                    setBlink(true);
                    setTimeout(() => setBlink(false), 200);
                }
            }
        }, 3000);
        return () => clearInterval(blinkInterval);
    }, [state]);

    // Track mouse for pupils
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            // Calculate center of the robot
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Limit the movement
            const maxTrack = 10;
            const dx = Math.max(-maxTrack, Math.min(maxTrack, (e.clientX - centerX) / 15));
            const dy = Math.max(-maxTrack, Math.min(maxTrack, (e.clientY - centerY) / 15));

            setMousePos({ x: dx, y: dy });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Touch response for mobile
    const handleTouch = () => {
        setBlink(true);
        setTimeout(() => setBlink(false), 200);
        if (!msgVisible) {
            setDisplayMsg("Hello there!");
            setMsgVisible(true);
            setTimeout(() => setMsgVisible(false), 2000);
        }
    };


    const getEyes = () => {
        const renderEye = () => <span className="inline-block w-[6px] h-4 md:h-5 bg-[var(--color-primary)] rounded-full"></span>;

        if (state === 'sleep') return ['-', '-'];
        if (blink) return ['-', '-'];
        if (isWink) return [renderEye(), '>'];
        if (state === 'happy') return ['^', '^'];
        if (state === 'excited') return ['✧', '✧'];
        if (state === 'confused' || state === 'error') return ['O', 'o'];
        if (state === 'surprise') return ['O', 'O'];
        if (state === 'prime') return ['*', '*'];
        if (state === 'curious') return ['?', '?'];
        if (state === 'nerd') return ['-', '-'];
        return [renderEye(), renderEye()]; // idle
    };

    const getMouth = () => {
        const renderSmile = (path, opacity = "1") => (
            <svg width="22" height="10" viewBox="0 0 22 10" style={{ stroke: 'currentColor', fill: 'none', strokeWidth: '2.5', strokeLinecap: 'round', opacity }} className="transition-all duration-300 mt-1">
                <path d={path} />
            </svg>
        );

        if (state === 'sleep') return 'z';
        if (state === 'happy') return renderSmile("M 2 2 Q 11 9 20 2");
        if (state === 'excited' || state === 'surprise') return renderSmile("M 3 1 Q 11 10 19 1");
        if (state === 'confused' || state === 'error') return renderSmile("M 5 7 Q 11 4 17 7", "0.6");
        if (state === 'prime') return renderSmile("M 4 2 Q 11 8 18 2");
        if (state === 'curious' || state === 'thinking') return renderSmile("M 7 5 Q 11 5 15 5", "0.5");
        if (state === 'nerd') return '-';

        // Default small subtle smile
        return renderSmile("M 5 2 Q 11 7 17 2", "0.9");
    };

    const eyeContent = getEyes();

    // Body animations
    const getBodyAnimation = () => {
        switch (state) {
            case 'excited': return { y: [-3, 3, -3], rotate: [-2, 2, -2] };
            case 'happy': return { y: [-15, -45, -15], scale: [1, 1.05, 1] }; // Happy bounce
            case 'prime': return { rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }; // Sparkle glow
            case 'curious': return { rotate: [0, 15], y: [-10, -15] }; // Curious tilt
            case 'sleep': return { y: [-5, 5, -5] };
            case 'confused':
            case 'error': return { x: [-5, 5, -5, 5, 0] };
            case 'thinking': return { y: [-2, 2, -2] };
            case 'surprise': return { y: [-15, 0, -5, 0] };
            default: return { y: [-10, 10, -10] }; // floating idle breathing
        }
    };

    const getTransition = () => {
        switch (state) {
            case 'excited': return { repeat: Infinity, duration: 0.2 };
            case 'happy': return { duration: 0.6, ease: "easeOut" };
            case 'prime': return { duration: 0.5, repeat: 2 };
            case 'confused':
            case 'error': return { duration: 0.4 };
            case 'surprise': return { duration: 0.5, ease: "easeOut" };
            case 'thinking': return { repeat: Infinity, duration: 2, ease: "easeInOut" };
            default: return { repeat: Infinity, duration: 4, ease: "easeInOut" };
        }
    };

    return (
        <div ref={containerRef} className="relative flex flex-col items-center justify-center p-4 z-50">

            {/* Tooltip / Speech Bubble */}
            <AnimatePresence>
                {msgVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        className="absolute -top-12 whitespace-nowrap px-4 py-2 text-sm font-bold rounded-2xl border shadow-xl z-10"
                        style={{ backgroundColor: 'var(--color-bg-panel)', borderColor: 'var(--color-border)', color: 'var(--color-text-main)' }}
                    >
                        {displayMsg}
                        <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 border-b border-r"
                            style={{ backgroundColor: 'var(--color-bg-panel)', borderColor: 'var(--color-border)' }} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Robot Body - Transparent Soft Blue Glass Sphere */}
            <motion.div
                animate={getBodyAnimation()}
                transition={getTransition()}
                onClick={handleTouch}
                className="w-40 h-40 sm:w-48 sm:h-48 rounded-full flex flex-col items-center justify-center backdrop-blur-xl relative cursor-pointer"
                style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderColor: 'rgba(96, 165, 250, 0.3)',
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    boxShadow: state === 'prime'
                        ? '0 0 60px rgba(59, 130, 246, 0.4), inset 0 0 60px rgba(59, 130, 246, 0.6)'
                        : '0 0 30px rgba(59, 130, 246, 0.15), inset 0 0 40px rgba(59, 130, 246, 0.2)'
                }}
            >
                {/* Sparkle heart for prime/happy sometimes */}
                <AnimatePresence>
                    {(state === 'prime' || state === 'happy') && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0, y: 0 }}
                            animate={{ opacity: 1, scale: 1.5, y: -40 }}
                            exit={{ opacity: 0 }}
                            className="absolute text-pink-400 text-xl z-20"
                        >
                            {state === 'prime' ? '✨' : '💝'}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Inner Face Container - follows cursor */}
                <motion.div
                    className="flex flex-col items-center justify-center gap-1 z-10 w-full h-full relative"
                    animate={{ x: mousePos.x, y: mousePos.y }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                >
                    {/* Glasses for nerd mode */}
                    {state === 'nerd' && (
                        <div className="absolute top-1/2 -mt-4 flex gap-1 w-20 justify-center items-center backdrop-blur-sm bg-black/5 dark:bg-white/5 p-1 rounded-sm border border-black/20 dark:border-white/20">
                            <div className="w-8 h-8 rounded border-2 border-primary"></div>
                            <div className="w-2 h-0.5 bg-primary"></div>
                            <div className="w-8 h-8 rounded border-2 border-primary"></div>
                        </div>
                    )}

                    <div className="flex gap-6 relative z-10 w-full justify-center mt-2 px-8">
                        {/* Left Eye */}
                        <div className="flex items-center justify-center w-8 h-8">
                            <span className="font-extrabold text-2xl drop-shadow-lg flex items-center justify-center" style={{ color: 'var(--color-primary)' }}>{eyeContent[0]}</span>
                        </div>
                        {/* Right Eye */}
                        <div className="flex items-center justify-center w-8 h-8">
                            <span className="font-extrabold text-2xl drop-shadow-lg flex items-center justify-center" style={{ color: 'var(--color-primary)' }}>{eyeContent[1]}</span>
                        </div>
                    </div>

                    {/* Mouth */}
                    <div className="font-bold text-xl drop-shadow-lg z-10 flex items-center justify-center h-6" style={{ color: 'var(--color-primary)' }}>
                        {getMouth()}
                    </div>
                </motion.div>

                {/* Subtle base reflection/highlight for 3D sphere effect */}
                <div className="absolute top-2 left-6 w-12 h-6 rounded-full bg-white opacity-20 transform -rotate-45"></div>
            </motion.div>
        </div>
    );
};

export default RobotAssistant;
