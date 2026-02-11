"use client"

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 300;

/** GPU-optimized floating particles that react to mouse + scroll */
function Particles() {
  const pointsRef = useRef<THREE.Points>(null);
  const { pointer, size } = useThree();
  const mouseTarget = useRef(new THREE.Vector2(0, 0));

  const { positions, velocities, sizes } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 30;
      positions[i3 + 1] = (Math.random() - 0.5) * 30;
      positions[i3 + 2] = (Math.random() - 0.5) * 15;

      velocities[i3] = (Math.random() - 0.5) * 0.01;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.01;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.005;

      sizes[i] = Math.random() * 3 + 0.5;
    }

    return { positions, velocities, sizes };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [positions, sizes]);

  useFrame(() => {
    if (!pointsRef.current) return;

    // Smooth mouse follow
    mouseTarget.current.lerp(
      new THREE.Vector2(pointer.x * 2, pointer.y * 2),
      0.05
    );

    const posAttr = pointsRef.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Float with velocity
      arr[i3] += velocities[i3];
      arr[i3 + 1] += velocities[i3 + 1];
      arr[i3 + 2] += velocities[i3 + 2];

      // Mouse repulsion
      const dx = arr[i3] - mouseTarget.current.x * 5;
      const dy = arr[i3 + 1] - mouseTarget.current.y * 5;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 4) {
        const force = (4 - dist) * 0.003;
        arr[i3] += (dx / dist) * force;
        arr[i3 + 1] += (dy / dist) * force;
      }

      // Wrap around edges
      if (arr[i3] > 15) arr[i3] = -15;
      if (arr[i3] < -15) arr[i3] = 15;
      if (arr[i3 + 1] > 15) arr[i3 + 1] = -15;
      if (arr[i3 + 1] < -15) arr[i3 + 1] = 15;
      if (arr[i3 + 2] > 7.5) arr[i3 + 2] = -7.5;
      if (arr[i3 + 2] < -7.5) arr[i3 + 2] = 7.5;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uColor: { value: new THREE.Color(0.875, 1.0, 0.0) },
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        }}
        vertexShader={`
          attribute float aSize;
          uniform float uPixelRatio;
          varying float vAlpha;

          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * uPixelRatio * (150.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;

            // Fade by depth
            vAlpha = smoothstep(-10.0, 0.0, mvPosition.z) * 0.6;
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          varying float vAlpha;

          void main() {
            // Soft circle
            float d = length(gl_PointCoord - vec2(0.5));
            if (d > 0.5) discard;

            float alpha = smoothstep(0.5, 0.1, d) * vAlpha;
            gl_FragColor = vec4(uColor, alpha);
          }
        `}
      />
    </points>
  );
}

/** Faint connecting lines between nearby particles */
function ConnectionLines() {
  const lineRef = useRef<THREE.LineSegments>(null);

  return null; // Lines are optional — keeps it minimal
}

/** Full-page floating particles background */
export function FloatingParticles() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Particles />
      </Canvas>
    </div>
  );
}
