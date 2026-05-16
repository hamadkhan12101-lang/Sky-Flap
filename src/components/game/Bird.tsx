import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cone, Box } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { getSocket } from '../MultiplayerManager';

export const Bird = () => {
  const birdRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Group>(null);
  const rightWingRef = useRef<THREE.Group>(null);
  const velocity = useRef(0);
  const { gameState, setGameState, setIsSpeedingUp } = useGameStore();

  const GRAVITY = -0.005;
  const JUMP_FORCE = 0.12;
  const lastUpdate = useRef(0);

  const handleJump = (e?: any) => {
    if (e && e.target && (e.target as HTMLElement).closest('button')) return;

    if (gameState === 'PLAYING') {
      velocity.current = JUMP_FORCE;
      
      // Basic sound synth (Flap)
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    }
  };

  React.useEffect(() => {
    if (gameState === 'PLAYING') {
      if (birdRef.current) {
        birdRef.current.position.y = 0;
        birdRef.current.rotation.x = 0;
        velocity.current = 0;
      }
    }
  }, [gameState]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') handleJump();
      if (e.code === 'KeyM') setIsSpeedingUp(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyM') setIsSpeedingUp(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleJump);
    window.addEventListener('touchstart', handleJump);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleJump);
      window.removeEventListener('touchstart', handleJump);
    };
  }, [gameState, setIsSpeedingUp]);

  useFrame((state, delta) => {
    if (!birdRef.current) return;

    if (gameState === 'PLAYING') {
      velocity.current += GRAVITY;
      birdRef.current.position.y += velocity.current;

      // Rotation based on velocity
      birdRef.current.rotation.x = THREE.MathUtils.lerp(
        birdRef.current.rotation.x,
        -velocity.current * 5,
        0.1
      );

      // Wing flapping
      const flapSpeed = 20;
      if (leftWingRef.current) {
        leftWingRef.current.rotation.x = Math.sin(state.clock.elapsedTime * flapSpeed) * 0.8;
      }
      if (rightWingRef.current) {
        rightWingRef.current.rotation.x = -Math.sin(state.clock.elapsedTime * flapSpeed) * 0.8;
      }

      // Ground collision
      if (birdRef.current.position.y < -4.5 || birdRef.current.position.y > 6) {
        setGameState('GAME_OVER');
      }

      // Report position to socket (throttled)
      if (state.clock.elapsedTime - lastUpdate.current > 0.05) {
        const socket = getSocket();
        if (socket && socket.connected) {
          socket.emit('player:update', {
            position: { x: birdRef.current.position.x, y: birdRef.current.position.y, z: birdRef.current.position.z },
            rotation: { x: birdRef.current.rotation.x, y: birdRef.current.rotation.y, z: birdRef.current.rotation.z }
          });
        }
        lastUpdate.current = state.clock.elapsedTime;
      }
    } else if (gameState === 'START') {
        // Hover effect
        birdRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.5;
        birdRef.current.rotation.x = 0;
    }
  });

  return (
    <group ref={birdRef} position={[0, 0, 0]} name="bird-group">
      {/* Body */}
      <Sphere args={[0.5, 32, 32]} castShadow>
        <meshStandardMaterial color="#F7BC00" flatShading />
      </Sphere>
      
      {/* Eyes */}
      <group position={[0.3, 0.2, 0.3]}>
        <Sphere args={[0.08, 16, 16]}>
          <meshStandardMaterial color="black" />
        </Sphere>
      </group>
      <group position={[0.3, 0.2, -0.3]}>
        <Sphere args={[0.08, 16, 16]}>
          <meshStandardMaterial color="black" />
        </Sphere>
      </group>

      {/* Beak */}
      <group position={[0.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <Cone args={[0.15, 0.3, 16]}>
          <meshStandardMaterial color="#f97316" />
        </Cone>
      </group>

      {/* Wings */}
      <group ref={leftWingRef} position={[0, 0, 0.4]}>
        <Box args={[0.4, 0.1, 0.6]} position={[0, 0, 0.3]}>
           <meshStandardMaterial color="#fbbf24" flatShading />
        </Box>
      </group>
      <group ref={rightWingRef} position={[0, 0, -0.4]}>
        <Box args={[0.4, 0.1, 0.6]} position={[0, 0, -0.3]}>
           <meshStandardMaterial color="#fbbf24" flatShading />
        </Box>
      </group>

      {/* Tail */}
      <group position={[-0.45, 0, 0]} rotation={[0, 0, 0.2]}>
         <Box args={[0.3, 0.15, 0.5]}>
            <meshStandardMaterial color="#fbbf24" flatShading />
         </Box>
      </group>
    </group>
  );
};
