type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

const SENSITIVE_KEY_PARTS = [
	'authorization',
	'x-api-key',
	'apikey',
	'api_key',
	'token',
	'secret',
	'password',
	'passphrase',
	'privatekey',
	'private_key',
	'private-key',
	'keypem',
	'pem',
	'certificate',
	'cert',
	'chain',
];

export function redactSensitive<T>(value: T): T {
	return redactValue(value) as T;
}

function redactValue(value: unknown, key = ''): JsonValue | undefined {
	if (value === undefined) return undefined;
	if (value === null || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
		return isSensitiveKey(key) ? '[redacted]' : (value as JsonValue);
	}
	if (Array.isArray(value)) {
		return value.map((item) => redactValue(item) ?? null);
	}
	if (typeof value === 'object') {
		const output: Record<string, JsonValue> = {};
		for (const [childKey, childValue] of Object.entries(value as Record<string, unknown>)) {
			output[childKey] = isSensitiveKey(childKey) ? '[redacted]' : (redactValue(childValue, childKey) ?? null);
		}
		return output;
	}
	return String(value);
}

function isSensitiveKey(key: string): boolean {
	const normalized = key.toLowerCase().replace(/[^a-z0-9_-]/g, '');
	return SENSITIVE_KEY_PARTS.some((part) => normalized.includes(part));
}
