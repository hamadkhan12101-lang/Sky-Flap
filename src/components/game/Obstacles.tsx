import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

const PIPE_WIDTH = 1.2;
const PIPE_DEPTH = 1.2;
const GAP_SIZE = 3.5;
const SPEED = 4.5;

interface PipeProps {
  index: number;
}

export const Pipe = ({ index }: PipeProps) => {
  const meshRef = useRef<THREE.Group>(null);
  const { gameState, incrementScore, setGameState, isSpeedingUp } = useGameStore();
  const passed = useRef(false);

  // Random height for the gap
  const heightOffset = useMemo(() => (Math.random() - 0.5) * 4, []);
  
  const initialX = 10 + index * 8;

  React.useEffect(() => {
    if (gameState === 'PLAYING') {
      if (meshRef.current) {
        meshRef.current.position.x = initialX;
        passed.current = false;
      }
    }
  }, [gameState, initialX]);

  useFrame((state, delta) => {
    if (!meshRef.current || gameState !== 'PLAYING') return;

    const currentSpeed = isSpeedingUp ? SPEED * 2.5 : SPEED;
    meshRef.current.position.x -= currentSpeed * delta;

    // Reset pipe when offscreen
    if (meshRef.current.position.x < -15) {
      meshRef.current.position.x += 32; // Loop back
      passed.current = false;
      // Should ideally randomize height here too, but for simplicity we keep it or use a more complex system
    }

    // Score detection
    if (!passed.current && meshRef.current.position.x < 0) {
      passed.current = true;
      incrementScore();
      
      // Point sound
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    }

    // Collision detection (very basic bounding box check)
    // Bird is at x=0, z=0. Y is between -5 and 5 approx.
    const birdY = state.scene.getObjectByName('bird-group')?.position.y || 0;
    const pipeX = meshRef.current.position.x;
    
    if (Math.abs(pipeX) < 0.8) {
      if (birdY > heightOffset + GAP_SIZE / 2 || birdY < heightOffset - GAP_SIZE / 2) {
        setGameState('GAME_OVER');
      }
    }
  });

  return (
    <group ref={meshRef} position={[initialX, heightOffset, 0]}>
      {/* Top Pipe */}
      <group position={[0, 6, 0]}>
        <Cylinder args={[PIPE_WIDTH / 2, PIPE_WIDTH / 2, 8, 32]} castShadow>
          <meshStandardMaterial color="#73BF2E" flatShading roughness={0.3} metalness={0.2} />
        </Cylinder>
        {/* Cap */}
        <Cylinder args={[PIPE_WIDTH / 2 + 0.1, PIPE_WIDTH / 2 + 0.1, 0.5, 32]} position={[0, -4, 0]}>
           <meshStandardMaterial color="#558022" />
        </Cylinder>
      </group>

      {/* Bottom Pipe */}
      <group position={[0, -6, 0]}>
        <Cylinder args={[PIPE_WIDTH / 2, PIPE_WIDTH / 2, 8, 32]} castShadow>
          <meshStandardMaterial color="#73BF2E" flatShading roughness={0.3} metalness={0.2} />
        </Cylinder>
        {/* Cap */}
        <Cylinder args={[PIPE_WIDTH / 2 + 0.1, PIPE_WIDTH / 2 + 0.1, 0.5, 32]} position={[0, 4, 0]}>
           <meshStandardMaterial color="#558022" />
        </Cylinder>
      </group>
    </group>
  );
};

export const Obstacles = () => {
    return (
        <group>
            <Pipe index={0} />
            <Pipe index={1} />
            <Pipe index={2} />
            <Pipe index={3} />
        </group>
    );
}
