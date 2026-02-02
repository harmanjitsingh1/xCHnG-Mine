import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

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
let messaging = null;

// const initMessaging = async () => {
//   const supported = await isSupported();
//   console.log(supported)
//   if (supported) {
//     messaging = getMessaging(app);
//   }
// };

const initMessaging = async () => {
  try {
    const supported = await isSupported();
    console.log("Is Messaging Supported?", supported);
    
    if (supported) {
      messaging = getMessaging(app);
      console.log("Messaging initialized successfully.");
    } else {
      // Logic to see if the browser itself is the problem
      console.log("Browser Info:", navigator.userAgent);
      console.log("Service Worker in navigator?", 'serviceWorker' in navigator);
      console.log("PushManager in window?", 'PushManager' in window);
    }
  } catch (err) {
    console.error("Error during isSupported check:", err);
  }
};
// Trigger initialization
initMessaging();


export const requestNotificationPermission = async () => {
  console.log("requesting.....");
  
  if (!messaging) {
    console.log("Firebase Messaging not supported in this browser/context.");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const registration = await navigator.serviceWorker.ready;

      const token = await getToken(messaging, {
        vapidKey: "BJHvf_3dacROKGRNfCoNeCrxaMP3u5QvCOBeoly_xOT7KiH7rHUh6Eu_Ik2K8mLm6vk7pyyqKA8df03FLcyMc1U",
        serviceWorkerRegistration: registration,
        // vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });
      console.log("FCM Token:", token);
      return token;
      // TODO: Send this token to your backend server to save it for this user
    } else {
      console.log("Notification permission denied");
      return null;
    }
  } catch (error) {
    console.error("Error getting permission/token", error);
    return null;
  }
};

// Listen for messages when the app is OPEN (Foreground)
export const onForegroundMessage = () => {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};