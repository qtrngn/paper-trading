import 'dotenv/config';
import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import { connectToAlpaca, subscribeToSymbol } from './alpacaClient.js';

const port = Number(process.env.PORT || '8080');

const server = createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Realtime service is running');
});

const webSocketServer = new WebSocketServer({ server });

webSocketServer.on('connection', (socket) => {
  socket.on('message', (data) => {
    const message = data.toString();

    console.log('Received:', message);
    socket.send(`echo: ${message}`);
  });
});

export async function startServer() {
  await connectToAlpaca();
  subscribeToSymbol("AAPL");
  server.listen(port, () => {
    console.log(`Server started on ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
