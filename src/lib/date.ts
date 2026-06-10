const DATE_PREFIX = /^(\d{4})-(\d{2})-(\d{2})-(.+)$/;

export function parseDateFromId(id: string): { date: Date; slug: string } {
	const m = id.match(DATE_PREFIX);
	if (!m) return { date: new Date(0), slug: id };
	const [, y, mo, d, rest] = m;
	return {
		date: new Date(`${y}-${mo}-${d}T00:00:00Z`),
		slug: rest,
	};
}
