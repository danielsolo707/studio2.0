"use client"

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── Vertex shader: distorts sphere with noise ─── */
const vertexShader = `
  uniform float uTime;
  uniform float uHover;
  varying vec3 vNormal;
  varying vec3 vPosition;

  // Simplex 3D noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vNormal = normal;
    vPosition = position;

    float noise = snoise(position * 1.5 + uTime * 0.4) * (0.3 + uHover * 0.15);
    vec3 newPosition = position + normal * noise;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

/* ─── Fragment shader: acid-green iridescent surface ─── */
const fragmentShader = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    // Fresnel-like edge glow
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);

    // Base acid-green color
    vec3 acidGreen = vec3(0.875, 1.0, 0.0);
    vec3 deepBlack = vec3(0.01, 0.01, 0.02);

    // Iridescent shift
    float shift = sin(vPosition.y * 3.0 + uTime * 0.5) * 0.5 + 0.5;
    vec3 iridescent = mix(acidGreen, vec3(0.0, 0.8, 1.0), shift * 0.3);

    vec3 color = mix(deepBlack, iridescent, fresnel * 0.8);
    color += acidGreen * fresnel * 0.4;

    gl_FragColor = vec4(color, 0.85);
  }
`;

/** Animated blob mesh that reacts to mouse */
function Blob() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHover: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    uniforms.uTime.value = t;

    // Smooth hover response
    const target = Math.sqrt(pointer.x ** 2 + pointer.y ** 2) > 0.1 ? 1.0 : 0.0;
    uniforms.uHover.value += (target - uniforms.uHover.value) * 0.05;

    // Gentle mouse-follow rotation
    meshRef.current.rotation.x += (pointer.y * 0.3 - meshRef.current.rotation.x) * 0.02;
    meshRef.current.rotation.y += (pointer.x * 0.3 - meshRef.current.rotation.y) * 0.02;
    meshRef.current.rotation.z = Math.sin(t * 0.15) * 0.1;
  });

  return (
    <mesh ref={meshRef} scale={2.2}>
      <icosahedronGeometry args={[1, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

/** Full hero 3D blob canvas — rendered behind the hero text */
export function HeroBlob() {
  return (
    <div
      className="absolute inset-0 z-0"
      aria-hidden="true"
      style={{ pointerEvents: 'auto' }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Blob />
      </Canvas>
    </div>
  );
}
