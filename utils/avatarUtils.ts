// Utility to generate an SVG avatar (data URI) containing the first letter of a name.
// This lets us store a lightweight placeholder in avatarUrl that behaves like an image.
export function generateInitialAvatar(name: string, size: number = 128) {
	const initial = (name || '?').trim().charAt(0).toUpperCase() || '?';
	// Deterministic color based on initial
	const colors = [
		'#2563EB', '#7C3AED', '#DB2777', '#059669', '#DC2626', '#0D9488', '#D97706', '#6366F1', '#0891B2'
	];
	const colorIndex = initial.charCodeAt(0) % colors.length;
	const bg = colors[colorIndex];
	const svg = `<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
		`<rect width="100%" height="100%" rx="${size * 0.18}" fill="${bg}"/>` +
		`<text x="50%" y="54%" font-family="'Segoe UI', Roboto, Arial, sans-serif" font-size="${size * 0.55}" ` +
		`fill="white" text-anchor="middle" dominant-baseline="middle" font-weight="600">${initial}</text>` +
		`</svg>`;
	return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

// Fallback helper for components rendering an avatar; returns provided url or generated initial avatar.
export function resolveAvatarUrl(name: string, avatarUrl?: string): string {
	if (avatarUrl && avatarUrl.trim() !== '') return avatarUrl;
	return generateInitialAvatar(name);
}
