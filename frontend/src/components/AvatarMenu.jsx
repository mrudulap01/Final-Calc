import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, Upload, Trash2, X, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AvatarMenu = () => {
    const { user, api, logout, deleteAccount } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const [currentAvatar, setCurrentAvatar] = useState(user?.avatar || null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!previewUrl) return;
        setIsUploading(true);
        try {
            await api.put('/auth/profile/avatar', { avatar: previewUrl });
            setCurrentAvatar(previewUrl);
            if (user) user.avatar = previewUrl;
            setPreviewUrl(null);
            setIsOpen(false);
        } catch (err) {
            console.error('Failed to save avatar', err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = async () => {
        setIsUploading(true);
        try {
            await api.put('/auth/profile/avatar', { avatar: null });
            setCurrentAvatar(null);
            if (user) user.avatar = null;
            setPreviewUrl(null);
            setIsOpen(false);
        } catch (err) {
            console.error('Failed to remove avatar', err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="relative">
            {/* Avatar Trigger */}
            <button
                onClick={() => setIsOpen(true)}
                className="w-10 h-10 rounded-full border-2 overflow-hidden flex items-center justify-center shadow-sm hover:scale-105 transition-transform relative z-50 cursor-pointer"
                style={{ borderColor: 'var(--color-primary)', backgroundColor: 'var(--color-bg-panel)' }}
            >
                {currentAvatar ? (
                    <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold text-lg">
                        {user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                )}
            </button>

            {/* Modal */}
            {createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            key="overlay"
                            initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black z-40" onClick={() => setIsOpen(false)}
                        />
                    )}
                </AnimatePresence>,
                document.body
            )}

            {createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            key="panel"
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="fixed top-20 right-6 w-72 bg-panel p-5 rounded-2xl shadow-2xl border z-50 flex flex-col items-center"
                            style={{ backgroundColor: 'var(--color-bg-panel)', borderColor: 'var(--color-border)' }}
                        >
                            <button onClick={() => setIsOpen(false)} className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                <X size={18} />
                            </button>
                            <h3 className="font-bold text-lg mb-4 text-center">Profile Picture</h3>

                            <div className="w-24 h-24 rounded-full border-4 overflow-hidden mb-4 relative group" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-base)' }}>
                                {previewUrl || currentAvatar ? (
                                    <img src={previewUrl || currentAvatar} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold text-3xl">
                                        {user?.email?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                            </div>

                            {/* Removed isolated hidden input */}

                            <div className="flex flex-col gap-2 w-full">
                                {previewUrl ? (
                                    <div className="flex gap-2 w-full">
                                        <button onClick={handleSave} disabled={isUploading} className="flex-1 py-1.5 rounded-lg text-white font-medium hover:opacity-90 transition-opacity bg-primary text-sm flex items-center justify-center gap-2">
                                            {isUploading ? 'Saving...' : 'Save'}
                                        </button>
                                        <button onClick={() => setPreviewUrl(null)} className="flex-1 py-1.5 rounded-lg border font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-main)' }}>
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <label className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors text-sm cursor-pointer">
                                            <Upload size={16} /> Upload New
                                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                        </label>
                                        {currentAvatar && (
                                            <button onClick={handleRemove} disabled={isUploading} className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-red-500/10 text-red-500 font-medium hover:bg-red-500/20 transition-colors text-sm">
                                                <Trash2 size={16} /> Remove Background
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="w-full mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                                <h4 className="text-sm font-bold mb-3 text-center">Settings</h4>
                                <div className="text-xs uppercase font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>Account Section</div>
                                <div className="flex flex-col gap-2">
                                    <button onClick={() => {
                                        if (window.confirm('Delete your account forever? All history will be lost. This cannot be undone.')) {
                                            deleteAccount();
                                        }
                                    }} className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-red-500/10 text-red-500 font-medium hover:bg-red-500/20 transition-colors text-sm text-center">
                                        <Trash2 size={16} /> Delete Account
                                    </button>
                                    <button onClick={logout} className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm text-center" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-main)' }}>
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default AvatarMenu;
