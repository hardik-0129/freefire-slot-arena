import { requestForToken } from '../lib/firebase';

export const getDeviceToken = async (): Promise<string> => {
  const vapidKey = "BKhfMR7hWm_pYvtFK_Z0Eev1HadfRuB7v8hGWy_HLoP3UJDzdUkXNTa6-NDuWtze9BPm1r7jheJT6n598EUZI_s"; // Your VAPID key
  try {
    const token = await requestForToken(vapidKey);
    if (token) {
      console.log('Firebase Device Token:', token);
      return token;
    }
  } catch (err) {
    console.error('Failed to get Firebase device token:', err);
  }
  
  // Fallback: Generate a unique device identifier
  const fallbackToken = generateFallbackDeviceToken();
  console.log('Using fallback device token:', fallbackToken);
  return fallbackToken;
};

// Generate a fallback device token when Firebase fails
const generateFallbackDeviceToken = (): string => {
  // Create a unique device identifier based on browser fingerprint
  const userAgent = navigator.userAgent;
  const language = navigator.language;
  const platform = navigator.platform;
  const screenSize = `${window.screen.width}x${window.screen.height}`;
  const timestamp = Date.now();
  
  // Create a hash-like identifier
  const deviceInfo = `${userAgent}-${language}-${platform}-${screenSize}-${timestamp}`;
  const fallbackToken = `device_${btoa(deviceInfo).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32)}`;
  
  return fallbackToken;
};
