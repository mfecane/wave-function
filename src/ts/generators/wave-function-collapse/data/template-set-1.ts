import { BorderType, Directions, Template } from '../types'

export const baseTemplates: Partial<Template>[] = [
	{
		[Directions.top]: BorderType.Void,
		[Directions.right]: BorderType.Void,
		[Directions.bottom]: BorderType.Void,
		[Directions.left]: BorderType.Void,
		id: 0,
		rotation: 0,
	},
	{
		[Directions.top]: BorderType.Border,
		[Directions.right]: BorderType.Border,
		[Directions.bottom]: BorderType.Void,
		[Directions.left]: BorderType.Void,
		id: 1,
		rotation: 0,
	},
	{
		[Directions.top]: BorderType.Border,
		[Directions.right]: BorderType.Border,
		[Directions.bottom]: BorderType.Border,
		[Directions.left]: BorderType.Border,
		id: 2,
		rotation: 0,
	},
	{
		[Directions.top]: BorderType.Void,
		[Directions.right]: BorderType.Border,
		[Directions.bottom]: BorderType.Void,
		[Directions.left]: BorderType.Border,
		id: 3,
		rotation: 0,
	},
	{
		[Directions.top]: BorderType.Void,
		[Directions.right]: BorderType.Border,
		[Directions.bottom]: BorderType.Border,
		[Directions.left]: BorderType.Border,
		id: 4,
		rotation: 0,
	},
	{
		[Directions.top]: BorderType.Green,
		[Directions.right]: BorderType.Border,
		[Directions.bottom]: BorderType.Green,
		[Directions.left]: BorderType.Border,
		id: 5,
		rotation: 0,
	},
	{
		[Directions.top]: BorderType.Green,
		[Directions.right]: BorderType.Void,
		[Directions.bottom]: BorderType.Green,
		[Directions.left]: BorderType.Void,
		id: 6,
		rotation: 0,
	},
	{
		[Directions.top]: BorderType.Void,
		[Directions.right]: BorderType.Void,
		[Directions.bottom]: BorderType.Green,
		[Directions.left]: BorderType.Void,
		id: 7,
		rotation: 0,
	},
	{
		[Directions.top]: BorderType.Void,
		[Directions.right]: BorderType.Green,
		[Directions.bottom]: BorderType.Green,
		[Directions.left]: BorderType.Void,
		id: 8,
		rotation: 0,
	},
	{
		[Directions.top]: BorderType.Void,
		[Directions.right]: BorderType.Border,
		[Directions.bottom]: BorderType.Green,
		[Directions.left]: BorderType.Border,
		id: 9,
		rotation: 0,
	},
	{
		[Directions.top]: BorderType.Green,
		[Directions.right]: BorderType.Border,
		[Directions.bottom]: BorderType.Border,
		[Directions.left]: BorderType.Border,
		id: 10,
		rotation: 0,
	},
	{
		[Directions.top]: BorderType.Void,
		[Directions.right]: BorderType.Void,
		[Directions.bottom]: BorderType.Void,
		[Directions.left]: BorderType.Border,
		id: 11,
		rotation: 0,
	},
	{
		[Directions.top]: BorderType.Green,
		[Directions.right]: BorderType.Green,
		[Directions.bottom]: BorderType.Green,
		[Directions.left]: BorderType.Border,
		id: 12,
		rotation: 0,
	},
	{
		[Directions.top]: BorderType.Green,
		[Directions.right]: BorderType.Border,
		[Directions.bottom]: BorderType.Green,
		[Directions.left]: BorderType.Border,
		id: 13,
		rotation: 0,
	},
]
