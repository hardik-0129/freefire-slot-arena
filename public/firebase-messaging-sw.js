// firebase-messaging-sw.js
// This file must be in your public/ directory for FCM to work

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDuNR6-r3wNptX6VHz4qrlZ6GhYea4xDJw",
  authDomain: "auth-test-e3855.firebaseapp.com",
  projectId: "auth-test-e3855",
  storageBucket: "auth-test-e3855.firebasestorage.app",
  messagingSenderId: "1071494558257",
  appId: "1:1071494558257:web:b356a41fadd7c9ab285b10"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  
  // Support data-only messages (preferred) and fall back to notification payload
  const data = payload && payload.data ? payload.data : {};
  const title = data.title || (payload.notification && payload.notification.title) || 'Notification';
  const body = data.body || (payload.notification && payload.notification.body) || '';
  const icon = data.icon || '/logo.svg';
  
  
  const notificationOptions = {
    body,
    icon,
    badge: '/logo.svg',
    data,
    tag: 'fcm-notification'
  };

  return self.registration.showNotification(title, notificationOptions)
    .then(() => {
    })
    .catch((error) => {
      console.error('Error showing notification:', error);
    });
});

// Optional: focus/open app on click
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const urlToOpen = (event.notification && event.notification.data && event.notification.data.click_action) || '/';
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
    for (const client of windowClients) {
      if ('focus' in client) return client.focus();
    }
    if (clients.openWindow) return clients.openWindow(urlToOpen);
  }));
});
