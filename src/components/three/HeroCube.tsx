"use client"

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, RoundedBox } from '@react-three/drei';
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
            metalness={0.75}
            roughness={0.16}
            clearcoat={0.8}
            clearcoatRoughness={0.12}
            envMapIntensity={1.6}
            reflectivity={0.6}
          />
        );
      case 1: // Dot perforated metal
        return (
          <meshStandardMaterial
            map={textures.dot}
            color="#252530"
            metalness={0.65}
            roughness={0.38}
            envMapIntensity={0.9}
          />
        );
      case 2: // Fine grid mesh
        return (
          <meshStandardMaterial
            map={textures.grid}
            color="#222230"
            metalness={0.55}
            roughness={0.42}
            envMapIntensity={0.85}
          />
        );
      case 3: // Matte dark grey
        return (
          <meshStandardMaterial
            color="#1e1e26"
            metalness={0.25}
            roughness={0.7}
            envMapIntensity={0.5}
          />
        );
      case 4: // Brushed / speckled metal
        return (
          <meshStandardMaterial
            map={textures.brushed}
            bumpMap={textures.speckle}
            bumpScale={0.02}
            color="#222230"
            metalness={0.6}
            roughness={0.45}
            envMapIntensity={0.85}
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

/** Build 3 layers along X, each with 9 sub‑cubes (Y × Z) */
function buildLayers() {
  const layers: { pos: [number, number, number]; variant: MaterialVariant }[][] = [[], [], []];
  let idx = 0;
  for (let x = 0; x < 3; x++)
    for (let y = 0; y < 3; y++)
      for (let z = 0; z < 3; z++) {
        layers[x].push({
          pos: [(x - 1) * GAP, (y - 1) * GAP, (z - 1) * GAP],
          variant: VARIANT_MAP[idx],
        });
        idx++;
      }
  return layers;
}

/** The 3×3×3 Rubik's assembly with layer‑flip animation + drag rotation */
function RubiksCube({ paused = false }: { paused?: boolean }) {
  const textures = useMemo(() => ({
    dot: createDotTexture(),
    grid: createGridTexture(),
    brushed: createBrushedTexture(),
    speckle: createSpeckleTexture(),
  }), []);
  const layersData = useMemo(() => buildLayers(), []);

  const outerRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const layerRefs = useRef<(THREE.Group | null)[]>([null, null, null]);
  const targetX = useRef([0, 0, 0]);
  const flipTimer = useRef(0);
  const nextDelay = useRef(2000 + Math.random() * 2000);
  const isDragging = useRef(false);
  const prevPointer = useRef({ x: 0, y: 0 });

  // Drag rotation (window‑level) — desktop only
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isTouchDevice = window.matchMedia('(hover: none)').matches;
    if (isTouchDevice) return;

    const onDown = (e: MouseEvent) => {
      isDragging.current = true;
      prevPointer.current = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current || !outerRef.current) return;
      const dx = e.clientX - prevPointer.current.x;
      const dy = e.clientY - prevPointer.current.y;
      prevPointer.current = { x: e.clientX, y: e.clientY };
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(dy * 0.008, dx * 0.008, 0, 'XYZ'));
      outerRef.current.quaternion.premultiply(q);
    };
    const onUp = () => { isDragging.current = false; };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (paused) return;
    const dt = Math.min(delta, 0.05);

    // Gentle auto‑rotation
    if (innerRef.current) {
      innerRef.current.rotation.x += dt * 0.08;
      innerRef.current.rotation.y += dt * 0.12;
      innerRef.current.rotation.z += dt * 0.04;
    }

    if (outerRef.current && !isDragging.current) {
      outerRef.current.rotation.x += (state.pointer.y * 0.4 - outerRef.current.rotation.x) * 0.02;
      outerRef.current.rotation.y += (state.pointer.x * 0.5 - outerRef.current.rotation.y) * 0.02;
    }

    // Lerp each layer towards target rotation on X
    layerRefs.current.forEach((layer, i) => {
      if (!layer) return;
      layer.rotation.x += (targetX.current[i] - layer.rotation.x) * 0.05;
    });

    // Trigger next layer flip
    flipTimer.current += dt * 1000;
    if (flipTimer.current >= nextDelay.current) {
      flipTimer.current = 0;
      nextDelay.current = 2000 + Math.random() * 3000;

      // Rotate inner wrapper 90° so a different face is shown
      if (innerRef.current) {
        if (Math.random() > 0.5) innerRef.current.rotateY(Math.PI / 2);
        else innerRef.current.rotateZ(Math.PI / 2);
      }

      // Flip a random layer 180°
      const li = Math.floor(Math.random() * 3);
      targetX.current[li] += Math.random() > 0.5 ? Math.PI : -Math.PI;
    }
  });

  // Texture cleanup
  useEffect(() => {
    return () => { Object.values(textures).forEach((t) => t.dispose()); };
  }, [textures]);

  return (
    <group ref={outerRef}>
      <group ref={innerRef}>
        {layersData.map((layer, i) => (
          <group key={i} ref={(el) => { layerRefs.current[i] = el; }}>
            {layer.map((c, j) => (
              <SubCube key={j} position={c.pos} variant={c.variant} textures={textures} />
            ))}
          </group>
        ))}
      </group>
    </group>
  );
}

/** Interactive 3D Rubik's cube canvas — hero section */
export function HeroCube({ paused = false }: { paused?: boolean }) {
  return (
    <div
      className="w-full h-full"
      aria-hidden="true"
      style={{ pointerEvents: 'auto' }}
    >
      <Canvas
        camera={{ position: [5.5, 3.5, 5.0], fov: 28 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.25,
        }}
        frameloop={paused ? 'never' : 'always'}
        style={{ background: 'transparent' }}
      >
        <fog attach="fog" args={['#050507', 7, 16]} />
        {/* Ambient — enough to see the dark faces */}
        <ambientLight intensity={0.25} />

        {/* Key light — strong top-right, warm tone (dramatic like reference) */}
        <directionalLight
          position={[5, 8, 4]}
          intensity={2.2}
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
            <meshBasicMaterial color="#2f313b" />
          </mesh>
          <mesh position={[-4, 3, 4]}>
            <sphereGeometry args={[1.0, 16, 16]} />
            <meshBasicMaterial color="#2a2c36" />
          </mesh>
        </Environment>

        <RubiksCube paused={paused} />

        {/* Soft fake shadow — cheap radial gradient plane, no ReadPixels stall */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, 0]}>
          <circleGeometry args={[2.4, 32]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.35} />
        </mesh>
      </Canvas>
    </div>
  );
}
