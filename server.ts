import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Track players
  const players: Record<string, any> = {};

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Initialize player
    players[socket.id] = {
      id: socket.id,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      score: 0,
      gameState: 'START',
      color: '#' + Math.floor(Math.random()*16777215).toString(16)
    };

    // Send existing players to the new player
    socket.emit('players:init', Object.values(players));

    // Notify others
    socket.broadcast.emit('player:joined', players[socket.id]);

    socket.on('player:update', (data) => {
      if (players[socket.id]) {
        players[socket.id] = { ...players[socket.id], ...data };
        socket.broadcast.emit('player:updated', players[socket.id]);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      delete players[socket.id];
      io.emit('player:left', socket.id);
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
