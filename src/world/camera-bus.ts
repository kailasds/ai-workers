// A tiny channel between the HUD (zoom buttons, level readout) and the 3D camera inside the canvas.

export type CameraCommand = 'in' | 'out' | 'reset'
export type ZoomLevel = 'Campus' | 'Place' | 'Desk'

type Listener<T> = (v: T) => void
const commandListeners = new Set<Listener<CameraCommand>>()
const levelListeners = new Set<Listener<ZoomLevel>>()
let level: ZoomLevel = 'Campus'

export const cameraBus = {
  send(cmd: CameraCommand) {
    commandListeners.forEach((l) => l(cmd))
  },
  onCommand(l: Listener<CameraCommand>) {
    commandListeners.add(l)
    return () => {
      commandListeners.delete(l)
    }
  },
  setLevel(next: ZoomLevel) {
    if (next === level) return
    level = next
    levelListeners.forEach((l) => l(next))
  },
  getLevel: () => level,
  onLevel(l: Listener<ZoomLevel>) {
    levelListeners.add(l)
    return () => {
      levelListeners.delete(l)
    }
  },
}
