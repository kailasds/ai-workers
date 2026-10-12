import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// A rim-lit atmosphere: bright at the silhouette, clear at the centre, so the core reads as a sphere.
const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`
const atmosphereFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float rim = pow(1.0 - max(dot(vNormal, vView), 0.0), uPower);
    float pulse = 0.85 + 0.15 * sin(uTime * 1.6);
    gl_FragColor = vec4(uColor, rim * pulse);
  }
`

export const BRAIN_Y = 3
export const BRAIN_R = 1.6

/** The platform brain: shared knowledge every Worker draws on. */
export function Brain({ animate, onSelect }: { animate: boolean; onSelect: () => void }) {
  const lattice = useRef<THREE.Mesh>(null)
  const neurons = useRef<THREE.Points>(null)
  const core = useRef<THREE.Mesh>(null)
  const atmosphere = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertex,
        fragmentShader: atmosphereFragment,
        uniforms: { uColor: { value: new THREE.Color('#7dd3fc') }, uPower: { value: 2.6 }, uTime: { value: 0 } },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.BackSide,
      }),
    [],
  )
  const neuronGeometry = useMemo(() => {
    const n = 520
    const pos = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      // Fibonacci sphere: an even shell of points around the core.
      const y = 1 - (i / (n - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const t = i * Math.PI * (3 - Math.sqrt(5))
      const R = BRAIN_R + 0.55 + ((i * 7919) % 100) / 400
      pos.set([Math.cos(t) * r * R, y * R, Math.sin(t) * r * R], i * 3)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])

  useFrame((state, dt) => {
    atmosphere.uniforms.uTime.value = state.clock.elapsedTime
    if (!animate) return
    if (lattice.current) lattice.current.rotation.y += dt * 0.12
    if (neurons.current) {
      neurons.current.rotation.y -= dt * 0.05
      neurons.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.15
    }
    if (core.current) core.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.015)
  })

  return (
    <group>
      {/* the pad it stands on */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.02}>
        <circleGeometry args={[3.6, 64]} />
        <meshStandardMaterial color="#0b1430" roughness={0.6} metalness={0.2} />
      </mesh>
      {[2.2, 2.9, 3.5].map((r, i) => (
        <mesh key={r} rotation-x={-Math.PI / 2} position-y={0.04}>
          <ringGeometry args={[r - 0.04, r, 96]} />
          <meshBasicMaterial color="#7dd3fc" transparent opacity={0.55 - i * 0.12} toneMapped={false} />
        </mesh>
      ))}

      <group
        position-y={BRAIN_Y}
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = '')}
      >
        <mesh ref={core}>
          <sphereGeometry args={[BRAIN_R, 64, 64]} />
          <meshPhysicalMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.55} roughness={0.18} metalness={0.05} clearcoat={1} clearcoatRoughness={0.15} />
        </mesh>
        <mesh scale={1.22} material={atmosphere}>
          <sphereGeometry args={[BRAIN_R, 48, 48]} />
        </mesh>
        <mesh ref={lattice} scale={1.28}>
          <icosahedronGeometry args={[BRAIN_R, 2]} />
          <meshBasicMaterial color="#bae6fd" wireframe transparent opacity={0.22} toneMapped={false} />
        </mesh>
        <points ref={neurons} geometry={neuronGeometry}>
          <pointsMaterial color="#e0f2fe" size={0.06} sizeAttenuation transparent opacity={0.9} depthWrite={false} toneMapped={false} />
        </points>
        <pointLight color="#7dd3fc" intensity={18} distance={14} decay={1.6} />
      </group>

      {/* the light column rising from the brain */}
      <mesh position-y={BRAIN_Y + 6}>
        <cylinderGeometry args={[0.12, 0.35, 10, 24, 1, true]} />
        <meshBasicMaterial color="#bae6fd" transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}
