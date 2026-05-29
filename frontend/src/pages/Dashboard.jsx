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
        <div className="flex-grow flex flex-col h-screen overflow-hidden relative">
            {/* Header */}
            <header className="h-16 flex items-center justify-between px-6 backdrop-blur-md border-b z-20 relative"
                style={{
                    backgroundColor: 'rgba(var(--color-bg-panel), 0.7)',
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

                    <button onClick={() => setActiveTab('history')} className={`p-2 rounded-lg transition-colors ${activeTab === 'history' ? 'bg-black/10 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`} title="History">
                        <History size={20} />
                    </button>
                    <button onClick={() => setActiveTab('analytics')} className={`p-2 rounded-lg transition-colors ${activeTab === 'analytics' ? 'bg-black/10 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`} title="Analytics">
                        <BarChart2 size={20} />
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
            <main className="flex-grow flex items-center justify-center p-4 overflow-hidden relative z-10">
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
                            className="absolute top-0 left-0 h-full z-40 w-full max-w-md shadow-2xl"
                        >
                            <Suspense fallback={<div className="p-8 text-center bg-panel/90 text-main h-full flex items-center justify-center animate-pulse" style={{ backgroundColor: 'rgba(var(--color-bg-panel), 0.95)', color: 'var(--color-text-main)' }}>Loading history...</div>}>
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
                            className="absolute top-0 right-0 h-full z-40 w-full max-w-4xl shadow-2xl"
                        >
                            <Suspense fallback={<div className="p-8 text-center bg-panel/90 text-main h-full flex items-center justify-center animate-pulse" style={{ backgroundColor: 'rgba(var(--color-bg-panel), 0.95)', color: 'var(--color-text-main)' }}>Loading analytics...</div>}>
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
