import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Server connection failed. Please check if the backend is running.');
        }
    };

    return (
        <div className="flex-grow flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="w-full max-w-md p-8 rounded-2xl backdrop-blur-md shadow-2xl border"
                style={{
                    backgroundColor: 'rgba(var(--color-bg-panel), 0.8)',
                    borderColor: 'var(--color-border)'
                }}
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r"
                        style={{ backgroundImage: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))' }}>
                        CalcNova
                    </h1>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Sign in to continue</p>
                </div>

                {error && <div className="mb-4 p-3 rounded bg-red-500/10 text-red-500 text-sm border border-red-500/20 text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <input
                            type="email"
                            placeholder="Email address"
                            className="w-full px-4 py-3 rounded-xl border border-border bg-transparent focus:outline-none focus:ring-2 focus:ring-primary transition-all transition-colors duration-200"
                            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-main)' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full px-4 py-3 rounded-xl border border-border bg-transparent focus:outline-none focus:ring-2 focus:ring-primary transition-all transition-colors duration-200"
                            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-main)' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02, translateY: -2 }}
                        whileTap={{ scale: 0.98, translateY: 0 }}
                        type="submit"
                        className="w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all"
                        style={{ backgroundImage: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))' }}
                    >
                        Sign In
                    </motion.button>
                </form>

                <p className="mt-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Don't have an account? <Link to="/register" className="font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>Create one</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
