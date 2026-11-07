/** Path under the GitHub Pages project-site base (/go-worker-pool/), keeping slashes aligned. */
export function sitePath(path = ''): string {
	const base = import.meta.env.BASE_URL.replace(/\/$/, '');
	const suffix = path.replace(/^\//, '');
	return suffix ? `${base}/${suffix}` : `${base}/`;
}
