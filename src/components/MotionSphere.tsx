
"use client"

import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import dynamic from 'next/dynamic';

function FloatingObjects({ mousePos, scrollProgress }: { 
  mousePos: { x: number; y: number };
  scrollProgress: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  // Pre-allocate THREE.Vector3 outside useFrame to avoid garbage collection
  const dirVector = useMemo(() => new THREE.Vector3(), []);
  
  const objects = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => {
      const type = i % 4; // 0: Keyframe, 1: Path, 2: Torus, 3: Icosahedron
      return {
        type,
        position: [
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 10
        ] as [number, number, number],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number],
        scale: 0.5 + Math.random() * 1.5,
        speed: 0.2 + Math.random() * 0.5,
        offset: Math.random() * 10,
        color: i % 2 === 0 ? "#BF00FF" : "#00F2FF"
      };
    });
  }, []);

  useFrame((state) => {
    if (!groupRef.current || !camera) return;
    const time = state.clock.getElapsedTime();

    // Camera tilt follow mouse
    camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, mousePos.x * 0.05, 0.05);
    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, -mousePos.y * 0.05, 0.05);

    const children = groupRef.current.children;
    if (!children || children.length === 0) return;

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const obj = objects[i];
      if (!obj || !child) continue;

      // Ambient Motion
      child.position.y += Math.sin(time * obj.speed + obj.offset) * 0.002;
      child.rotation.x += 0.01 * obj.speed;
      child.rotation.z += 0.005 * obj.speed;

      // Scroll Dispersal (Explosion)
      const dispersalFactor = scrollProgress * 20;
      const flyPastFactor = scrollProgress > 0.4 ? (scrollProgress - 0.4) * 80 : 0;
      
      dirVector.fromArray(obj.position).normalize();
      child.position.x = obj.position[0] + dirVector.x * dispersalFactor;
      child.position.y = obj.position[1] + dirVector.y * dispersalFactor;
      child.position.z = obj.position[2] + dirVector.z * flyPastFactor;
      
      child.rotation.y += scrollProgress * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {objects.map((obj, i) => {
        if (obj.type === 0) { // Keyframe (Octahedron)
          return (
            <mesh key={i} position={obj.position} rotation={obj.rotation} scale={obj.scale}>
              <octahedronGeometry args={[0.5, 0]} />
              <meshPhysicalMaterial 
                transmission={1} 
                thickness={0.5} 
                roughness={0} 
                color="#ffffff" 
                emissive={obj.color} 
                emissiveIntensity={0.5} 
              />
            </mesh>
          );
        } else if (obj.type === 1) { // Torus Wireframe
          return (
            <mesh key={i} position={obj.position} rotation={obj.rotation} scale={obj.scale}>
              <torusGeometry args={[0.4, 0.05, 16, 32]} />
              <meshStandardMaterial color={obj.color} wireframe emissive={obj.color} emissiveIntensity={2} />
            </mesh>
          );
        } else if (obj.type === 2) { // Torus Knot
          return (
            <mesh key={i} position={obj.position} rotation={obj.rotation} scale={obj.scale}>
              <torusKnotGeometry args={[0.3, 0.05, 64, 8]} />
              <meshStandardMaterial color={obj.color} emissive={obj.color} emissiveIntensity={5} />
            </mesh>
          );
        } else { // Icosahedron Wireframe
          return (
            <mesh key={i} position={obj.position} rotation={obj.rotation} scale={obj.scale}>
              <icosahedronGeometry args={[0.4, 0]} />
              <meshStandardMaterial color={obj.color} wireframe emissive={obj.color} emissiveIntensity={1} />
            </mesh>
          );
        }
      })}
    </group>
  );
}

function Scene({ mousePos, scrollProgress }: { 
  mousePos: { x: number; y: number };
  scrollProgress: number;
}) {
  return (
    <>
      <color attach="background" args={['#030305']} />
      <pointLight position={[-10, 5, 5]} color="#BF00FF" intensity={50} />
      <pointLight position={[10, -5, 5]} color="#00F2FF" intensity={50} />
      <ambientLight intensity={0.1} />
      <FloatingObjects mousePos={mousePos} scrollProgress={scrollProgress} />
    </>
  );
}

function MotionSphereInner({ mousePos, scrollProgress }: { 
  mousePos: { x: number; y: number };
  scrollProgress: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 bg-[#030305]">
      <Canvas 
        camera={{ position: [0, 0, 12], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          <Scene mousePos={mousePos} scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export const MotionSphereCanvas = dynamic(
  () => Promise.resolve({ default: MotionSphereInner }),
  { ssr: false }
);
