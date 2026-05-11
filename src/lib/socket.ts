import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL;

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

let connectStarted = false;

export function ensureSocketConnected() {
  if (typeof window === "undefined") return;
  if (!connectStarted) {
    connectStarted = true;
    socket.connect();
  } else if (!socket.connected) {
    socket.connect();
  }
}
