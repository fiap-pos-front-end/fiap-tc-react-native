import "dotenv/config";
import type { ExpoConfig } from "expo/config";

const bool = (v: unknown, d = false) =>
  ["true", "1", "yes", "on"].includes(String(v ?? d).toLowerCase());

const int = (v: unknown, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const config: ExpoConfig = {
  name: "fiap-f3-tech-challenge-3",
  slug: "fiap-f3-tech-challenge-3",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "fiapf3techchallenge3",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/icon.png",
      backgroundColor: "#0092EA",
    },
    edgeToEdgeEnabled: true,
    package: "br.com.bytebank",
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#0092EA",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    firebase: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    },

    useEmulators: bool(process.env.USE_EMULATORS, true),
    firestoreEmulatorPort: int(process.env.FIRESTORE_EMULATOR_PORT, 8080),
  },
};

export default config;
