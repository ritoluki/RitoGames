"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Grid } from "@react-three/drei";
import {
  useLayoutEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import * as THREE from "three";

import { GRID_SIZE } from "@/lib/games/snakeLogic";
import type { SnakeGameRefState } from "@/lib/games/snakeTypes";

const MAX_SEGMENTS = GRID_SIZE * GRID_SIZE;
const cx = (GRID_SIZE - 1) / 2;

function BoardFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
      <planeGeometry args={[GRID_SIZE + 0.4, GRID_SIZE + 0.4]} />
      <meshStandardMaterial
        color="#0a0a12"
        metalness={0.15}
        roughness={0.85}
      />
    </mesh>
  );
}

function FoodOrb({ stateRef }: { stateRef: RefObject<SnakeGameRefState | null> }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const mesh = meshRef.current;
    const food = stateRef.current?.food;
    if (!mesh || !food) return;
    mesh.position.set(food.x - cx, 0.38, food.y - cx);
    const t = state.clock.elapsedTime;
    const pulse = 0.75 + 0.25 * Math.sin(t * 5);
    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 1.1 * pulse;
    mesh.scale.setScalar(0.92 + 0.08 * pulse);
  });

  return (
    <mesh ref={meshRef} castShadow>
      <sphereGeometry args={[0.38, 28, 28]} />
      <meshStandardMaterial
        color="#ff7a9a"
        emissive="#ff2d55"
        emissiveIntensity={1.1}
        metalness={0.25}
        roughness={0.35}
      />
    </mesh>
  );
}

function SnakePool({ stateRef }: { stateRef: RefObject<SnakeGameRefState | null> }) {
  const groupRef = useRef<THREE.Group>(null);
  const geom = useMemo(() => new THREE.BoxGeometry(0.86, 0.42, 0.86), []);
  const meshesRef = useRef<THREE.Mesh[]>([]);

  const pool = useMemo(() => {
    const out: THREE.Mesh[] = [];
    for (let i = 0; i < MAX_SEGMENTS; i += 1) {
      const mat = new THREE.MeshStandardMaterial({
        color: 0xc8f540,
        metalness: 0.25,
        roughness: 0.42,
        emissive: 0x000000,
        emissiveIntensity: 0,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.visible = false;
      mesh.position.y = 0.22;
      out.push(mesh);
    }
    return out;
  }, [geom]);

  useLayoutEffect(() => {
    const g = groupRef.current;
    if (!g) return;
    for (const m of pool) {
      g.add(m);
    }
    meshesRef.current = pool;
    return () => {
      for (const m of pool) {
        g.remove(m);
      }
    };
  }, [pool]);

  const colorTail = useMemo(() => new THREE.Color(0x3d5220), []);
  const colorHead = useMemo(() => new THREE.Color(0xd4ff4a), []);
  const emHead = useMemo(() => new THREE.Color(0x66aa22), []);

  useFrame((state) => {
    const meshes = meshesRef.current;
    const snake = stateRef.current?.snake;
    if (!snake) return;
    const n = snake.length;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < meshes.length; i += 1) {
      const mesh = meshes[i]!;
      if (i >= n) {
        mesh.visible = false;
        continue;
      }
      const seg = snake[i]!;
      mesh.visible = true;
      mesh.position.x = seg.x - cx;
      mesh.position.z = seg.y - cx;

      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (i === 0) {
        mat.color.copy(colorHead);
        mat.emissive.copy(emHead);
        mat.emissiveIntensity =
          0.45 + 0.12 * Math.sin(t * 7);
      } else {
        const u = i / Math.max(n - 1, 1);
        mat.color.lerpColors(colorTail, colorHead, u);
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
      }
    }
  });

  return <group ref={groupRef} />;
}

function Scene({ stateRef }: { stateRef: RefObject<SnakeGameRefState | null> }) {
  return (
    <>
      <color attach="background" args={["#06060c"]} />
      <fog attach="fog" args={["#06060c", 14, 38]} />

      <ambientLight intensity={0.35} />
      <directionalLight
        castShadow
        position={[8, 18, 10]}
        intensity={1.15}
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-6, 8, -4]} intensity={0.4} color="#7c5cfc" />
      <pointLight position={[0, 6, 0]} intensity={0.25} color="#c8f540" />

      <BoardFloor />

      <Grid
        position={[0, 0.001, 0]}
        args={[GRID_SIZE, GRID_SIZE]}
        cellSize={1}
        cellThickness={0.65}
        cellColor="#2a2a48"
        sectionSize={GRID_SIZE}
        sectionColor="#3d3d62"
        fadeDistance={42}
        fadeStrength={1}
        infiniteGrid={false}
      />

      <SnakePool stateRef={stateRef} />
      <FoodOrb stateRef={stateRef} />

      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.45}
        scale={GRID_SIZE * 1.2}
        blur={2.2}
        far={5}
      />
    </>
  );
}

export default function SnakeBoard3D({
  stateRef,
  className,
}: {
  stateRef: RefObject<SnakeGameRefState | null>;
  className?: string;
}) {
  return (
    <div className={className ?? "h-full min-h-[280px] w-full"}>
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        camera={{
          position: [11, 15.5, 13.5],
          fov: 42,
          near: 0.1,
          far: 80,
        }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0, 0);
        }}
      >
        <Scene stateRef={stateRef} />
      </Canvas>
    </div>
  );
}
