import { Tilemap } from '../generators/wave-function-collapse/tilemap'
import { BorderColors, Directions } from '../generators/wave-function-collapse/types'
import { Graphics } from './graphics'

export class TileRenderer {
	private SIZE = 32

	constructor(private graphics: Graphics) {}

	public render(tilemap: Tilemap) {
		for (let i = 0; i < tilemap.tiles.length; ++i) {
			for (let j = 0; j < tilemap.tiles[i].length; ++j) {
				this.renderTileSprite(tilemap, i, j)
				// this.renderTileSimple(tilemap, i, j)
			}
		}
	}

	private renderTileSimple(tilemap: Tilemap, x: number, y: number) {
		const tile = tilemap.getTileAt(x, y)

		if (!tile) {
			return
		}

		const centerX = (tile.x - tilemap.size / 2) * this.SIZE
		const centerY = (tile.y - tilemap.size / 2) * this.SIZE

		this.graphics.drawRect(
			centerX - this.SIZE / 2 + 2,
			centerY - this.SIZE / 2 + 2,
			this.SIZE - 4,
			this.SIZE - 4,
			'#EEEEEE'
		)

		const template = tile.templates[0]
		if (template) {
			this.graphics.drawCircle(centerX, centerY - 10, 2, BorderColors[template[Directions.top]])
			this.graphics.drawCircle(centerX + 10, centerY, 2, BorderColors[template[Directions.right]])
			this.graphics.drawCircle(centerX, centerY + 10, 2, BorderColors[template[Directions.bottom]])
			this.graphics.drawCircle(centerX - 10, centerY, 2, BorderColors[template[Directions.left]])
		}
	}

	private renderTileSprite(tilemap: Tilemap, x: number, y: number) {
		const tile = tilemap.getTileAt(x, y)

		if (!tile) {
			return
		}

		const centerX = (tile.x - tilemap.size / 2) * this.SIZE
		const centerY = (tile.y - tilemap.size / 2) * this.SIZE

		this.graphics.drawSprite(
			centerX - this.SIZE / 2,
			centerY - this.SIZE / 2,
			tile.templates[0].id,
			tile.templates[0].rotation
		)
	}
}
