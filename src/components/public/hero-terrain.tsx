"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useTheme } from "@/components/ui/theme-provider";

function TerrainMesh({ isDark }: { isDark: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const { geometry, positions } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(18, 12, 64, 42);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z =
        Math.sin(x * 0.55) * 0.7 +
        Math.cos(y * 0.7) * 0.55 +
        Math.sin((x + y) * 0.35) * 0.45 +
        Math.cos(x * 1.1) * 0.12;
      pos.setZ(i, z);
    }
    geo.computeVertexNormals();

    const pointPositions = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i += 1) {
      pointPositions[i * 3] = pos.getX(i);
      pointPositions[i * 3 + 1] = pos.getY(i);
      pointPositions[i * 3 + 2] = pos.getZ(i) + 0.08;
    }

    return { geometry: geo, positions: pointPositions };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.z = -0.35;
      meshRef.current.rotation.x = -0.95 + Math.sin(t * 0.18) * 0.04;
      meshRef.current.position.y = -0.4 + Math.sin(t * 0.22) * 0.06;
    }
    if (pointsRef.current && meshRef.current) {
      pointsRef.current.rotation.copy(meshRef.current.rotation);
      pointsRef.current.position.copy(meshRef.current.position);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.15;
      ringRef.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.04);
    }
  });

  const wire = isDark ? "#5BA8A8" : "#3F8F8F";
  const points = isDark ? "#FAFAFA" : "#0A0A0A";

  return (
    <group position={[2.2, 0.2, 0]}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshBasicMaterial color={wire} wireframe transparent opacity={0.85} />
      </mesh>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={points}
          size={0.045}
          sizeAttenuation
          transparent
          opacity={0.8}
        />
      </points>
      <mesh ref={ringRef} rotation={[-Math.PI / 2.4, 0, 0]} position={[0, 0.2, 0.6]}>
        <ringGeometry args={[3.2, 3.35, 64]} />
        <meshBasicMaterial color={wire} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

export function HeroTerrain() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 bg-gess-black" aria-hidden>
      {visible ? (
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 2.8, 8.5], fov: 42 }}
          gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
          style={{ width: "100%", height: "100%" }}
        >
          <color attach="background" args={[isDark ? "#0a0a0a" : "#fafafa"]} />
          <TerrainMesh isDark={isDark} />
        </Canvas>
      ) : null}
    </div>
  );
}
