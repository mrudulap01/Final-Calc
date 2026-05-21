import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, PlusCircle } from 'lucide-react';

const AssistantPanel = ({ onReinsert }) => {
    const { api } = useAuth();
    const [suggestions, setSuggestions] = useState([]);
    const [expressions, setExpressions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const fetchPatterns = async () => {
        try {
            const res = await api.get('/analytics');
            if (res.data) {
                // Combine top operators and top numbers into quick keys
                const ops = (res.data.topOperators || []).map(o => o.operator);
                const nums = (res.data.topNumbers || []).map(n => n.label);

                // Keep top 6 combined elements
                const combined = [...new Set([...ops, ...nums])].slice(0, 6);
                setSuggestions(combined);

                // Full expressions to repeat
                setExpressions(res.data.topExpressions || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPatterns();

        const handleRefresh = () => fetchPatterns();
        window.addEventListener('reinsert_expr', handleRefresh);
        return () => window.removeEventListener('reinsert_expr', handleRefresh);
    }, []);

    return (
        <div className="flex flex-col h-full justify-center ml-4 relative z-20">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-3 rounded-full shadow-lg transition-all duration-300 border ${isOpen ? 'bg-primary text-white scale-110 border-primary' : 'bg-panel text-primary hover:scale-105 border-transparent'}`}
                style={!isOpen ? { backgroundColor: 'var(--color-bg-panel)' } : {}}
            >
                <Sparkles size={24} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.9 }}
                        className="absolute left-16 top-1/2 -translate-y-1/2 w-72 bg-panel border p-5 rounded-3xl shadow-2xl"
                        style={{ backgroundColor: 'rgba(var(--color-bg-panel), 0.95)', borderColor: 'var(--color-border)', backdropFilter: 'blur(10px)' }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold flex items-center gap-2 text-lg" style={{ color: 'var(--color-primary)' }}>
                                <Sparkles size={18} /> Quick Suggest
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 opacity-60 hover:opacity-100 transition-all">
                                <X size={16} />
                            </button>
                        </div>

                        {suggestions.length === 0 && expressions.length === 0 ? (
                            <div className="text-sm opacity-50 text-center py-6">Keep calculating to get smart suggestions!</div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {expressions.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold opacity-60 uppercase tracking-wider mb-2">Repeat Last Expression?</p>
                                        <div className="flex flex-col gap-2">
                                            {expressions.slice(0, 2).map((exp, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => onReinsert(exp.label)}
                                                    className="w-full text-left p-2 rounded-xl text-sm font-mono bg-black/5 dark:bg-white/5 border border-transparent hover:border-primary transition-all active:scale-95 truncate flex items-center justify-between group"
                                                >
                                                    <span className="truncate">{exp.label}</span>
                                                    <PlusCircle size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--color-primary)' }} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <p className="text-xs font-semibold opacity-60 uppercase tracking-wider mb-2">Frequently Used</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {suggestions.map((s, i) => (
                                            <button
                                                key={`op-${i}`}
                                                onClick={() => onReinsert(s)}
                                                className="p-2 rounded-xl text-lg font-bold bg-black/5 dark:bg-white/5 border border-transparent hover:border-primary transition-all active:scale-95"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AssistantPanel;
