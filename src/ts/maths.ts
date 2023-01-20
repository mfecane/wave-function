export class Vector2 {
	public constructor(public x: number = 0, public y: number = 0) {}

	public clone(): Vector2 {
		return new Vector2(this.x, this.y)
	}

	public multiplyScalar(value: number): Vector2 {
		this.x *= value
		this.y *= value
		return this
	}

	public add(other: Vector2): Vector2 {
		this.x += other.x
		this.y += other.y
		return this
	}

	public sub(other: Vector2): Vector2 {
		this.x -= other.x
		this.y -= other.y
		return this
	}

	public rotateAroundZero(angle: number): Vector2 {
		const { x, y } = this
		this.x = x * Math.cos(angle) - y * Math.sin(angle)
		this.y = x * Math.sin(angle) + y * Math.cos(angle)
		return this
	}
}
