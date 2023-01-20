import { Callback, graphics } from './canvas/graphics'
import { TileRenderer } from './canvas/tile-renderer'
import { Tilemap } from './generators/wave-function-collapse/tilemap'

const generateButton = document.querySelector<HTMLDivElement>('#generate')
let callback: Callback | null = null

function generate() {
	if (callback) {
		graphics.removeDrawCallback(callback)
	}

	const tileMap = new Tilemap(64)
	tileMap.build()

	const iterationsElement =
		document.querySelector<HTMLDivElement>('#iterations')
	iterationsElement.innerText = Number(tileMap.calls).toLocaleString()

	const tileRenderer = new TileRenderer(graphics)
	callback = function () {
		tileRenderer.render(tileMap)
	}
	graphics.addDrawCallback(callback)
}

window.addEventListener('load', () => {
	graphics.init()
	graphics.animate()
	generate()
})

generateButton.addEventListener('click', () => generate())
