import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, Cloud, Clouds, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Bird } from './Bird';
import { Obstacles } from './Obstacles';
import { OtherBirds } from './OtherBirds';
import { useGameStore } from '../../store/useGameStore';

const Background = () => {
    const group = useRef<THREE.Group>(null);
    const { gameState } = useGameStore();

    useFrame((state, delta) => {
        if (group.current && gameState === 'PLAYING') {
            group.current.rotation.y += delta * 0.05;
        }
    });

    return (
        <group ref={group}>
            <Clouds material={THREE.MeshBasicMaterial}>
                <Cloud seed={1} bounds={[10, 2, 10]} volume={6} color="white" opacity={0.7} />
            </Clouds>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </group>
    );
};

const Floor = () => {
    return (
        <group position={[0, -10, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#DED895" />
            </mesh>
            {/* Grass border top */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <planeGeometry args={[100, 4]} />
                <meshStandardMaterial color="#73BF2E" />
            </mesh>
        </group>
    );
};

const GameLoop = () => {
  const { gameState, isSpeedingUp } = useGameStore();
  useFrame((state) => {
    if (gameState === 'GAME_OVER') {
        state.camera.position.x += (Math.random() - 0.5) * 0.1;
        state.camera.position.y += (Math.random() - 0.5) * 0.1;
        state.camera.lookAt(0, 0, 0);
    } else {
        const targetFOV = isSpeedingUp ? 55 : 45;
        if (state.camera instanceof THREE.PerspectiveCamera) {
            state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, targetFOV, 0.1);
            state.camera.updateProjectionMatrix();
        }

        state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, 0, 0.11);
        state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 0, 0.11);
        state.camera.lookAt(0, 0, 0);
    }
  });
  return null;
};

export const GameScene = () => {

  const { gameState } = useGameStore();
  
  return (
    <div className="w-full h-screen">
      <Canvas
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ position: [0, 0, 12], fov: 45 }}
        onCreated={({ gl }) => {
          gl.setClearColor('#4EC0CA');
        }}
      >
        <GameLoop />
        <Suspense fallback={null}>
          <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
          <ambientLight intensity={1.5} />
          <pointLight position={[10, 10, 10]} intensity={2} castShadow />
          <spotLight position={[0, 10, 0]} angle={0.15} penumbra={1} intensity={2} castShadow />
          
          <Background />
          <OtherBirds />
          <Bird />
          <Obstacles />
          <Floor />

          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
};
