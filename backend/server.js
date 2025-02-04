import WebSocket, { WebSocketServer } from 'ws';

const MESSAGE_RATE = 1000;
const wss = new WebSocketServer({ port: 8080, clientTracking: true });

wss.on('connection', function connection(ws, req) {
  console.log('A client connected', req.url);

  let msgId = 0;
  let interval = setInterval(() => {
    const data = JSON.stringify({text: `Message ${++msgId}`, session: getRandomSessionId()})
    ws.send(data);
  }, MESSAGE_RATE);

  ws.on('message', function incoming(data) {
    console.log('received: %s', data);

    // Broadcast to all connected clients
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });

  ws.on('close', function close() {
    console.log('A client disconnected', req.url);
    clearInterval(interval);
  });
});

wss.on('error', e => {
  console.error('WebSocket server error: ', e);
});

wss.on('listening', () => {
  console.log('WebSocket server started on port 8080');
});

function getRandomSessionId() {
  return Math.floor(Math.random() * 4);
}