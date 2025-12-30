import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Center, Environment } from "@react-three/drei";
import { Suspense } from "react";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

interface STLModelProps {
  url: string;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  color?: string;
}

function STLModel({
  url,
  rotationX = 0,
  rotationY = 0,
  rotationZ = 0,
  color = "#a9a9a9ff",
}: STLModelProps) {
  const geometry = useLoader(STLLoader, url);

  return (
    <Center>
      <mesh
        geometry={geometry}
        rotation={[rotationX, rotationY, rotationZ]}
        scale={1.5}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={color}
          roughness={0.35}
          metalness={0.0}
          envMapIntensity={0.3}
        />
      </mesh>
    </Center>
  );
}

export interface Props {
  modelPath: string;
  height?: string;
  cameraDistance?: number;
  cameraHeight?: number;
  autoRotate?: boolean;
  backgroundColor?: string;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  className?: string;
  color?: string;
  aspectRatio?: string;
}

export default function STLViewer({
  modelPath,
  aspectRatio = "1 / 1",
  cameraDistance = 2,
  cameraHeight = 45,
  autoRotate = true,
  backgroundColor = "rgba(0,0,0,0)",
  rotationX = 0,
  rotationY = 0,
  rotationZ = 0,
  className,
  color = "#a9a9a9ff",
}: Props) {
  return (
    <div
      className={className}
      style={{
        width: "100%",
        aspectRatio: aspectRatio,
        margin: "2rem auto",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <Canvas
        camera={{ position: [20, cameraHeight, cameraDistance], fov: 50 }}
        shadows
        style={{ background: backgroundColor }}
      >
        {/* <ambientLight intensity={4} /> */}
        <directionalLight
          castShadow
          position={[20, cameraHeight, cameraDistance]}
          intensity={1}
        />
        {/* <directionalLight position={[-1, -1, -1]} intensity={0.3} /> */}
        <Environment preset="city" />

        <Suspense fallback={null}>
          <STLModel
            url={modelPath}
            rotationX={rotationX}
            rotationY={rotationY}
            rotationZ={rotationZ}
            color={color}
          />
        </Suspense>

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          autoRotate={autoRotate}
          autoRotateSpeed={2.0}
          enablePan={false}
          enableZoom={false}
        />
      </Canvas>
    </div>
  );
}
