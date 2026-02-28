// Firebase initialization — runs at module load time on the client side.
// Only configures the Firebase app and exports the `auth` instance used by AuthUserContext.
// Google OAuth is the only authentication method used in this app.
//
// NEXT_PUBLIC_ prefix is required so Next.js includes these values in the client bundle.
// Unlike the Strapi token (ADR-001), Firebase credentials are safe to expose client-side —
// they are API keys for a client-side SDK, not server-side secrets.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase project credentials read from environment variables.
const firebaseCredentials = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Validate all required keys at startup so a missing env var fails fast with a clear error
// instead of producing a cryptic Firebase SDK error later during authentication.
const requiredKeys = ['apiKey', 'authDomain', 'projectId'] as const;
requiredKeys.forEach(key => {
  if (!firebaseCredentials[key]) {
    throw new Error(`Firebase config missing: ${key}`);
  }
});

export const firebaseConfig = firebaseCredentials;

// Initialize the Firebase app with the validated config.
export const firebaseApp = initializeApp(firebaseConfig);

// Export the Auth instance used by AuthUserContext to manage user sessions.
export const auth = getAuth(firebaseApp);
