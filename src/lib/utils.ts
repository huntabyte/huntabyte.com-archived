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
