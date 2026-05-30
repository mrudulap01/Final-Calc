const API_URL = import.meta.env.VITE_API_URL || 'https://final-calc.onrender.com/api';

let wakeUpPromise = null;
let listeners = [];

export const waitForBackend = async (onStateChange) => {
    if (wakeUpPromise) {
        if (onStateChange) listeners.push(onStateChange);
        return wakeUpPromise;
    }

    if (onStateChange) listeners.push(onStateChange);

    wakeUpPromise = (async () => {
        // The exact retry delays requested: Attempt 1: 3s, Attempt 2: 5s, Attempt 3: 8s, Attempt 4: 10s
        const delays = [0, 3000, 5000, 8000, 10000];
        
        const notify = (state) => {
            listeners.forEach(cb => cb(state));
        };
        
        for (let i = 0; i < delays.length; i++) {
            if (i > 0) {
                notify(`waking_up_attempt_${i}`);
                await new Promise(resolve => setTimeout(resolve, delays[i]));
            } else {
                notify('checking');
            }
            
            try {
                const controller = new AbortController();
                // Aggressive 4s timeout for the health check itself
                const timeoutId = setTimeout(() => controller.abort(), 4000); 
                
                const response = await fetch(`${API_URL}/health?_t=${Date.now()}`, { 
                    method: 'GET',
                    cache: 'no-store',
                    headers: {
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache'
                    },
                    signal: controller.signal 
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    notify('ready');
                    wakeUpPromise = null;
                    listeners = [];
                    return true;
                }
            } catch {
                // Request failed or timed out. Loop will continue to the next delay if available.
            }
        }
        
        notify('error');
        wakeUpPromise = null;
        listeners = [];
        return false;
    })();

    return wakeUpPromise;
};
