const API_URL = import.meta.env.VITE_API_URL || 'https://final-calc.onrender.com/api';

export const waitForBackend = async (onStateChange) => {
    // The exact retry delays requested: Attempt 1: 3s, Attempt 2: 5s, Attempt 3: 8s, Attempt 4: 10s
    const delays = [0, 3000, 5000, 8000, 10000];
    
    for (let i = 0; i < delays.length; i++) {
        if (i > 0) {
            if (onStateChange) onStateChange(`waking_up_attempt_${i}`);
            await new Promise(resolve => setTimeout(resolve, delays[i]));
        } else {
            if (onStateChange) onStateChange('checking');
        }
        
        try {
            const controller = new AbortController();
            // Aggressive 4s timeout for the health check itself
            const timeoutId = setTimeout(() => controller.abort(), 4000); 
            
            const response = await fetch(`${API_URL}/health`, { 
                method: 'GET',
                signal: controller.signal 
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                if (onStateChange) onStateChange('ready');
                return true;
            }
        } catch {
            // Request failed or timed out. Loop will continue to the next delay if available.
        }
    }
    
    if (onStateChange) onStateChange('error');
    return false;
};
