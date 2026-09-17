import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useGameStore } from '../store/gameStore'
import * as THREE from 'three'

const LANE_POSITIONS = [-3.5, 0, 3.5]

useGLTF.preload('/models/car.glb')
const TEAM_CONFIGS = {
  A: {
    primary: '#DC0000', // Ferrari
    secondary: '#111111',
  },

  B: {
    primary: '#0800efc9', // Red Bull
    secondary: '#201c04',
  },

  C: {
    primary: '#00A19B', // Aston Martin
    secondary: '#111111',
  },

  D: {
    primary: '#1e1d03', // McLaren
    secondary: '#111111',
  },

  E: {
    primary: '#10f4dd', // Mercedes
    secondary: '#111111',
  },

  F: {
    primary: '#FF87BC', // Alpine BWT
    secondary: '#0090FF',
  },

  G: {
    primary: '#bec1be', // RB Visa
    secondary: '#FFFFFF',
  },

  H: {
    primary: '#00E701', // Sauber
    secondary: '#111111',
  },
}

interface ObstacleData {
  id: number
  lane: number
  z: number
carType: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'}

/*
PREVIOUS TEAM CONFIGS KEPT FOR LATER

const TEAM_CONFIGS = {
  A: { body: '#C0C0C0', emissive: '#888888', light: '#aaaaaa', tail: '#ff0000', under: '#555555' },
  B: { body: '#1a1aff', emissive: '#0000aa', light: '#0000cc', tail: '#ff0000', under: '#000088' },
  C: { body: '#cc4400', emissive: '#881100', light: '#aa3300', tail: '#ff0000', under: '#441100' },
}
*/

const ObstacleCar = ({
  lane,
  z,
  carType,
}: {
  lane: number
  z: number
  carType: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'
}) => {
  const meshRef = useRef<any>(null)

  const { scene } = useGLTF('/models/car.glb')

  const cloned = useMemo(() => {
    const c = scene.clone(true)

    const cfg = TEAM_CONFIGS[carType]

    c.traverse((node: any) => {
      if (!node.isMesh) return

      node.castShadow = true
      node.receiveShadow = true

      node.material = node.material.clone()

      node.material.roughness = 1
node.material.metalness = 0.15

// brighten only car materials
if (node.material.color) {
  node.material.color.multiplyScalar(4)
}
      const name = node.name.toLowerCase()

      // Main body color
      if (node.material.color) {
        node.material.color.set(cfg.primary)
      }

      // Wheels + aero parts
      if (
        name.includes('wheel') ||
        name.includes('tire') ||
        name.includes('tyre') ||
        name.includes('wing') ||
        name.includes('spoiler') ||
        name.includes('floor')
      ) {
        node.material.color.set(cfg.secondary)
      }

      node.material.needsUpdate = true
    })

    return c
  }, [scene, carType])

  return (
    <group
      ref={meshRef}
      position={[LANE_POSITIONS[lane], 0.8, z]}
      rotation={[0, -Math.PI, 0]}
      scale={[0.5, 0.5, 0.5]}
    >
      {/* Car-only lighting 
      */}
      <pointLight
        position={[0, 3, 0]}
        intensity={5}
        color="#ffffff71"
        distance={8}
      />

      <primitive object={cloned} />
    </group>
  )
}

export const Obstacles = () => {
  const [obstacles, setObstacles] = useState<ObstacleData[]>([])

  const obstacleIdRef = useRef(0)

  const obstacleSpeed = useGameStore(
    (state: any) => state.obstacleSpeed
  )

  const playerLane = useGameStore(
    (state: any) => state.playerLane
  )

  const loseLife = useGameStore(
    (state: any) => state.loseLife
  )

  const incrementDodgeCount = useGameStore(
    (state: any) => state.incrementDodgeCount
  )

  const collisionCooldownRef = useRef(false)

const carTypes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const
  useEffect(() => {
    const initialObstacles: ObstacleData[] = [
      {
        id: obstacleIdRef.current++,
        lane: playerLane,
        z: -20,
        carType:
          carTypes[Math.floor(Math.random() * carTypes.length)],
      },
      {
        id: obstacleIdRef.current++,
        lane: [0, 1, 2].filter(l => l !== playerLane)[0],
        z: -40,
        carType:
          carTypes[Math.floor(Math.random() * carTypes.length)],
      },
    ]

    setObstacles(initialObstacles)
    obstaclesRef.current = initialObstacles
  }, [])

  const obstaclesRef = useRef<ObstacleData[]>([])

  const lastUpdateTimeRef = useRef(0)

  useFrame((_state, delta) => {
    const now = performance.now()

    if (now - lastUpdateTimeRef.current > 16) {
      lastUpdateTimeRef.current = now

      obstaclesRef.current = obstaclesRef.current.map(obs => ({
        ...obs,
        z: obs.z + obstacleSpeed * delta,
      }))

      obstaclesRef.current.forEach(obs => {
        if (
          obs.z > 4 &&
          obs.z < 8 &&
          obs.lane === playerLane &&
          !collisionCooldownRef.current
        ) {
          collisionCooldownRef.current = true

          loseLife()

          setTimeout(() => {
            collisionCooldownRef.current = false
          }, 500)
        }

        if (
          obs.z > 8 &&
          obs.z < 8.5 &&
          obs.lane !== playerLane
        ) {
          incrementDodgeCount()
        }
      })

      obstaclesRef.current = obstaclesRef.current.map(obs => {
        if (obs.z > 10) {
          const carType =
            carTypes[Math.floor(Math.random() * carTypes.length)]

          const lane =
            obs.id % 2 === 0
              ? playerLane
              : [0, 1, 2]
                  .filter(l => l !== playerLane)
                  [Math.floor(Math.random() * 2)]

          return {
            ...obs,
            lane,
            z: obs.id % 2 === 0 ? -30 : -50,
            carType,
          }
        }

        return obs
      })

      setObstacles([...obstaclesRef.current])
    }
  })

  return (
    <group>
      {obstacles.map(obs => (
        <ObstacleCar
          key={obs.id}
          lane={obs.lane}
          z={obs.z}
          carType={obs.carType}
        />
      ))}
    </group>
  )
  
}