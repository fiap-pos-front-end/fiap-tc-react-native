import { getApps } from '@react-native-firebase/app';

// Initialize Firebase if not already initialized
if (getApps().length === 0) {
  // Firebase will be automatically initialized by the native modules
  // when using @react-native-firebase/app
  console.log('Firebase initialized');
}

export default {};

