importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyAQVvpfZsNhdiHR-s9wpVhTCvl_XL-b8yM",
  authDomain: "nabtt-e645f.firebaseapp.com",
  projectId: "nabtt-e645f",
  storageBucket: "nabtt-e645f.firebasestorage.app",
  messagingSenderId: "192368391965",
  appId: "1:192368391965:web:8a1a355db94e4611da93f4",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/images/logo.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const deepLink = event.notification.data?.deepLink || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there is already a window/tab open and focus it
        for (const client of clientList) {
          if (client.url === deepLink && "focus" in client) {
            return client.focus();
          }
        }
        // If no window/tab matches, open a new one
        if (clients.openWindow) {
          return clients.openWindow(deepLink);
        }
      }),
  );
});

messaging.onMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received foreground message ",
    payload,
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/images/logo.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
