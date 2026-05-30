import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BackendWakeupScreen = ({ status }) => {
    // Only show if we are actively in a delayed retry state
    if (!status || status === 'ready' || status === 'error' || status === 'checking') return null;

    let message = "Starting server...";
    if (status === 'waking_up_attempt_2') message = "Waking up backend...";
    if (status === 'waking_up_attempt_3') message = "Please wait a few seconds...";
    if (status === 'waking_up_attempt_4') message = "Almost there, powering on...";

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 backdrop-blur-xl bg-black/40 dark:bg-black/80"
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="p-8 rounded-[2rem] shadow-2xl border flex flex-col items-center max-w-sm w-full text-center relative overflow-hidden"
                    style={{ backgroundColor: 'var(--color-bg-panel)', borderColor: 'var(--color-border)' }}
                >
                    {/* Animated gradient border top */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary" style={{ backgroundSize: '200% 100%', animation: 'gradientMove 2s linear infinite' }} />
                    
                    {/* Robot / loader */}
                    <div className="relative w-24 h-24 mb-6">
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                            className="absolute inset-0 rounded-full border-4 border-dashed border-primary/30"
                        />
                        <motion.div 
                            animate={{ rotate: -360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="absolute inset-2 rounded-full border-4 border-t-secondary border-r-transparent border-b-primary border-l-transparent"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl">🤖</span>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r" style={{ backgroundImage: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))' }}>
                        Waking Backend
                    </h2>
                    
                    <motion.p 
                        key={message}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm opacity-80"
                        style={{ color: 'var(--color-text-main)' }}
                    >
                        {message}
                    </motion.p>
                </motion.div>
                
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes gradientMove {
                        0% { background-position: 0% 50%; }
                        100% { background-position: 200% 50%; }
                    }
                `}} />
            </motion.div>
        </AnimatePresence>
    );
};

export default BackendWakeupScreen;
