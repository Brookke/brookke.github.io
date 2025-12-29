import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import { Suspense, useEffect, useState } from "react";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

interface STLModelConfig {
  url: string;
  position?: [number, number, number];
  scale?: number;
  quantity?: number;
}

interface PhysicsSTLProps {
  config: STLModelConfig;
  delay: number;
  color: string;
}

// Generate a random pastel color
function generateRandomColor(): string {
  const hue = Math.random() * 360;
  const saturation = 60 + Math.random() * 20; // 60-80%
  const lightness = 65 + Math.random() * 15; // 65-80%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function PhysicsSTL({ config, delay, color }: PhysicsSTLProps) {
  const geometry = useLoader(STLLoader, config.url);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!isVisible) return null;

  const position = config.position || [
    (Math.random() - 0.5) * 0.3,
    5,
    (Math.random() - 0.5) * 0.3,
  ];

  const scale = config.scale || 1;

  return (
    <RigidBody
      position={position}
      colliders="cuboid"
      restitution={0.2}
      friction={0.3}
      linearDamping={0.5}
      angularDamping={0.5}
      canSleep={true}
    >
      <mesh geometry={geometry} scale={scale} castShadow receiveShadow>
        <meshStandardMaterial
          color={color}
          roughness={0.35}
          metalness={0.0}
          envMapIntensity={0.6}
        />
      </mesh>
    </RigidBody>
  );
}

function Ground() {
  return (
    <RigidBody type="fixed" colliders="cuboid" friction={0.4}>
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <boxGeometry args={[10, 0.5, 10]} />
        <meshStandardMaterial color="#b2b2b2ff" roughness={0.9} />
      </mesh>
    </RigidBody>
  );
}

export interface Props {
  models: STLModelConfig[];
  height?: string;
  backgroundColor?: string;
  enableReset?: boolean;
  dropDelay?: number;
  className?: string;
}

export default function STLPileViewer({
  models,
  height = "600px",
  backgroundColor = "rgba(0,0,0,0)",
  dropDelay = 200,
  className,
}: Props) {
  // Expand models based on quantity and randomize order
  const expandedModels = models.flatMap((model) => {
    const quantity = model.quantity || 1;
    return Array.from({ length: quantity }, () => ({
      ...model,
      color: generateRandomColor(),
    }));
  });

  // Shuffle the expanded models array
  const shuffledModels = [...expandedModels].sort(() => Math.random() - 0.5);

  return (
    <div style={{ position: "relative" }}>
      <div
        className={className}
        style={{
          width: "100%",
          maxWidth: "1200px",
          height,
          margin: "2rem auto",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <Canvas
          camera={{ position: [0, 3, 4], fov: 50 }}
          shadows
          style={{ background: backgroundColor }}
        >
          {/* <ambientLight intensity={0.1}  castShadow/> */}
          <directionalLight
            castShadow
            position={[10, 10, 10]}
            intensity={0.02}
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-10, -10, -10]} intensity={0.4} />
          <Environment preset="city" />

          <Suspense fallback={null}>
            <Physics gravity={[0, -9.81, 0]}>
              <Ground />
              {shuffledModels.map((model, index) => (
                <PhysicsSTL
                  config={model}
                  delay={index * dropDelay}
                  color={model.color}
                />
              ))}
            </Physics>
          </Suspense>

          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            autoRotate={false}
            enablePan={true}
            enableZoom={false}
            minDistance={3}
            maxDistance={15}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>
    </div>
  );
}
