import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseCredentials = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const requiredKeys = ['apiKey', 'authDomain', 'projectId'] as const;
requiredKeys.forEach(key => {
  if (!firebaseCredentials[key]) {
    throw new Error(`Firebase config missing: ${key}`);
  }
});

export const firebaseConfig = firebaseCredentials;
export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
