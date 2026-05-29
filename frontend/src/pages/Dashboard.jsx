import React, { useState, Suspense, lazy } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, History, BarChart2, Mic, Calculator as CalcIcon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Calculator from '../components/Calculator';
import AssistantPanel from '../components/AssistantPanel';
import AvatarMenu from '../components/AvatarMenu';
import ThemeSelector from '../components/ThemeSelector';

const HistoryPanel = lazy(() => import('../components/HistoryPanel'));
const AnalyticsPanel = lazy(() => import('../components/AnalyticsPanel'));

const Dashboard = () => {
    const { user, isOnline } = useAuth();
    const [activeTab, setActiveTab] = useState('calculator'); // calculator, history, analytics

    return (
        <div className="flex-grow flex flex-col min-h-[100dvh] overflow-x-hidden relative">
            {/* Header */}
            <header className="h-20 sm:h-16 flex items-center justify-between px-4 sm:px-6 backdrop-blur-md border-b z-20 relative"
                style={{
                    backgroundColor: 'rgba(var(--color-bg-panel), 0.9)',
                    borderColor: 'var(--color-border)',
                }}
            >
                {/* Left: Logo */}
                <div className="flex-1 flex items-center justify-start">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r"
                        style={{ backgroundImage: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))' }}>
                        CalcNova
                    </h1>
                </div>

                {/* Center: Tabs */}
                <div className="flex-1 flex items-center justify-center gap-3">

                    <button aria-label="View History" onClick={() => setActiveTab('history')} className={`p-3 rounded-xl transition-colors ${activeTab === 'history' ? 'bg-black/10 dark:bg-white/10 shadow-inner' : 'hover:bg-black/5 dark:hover:bg-white/5'}`} title="History">
                        <History size={24} />
                    </button>
                    <button aria-label="View Analytics" onClick={() => setActiveTab('analytics')} className={`p-3 rounded-xl transition-colors ${activeTab === 'analytics' ? 'bg-black/10 dark:bg-white/10 shadow-inner' : 'hover:bg-black/5 dark:hover:bg-white/5'}`} title="Analytics">
                        <BarChart2 size={24} />
                    </button>
                </div>

                {/* Right: Theme, Sync, Profile */}
                <div className="flex-1 flex items-center justify-end gap-3">
                    {user && (
                        <>
                            <ThemeSelector />
                            <div className="hidden sm:flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full border shadow-sm"
                                style={{ backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-main)', borderColor: 'var(--color-border)' }}>
                                <div className={`w-2 h-2 rounded-full animate-pulse ${isOnline ? 'bg-green-500' : 'bg-amber-500'}`} title={isOnline ? 'Online Sync' : 'Offline Mode'} />
                                <span className="max-w-[120px] truncate">{user.email}</span>
                            </div>
                            <AvatarMenu />
                        </>
                    )}
                </div>
            </header>

            {/* Main Area */}
            <main className="flex-grow flex flex-col items-center justify-center p-2 sm:p-4 overflow-x-hidden relative z-10 py-6">
                {/* Calculator Always Visible */}
                <div className="flex items-center justify-center w-full max-w-5xl h-full relative z-10">
                    <Calculator />
                    <AssistantPanel onReinsert={(val) => {
                        window.dispatchEvent(new CustomEvent('reinsert_expr', { detail: val }));
                    }} />
                </div>

                {/* Overlaid Backdrop when panels are open */}
                <AnimatePresence>
                    {(activeTab === 'history' || activeTab === 'analytics') && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.3 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black z-30"
                            onClick={() => setActiveTab('calculator')}
                        />
                    )}
                </AnimatePresence>

                {/* Slide-In History */}
                <AnimatePresence>
                    {activeTab === 'history' && (
                        <motion.div
                            initial={{ x: '-100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '-100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute top-0 left-0 h-full z-40 w-[85vw] sm:w-[400px] max-w-md shadow-2xl"
                        >
                            <Suspense fallback={
                                <div className="p-6 h-full flex flex-col gap-4 animate-pulse w-full bg-panel" style={{ backgroundColor: 'var(--color-bg-panel)' }}>
                                    <div className="h-8 bg-black/10 dark:bg-white/10 rounded-lg w-1/3 mb-4" />
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-24 bg-black/5 dark:bg-white/5 rounded-2xl w-full" />
                                    ))}
                                </div>
                            }>
                                <HistoryPanel onClose={() => setActiveTab('calculator')} />
                            </Suspense>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Slide-In Analytics */}
                <AnimatePresence>
                    {activeTab === 'analytics' && (
                        <motion.div
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute top-0 right-0 h-full z-40 w-[90vw] sm:w-[600px] lg:w-[800px] max-w-4xl shadow-2xl"
                        >
                            <Suspense fallback={
                                <div className="p-6 h-full flex flex-col gap-8 animate-pulse w-full bg-panel" style={{ backgroundColor: 'var(--color-bg-panel)' }}>
                                    <div className="h-8 bg-black/10 dark:bg-white/10 rounded-lg w-1/4 mb-2" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                                        <div className="aspect-square bg-black/5 dark:bg-white/5 rounded-full mx-auto w-[250px]" />
                                        <div className="h-64 bg-black/5 dark:bg-white/5 rounded-2xl w-full" />
                                    </div>
                                </div>
                            }>
                                <AnalyticsPanel onClose={() => setActiveTab('calculator')} />
                            </Suspense>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Dashboard;
