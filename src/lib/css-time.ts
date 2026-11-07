/**
 * Read a CSS time custom property as milliseconds.
 *
 * The production CSS minifier rewrites an authored `420ms` to `.42s`.
 * `parseFloat(".42s")` is `0.42`, which the Web Animations API treats as
 * 0.42 milliseconds. Job flights then finish before a frame is painted.
 */
export function cssDurationMs(raw: string, fallback: number): number {
	const value = raw.trim();
	const n = parseFloat(value);
	if (!Number.isFinite(n)) return fallback;
	if (value.endsWith('ms')) return n;
	if (value.endsWith('s')) return n * 1000;
	return n;
}
