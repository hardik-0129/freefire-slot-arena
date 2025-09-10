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
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.svg',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
