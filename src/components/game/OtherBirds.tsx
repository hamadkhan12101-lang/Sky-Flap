import React from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cone, Box } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, PlayerData } from '../../store/useGameStore';

const OtherBird = ({ player }: { player: PlayerData }) => {
  const leftWingRef = React.useRef<THREE.Group>(null);
  const rightWingRef = React.useRef<THREE.Group>(null);

  useFrame((state) => {
    const flapSpeed = 20;
    if (leftWingRef.current) {
      leftWingRef.current.rotation.x = Math.sin(state.clock.elapsedTime * flapSpeed) * 0.8;
    }
    if (rightWingRef.current) {
      rightWingRef.current.rotation.x = -Math.sin(state.clock.elapsedTime * flapSpeed) * 0.8;
    }
  });

  return (
    <group 
      position={[player.position.x, player.position.y, player.position.z]}
      rotation={[player.rotation.x, player.rotation.y, player.rotation.z]}
    >
      {/* Body */}
      <Sphere args={[0.5, 32, 32]} castShadow>
        <meshStandardMaterial color={player.color} flatShading opacity={0.7} transparent />
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

      {/* Basic wings */}
      <group ref={leftWingRef} position={[0, 0, 0.4]}>
        <Box args={[0.4, 0.1, 0.6]} position={[0, 0, 0.3]}>
           <meshStandardMaterial color={player.color} flatShading opacity={0.7} transparent />
        </Box>
      </group>
      <group ref={rightWingRef} position={[0, 0, -0.4]}>
        <Box args={[0.4, 0.1, 0.6]} position={[0, 0, -0.3]}>
           <meshStandardMaterial color={player.color} flatShading opacity={0.7} transparent />
        </Box>
      </group>
    </group>
  );
};

export const OtherBirds = () => {
    const otherPlayers = useGameStore((state) => state.otherPlayers);
    return (
        <group>
            {Object.values(otherPlayers).map((player) => (
                <OtherBird key={player.id} player={player} />
            ))}
        </group>
    );
};
