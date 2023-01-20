export function randomElement<T>(arr: Array<T>) {
	return arr[Math.floor(Math.random() * arr.length)]
}

export function assertEmpty<T>(variable: T | null | undefined): T {
	if (!variable) throw 'Assertion failed'
	return variable
}

export function assertNonZero(variable: number): number {
	if (variable === 0) {
		console.groupCollapsed()
		console.trace()
		console.groupEnd()
		debugger
		throw 'Assertion failed'
	}
	return variable
}
