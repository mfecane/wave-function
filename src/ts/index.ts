import { addEvents, Point, resolvePoint } from './canvas/position'

const canvas = document.createElement('canvas')
const container = document.querySelector('.container')
if (!container) {
  throw new Error('no container')
}
container.appendChild(canvas)
const context = canvas.getContext('2d')
addEvents(canvas)

canvas.width = window.innerWidth
canvas.height = window.innerHeight

function draw() {
  const p1: Point = resolvePoint(context, { x: 0, y: 20 })
  const p2: Point = resolvePoint(context, { x: 20, y: 80 })

  context.clearRect(0, 0, context.canvas.width, context.canvas.height)

  context.fillStyle = 'red'
  context.fillRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y)
}

function animate() {
  draw()
  requestAnimationFrame(animate)
}

window.addEventListener('load', () => animate())
