---
name: E2EE artifact boundary
description: Which workspace artifacts are required for the secure messenger product.
---

The E2EE frontend and API server are one product boundary. The frontend depends
on the API server for authentication, encrypted-message persistence, message
requests, and Socket.IO realtime delivery. Unrelated presentation, landing-page,
and mockup artifacts can be removed without removing either of these two.

**Why:** The user explicitly chose to remove unrelated projects while keeping
the API server after being told that deleting it would break E2EE login and
messaging.

**How to apply:** Preserve both `artifacts/e2ee-app` and `artifacts/api-server`
when cleaning up or restructuring the workspace.