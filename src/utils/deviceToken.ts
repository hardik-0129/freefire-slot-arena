import { requestForToken } from '../lib/firebase';

export const getDeviceToken = async (): Promise<string | null> => {
  const vapidKey = "BKhfMR7hWm_pYvtFK_Z0Eev1HadfRuB7v8hGWy_HLoP3UJDzdUkXNTa6-NDuWtze9BPm1r7jheJT6n598EUZI_s"; // Your VAPID key
  try {
    const token = await requestForToken(vapidKey);
    // console.log('Device Token:', token);
    return token;
  } catch (err) {
    console.error('Failed to get device token:', err);
    return null;
  }
};
