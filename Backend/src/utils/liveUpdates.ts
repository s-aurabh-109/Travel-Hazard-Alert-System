import WebSocket from 'ws';

let wss: WebSocket.Server | null = null;
const clients = new Set<WebSocket>();

const registerWebSocketServer = (server: any): WebSocket.Server => {
  if (wss && wss.options && wss.options.server === server) {
    return wss;
  }

  if (wss) {
    wss.close();
  }

  wss = new WebSocket.Server({ server });

  wss.on('connection', (socket: WebSocket) => {
    clients.add(socket);

    socket.on('message', (message: WebSocket.Data) => {
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed.type === 'ping') {
          socket.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (error) {
        // ignore invalid payloads
      }
    });

    socket.on('close', () => {
      clients.delete(socket);
    });
  });

  return wss;
};

const broadcastLiveUpdate = (payload: unknown): void => {
  const message = JSON.stringify(payload);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
};

export { registerWebSocketServer, broadcastLiveUpdate };
export default { registerWebSocketServer, broadcastLiveUpdate };
