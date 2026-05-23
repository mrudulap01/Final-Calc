import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator } from 'lucide-react';

<<<<<<< HEAD
const API_URL = import.meta.env.VITE_API_URL || https://calcnova-backend.onrender.com;
=======
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
>>>>>>> dfceefb2557c05eb2d9a1b1afb016aa870f7cffb

const ShareView = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShare = async () => {
            try {
                const res = await axios.get(`${API_URL}/history/share/${id}`);
                setData(res.data);
                if (res.data.theme) {
                    document.documentElement.setAttribute('data-theme', res.data.theme);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchShare();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base text-main">
                <div className="animate-pulse flex flex-col items-center">
                    <Calculator size={48} className="mb-4 opacity-50" />
                    <p>Loading Calculation...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-base text-main gap-4">
                <h2 className="text-2xl font-bold">Calculation not found</h2>
                <Link to="/" className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-bold shadow-lg">
                    Back to Calculator
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-base text-main p-4 relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg-base)' }}>

            <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r"
                    style={{ backgroundImage: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))' }}>
                    CalcNova
                </h1>
                <Link to="/" className="px-4 py-2 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors">
                    Try CalcNova
                </Link>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full max-w-lg p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border backdrop-blur-2xl relative z-10"
                style={{ backgroundColor: 'rgba(var(--color-bg-panel), 0.85)', borderColor: 'var(--color-border)' }}
            >
                <div className="flex items-center gap-4 mb-10 pb-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="w-14 h-14 rounded-full border-2 overflow-hidden bg-black/5 dark:bg-white/5" style={{ borderColor: 'var(--color-primary)' }}>
                        {data.avatar ? (
                            <img src={data.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary font-bold text-xl">
                                {data.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="font-bold text-lg opacity-90">{data.email?.split('@')[0] || 'User'} shared a calculation</div>
                        <div className="text-sm opacity-50">{new Date(data.created_at).toLocaleString()}</div>
                    </div>
                </div>

                <div className="w-full flex flex-col items-end mb-6 bg-black/5 dark:bg-white/5 p-6 rounded-2xl border min-h-[160px] justify-end overflow-hidden relative" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="text-right text-2xl sm:text-3xl mb-2 opacity-70 break-all w-full font-mono tracking-wide">
                        {data.expression}
                    </div>
                    <div className="text-right text-5xl sm:text-6xl font-extrabold tracking-tight break-all" style={{ color: 'var(--color-primary)' }}>
                        {data.result}
                    </div>
                </div>

            </motion.div>
        </div>
    );
};

export default ShareView;
