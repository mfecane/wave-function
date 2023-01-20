type CanvasPosition = {
  cx: number
  cy: number
  w: number
}

export type Point = {
  x: number
  y: number
}

const currentPosition: CanvasPosition = { cx: 0, cy: 0, w: 500 }

export function addEvents(canvas: HTMLCanvasElement) {
  let isDragging = false
  let startX: number, startY: number

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true
    startX = e.clientX
    startY = e.clientY
  })

  canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      startX = e.clientX
      startY = e.clientY

      currentPosition.cx -= (dx * currentPosition.w) / canvas.width
      currentPosition.cy -= (dy * currentPosition.w) / canvas.width
    }
  })

  canvas.addEventListener('mouseup', (e) => {
    isDragging = false
  })

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 1.1 : 0.9
    currentPosition.w *= delta
  })
}

export function resolvePoint(
  context: CanvasRenderingContext2D,
  point: Point
): Point {
  // context.canvas.width
  let newx: number, newy: number
  const ratio = context.canvas.width / context.canvas.height

  newx =
    context.canvas.width / 2 +
    ((point.x - currentPosition.cx) / currentPosition.w) * context.canvas.width
  newy =
    context.canvas.width / ratio / 2 +
    ((point.y - currentPosition.cy) / currentPosition.w) * context.canvas.width

  return {
    x: newx,
    y: newy,
  }
}
