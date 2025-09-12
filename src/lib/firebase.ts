// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDuNR6-r3wNptX6VHz4qrlZ6GhYea4xDJw",
  authDomain: "auth-test-e3855.firebaseapp.com",
  projectId: "auth-test-e3855",
  storageBucket: "auth-test-e3855.firebasestorage.app",
  messagingSenderId: "1071494558257",
  appId: "1:1071494558257:web:b356a41fadd7c9ab285b10"
};

const app = initializeApp(firebaseConfig);

// Check if the browser supports service workers and messaging
export const isSupported = async () => {
  try {
    await import('firebase/messaging');
    return 'Notification' in window && 
           'serviceWorker' in navigator && 
           'PushManager' in window;
  } catch (err) {
    return false;
  }
};

export let messaging: any = null;

// Initialize messaging if supported
export const initializeMessaging = async () => {
  if (await isSupported()) {
    messaging = getMessaging(app);
    return true;
  }
  return false;
};

export const requestForToken = async (vapidKey: string): Promise<string | null> => {
  try {
    if (!messaging) {
      const supported = await initializeMessaging();
      if (!supported) {
        return null;
      }
    }
    
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const currentToken = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
    return currentToken;
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
    return null;
  }
};

export { onMessage };
