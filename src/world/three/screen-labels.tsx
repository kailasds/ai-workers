import { useCallback, useLayoutEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Labels for the 3D campus, drawn as ordinary DOM over the canvas. Each frame the projector
// moves them to their 3D anchor by writing a transform straight to the element — no React
// render per frame, one shared layer, and text stays pin-sharp at every zoom.

export interface LabelSpec {
  id: string
  position: [number, number, number]
  node: React.ReactNode
  /** Draw order; higher sits on top. */
  z?: number
}

type Registry = Map<string, { el: HTMLDivElement | null; pos: THREE.Vector3 }>

export function useLabelRegistry() {
  return useMemo<Registry>(() => new Map(), [])
}


/** Inside the canvas: projects every registered anchor to the screen each frame. */
export function LabelProjector({ registry }: { registry: Registry }) {
  const { camera, size } = useThree()
  const v = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    registry.forEach(({ el, pos }) => {
      if (!el) return
      v.copy(pos).project(camera)
      if (v.z > 1 || v.z < -1) {
        el.style.visibility = 'hidden'
        return
      }
      const x = ((v.x + 1) / 2) * size.width
      const y = ((1 - v.y) / 2) * size.height
      el.style.visibility = 'visible'
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`
    })
  })
  return null
}

/** Outside the canvas: the DOM layer the projector moves. */
export function LabelLayer({ registry, labels }: { registry: Registry; labels: LabelSpec[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {labels.map((l) => (
        <Anchored key={l.id} registry={registry} spec={l} />
      ))}
    </div>
  )
}

function Anchored({ registry, spec }: { registry: Registry; spec: LabelSpec }) {
  const pos = useMemo(() => new THREE.Vector3(), [])
  const [x, y, z] = spec.position
  useLayoutEffect(() => {
    pos.set(x, y, z)
  }, [pos, x, y, z])
  const ref = useCallback(
    (el: HTMLDivElement | null) => {
      if (el) registry.set(spec.id, { el, pos })
      else registry.delete(spec.id)
    },
    [registry, spec.id, pos],
  )
  return (
    <div ref={ref} className="absolute top-0 left-0 will-change-transform" style={{ visibility: 'hidden', zIndex: spec.z ?? 1 }}>
      <div className="pointer-events-auto">{spec.node}</div>
    </div>
  )
}
