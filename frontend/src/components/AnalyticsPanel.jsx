import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { X, Download } from 'lucide-react';

import { Chart as ChartJS } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const AnalyticsPanel = ({ onClose }) => {
    const { api } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/analytics');
                setStats(res.data);
            } catch (err) {
                console.error('Failed to load analytics', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const handleDownloadCSV = async () => {
        try {
            // Re-fetch all history to build the CSV
            const res = await api.get('/history');
            const history = res.data;

            if (!history || history.length === 0) return;

            let csvData = "Date,Expression,Result,Mode\n";
            history.forEach(item => {
                const date = new Date(item.created_at).toLocaleString().replace(/,/g, '');
                // Escape quotes in expressions if needed
                const expr = `"${item.expression.replace(/"/g, '""')}"`;
                const result = `"${item.result.replace(/"/g, '""')}"`;
                csvData += `${date},${expr},${result},${item.calculator_mode}\n`;
            });

            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `calcnova_analytics_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (err) {
            console.error('Failed to download CSV', err);
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse h-full flex items-center justify-center bg-panel/90 text-main">Loading analytics...</div>;

    const modeData = {
        labels: stats?.modeDistribution?.map(m => m.mode.toUpperCase()) || [],
        datasets: [{
            data: stats?.modeDistribution?.map(m => m.count) || [],
            backgroundColor: ['#4f46e5', '#0d9488', '#f97316'],
            borderWidth: 0,
        }]
    };

    const trendData = {
        labels: stats?.dailyTrend?.map(t => new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })) || [],
        datasets: [{
            label: 'Calculations',
            data: stats?.dailyTrend?.map(t => t.count) || [],
            backgroundColor: '#818cf8',
            borderRadius: 6,
        }]
    };

    return (
        <div
            className="w-full h-full bg-panel p-6 sm:p-8 shadow-xl border-l overflow-hidden flex flex-col overflow-y-auto"
            style={{ backgroundColor: 'rgba(var(--color-bg-panel), 0.95)', borderColor: 'var(--color-border)', backdropFilter: 'blur(10px)' }}
        >
            <div className="mb-8 flex items-start justify-between w-full">
                <div className="flex items-start gap-4">
                    {onClose && (
                        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors mt-1">
                            <X size={24} />
                        </button>
                    )}
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight mb-2">Advanced Analytics</h2>
                        <p className="text-muted" style={{ color: 'var(--color-text-muted)' }}>Real-time insights on your mathematical habits.</p>
                    </div>
                </div>

                <button
                    onClick={handleDownloadCSV}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border hover:bg-black/5 dark:hover:bg-white/5 transition-colors mt-2"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-main)' }}
                    title="Export History Data (CSV)"
                >
                    <Download size={16} />
                    <span className="hidden sm:inline">Export CSV</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 rounded-2xl border border-border bg-base-panel/50 flex flex-col items-center justify-center text-center shadow-sm" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-base)' }}>
                    <div className="text-xs font-bold opacity-60 mb-2 uppercase tracking-widest">Total Calculations</div>
                    <div className="text-5xl font-extrabold" style={{ color: 'var(--color-primary)' }}>{stats?.totalCalculations || 0}</div>
                </div>
                <div className="p-6 rounded-2xl border border-border bg-base-panel/50 flex flex-col items-center justify-center text-center shadow-sm" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-base)' }}>
                    <div className="text-xs font-bold opacity-60 mb-2 uppercase tracking-widest text-center">Top Operator</div>
                    <div className="text-4xl font-extrabold bg-blue-500/10 text-blue-500 w-16 h-16 rounded-full flex items-center justify-center">
                        {stats?.topOperators?.[0]?.operator || '?'}
                    </div>
                </div>
                <div className="p-6 rounded-2xl border border-border bg-base-panel/50 flex flex-col items-center justify-center text-center shadow-sm" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-base)' }}>
                    <div className="text-xs font-bold opacity-60 mb-2 uppercase tracking-widest text-center">Favorite Number</div>
                    <div className="text-5xl font-extrabold" style={{ color: 'var(--color-accent)' }}>{stats?.topNumbers?.[0]?.label || '0'}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl border flex flex-col items-center" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-base)' }}>
                    <h3 className="font-bold text-lg mb-6 self-start">Mode Distribution</h3>
                    <div className="w-64 h-64">
                        {stats?.modeDistribution?.length > 0 ? (
                            <Doughnut data={modeData} options={{ maintainAspectRatio: false }} />
                        ) : (
                            <div className="w-full h-full flex flex-col justify-center items-center opacity-40">No Data</div>
                        )}
                    </div>
                </div>
                <div className="p-6 rounded-2xl border flex flex-col" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-base)' }}>
                    <h3 className="font-bold text-lg mb-6">Daily Trend</h3>
                    <div className="flex-grow min-h-[250px]">
                        {stats?.dailyTrend?.length > 0 ? (
                            <Bar
                                data={trendData}
                                options={{
                                    maintainAspectRatio: false,
                                    scales: { y: { beginAtZero: true, grid: { color: 'rgba(150,150,150,0.1)' } }, x: { grid: { display: false } } },
                                    plugins: { legend: { display: false } }
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col justify-center items-center opacity-40">No Data</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPanel;
