const fallbackBackendUrl = 'https://ai-trading-t3yo.onrender.com';
// const fallbackBackendUrl = 'http://localhost:3000';
// 
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || fallbackBackendUrl;
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || BACKEND_URL;
