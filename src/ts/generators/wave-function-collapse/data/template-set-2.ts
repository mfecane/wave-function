import { BorderType, Directions, Template } from '../types'

export const baseTemplates: Partial<Template>[] = [
	{
		[Directions.top]: BorderType.Void,
		[Directions.right]: BorderType.Void,
		[Directions.bottom]: BorderType.Void,
		[Directions.left]: BorderType.Void,
		id: 0,
		weight: 4,
	},
	{
		[Directions.top]: BorderType.Border,
		[Directions.right]: BorderType.Border,
		[Directions.bottom]: BorderType.Void,
		[Directions.left]: BorderType.Void,
		id: 1,
		weight: 4,
	},
	{
		[Directions.top]: BorderType.Border,
		[Directions.right]: BorderType.Border,
		[Directions.bottom]: BorderType.Border,
		[Directions.left]: BorderType.Border,
		id: 2,
		weight: 8,
	},
	{
		[Directions.top]: BorderType.Void,
		[Directions.right]: BorderType.Border,
		[Directions.bottom]: BorderType.Void,
		[Directions.left]: BorderType.Border,
		id: 3,
		weight: 4,
	},
	{
		[Directions.top]: BorderType.Void,
		[Directions.right]: BorderType.Border,
		[Directions.bottom]: BorderType.Border,
		[Directions.left]: BorderType.Border,
		id: 4,
		weight: 1,
	},
	{
		[Directions.top]: BorderType.Green,
		[Directions.right]: BorderType.Border,
		[Directions.bottom]: BorderType.Green,
		[Directions.left]: BorderType.Border,
		id: 5,
		weight: 16,
	},
	{
		[Directions.top]: BorderType.Green,
		[Directions.right]: BorderType.Void,
		[Directions.bottom]: BorderType.Green,
		[Directions.left]: BorderType.Void,
		id: 6,
		weight: 1,
	},
	{
		[Directions.top]: BorderType.Void,
		[Directions.right]: BorderType.Green,
		[Directions.bottom]: BorderType.Green,
		[Directions.left]: BorderType.Void,
		id: 8,
		weight: 1,
	},
	{
		[Directions.top]: BorderType.Green,
		[Directions.right]: BorderType.Border,
		[Directions.bottom]: BorderType.Green,
		[Directions.left]: BorderType.Border,
		id: 13,
		weight: 16,
	},
	{
		[Directions.top]: BorderType.Void,
		[Directions.right]: BorderType.Void,
		[Directions.bottom]: BorderType.Green,
		[Directions.left]: BorderType.Void,
		id: 7,
		weight: 1,
	},
	{
		[Directions.top]: BorderType.Green,
		[Directions.right]: BorderType.Green,
		[Directions.bottom]: BorderType.Green,
		[Directions.left]: BorderType.Void,
		id: 14,
		weight: 4,
	},
	{
		[Directions.top]: BorderType.Green,
		[Directions.right]: BorderType.Green,
		[Directions.bottom]: BorderType.Green,
		[Directions.left]: BorderType.Green,
		id: 15,
		weight: 1,
	},
	{
		[Directions.top]: BorderType.Void,
		[Directions.right]: BorderType.Border,
		[Directions.bottom]: BorderType.Green,
		[Directions.left]: BorderType.Border,
		id: 9,
		weight: 1,
	},
]
