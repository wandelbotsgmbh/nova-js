import ws from "ws"
globalThis.WebSocket = ws as unknown as typeof globalThis.WebSocket
