import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
    en: {
        appName: 'CalcNova',
        tryApp: 'Try CalcNova',
        shareLink: 'Shared a calculation',
        history: 'History',
        analytics: 'Analytics',
        noHistory: 'No History found',
        clearHistory: 'Clear History',
        sync: 'Sync',
        offline: 'Offline'
    },
    hi: {
        appName: 'कैलकनोवा',
        tryApp: 'कैलकनोवा आजमाएं',
        shareLink: 'एक गणना साझा की',
        history: 'इतिहास',
        analytics: 'विश्लेषण',
        noHistory: 'कोई इतिहास नहीं मिला',
        clearHistory: 'इतिहास साफ़ करें',
        sync: 'सिंक करें',
        offline: 'ऑफ़लाइन'
    },
    es: {
        appName: 'CalcNova',
        tryApp: 'Prueba CalcNova',
        shareLink: 'Compartió un cálculo',
        history: 'Historial',
        analytics: 'Análisis',
        noHistory: 'No se encontró historial',
        clearHistory: 'Borrar historial',
        sync: 'Sincronizar',
        offline: 'Desconectado'
    }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(localStorage.getItem('calcnova_lang') || 'en');

    useEffect(() => {
        localStorage.setItem('calcnova_lang', lang);
        document.documentElement.lang = lang;
    }, [lang]);

    const t = (key) => translations[lang]?.[key] || translations['en'][key] || key;

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLang = () => useContext(LanguageContext);
