// Authentication guard hook — replaces the broken setInterval + window.location pattern (ADR-002).
// Call this at the top of any page-client.tsx that requires the user to be signed in.
// Redirects to `redirectTo` if the user is not authenticated once Firebase has resolved.
//
// Returns { isLoading, isAuthenticated } so the page can conditionally render its content
// (show a skeleton while loading, block render when unauthenticated).

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthUserContext';

// redirectTo defaults to '/' (home/login page). Pass a different path if needed.
export function useAuthGuard(redirectTo: string = '/') {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for Firebase to finish the initial auth check before redirecting.
    // Without the isLoading guard, the hook would redirect on every mount before
    // Firebase has had a chance to restore the persisted session.
    if (!isLoading && !user) {
      // router.replace instead of router.push so the protected page is removed from the
      // browser history — the back button won't return the user to the protected route.
      router.replace(redirectTo);
    }
  }, [user, isLoading, redirectTo, router]);

  return {
    isLoading,
    // Coerce to boolean so the page can use isAuthenticated directly without null checks.
    isAuthenticated: !!user,
  };
}
