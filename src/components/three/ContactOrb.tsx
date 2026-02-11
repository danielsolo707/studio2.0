"use client"

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── Pulsing energy orb for the contact section ─── */

const vertexShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vNormal = normal;
    vPosition = position;

    // Subtle breathing
    float scale = 1.0 + sin(uTime * 1.5) * 0.05;
    vec3 pos = position * scale;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.5);

    vec3 acidGreen = vec3(0.875, 1.0, 0.0);
    vec3 white = vec3(1.0);
    vec3 dark = vec3(0.0, 0.02, 0.04);

    // Animated energy bands
    float bands = sin(vPosition.y * 8.0 - uTime * 2.0) * 0.5 + 0.5;
    bands *= sin(vPosition.x * 6.0 + uTime * 1.5) * 0.5 + 0.5;

    vec3 color = mix(dark, acidGreen, fresnel * 0.9);
    color += acidGreen * bands * 0.15;
    color += white * pow(fresnel, 5.0) * 0.3;

    float alpha = fresnel * 0.7 + bands * 0.1 + 0.1;

    gl_FragColor = vec4(color, alpha);
  }
`;

/** Inner energy core — brighter */
function Core() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.5;
    meshRef.current.rotation.z = t * 0.3;
    const s = 0.4 + Math.sin(t * 2) * 0.05;
    meshRef.current.scale.setScalar(s);
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 2]} />
      <meshBasicMaterial color="#DFFF00" wireframe transparent opacity={0.4} />
    </mesh>
  );
}

/** Outer shell */
function Shell() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    uniforms.uTime.value = t;

    // Mouse influence
    meshRef.current.rotation.x += (pointer.y * 0.5 - meshRef.current.rotation.x) * 0.03;
    meshRef.current.rotation.y += (pointer.x * 0.5 - meshRef.current.rotation.y) * 0.03;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/** Orbiting ring particles */
function OrbitalRing() {
  const groupRef = useRef<THREE.Group>(null);

  const particles = useMemo(() => {
    const count = 60;
    const arr: { angle: number; radius: number; speed: number; size: number }[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        angle: (i / count) * Math.PI * 2,
        radius: 1.5 + Math.random() * 0.3,
        speed: 0.3 + Math.random() * 0.2,
        size: 0.015 + Math.random() * 0.02,
      });
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z = state.clock.getElapsedTime() * 0.1;
  });

  return (
    <group ref={groupRef} rotation={[Math.PI * 0.3, 0, 0]}>
      {particles.map((p, i) => (
        <OrbitalParticle key={i} {...p} index={i} />
      ))}
    </group>
  );
}

function OrbitalParticle({
  angle,
  radius,
  speed,
  size,
  index,
}: {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  index: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() * speed + angle;
    meshRef.current.position.x = Math.cos(t) * radius;
    meshRef.current.position.y = Math.sin(t) * radius;
    meshRef.current.position.z = Math.sin(t * 2) * 0.15;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial color="#DFFF00" transparent opacity={0.6} />
    </mesh>
  );
}

/** Contact section 3D orb canvas */
export function ContactOrb() {
  return (
    <div
      className="w-64 h-64 md:w-80 md:h-80"
      aria-hidden="true"
      style={{ pointerEvents: 'auto' }}
    >
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Shell />
        <Core />
        <OrbitalRing />
      </Canvas>
    </div>
  );
}
