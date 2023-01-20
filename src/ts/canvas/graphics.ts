import { Vector2 } from '../maths'

type CanvasPosition = {
	cx: number
	cy: number
	w: number
}

export type Callback = (context?: CanvasRenderingContext2D) => void

export class Graphics {
	context: CanvasRenderingContext2D
	canvas: HTMLCanvasElement
	callbacks: Callback[] = []

	private currentPosition: CanvasPosition = { cx: 0, cy: 0, w: 1024 }
	isDragging = false
	startX: number = 0
	startY: number = 0

	private spriteSheet: any
	private spriteSize = 32

	public init() {
		this.canvas = document.createElement('canvas')
		const container = document.querySelector('.container')
		if (!container) {
			throw new Error('no container')
		}
		container.appendChild(this.canvas)
		this.context = this.canvas.getContext('2d')
		this.context.imageSmoothingEnabled = false

		this.canvas.width = window.innerWidth
		this.canvas.height = window.innerHeight

		this.canvas.addEventListener('mousedown', (e) => {
			this.isDragging = true
			this.startX = e.clientX
			this.startY = e.clientY
		})

		this.canvas.addEventListener('mousemove', (e) => {
			if (this.isDragging) {
				const dx = e.clientX - this.startX
				const dy = e.clientY - this.startY
				this.startX = e.clientX
				this.startY = e.clientY

				this.currentPosition.cx -=
					(dx * this.currentPosition.w) / this.canvas.width
				this.currentPosition.cy -=
					(dy * this.currentPosition.w) / this.canvas.width
			}
		})

		this.canvas.addEventListener('mouseup', (e) => {
			this.isDragging = false
		})

		this.canvas.addEventListener('wheel', (e) => {
			e.preventDefault()
			const delta = e.deltaY > 0 ? 1.1 : 0.9
			this.currentPosition.w *= delta
		})

		this.spriteSheet = new Image()
		this.spriteSheet.src = './assets/images/tile-map.png'
	}

	public drawRect(x: number, y: number, w: number, h: number, color: string) {
		this.context.strokeStyle = color
		this.context.beginPath()

		const { x: screenX1, y: screenY1 } = this.resolvePoint(new Vector2(x, y))
		const { x: screenX2, y: screenY2 } = this.resolvePoint(
			new Vector2(x + w, y + h)
		)

		this.context.rect(
			screenX1,
			screenY1,
			screenX2 - screenX1,
			screenY2 - screenY1
		)
		this.context.stroke()
	}

	public drawCircle(x: number, y: number, radius: number, color: string) {
		this.context.strokeStyle = color
		this.context.beginPath()

		const { x: screenX1, y: screenY1 } = this.resolvePoint(new Vector2(x, y))

		this.context.fillStyle = color
		this.context.beginPath()
		this.context.arc(
			screenX1,
			screenY1,
			this.resolveSize(radius),
			0,
			2 * Math.PI
		)
		this.context.fill()
	}

	public drawSprite(x: number, y: number, tileId: number, rotation: number) {
		const { x: screenX1, y: screenY1 } = this.resolvePoint(new Vector2(x, y))

		const spriteX = this.spriteSize * (tileId % 16)
		const spriteY = this.spriteSize * (tileId - (tileId % 16))

		const size = this.resolveSize(this.spriteSize)

		this.context.save()

		this.context.translate(screenX1 + size / 2, screenY1 + size / 2)
		// this.context.translate(screenX1, screenY1)
		this.context.rotate((rotation * Math.PI) / 2)

		this.context.drawImage(
			this.spriteSheet,
			spriteX,
			spriteY,
			this.spriteSize,
			this.spriteSize,
			-size / 2 - 1,
			-size / 2 - 1,
			size + 2,
			size + 2
		)

		this.context.restore()
	}

	public resolveSize(x: number) {
		return (x * this.context.canvas.width) / this.currentPosition.w
	}

	public resolvePoint(point: Vector2): Vector2 {
		let newx: number, newy: number
		const ratio = this.context.canvas.width / this.context.canvas.height

		newx =
			this.context.canvas.width / 2 +
			((point.x - this.currentPosition.cx) / this.currentPosition.w) *
				this.context.canvas.width
		newy =
			this.context.canvas.width / ratio / 2 +
			((point.y - this.currentPosition.cy) / this.currentPosition.w) *
				this.context.canvas.width

		return new Vector2(newx, newy)
	}

	public addDrawCallback(callback: Callback) {
		this.callbacks.push(callback)
	}

	public removeDrawCallback(callback: Callback) {
		const index = this.callbacks.findIndex((cb) => cb === callback)
		if (index != -1) {
			this.callbacks.splice(index, 1)
		}
	}

	public animate() {
		this.context.fillStyle = '#27323f'
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
		this.callbacks.forEach((callback) => callback(this.context))
		requestAnimationFrame(() => this.animate.call(this))
	}
}

export const graphics = new Graphics()
