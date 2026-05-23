import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const CustomCursor = () => {
    const dotRef = useRef(null);
    const haloRef = useRef(null);
    const { isDarkMode } = useTheme();
    const [isVisible, setIsVisible] = useState(false);

    // Physics state
    const cursor = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const trailing = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

    // Scale states
    const dotScale = useRef(1);
    const haloScale = useRef(1);

    useEffect(() => {
        // Disable on touch devices
        if (window.matchMedia('(pointer: coarse)').matches) return;

        let animationFrame;

        const moveCursor = (e) => {
            cursor.current.x = e.clientX;
            cursor.current.y = e.clientY;
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseDown = () => {
            dotScale.current = 0.5;
            haloScale.current = 0.8;
        };

        const handleMouseUp = () => {
            dotScale.current = 1;
            haloScale.current = 1;
        };

        const updateHoverStates = () => {
            // Find if mouse is over clickable
            const el = document.elementFromPoint(cursor.current.x, cursor.current.y);
            const isClickable = el?.closest('button, a, input, select') != null;

            if (isClickable) {
                haloScale.current = 1.6;
                dotScale.current = 1.2;
            } else {
                if (haloScale.current > 1.0) haloScale.current = 1;
                if (dotScale.current > 1.0) dotScale.current = 1;
            }
        };

        const loop = () => {
            // Smooth trailing logic for halo
            trailing.current.x += (cursor.current.x - trailing.current.x) * 0.2;
            trailing.current.y += (cursor.current.y - trailing.current.y) * 0.2;

            if (dotRef.current && haloRef.current) {
                // Apply transforms
                dotRef.current.style.transform = `translate3d(${cursor.current.x}px, ${cursor.current.y}px, 0) translate(-50%, -50%) scale(${dotScale.current})`;
                haloRef.current.style.transform = `translate3d(${trailing.current.x}px, ${trailing.current.y}px, 0) translate(-50%, -50%) scale(${haloScale.current})`;
            }

            // Periodic checks for hover scale
            if (Date.now() % 4 === 0) updateHoverStates();

            animationFrame = requestAnimationFrame(loop);
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        // Hide when leaving page
        window.addEventListener('mouseout', () => setIsVisible(false));

        loop();

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            cancelAnimationFrame(animationFrame);
        };
    }, []);

    // Theme responsive glow color
    const glowColor = isDarkMode ? 'rgba(56, 189, 248, 1)' : 'rgba(79, 70, 229, 1)'; // primary matching approx
    const haloColor = isDarkMode ? 'rgba(56, 189, 248, 0.2)' : 'rgba(79, 70, 229, 0.2)';

    return (
        <div className={`pointer-events-none fixed inset-0 z-[9999] transition-opacity duration-300 hidden sm:block ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Halo */}
            <div
                ref={haloRef}
                className="absolute top-0 left-0 w-8 h-8 rounded-full mix-blend-screen dark:mix-blend-lighten transition-transform duration-75 ease-out"
                style={{
                    backgroundColor: haloColor,
                    boxShadow: `0 0 20px ${haloColor}`
                }}
            />
            {/* Dot */}
            <div
                ref={dotRef}
                className="absolute top-0 left-0 w-2 h-2 rounded-full shadow-md transition-transform duration-75 ease-out"
                style={{
                    backgroundColor: glowColor,
                    boxShadow: `0 0 10px ${glowColor}`
                }}
            />
        </div>
    );
};

export default CustomCursor;
