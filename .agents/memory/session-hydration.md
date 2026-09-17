---
name: Session hydration and key recovery
description: Server sessions survive refreshes, while private encryption keys remain memory-only and require re-authentication after a refresh.
---

Restore the authenticated user from the server session before rendering routes, but never persist or reconstruct the private encryption key automatically. If the user is restored without a key, keep them on the dashboard in a locked state and require login again.

**Why:** Redirecting before the session check completes makes a valid session look unauthenticated and sends users back to the landing page. Persisting the private key would weaken the E2EE security boundary.

**How to apply:** Keep route rendering behind the initial session check; distinguish “session loading,” “authenticated but key locked,” and “unauthenticated” states in the UI.