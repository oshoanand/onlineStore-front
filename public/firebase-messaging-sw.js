importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js",
);

// 1. Initialize Firebase inside the Service Worker

const firebaseConfig = {
  apiKey: "AIzaSyAEFVxhBdqjvecjA_aj5TAD8lI30NPFglU",
  authDomain: "zepo-c03d7.firebaseapp.com",
  projectId: "zepo-c03d7",
  storageBucket: "zepo-c03d7.firebasestorage.app",
  messagingSenderId: "465436463784",
  appId: "1:465436463784:web:d663dcaf80d8a84d29289d",
  measurementId: "G-5NCKNW2SR4",
};

firebase.initializeApp(firebaseConfig);

// 2. Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// 3. Handle Background Messages
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icons/icon-192.png", // Add your app icon in public folder
    badge: "/icons/badge.png", // Small monochrome icon
    data: { url: payload.data?.click_action || "/" }, // Handle click URL
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 4. Handle Notification Click
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
