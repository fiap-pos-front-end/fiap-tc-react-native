import { initializeApp } from "firebase/app";
export function useInitFirebase() {
  const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
  };
  const app = initializeApp(firebaseConfig);
  console.log("🚀 ~ RootLayout ~ app:", app);
}
