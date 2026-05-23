import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Initial state from localStorage or defaults
    const [theme, setTheme] = useState(() => localStorage.getItem('calcnova_theme') || 'default');
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('calcnova_darkmode');
        return saved ? JSON.parse(saved) : true; // Default dark mode true for SaaS vibe
    });
    const [soundEnabled, setSoundEnabled] = useState(() => {
        const saved = localStorage.getItem('calcnova_sound');
        return saved ? JSON.parse(saved) : true;
    });
    const [lang, setLang] = useState(() => localStorage.getItem('calcnova_lang') || 'en');

    useEffect(() => {
        // Apply theme to HTML tag
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('calcnova_theme', theme);
    }, [theme]);

    useEffect(() => {
        // Apply dark class to HTML tag
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('calcnova_darkmode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    useEffect(() => {
        localStorage.setItem('calcnova_sound', JSON.stringify(soundEnabled));
    }, [soundEnabled]);

    useEffect(() => {
        localStorage.setItem('calcnova_lang', lang);
    }, [lang]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isDarkMode, setIsDarkMode, soundEnabled, setSoundEnabled, lang, setLang }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
