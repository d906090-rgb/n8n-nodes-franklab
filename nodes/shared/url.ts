const FRANKLAB_ORIGIN = 'https://franklab.ru';
const FRANKLAB_API_BASE = `${FRANKLAB_ORIGIN}/franklab/api`;

const BLOCKED_HOSTS = new Set([
	'localhost',
	'localhost.',
	'metadata.google.internal',
	'metadata',
	'instance-data',
]);

const BLOCKED_HOST_SUFFIXES = ['.localhost', '.local', '.internal', '.lan', '.home', '.corp', '.private', '.intranet'];

export function normalizeBaseUrl(rawBaseUrl: string): string {
	const candidate = rawBaseUrl.trim().replace(/\/+$/, '');
	let parsed: URL;
	try {
		parsed = new URL(candidate);
	} catch {
		throw new Error('FrankLab Base URL must be https://franklab.ru');
	}

	if (parsed.protocol !== 'https:' || parsed.hostname !== 'franklab.ru') {
		throw new Error('Only https://franklab.ru is allowed for the public FrankLab n8n package');
	}

	const path = parsed.pathname.replace(/\/+$/, '');
	if (path === '' || path === '/' || path === '/franklab/api') {
		return FRANKLAB_API_BASE;
	}

	throw new Error('FrankLab Base URL must be https://franklab.ru or https://franklab.ru/franklab/api');
}

export function buildApiUrl(baseUrl: string, path: string, pathParams: Record<string, unknown> = {}): string {
	const normalizedBase = normalizeBaseUrl(baseUrl);
	const concretePath = path.replace(/:([A-Za-z0-9_]+)/g, (_match, name: string) => {
		const value = pathParams[name];
		if (value === undefined || value === null || String(value).trim() === '') {
			throw new Error(`Missing path parameter: ${name}`);
		}
		return encodeURIComponent(String(value));
	});
	return `${normalizedBase}${concretePath}`;
}

export function validatePublicMediaUrl(rawUrl: string): true {
	let parsed: URL;
	try {
		parsed = new URL(rawUrl);
	} catch {
		throw new Error('Media URL must be an absolute URL');
	}

	if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
		throw new Error('Only http and https media URLs are allowed');
	}

	const hostname = normalizeHostname(parsed.hostname);
	if (isUnsafeHostname(hostname) || isUnsafeIpLiteral(hostname) || embedsUnsafeIpv4(hostname)) {
		throw new Error('Local media URLs are not allowed');
	}

	return true;
}

export function validatePublicMediaUrlsInPayload(payload: unknown): true {
	validateNestedMediaUrls(payload, 'payload');
	return true;
}

function validateNestedMediaUrls(value: unknown, path: string): void {
	if (Array.isArray(value)) {
		value.forEach((item, index) => validateNestedMediaUrls(item, `${path}[${index}]`));
		return;
	}

	if (!isRecord(value)) return;

	for (const [key, nestedValue] of Object.entries(value)) {
		const fieldPath = `${path}.${key}`;
		if (isMediaUrlField(key) && typeof nestedValue === 'string' && nestedValue.trim() !== '') {
			try {
				validatePublicMediaUrl(nestedValue);
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				throw new Error(`Media URL field ${fieldPath}: ${message}`);
			}
		}
		validateNestedMediaUrls(nestedValue, fieldPath);
	}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isMediaUrlField(key: string): boolean {
	const lower = key.toLowerCase();
	return lower === 'url' || lower.endsWith('_url') || lower.endsWith('-url') || key.endsWith('Url') || key.endsWith('URL');
}

function normalizeHostname(hostname: string): string {
	const lower = hostname.toLowerCase();
	if (lower.startsWith('[') && lower.endsWith(']')) return lower.slice(1, -1);
	return lower;
}

function isUnsafeHostname(hostname: string): boolean {
	if (BLOCKED_HOSTS.has(hostname)) return true;
	return BLOCKED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
}

function isUnsafeIpLiteral(hostname: string): boolean {
	return isUnsafeIpv4(hostname) || isUnsafeIpv6(hostname);
}

function isUnsafeIpv4(hostname: string): boolean {
	const parts = hostname.split('.').map((part) => Number(part));
	if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
		return false;
	}
	const [first, second] = parts;
	return (
		first === 0 ||
		first === 10 ||
		first === 127 ||
		(first === 100 && second >= 64 && second <= 127) ||
		(first === 169 && second === 254) ||
		(first === 172 && second >= 16 && second <= 31) ||
		(first === 192 && second === 168) ||
		(first === 198 && (second === 18 || second === 19)) ||
		first >= 224
	);
}

function isUnsafeIpv6(hostname: string): boolean {
	if (!hostname.includes(':')) return false;
	if (hostname === '::' || hostname === '::1') return true;

	const mappedIpv4 = parseMappedIpv4(hostname);
	if (mappedIpv4 && isUnsafeIpv4(mappedIpv4)) return true;

	const firstHextet = parseInt(hostname.split(':').find(Boolean) ?? '0', 16);
	if (!Number.isFinite(firstHextet)) return true;
	return (
		(firstHextet & 0xfe00) === 0xfc00 ||
		(firstHextet & 0xffc0) === 0xfe80 ||
		(firstHextet & 0xff00) === 0xff00 ||
		hostname.startsWith('2001:db8:')
	);
}

function parseMappedIpv4(hostname: string): string | null {
	const dotQuad = hostname.match(/(?:^|:)(\d{1,3}(?:\.\d{1,3}){3})$/)?.[1];
	if (dotQuad) return dotQuad;
	if (!hostname.includes('ffff:')) return null;

	const hextets = hostname.split(':').filter(Boolean);
	const tail = hextets.slice(-2);
	if (tail.length !== 2) return null;

	const high = parseInt(tail[0], 16);
	const low = parseInt(tail[1], 16);
	if (![high, low].every((part) => Number.isInteger(part) && part >= 0 && part <= 0xffff)) return null;
	return [high >> 8, high & 0xff, low >> 8, low & 0xff].join('.');
}

function embedsUnsafeIpv4(hostname: string): boolean {
	const candidates = hostname.match(/\d{1,3}(?:[.-]\d{1,3}){3}/g) ?? [];
	return candidates.some((candidate) => isUnsafeIpv4(candidate.split('-').join('.')));
}
