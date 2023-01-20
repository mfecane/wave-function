export enum BorderType {
	Void = 'void',
	Border = 'border',
	Green = 'green',
}

export const BorderColors = {
	[BorderType.Void]: '#000000',
	[BorderType.Border]: '#0000FF',
	[BorderType.Green]: '#00FF00',
}

export enum Directions {
	top = 'top',
	right = 'right',
	bottom = 'bottom',
	left = 'left',
}

export interface Template {
	[Directions.top]: BorderType
	[Directions.right]: BorderType
	[Directions.bottom]: BorderType
	[Directions.left]: BorderType
	id: number
	weight: number
	rotation: number
}
