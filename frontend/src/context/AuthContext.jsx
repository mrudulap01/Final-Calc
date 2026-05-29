import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://final-calc.onrender.com/api'
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('calcnova_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('calcnova_token'));
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(true);

    const logout = () => {
        localStorage.removeItem('calcnova_token');
        setToken(null);
        setUser(null);
    };

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('calcnova_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
    };

    const register = async (email, password) => {
        const res = await api.post('/auth/register', { email, password });
        localStorage.setItem('calcnova_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
    };

    const deleteAccount = async () => {
        try {
            await api.delete('/auth/account');
            logout();
        } catch (err) {
            console.error('Failed to delete account', err);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            if (token) {
                try {
                    const res = await api.get('/auth/profile');
                    setUser(res.data);
                } catch (err) {
                    console.error('Failed to fetch profile', err);
                    logout();
                }
            }
            setLoading(false);
        };
        fetchProfile();

        // Sync Ping
        const pingInterval = setInterval(async () => {
            try {
                await api.get('/health', { timeout: 3000 });
                setIsOnline(true);
            } catch {
                setIsOnline(false);
            }
        }, 10000); // 10s ping

        return () => clearInterval(pingInterval);
    }, [token]);

    return (
        <AuthContext.Provider value={{ user, token, loading, isOnline, login, register, logout, deleteAccount, api }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
