import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Palette, Moon, Sun, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { t } from '../utils/translations';

const THEMES = [
    { id: 'ocean', name: 'Dark Ocean', colors: ['bg-sky-600', 'bg-sky-400'] },
    { id: 'cyber', name: 'Cyber Neon', colors: ['bg-fuchsia-500', 'bg-fuchsia-400'] },
    { id: 'forest', name: 'Forest Dream', colors: ['bg-emerald-500', 'bg-emerald-400'] },
    { id: 'sunset', name: 'Sunset Blaze', colors: ['bg-orange-500', 'bg-orange-400'] },
    { id: 'sky', name: 'Light Sky', colors: ['bg-sky-400', 'bg-sky-300'] },
    { id: 'mint', name: 'Mint Fresh', colors: ['bg-teal-500', 'bg-teal-400'] },
    { id: 'rose', name: 'Rose Gold', colors: ['bg-rose-500', 'bg-rose-400'] },
    { id: 'slate', name: 'Slate Pro', colors: ['bg-slate-600', 'bg-slate-400'] }
];

const ThemeSelector = () => {
    const { theme, setTheme, isDarkMode, setIsDarkMode, soundEnabled, setSoundEnabled, lang, setLang } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                title="Themes"
            >
                <Palette size={20} />
            </button>

            {/* Slide-in Panel */}
            {createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black z-40"
                                onClick={() => setIsOpen(false)}
                            />
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed top-0 right-0 h-full w-80 shadow-2xl z-50 overflow-y-auto"
                                style={{ backgroundColor: 'var(--color-bg-panel)', color: 'var(--color-text-main)' }}
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-8">
                                        <h2 className="text-2xl font-bold tracking-tight">{t('settings_appearance', lang)}</h2>
                                        <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <div className="mb-4 p-4 rounded-xl border border-border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-base)' }}>
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-lg flex items-center gap-2">
                                                {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                                                {isDarkMode ? t('mode_dark', lang) : t('mode_light', lang)}
                                            </span>
                                            <button
                                                onClick={() => setIsDarkMode(!isDarkMode)}
                                                className="w-14 h-8 rounded-full p-1 transition-colors duration-300 relative"
                                                style={{ backgroundColor: isDarkMode ? 'var(--color-primary)' : '#cbd5e1' }}
                                            >
                                                <motion.div
                                                    className="w-6 h-6 bg-white rounded-full shadow-md"
                                                    layout
                                                    transition={{ type: "spring", stiffness: 700, damping: 30 }}
                                                    style={{ translateX: isDarkMode ? 24 : 0 }}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-8 p-4 rounded-xl border border-border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-base)' }}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold">{t('settings_sound', lang)}</span>
                                            <input type="checkbox" checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} className="w-5 h-5 accent-primary cursor-pointer" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold">{t('settings_language', lang)}</span>
                                            <select
                                                value={lang}
                                                onChange={(e) => setLang(e.target.value)}
                                                className="bg-panel border border-border rounded p-1 text-sm outline-none"
                                                style={{ backgroundColor: 'var(--color-bg-panel)', color: 'var(--color-text-main)', borderColor: 'var(--color-border)' }}
                                            >
                                                <option value="en">English</option>
                                                <option value="es">Español</option>
                                                <option value="hi">हिंदी</option>
                                            </select>
                                        </div>
                                    </div>

                                    <h3 className="text-sm uppercase tracking-wider font-semibold mb-4 text-muted" style={{ color: 'var(--color-text-muted)' }}>Color Themes</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        {THEMES.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => setTheme(t.id)}
                                                className={`relative p-4 rounded-xl border-2 transition-all duration-200 overflow-hidden group flex flex-col items-center gap-2
                                                ${theme === t.id ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-transparent hover:border-border'}`}
                                                style={{
                                                    backgroundColor: 'var(--color-bg-base)',
                                                    borderColor: theme === t.id ? 'var(--color-primary)' : 'transparent'
                                                }}
                                            >
                                                <div className="flex gap-2 w-full h-8 rounded-lg overflow-hidden flex-shrink-0 relative">
                                                    <div className={`flex-1 ${t.colors[0]}`} />
                                                    <div className={`flex-1 ${t.colors[1]}`} />
                                                </div>
                                                <span className="text-xs font-semibold whitespace-nowrap">{t.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};

export default ThemeSelector;
