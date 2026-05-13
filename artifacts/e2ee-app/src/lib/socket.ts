/**
 * socket.ts
 *
 * Socket.IO client singleton.
 *
 * Architecture:
 *  - A single socket is created lazily on first call to getSocket().
 *  - Authentication is handled by the session cookie automatically
 *    (credentials: true + same-origin).
 *  - The socket is disconnected on logout via disconnectSocket().
 *  - Encryption is NOT performed here — the socket only delivers
 *    already-encrypted ciphertext received from the server.
 */

import { io, type Socket } from "socket.io-client";

let _socket: Socket | null = null;

/**
 * Get (or lazily create) the authenticated Socket.IO connection.
 * Must only be called after the user is logged in.
 */
export function getSocket(): Socket {
  if (_socket && _socket.connected) return _socket;

  _socket = io({
    // Connect to same origin — the proxy routes /api/socket.io → API server
    path: "/api/socket.io",
    withCredentials: true,
    transports: ["polling", "websocket"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  });

  return _socket;
}

/** Gracefully disconnect and forget the socket (call on logout). */
export function disconnectSocket(): void {
  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }
}

/** Check if a socket is currently connected. */
export function isSocketConnected(): boolean {
  return _socket?.connected ?? false;
}
