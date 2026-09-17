import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import React from 'react'

export const RedCar = React.memo(() => {
  const carRef = useRef<any>(null)

  const clockRef = useRef({ time: 0 })

  useFrame((_state, delta) => {
    if (!carRef.current) return
    clockRef.current.time += delta
    // Red car moves slightly ahead of player
    carRef.current.position.z = 10 + Math.sin(clockRef.current.time * 2) * 0.5
  })

  return (
    <group ref={carRef} position={[0, 0.3, 10]}>
      {/* Main body - red sports car */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.2, 0.35, 3.0]} />
        <meshStandardMaterial color="#cc0000" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Hood - angled front */}
      <mesh position={[0, 0.35, 1.0]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[1.0, 0.15, 1.2]} />
        <meshStandardMaterial color="#aa0000" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Cockpit - low profile */}
      <mesh position={[0, 0.5, 0.2]}>
        <boxGeometry args={[0.8, 0.3, 1.2]} />
        <meshStandardMaterial color="#880000" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Windshield */}
      <mesh position={[0, 0.55, 0.6]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[0.75, 0.2, 0.4]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.1} metalness={0.8} transparent opacity={0.7} />
      </mesh>

      {/* Rear window */}
      <mesh position={[0, 0.55, -0.2]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.75, 0.2, 0.3]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.1} metalness={0.8} transparent opacity={0.7} />
      </mesh>

      {/* Front spoiler */}
      <mesh position={[0, 0.08, 1.5]}>
        <boxGeometry args={[1.4, 0.08, 0.4]} />
        <meshStandardMaterial color="#aa0000" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Rear wing - high and angular */}
      <mesh position={[0, 0.6, -1.3]}>
        <boxGeometry args={[1.3, 0.08, 0.3]} />
        <meshStandardMaterial color="#aa0000" roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh position={[-0.5, 0.4, -1.3]}>
        <boxGeometry args={[0.08, 0.25, 0.15]} />
        <meshStandardMaterial color="#aa0000" roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh position={[0.5, 0.4, -1.3]}>
        <boxGeometry args={[0.08, 0.25, 0.15]} />
        <meshStandardMaterial color="#aa0000" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Side skirts */}
      <mesh position={[-0.65, 0.1, 0]}>
        <boxGeometry args={[0.1, 0.15, 2.5]} />
        <meshStandardMaterial color="#aa0000" roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh position={[0.65, 0.1, 0]}>
        <boxGeometry args={[0.1, 0.15, 2.5]} />
        <meshStandardMaterial color="#aa0000" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Front left wheel */}
      <mesh position={[-0.65, 0.15, 1.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 0.25, 16]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Front left wheel rim */}
      <mesh position={[-0.65, 0.15, 1.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.26, 8]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={0.5} />
      </mesh>

      {/* Front right wheel */}
      <mesh position={[0.65, 0.15, 1.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 0.25, 16]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Front right wheel rim */}
      <mesh position={[0.65, 0.15, 1.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.26, 8]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={0.5} />
      </mesh>

      {/* Rear left wheel */}
      <mesh position={[-0.65, 0.15, -1.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.28, 0.28, 0.28, 16]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Rear left wheel rim */}
      <mesh position={[-0.65, 0.15, -1.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 0.29, 8]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={0.5} />
      </mesh>

      {/* Rear right wheel */}
      <mesh position={[0.65, 0.15, -1.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.28, 0.28, 0.28, 16]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Rear right wheel rim */}
      <mesh position={[0.65, 0.15, -1.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 0.29, 8]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={0.5} />
      </mesh>

      {/* Tail lights - prominent red glow */}
      <mesh position={[-0.4, 0.3, -1.45]}>
        <boxGeometry args={[0.2, 0.08, 0.05]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={4} />
      </mesh>
      <mesh position={[0.4, 0.3, -1.45]}>
        <boxGeometry args={[0.2, 0.08, 0.05]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={4} />
      </mesh>

      {/* Headlights */}
      <mesh position={[-0.35, 0.2, 1.5]}>
        <boxGeometry args={[0.15, 0.06, 0.05]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.35, 0.2, 1.5]}>
        <boxGeometry args={[0.15, 0.06, 0.05]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
      </mesh>
    </group>
  )
})
