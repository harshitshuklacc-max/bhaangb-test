"use client";

import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, OrbitControls, Sphere } from "@react-three/drei";

function FloatingShapes() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <Float speed={2} rotationIntensity={0.4} floatIntensity={1.2}>
        <Sphere args={[1.2, 64, 64]} position={[-1.5, 0.2, 0]}>
          <MeshDistortMaterial
            color="#e31e24"
            attach="material"
            distort={0.35}
            speed={2}
            roughness={0.2}
          />
        </Sphere>
      </Float>
      <Float speed={1.5} rotationIntensity={0.6} floatIntensity={1}>
        <mesh position={[1.8, -0.3, -0.5]} rotation={[0.4, 0.6, 0.2]}>
          <boxGeometry args={[1.4, 1.4, 1.4]} />
          <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.25} />
        </mesh>
      </Float>
      <Float speed={2.5} floatIntensity={0.8}>
        <mesh position={[0, 1.2, -1]}>
          <torusGeometry args={[0.9, 0.25, 32, 64]} />
          <meshStandardMaterial color="#ff6b6b" wireframe />
        </mesh>
      </Float>
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} />
    </>
  );
}

export default function HeroScene() {
  return (
    <div className="h-[320px] w-full md:h-[420px]">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <FloatingShapes />
      </Canvas>
    </div>
  );
}
