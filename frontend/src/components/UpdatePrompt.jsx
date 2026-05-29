import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, Info } from 'lucide-react';

const UpdatePrompt = () => {
    // virtual:pwa-register/react provides a hook to listen to SW updates
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered:', r);
        },
        onRegisterError(error) {
            console.error('SW registration error', error);
        },
    });

    const close = () => {
        setNeedRefresh(false);
    };

    return (
        <AnimatePresence>
            {needRefresh && (
                <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 100, opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:-translate-x-0 md:right-6 z-[100] w-[90vw] md:w-80 p-4 rounded-2xl shadow-2xl border flex flex-col gap-3"
                    style={{ 
                        backgroundColor: 'var(--color-bg-panel)', 
                        borderColor: 'var(--color-primary)',
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.2), 0 8px 10px -6px rgb(0 0 0 / 0.2)'
                    }}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary flex-shrink-0">
                            <Info size={20} />
                        </div>
                        <div className="flex-grow pt-1">
                            <h3 className="font-bold text-sm leading-tight text-primary">New version available!</h3>
                            <p className="text-xs opacity-70 mt-1">Refresh to update the app safely without losing data.</p>
                        </div>
                        <button onClick={close} className="p-1 opacity-50 hover:opacity-100 transition-opacity">
                            <X size={16} />
                        </button>
                    </div>
                    
                    <button
                        onClick={() => updateServiceWorker(true)}
                        className="mt-2 w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 px-4 rounded-xl text-sm font-bold shadow-md hover:brightness-110 active:scale-[0.98] transition-all"
                    >
                        <RefreshCw size={16} />
                        Update & Refresh
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default UpdatePrompt;
