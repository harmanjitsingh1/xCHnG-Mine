import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// 1. Standard PWA Caching (Replicating your previous setup)
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);
self.skipWaiting();
clientsClaim();

// 2. Initialize Firebase in the Service Worker
const firebaseConfig = {
  apiKey: "AIzaSyCbsDD9vFPHENxLtlZelMDOWJIbhGSd1QQ",
  authDomain: "my-exchange-2b875.firebaseapp.com",
  projectId: "my-exchange-2b875",
  storageBucket: "my-exchange-2b875.firebasestorage.app",
  messagingSenderId: "531033475473",
  appId: "1:531033475473:web:7041b64f7f82394de73230",
  measurementId: "G-8C2KGSVVP4"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// 3. Handle Background Notifications
// This runs when the app is closed or in the background
onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192.png', // Path to your app icon
    badge: '/icons/icon-64.png', // Small monochrome icon for the status bar
    data: {
        url: payload.data?.url || '/' // Custom data to handle clicks
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 4. Handle Notification Clicks
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // Open the app or specific URL when clicked
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Check if there is already a window open and focus it
      for (let client of windowClients) {
        if (client.url.includes(event.notification.data.url) && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});