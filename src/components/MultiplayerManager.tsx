import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '../store/useGameStore';

let socket: Socket;

export const MultiplayerManager = () => {
  const { 
    updateOtherPlayer, 
    removeOtherPlayer, 
    initOtherPlayers, 
    gameState, 
    score 
  } = useGameStore();

  useEffect(() => {
    // Connect to the same host
    socket = io();

    socket.on('players:init', (players) => {
        // Filter out self if needed (server usually handles it, but socket.id is unique)
        const others = players.filter((p: any) => p.id !== socket.id);
        initOtherPlayers(others);
    });

    socket.on('player:joined', (player) => {
        if (player.id !== socket.id) {
            updateOtherPlayer(player.id, player);
        }
    });

    socket.on('player:updated', (player) => {
        if (player.id !== socket.id) {
            updateOtherPlayer(player.id, player);
        }
    });

    socket.on('player:left', (id) => {
        removeOtherPlayer(id);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Send updates when local state changes
  useEffect(() => {
    if (socket && socket.connected) {
        socket.emit('player:update', { gameState, score });
    }
  }, [gameState, score]);

  return null;
};

export const getSocket = () => socket;
