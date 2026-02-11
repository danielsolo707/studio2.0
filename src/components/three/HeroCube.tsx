"use client"

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Environment, Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

/* ─────────────────────────────────────────────────────────
 * Rubik's-cube style 3×3×3 dark cube
 *
 * Each sub-cube gets one of 5 surface variants:
 *   0 — glossy black (polished obsidian)
 *   1 — dot-grid perforated metal
 *   2 — fine mesh / crosshatch
 *   3 — matte dark
 *   4 — brushed metal
 *
 * Heavy lerp rotation follows the mouse for a weighty feel.
 * Float from drei adds the weightless drift.
 * ───────────────────────────────────────────────────────── */

const LERP = 0.018;
const SUB_SIZE = 0.52;
const GAP = 0.56;
const RADIUS = 0.035;

/* ── Procedural texture generators (canvas-based, no assets) ── */

function createDotTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1a1a22';
  ctx.fillRect(0, 0, size, size);

  const dotRadius = 2.4;
  const spacing = 10;
  ctx.fillStyle = '#4a4a58';

  for (let x = spacing / 2; x < size; x += spacing) {
    for (let y = spacing / 2; y < size; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

function createGridTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#151518';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = '#3a3a48';
  ctx.lineWidth = 1;
  const step = 8;

  for (let i = 0; i <= size; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

function createBrushedTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1a1a20';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = '#2e2e38';
  ctx.lineWidth = 0.6;

  for (let y = 0; y < size; y += 2) {
    const offset = (Math.random() - 0.5) * 4;
    ctx.beginPath();
    ctx.moveTo(offset, y);
    ctx.lineTo(size + offset, y);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createSpeckleTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#161620';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 1200; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 1.4 + 0.3;
    const brightness = Math.floor(Math.random() * 50 + 35);
    ctx.fillStyle = `rgb(${brightness},${brightness},${brightness + 8})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/* ── Material variant type ── */
type MaterialVariant = 0 | 1 | 2 | 3 | 4;

/* ── Seeded assignment: which variant each sub-cube gets ── */
const VARIANT_MAP: MaterialVariant[] = [
  0, 1, 3, 2, 0, 4, 1, 3, 0,   // z=0 layer (front)
  4, 0, 1, 3, 2, 0, 0, 1, 4,   // z=1 layer (mid)
  1, 3, 0, 0, 4, 2, 3, 0, 1,   // z=2 layer (back)
];

/** Single sub-cube with its material variant */
function SubCube({
  position,
  variant,
  textures,
}: {
  position: [number, number, number];
  variant: MaterialVariant;
  textures: {
    dot: THREE.CanvasTexture;
    grid: THREE.CanvasTexture;
    brushed: THREE.CanvasTexture;
    speckle: THREE.CanvasTexture;
  };
}) {
  const material = useMemo(() => {
    switch (variant) {
      case 0: // Glossy reflective (like polished black glass)
        return (
          <meshPhysicalMaterial
            color="#1a1a24"
            metalness={0.85}
            roughness={0.05}
            clearcoat={1.0}
            clearcoatRoughness={0.03}
            envMapIntensity={2.5}
            reflectivity={1}
          />
        );
      case 1: // Dot perforated metal
        return (
          <meshStandardMaterial
            map={textures.dot}
            color="#252530"
            metalness={0.7}
            roughness={0.3}
            envMapIntensity={1.2}
          />
        );
      case 2: // Fine grid mesh
        return (
          <meshStandardMaterial
            map={textures.grid}
            color="#222230"
            metalness={0.6}
            roughness={0.35}
            envMapIntensity={1.0}
          />
        );
      case 3: // Matte dark grey
        return (
          <meshStandardMaterial
            color="#1e1e26"
            metalness={0.3}
            roughness={0.65}
            envMapIntensity={0.6}
          />
        );
      case 4: // Brushed / speckled metal
        return (
          <meshStandardMaterial
            map={textures.brushed}
            bumpMap={textures.speckle}
            bumpScale={0.02}
            color="#222230"
            metalness={0.65}
            roughness={0.38}
            envMapIntensity={1.0}
          />
        );
    }
  }, [variant, textures]);

  return (
    <RoundedBox
      args={[SUB_SIZE, SUB_SIZE, SUB_SIZE]}
      radius={RADIUS}
      smoothness={4}
      position={position}
    >
      {material}
    </RoundedBox>
  );
}

/** The 3×3×3 Rubik's assembly */
function RubiksCube() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const rot = useRef({ x: 0.45, y: -0.6 });

  // Create procedural textures once
  const textures = useMemo(() => ({
    dot: createDotTexture(),
    grid: createGridTexture(),
    brushed: createBrushedTexture(),
    speckle: createSpeckleTexture(),
  }), []);

  // Cleanup textures on unmount
  useEffect(() => {
    return () => {
      textures.dot.dispose();
      textures.grid.dispose();
      textures.brushed.dispose();
      textures.speckle.dispose();
    };
  }, [textures]);

  // Build 3×3×3 positions
  const cubes = useMemo(() => {
    const arr: { pos: [number, number, number]; variant: MaterialVariant }[] = [];
    let idx = 0;
    for (let z = 0; z < 3; z++) {
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          arr.push({
            pos: [(x - 1) * GAP, (y - 1) * GAP, (z - 1) * GAP],
            variant: VARIANT_MAP[idx % VARIANT_MAP.length],
          });
          idx++;
        }
      }
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Target: mouse influence + gentle auto-spin
    const tx = pointer.y * 0.4 + Math.sin(t * 0.1) * 0.12;
    const ty = pointer.x * 0.6 + t * 0.05;

    // Heavy lerp → weighty, cinematic feel
    rot.current.x += (tx - rot.current.x) * LERP;
    rot.current.y += (ty - rot.current.y) * LERP;

    groupRef.current.rotation.x = rot.current.x;
    groupRef.current.rotation.y = rot.current.y;
  });

  return (
    <Float
      speed={1.0}
      rotationIntensity={0.03}
      floatIntensity={0.3}
      floatingRange={[-0.08, 0.08]}
    >
      <group ref={groupRef}>
        {cubes.map((c, i) => (
          <SubCube
            key={i}
            position={c.pos}
            variant={c.variant}
            textures={textures}
          />
        ))}
      </group>
    </Float>
  );
}

/** Interactive 3D Rubik's cube canvas — hero section */
export function HeroCube() {
  return (
    <div
      className="w-full h-full"
      aria-hidden="true"
      style={{ pointerEvents: 'auto' }}
    >
      <Canvas
        camera={{ position: [5.5, 3.5, 5.0], fov: 28 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
        }}
        style={{ background: 'transparent' }}
      >
        {/* Ambient — enough to see the dark faces */}
        <ambientLight intensity={0.15} />

        {/* Key light — strong top-right, warm tone (dramatic like reference) */}
        <directionalLight
          position={[5, 8, 4]}
          intensity={2.5}
          color="#f0e8e0"
        />

        {/* Secondary key — front-left, softer */}
        <directionalLight
          position={[-3, 4, 5]}
          intensity={1.0}
          color="#d8d8e8"
        />

        {/* Fill — cool, from left to push shadow detail */}
        <directionalLight
          position={[-5, 0, -2]}
          intensity={0.5}
          color="#8090b0"
        />

        {/* Rim / edge highlight from behind-right */}
        <directionalLight
          position={[3, -1, -6]}
          intensity={0.8}
          color="#c0c8e0"
        />

        {/* Bottom bounce — subtle ground reflection */}
        <pointLight
          position={[0, -4, 0]}
          intensity={0.25}
          color="#2a2a3e"
          distance={10}
        />

        {/* Top accent spot */}
        <spotLight
          position={[2, 6, 2]}
          intensity={1.5}
          angle={0.5}
          penumbra={0.8}
          color="#e0dcd4"
          distance={15}
        />

        {/* Programmatic environment for reflections — no external HDR needed */}
        <Environment>
          <color attach="background" args={['#0a0a12']} />
          <mesh scale={50}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshBasicMaterial color="#141420" side={THREE.BackSide} />
          </mesh>
          {/* Emissive panels baked into env map for glossy reflections */}
          <mesh position={[5, 5, -3]}>
            <sphereGeometry args={[1.5, 16, 16]} />
            <meshBasicMaterial color="#556" />
          </mesh>
          <mesh position={[-4, 3, 4]}>
            <sphereGeometry args={[1.0, 16, 16]} />
            <meshBasicMaterial color="#445" />
          </mesh>
          <mesh position={[0, -5, 0]}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshBasicMaterial color="#222" />
          </mesh>
        </Environment>

        <RubiksCube />
      </Canvas>
    </div>
  );
}
