export const translations = {
    en: {
        calc_basic: "Basic",
        calc_scientific: "Scientific",
        calc_programmer: "Programmer",
        history_title: "Calculation History",
        history_clear: "Clear All",
        history_empty: "No history yet. Start calculating!",
        analytics_title: "Advanced Analytics 2.0",
        analytics_desc: "Real-time insights on your mathematical habits.",
        settings_appearance: "Appearance",
        settings_language: "Language",
        settings_sound: "Sound Effects",
        mode_dark: "Dark Mode",
        mode_light: "Light Mode",
        robot_ready: "Ready!",
        robot_listening: "Listening..."
    },
    hi: {
        calc_basic: "बुनियादी",
        calc_scientific: "वैज्ञानिक",
        calc_programmer: "प्रोग्रामर",
        history_title: "गणना इतिहास",
        history_clear: "सभी साफ़ करें",
        history_empty: "अभी तक कोई इतिहास नहीं है। गणना शुरू करें!",
        analytics_title: "उन्नत विश्लेषिकी 2.0",
        analytics_desc: "आपकी गणितीय आदतों पर वास्तविक समय की जानकारी।",
        settings_appearance: "दिखावट",
        settings_language: "भाषा",
        settings_sound: "ध्वनि प्रभाव",
        mode_dark: "डार्क मोड",
        mode_light: "लाइट मोड",
        robot_ready: "तैयार!",
        robot_listening: "सुन रहा हूँ..."
    },
    es: {
        calc_basic: "Básico",
        calc_scientific: "Científico",
        calc_programmer: "Programador",
        history_title: "Historial de cálculos",
        history_clear: "Borrar todo",
        history_empty: "Aún no hay historial. ¡Empieza a calcular!",
        analytics_title: "Análisis avanzado 2.0",
        analytics_desc: "Información en tiempo real sobre tus hábitos matemáticos.",
        settings_appearance: "Apariencia",
        settings_language: "Idioma",
        settings_sound: "Efectos de sonido",
        mode_dark: "Modo oscuro",
        mode_light: "Modo claro",
        robot_ready: "¡Listo!",
        robot_listening: "Escuchando..."
    }
};

export const t = (key, lang = 'en') => {
    return translations[lang]?.[key] || translations['en'][key] || key;
};
