import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, FastForward, Download, X } from 'lucide-react';
import { motion } from 'framer-motion';

const HistoryPanel = ({ onClose }) => {
    const { api } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadHistory = async () => {
        try {
            const res = await api.get('/history');
            setHistory(res.data);
        } catch (err) {
            console.error('Failed to load history', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const handleDelete = async (id) => {
        try {
            await api.delete(`/history/${id}`);
            loadHistory();
        } catch (err) {
            console.error(err);
        }
    };

    const handleClearAll = async () => {
        try {
            await api.delete('/history');
            setHistory([]);
        } catch (err) {
            console.error(err);
        }
    };

    const handleReinsert = (expr) => {
        window.dispatchEvent(new CustomEvent('reinsert_expr', { detail: expr }));
        if (onClose) onClose();
    };

    const handleExportCSV = () => {
        if (history.length === 0) return;
        const headers = ['Date', 'Expression', 'Result', 'Mode'];
        const rows = history.map(item => [
            new Date(item.created_at).toLocaleString(),
            `"${item.expression}"`,
            `"${item.result}"`,
            item.mode
        ]);
        const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `calcnova-history-${Date.now()}.csv`;
        link.click();
    };

    if (loading) return <div className="p-8 text-center animate-pulse h-full flex items-center justify-center bg-panel/90 text-main">Loading history...</div>;

    return (
        <div
            className="w-full h-full bg-panel p-6 shadow-xl border-r overflow-hidden flex flex-col"
            style={{ backgroundColor: 'rgba(var(--color-bg-panel), 0.95)', borderColor: 'var(--color-border)', backdropFilter: 'blur(10px)' }}
        >
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    {onClose && (
                        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                            <X size={24} />
                        </button>
                    )}
                    <h2 className="text-2xl font-bold tracking-tight">History</h2>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExportCSV}
                        disabled={history.length === 0}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 transition-colors"
                    >
                        <Download size={16} /> <span className="hidden sm:inline">Export</span>
                    </button>
                    <button
                        onClick={handleClearAll}
                        disabled={history.length === 0}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-500/10 text-red-500 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                    >
                        <Trash2 size={16} /> <span className="hidden sm:inline">Clear</span>
                    </button>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {history.length === 0 && (
                    <div className="text-center text-muted mt-20" style={{ color: 'var(--color-text-muted)' }}>
                        No history yet. Start calculating!
                    </div>
                )}
                {history.map((item, i) => (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={item.id}
                        className="p-4 rounded-xl border flex justify-between items-center group transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-base)' }}
                    >
                        <div className="flex-1 overflow-hidden pr-4">
                            <div className="text-sm font-mono opacity-60 mb-1 truncate">{item.expression}</div>
                            <div className="text-xl font-bold text-primary truncate" style={{ color: 'var(--color-primary)' }}>= {item.result}</div>
                            <div className="text-xs uppercase tracking-wider opacity-40 mt-1 flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-sm bg-black/10 dark:bg-white/10">{item.mode}</span>
                                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleReinsert(item.expression)} className="p-2 rounded-lg bg-secondary text-white shadow-sm hover:scale-105 transition-transform" title="Reinsert">
                                <FastForward size={18} />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg bg-red-500 text-white shadow-sm hover:scale-105 transition-transform" title="Delete">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default HistoryPanel;
