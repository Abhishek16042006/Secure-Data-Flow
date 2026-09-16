---
name: API security integration tests
description: Environment constraints for exercising production-mode Express sessions and Socket.IO in API regression tests.
---

Production-mode API integration tests running on a local HTTP listener must send `X-Forwarded-Proto: https` for login requests so Express emits the secure session cookie, matching the deployed reverse-proxy path.

**Why:** The application trusts its first proxy hop and intentionally suppresses secure cookies when the request is not HTTPS; omitting the proxy header makes authenticated test flows fail even though the production configuration is correct.

**How to apply:** Use a real HTTP server plus the exported session middleware for session coverage, pass the proxy header on login, and close the Socket.IO server before closing the underlying HTTP listener during teardown.