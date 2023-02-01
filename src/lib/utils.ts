const defaultDateOptions: Intl.DateTimeFormatOptions = {
	year: "numeric",
	month: "long",
	day: "numeric",
}

export function shortDate(
	date: Date,
	options: Intl.DateTimeFormatOptions = defaultDateOptions,
) {
	return new Intl.DateTimeFormat("en-US", options).format(date)
}

export function typedBoolean<T>(
	value: T,
): value is Exclude<T, "" | 0 | false | null | undefined> {
	return Boolean(value)
}

export function assertNotNull<PossiblyNullType>(
	possiblyNull: PossiblyNullType,
	errorMessage: string,
): asserts possiblyNull is Exclude<PossiblyNullType, null | undefined> {
	if (possiblyNull == null) throw new Error(errorMessage)
}
