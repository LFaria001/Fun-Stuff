importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBkIkvjdQ1Mzorquq6PlDCXuosIJDzwEWU",
  authDomain: "musamar-hub.firebaseapp.com",
  projectId: "musamar-hub",
  storageBucket: "musamar-hub.firebasestorage.app",
  messagingSenderId: "429342019448",
  appId: "1:429342019448:web:3342971f2f08093420028d"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  // Don't show duplicate — FCM auto-shows notification from the 'notification' key
  // Only handle if data-only message (no notification key)
  if (payload.notification) return;
  const title = payload.data.title || 'Musamar Hub';
  const options = {
    body: payload.data.body || '',
    icon: 'icons/icon-192.png',
  };
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const appUrl = self.registration.scope;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].url.indexOf('MUSAMAR-Hub') !== -1) {
          return clientList[i].focus();
        }
      }
      return clients.openWindow(appUrl);
    })
  );
});
