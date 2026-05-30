import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register, checkBackend } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const isReady = await checkBackend();
        if (!isReady) {
            setError('Server connection failed. Please check if the backend is running.');
            setLoading(false);
            return;
        }

        try {
            await register(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Server connection failed. Please check if the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-grow flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="w-full max-w-md p-6 sm:p-8 rounded-2xl backdrop-blur-md shadow-2xl border"
                style={{
                    backgroundColor: 'rgba(var(--color-bg-panel), 0.8)',
                    borderColor: 'var(--color-border)',
                    position: 'relative',
                    zIndex: 20
                }}
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r"
                        style={{ backgroundImage: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))' }}>
                        Join CalcNova
                    </h1>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Create your account</p>
                </div>

                {error && <div className="mb-4 p-3 rounded bg-red-500/10 text-red-500 text-sm border border-red-500/20 text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <input
                            type="email"
                            placeholder="Email address"
                            className="w-full px-4 py-3 rounded-xl border border-border bg-transparent focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-main)' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password (min 6 chars)"
                            className="w-full px-4 py-3 rounded-xl border border-border bg-transparent focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-main)' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <motion.button
                        whileHover={!loading ? { scale: 1.02, translateY: -2 } : {}}
                        whileTap={!loading ? { scale: 0.98, translateY: 0 } : {}}
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        style={{ backgroundImage: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))' }}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing Up...
                            </>
                        ) : 'Sign Up'}
                    </motion.button>
                </form>

                <p className="mt-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Already have an account? <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>Log in</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
