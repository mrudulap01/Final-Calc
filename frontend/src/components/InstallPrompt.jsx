import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share } from 'lucide-react';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSPrompt, setShowIOSPrompt] = useState(false);

    useEffect(() => {
        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;

        if (isIosDevice && !isStandalone) {
            setIsIOS(true);
            // Don't show immediately, maybe wait a bit or let user trigger it
            const timer = setTimeout(() => {
                const hasSeenPrompt = localStorage.getItem('ios_install_prompt_dismissed');
                if (!hasSeenPrompt) {
                    setShowIOSPrompt(true);
                }
            }, 3000);
            return () => clearTimeout(timer);
        }

        // Detect Android / Chrome
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            
            const hasDismissed = localStorage.getItem('android_install_prompt_dismissed');
            if (!hasDismissed) {
                setShowInstallPrompt(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Cleanup
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        
        setShowInstallPrompt(false);
        deferredPrompt.prompt();
        
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
        
        setDeferredPrompt(null);
    };

    const handleDismissAndroid = () => {
        setShowInstallPrompt(false);
        localStorage.setItem('android_install_prompt_dismissed', 'true');
    };

    const handleDismissIOS = () => {
        setShowIOSPrompt(false);
        localStorage.setItem('ios_install_prompt_dismissed', 'true');
    };

    return (
        <>
            {/* Android/Desktop Install Prompt */}
            <AnimatePresence>
                {showInstallPrompt && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-panel p-4 rounded-2xl shadow-2xl border z-50 flex items-center justify-between"
                        style={{ backgroundColor: 'var(--color-bg-panel)', borderColor: 'var(--color-border)' }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                                <Download size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Install CalcNova</h4>
                                <p className="text-xs opacity-70">Add to home screen for offline use</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={handleInstallClick}
                                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-md"
                            >
                                Install
                            </button>
                            <button onClick={handleDismissAndroid} className="p-2 opacity-50 hover:opacity-100">
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* iOS Safari Install Prompt */}
            <AnimatePresence>
                {showIOSPrompt && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90vw] max-w-sm bg-panel p-4 rounded-2xl shadow-2xl border z-50 flex flex-col items-center text-center gap-2"
                        style={{ backgroundColor: 'var(--color-bg-panel)', borderColor: 'var(--color-border)' }}
                    >
                        <button onClick={handleDismissIOS} className="absolute top-2 right-2 p-1 opacity-50">
                            <X size={16} />
                        </button>
                        <h4 className="font-bold text-sm">Install CalcNova on iOS</h4>
                        <p className="text-xs opacity-80">
                            Tap the <Share size={14} className="inline mx-1" /> icon below and select <br />
                            <strong>"Add to Home Screen"</strong>
                        </p>
                        <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-panel absolute -bottom-2" style={{ borderTopColor: 'var(--color-bg-panel)' }}></div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default InstallPrompt;
