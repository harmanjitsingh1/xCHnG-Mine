import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { API } from "@/lib/axios.js";


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

const initMessaging = async () => {
  try {
    const supported = await isSupported();
    console.log("Is Messaging Supported?", supported);

    if (supported) {
      messaging = getMessaging(app);
      console.log("Messaging initialized successfully.");
    } else {
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


export const requestNotificationPermission = async (userId) => {
  if (!messaging) {
    console.error("Firebase Messaging not supported in this browser/context.");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const registration = await navigator.serviceWorker.ready;

      const token = await getToken(messaging, {
        vapidKey: "BJHvf_3dacROKGRNfCoNeCrxaMP3u5QvCOBeoly_xOT7KiH7rHUh6Eu_Ik2K8mLm6vk7pyyqKA8df03FLcyMc1U",
        serviceWorkerRegistration: registration,
      });

      if (token) {
        await saveTokenToDatabase(userId, token);
      }

      return token;
    } else {
      console.error("Notification permission denied");
      return null;
    }
  } catch (error) {
    console.error("Error getting permission/token", error);
    return null;
  }
};

const saveTokenToDatabase = async (userId, token) => {
  try {
    const res = await API.post("/notifications/update-fcm-token", { userId, token });
    return res;
  } catch (err) {
    console.error("Failed to sync token with server", err);
  }
};

export const onForegroundMessage = () => {
  return new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};