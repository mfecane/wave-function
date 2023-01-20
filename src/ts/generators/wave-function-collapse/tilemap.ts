import { baseTemplates } from './data/template-set-2'
import { Directions, Template } from './types'
import { assertNonZero, randomElement } from './utils'

/**
 * Creates rotated copy of original template
 * populates rotation
 */
function rotateTemplate(template: Template, ticks: number): Template {
	switch (ticks) {
		case 0:
			return { ...template }
		case 1:
			return {
				...template,
				rotation: 1,
				[Directions.top]: template[Directions.left],
				[Directions.right]: template[Directions.top],
				[Directions.bottom]: template[Directions.right],
				[Directions.left]: template[Directions.bottom],
			}
		case 2:
			return {
				...template,
				rotation: 2,
				[Directions.top]: template[Directions.bottom],
				[Directions.right]: template[Directions.left],
				[Directions.bottom]: template[Directions.top],
				[Directions.left]: template[Directions.right],
			}
		case 3:
			return {
				...template,
				rotation: 3,
				[Directions.top]: template[Directions.right],
				[Directions.right]: template[Directions.bottom],
				[Directions.bottom]: template[Directions.left],
				[Directions.left]: template[Directions.top],
			}
		default:
			throw 'rotateTemplate exception'
	}
}

function buildTemplateList(): Template[] {
	const out: Template[] = []

	const enriched: Template[] = baseTemplates.map(
		(t): Template => ({ rotation: 0, weight: 1, ...t } as Template)
	)

	enriched.forEach((t) => {
		tryPushTemplate(out, rotateTemplate(t, 0))
		tryPushTemplate(out, rotateTemplate(t, 1))
		tryPushTemplate(out, rotateTemplate(t, 2))
		tryPushTemplate(out, rotateTemplate(t, 3))
	})
	return out
}

function tryPushTemplate(out: Template[], t: Template) {
	if (
		!!out.find(
			(el) =>
				el[Directions.top] === t[Directions.top] &&
				el[Directions.right] === t[Directions.right] &&
				el[Directions.bottom] === t[Directions.bottom] &&
				el[Directions.left] === t[Directions.left] &&
				el.id === t.id
		)
	) {
		return
	}
	out.push(t)
}

const templates: Template[] = buildTemplateList()

export class Tilemap {
	public calls = 0

	public tiles: (Tile | null)[][] = []

	public constructor(public readonly size: number = 5) {
		for (let i = 0; i < this.size; i++) {
			this.tiles[i] = []
			for (let j = 0; j < this.size; j++) {
				this.tiles[i][j] = new Tile(i, j, this)
				if (i === 0 || j === 0 || i === size - 1 || j === size - 1) {
					this.tiles[i][j].collapseTo(0)
				}
			}
		}
	}

	static PropagationProcess = class {
		private q: Tile[] = []

		public constructor(private tileMap: Tilemap) {}

		public start(i: number, j: number) {
			this.pushToQ(i, j)
			let tile: Tile
			let guard = 0
			while ((tile = this.q.shift())) {
				if (guard++ > 200) {
					throw 'Guard overflow'
				}
				this.propagate(tile.x, tile.y)
			}
		}

		private propagate(x: number, y: number) {
			const self = this.tileMap.getTileAt(x, y)
			if (!self) {
				return
			}

			this.filterTargetTemplates(
				self,
				this.tileMap.getTileAt(x, y - 1),
				Directions.top
			)
			this.filterTargetTemplates(
				self,
				this.tileMap.getTileAt(x + 1, y),
				Directions.right
			)
			this.filterTargetTemplates(
				self,
				this.tileMap.getTileAt(x, y + 1),
				Directions.bottom
			)
			this.filterTargetTemplates(
				self,
				this.tileMap.getTileAt(x - 1, y),
				Directions.left
			)
		}

		private filterTargetTemplates(
			source: Tile,
			target: Tile | null,
			direction: Directions
		) {
			if (!target) {
				return
			}
			const newTemplates: Template[] = []

			for (let targetTemplate of target.templates) {
				let result = false
				for (let sourceTemplate of source.templates) {
					// at least one of source templates fits target template
					// we keep that target template on source
					result ||= this.tileMap.checkTiles(
						sourceTemplate,
						targetTemplate,
						direction
					)
				}
				if (result) {
					newTemplates.push(targetTemplate)
				}
			}
			// assertNonZero(newTemplates.length)

			if (target.templates.length !== newTemplates.length) {
				// further propagation required
				this.pushToQ(target.x, target.y - 1)
				this.pushToQ(target.x + 1, target.y)
				this.pushToQ(target.x, target.y + 1)
				this.pushToQ(target.x - 1, target.y)
			}

			target.replaceTemplates(newTemplates)
		}

		private pushToQ(x: number, y: number) {
			const cell = this.tileMap.getTileAt(x, y)
			if (cell) {
				this.q.push(cell)
			}
		}
	}

	public getTileAt(i: number, j: number): Tile | null {
		if (i < 0 || i > this.size - 1 || j < 0 || j > this.size - 1) {
			return null
		}
		return this.tiles[i][j]
	}

	private getNextTile(): Tile | null {
		let min: number = Infinity
		let tiles: Tile[] = []
		for (let i = 0; i < this.size; i++) {
			for (let j = 0; j < this.size; j++) {
				if (this.tiles[i][j]) {
					if (this.tiles[i][j].enthropy === 1) {
						continue
					}
					if (this.tiles[i][j].enthropy < min) {
						min = this.tiles[i][j].enthropy
						tiles = [this.tiles[i][j]]
					}
					if (this.tiles[i][j].enthropy === min) {
						tiles.push(this.tiles[i][j])
					}
				}
			}
		}
		if (tiles.length < 1) {
			return null
		}

		return randomElement<Tile>(tiles)
	}

	public checkTiles(
		self: Template,
		other: Template,
		direction: Directions
	): boolean {
		let result: boolean
		switch (direction) {
			case Directions.top:
				result = self[Directions.top] === other[Directions.bottom]
				break
			case Directions.right:
				result = self[Directions.right] === other[Directions.left]
				break
			case Directions.bottom:
				result = self[Directions.bottom] === other[Directions.top]
				break
			case Directions.left:
				result = self[Directions.left] === other[Directions.right]
				break
		}
		this.calls++
		return result
	}

	private collapseTile(tile: Tile) {
		tile.collapse()
		const propagation = new Tilemap.PropagationProcess(this)
		propagation.start(tile.x, tile.y)
	}

	public build() {
		let tile: Tile
		while ((tile = this.getNextTile())) {
			this.collapseTile(tile)
		}
	}
}

export class Tile {
	public templates: Template[] = [...templates]
	public enthropy: number = this.templates.length
	public dead = false

	public constructor(
		public x: number,
		public y: number,
		private tileMap: Tilemap
	) {}

	private getWeightedRandomTemplate(): Template {
		assertNonZero(this.templates.length)
		const totalWeight = this.templates.reduce((acc, cur) => acc + cur.weight, 0)
		const randomWeight = Math.random() * totalWeight
		let weight = 0
		for (let t of this.templates) {
			if (weight + t.weight > randomWeight) {
				return t
			}
			weight += t.weight
		}
		return this.templates[this.templates.length - 1]
	}

	public collapse() {
		if (this.dead) {
			return
		}
		const copy = [...this.templates]
		assertNonZero(this.templates.length)
		// const randomTemplate = randomElement<Template>(copy)
		const randomTemplate = this.getWeightedRandomTemplate()
		this.templates = [randomTemplate]
		this.enthropy = 1
	}

	public collapseTo(i: number) {
		if (this.dead) {
			return
		}
		assertNonZero(this.templates.length)
		this.templates = [this.templates[0]]
		this.enthropy = 1
	}

	private die() {
		this.dead = true
		this.tileMap.tiles[this.x][this.y] = null
	}

	public replaceTemplates(newTemplates: Template[]) {
		this.templates = newTemplates
		this.enthropy = this.templates.length
		if (this.enthropy < 1) {
			this.die()
		}
	}
}
