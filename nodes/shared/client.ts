import { buildApiUrl, normalizeBaseUrl } from './url';
import type { EndpointDefinition, HttpMethod } from './registry';
import { getEndpoint } from './registry';
import { isFailureStatus, isTerminalStatus } from './status';

type HeadersMap = Record<string, string>;
type RequestBody = Record<string, unknown>;

export interface FetchRequest {
	method: HttpMethod;
	headers: HeadersMap;
	body?: string;
}

export interface FetchResponse {
	ok: boolean;
	status: number;
	json(): Promise<unknown>;
	text(): Promise<string>;
}

export type FetchTransport = (url: string, init: FetchRequest) => Promise<FetchResponse>;

export interface FrankLabClientOptions {
	baseUrl: string;
	apiKey: string;
	fetch: FetchTransport;
}

export interface PollOptions {
	delayMs?: number;
	maxAttempts?: number;
}

export interface FrankLabClient {
	request(endpointKey: string, input?: RequestBody): Promise<Record<string, unknown>>;
	poll(endpointKey: string, taskId: string, options?: PollOptions): Promise<Record<string, unknown>>;
}

const PATH_PARAM_NAMES = ['jobId', 'taskId', 'profileId', 'dubbingId', 'languageCode'] as const;

export function createFrankLabClient(options: FrankLabClientOptions): FrankLabClient {
	const baseUrl = normalizeBaseUrl(options.baseUrl);
	const apiKey = options.apiKey.trim();
	if (!apiKey) {
		throw new Error('FrankLab API key is required');
	}

	return {
		async request(endpointKey: string, input: RequestBody = {}) {
			const endpoint = getEndpoint(endpointKey);
			return requestEndpoint(endpoint, baseUrl, apiKey, options.fetch, input);
		},
		async poll(endpointKey: string, taskId: string, pollOptions: PollOptions = {}) {
			const delayMs = pollOptions.delayMs ?? 5000;
			const maxAttempts = pollOptions.maxAttempts ?? 120;
			let lastResult: Record<string, unknown> = {};

			for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
				lastResult = await requestEndpoint(getEndpoint(endpointKey), baseUrl, apiKey, options.fetch, { jobId: taskId, taskId, dubbingId: taskId });
				if (!lastResult.taskId) lastResult.taskId = taskId;
				const status = lastResult.status;
				if (isTerminalStatus(status)) {
					if (isFailureStatus(status)) {
						throw new Error(String(lastResult.error ?? `FrankLab task failed with status ${status}`));
					}
					return lastResult;
				}
				if (delayMs > 0 && attempt < maxAttempts - 1) {
					await wait(delayMs);
				}
			}

			throw new Error(`FrankLab task did not finish within ${maxAttempts} polling attempts`);
		},
	};
}

async function requestEndpoint(
	endpoint: EndpointDefinition,
	baseUrl: string,
	apiKey: string,
	fetchTransport: FetchTransport,
	input: RequestBody,
): Promise<Record<string, unknown>> {
	const url = buildApiUrl(baseUrl, endpoint.path, input);
	const headers: HeadersMap = {
		Accept: 'application/json',
	};
	if (endpoint.authHeader === 'Authorization') {
		headers.Authorization = `Bearer ${apiKey}`;
	} else {
		headers['X-API-Key'] = apiKey;
	}

	const init: FetchRequest = {
		method: endpoint.method,
		headers,
	};

	if (endpoint.method === 'POST') {
		headers['Content-Type'] = 'application/json';
		init.body = JSON.stringify(buildBody(endpoint, input));
	}

	const response = await fetchTransport(url, init);
	const body = await readResponseBody(response);
	if (!response.ok) {
		throw new Error(extractErrorMessage(body, response.status));
	}

	return extractOutput(endpoint, body, input);
}

function buildBody(endpoint: EndpointDefinition, input: RequestBody): RequestBody {
	if (endpoint.module === 'c2pa') {
		assertNoC2paPrivateMaterial(input);
	}

	const body: RequestBody = {};
	for (const [key, value] of Object.entries(input)) {
		if ((PATH_PARAM_NAMES as readonly string[]).includes(key)) continue;
		if (value === undefined || value === null || value === '') continue;
		body[key] = value;
	}

	const operation = defaultBodyOperation(endpoint.key);
	if (operation && !body.operation) {
		body.operation = operation;
	}

	if (endpoint.key === 'c2pa.generateSelfSigned') {
		body.action = 'generate_self_signed';
	}

	return body;
}

async function readResponseBody(response: FetchResponse): Promise<unknown> {
	try {
		return await response.json();
	} catch {
		const text = await response.text();
		try {
			return JSON.parse(text);
		} catch {
			return { message: text };
		}
	}
}

function extractOutput(endpoint: EndpointDefinition, body: unknown, input: RequestBody): Record<string, unknown> {
	const root = isRecord(body) ? body : {};
	const rawData = root.data ?? root;
	const data = isRecord(rawData) ? rawData : {};
	const result = isRecord(data.result) ? data.result : data;
	const status = result.task_status ?? result.status ?? data.status ?? root.status;
	const taskId = result.task_id ?? result.taskId ?? data.taskId ?? input.taskId ?? input.jobId ?? input.dubbingId;

	if (endpoint.outputExtractor === 'list-result') {
		const items = Array.isArray(rawData) ? rawData : Array.isArray(result.items) ? result.items : Array.isArray(result.profiles) ? result.profiles : [];
		return { items, profiles: items, data: items };
	}
	if (endpoint.outputExtractor === 'profile-options') {
		const items = Array.isArray(rawData) ? rawData : Array.isArray(result.items) ? result.items : Array.isArray(result.profiles) ? result.profiles : [];
		const options = items.filter(isRecord).map((item) => ({
			name: String(item.label ?? item.name ?? item.id ?? item.profileId ?? ''),
			value: String(item.id ?? item.profileId ?? ''),
		})).filter((option) => option.name && option.value);
		return { options, items, data: options };
	}

	return {
		...result,
		...pickCostFields(data),
		taskId,
		status,
		audioUrl: result.audioUrl ?? result.resultUrl ?? firstUrl(result.task_result, 'audios'),
		resultUrl: result.resultUrl ?? result.audioUrl ?? firstUrl(result.task_result, 'audios') ?? firstUrl(result.task_result, 'videos'),
		downloadUrl: result.downloadUrl ?? data.downloadUrl,
		error: result.error ?? data.error ?? root.message ?? root.msg ?? null,
	};
}

function extractErrorMessage(body: unknown, status: number): string {
	if (isRecord(body)) {
		const data = isRecord(body.data) ? body.data : {};
		const result = isRecord(data.result) ? data.result : {};
		const message = result.task_status_msg ?? result.error ?? data.error ?? body.msg ?? body.message;
		if (typeof message === 'string' && message.trim()) return message;
	}
	return `FrankLab request failed with HTTP ${status}`;
}

function pickCostFields(data: Record<string, unknown>): Record<string, unknown> {
	const fields = ['final_cost_franks', 'cost_currency', 'cost_status', 'cost_unit'];
	const output: Record<string, unknown> = {};
	for (const field of fields) {
		if (data[field] !== undefined) output[field] = data[field];
	}
	return output;
}

function firstUrl(container: unknown, key: string): string | undefined {
	if (!isRecord(container)) return undefined;
	const values = container[key];
	if (!Array.isArray(values)) return undefined;
	for (const item of values) {
		if (isRecord(item) && typeof item.url === 'string' && item.url) return item.url;
	}
	return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function defaultBodyOperation(endpointKey: string): string | null {
	switch (endpointKey) {
		case 'volna.textToSpeech':
			return 'text-to-speech';
		case 'volna.textToDialogue':
			return 'text-to-dialogue';
		case 'volna.textToSpeechTurbo':
			return 'text-to-speech-turbo';
		case 'volna.googleTts':
			return 'google-3-1-tts';
		default:
			return null;
	}
}

function assertNoC2paPrivateMaterial(value: unknown, path: string[] = []): void {
	if (Array.isArray(value)) {
		value.forEach((item, index) => assertNoC2paPrivateMaterial(item, [...path, String(index)]));
		return;
	}
	if (!isRecord(value)) return;
	for (const [key, child] of Object.entries(value)) {
		const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
		if (
			normalized.includes('pem') ||
			normalized.includes('passphrase') ||
			normalized.includes('privatekey') ||
			normalized.includes('certificate')
		) {
			throw new Error(`C2PA private material is not supported in public package payloads: ${[...path, key].join('.')}`);
		}
		assertNoC2paPrivateMaterial(child, [...path, key]);
	}
}

async function wait(delayMs: number): Promise<void> {
	await new Promise<void>((resolve) => {
		const signal = AbortSignal.timeout(delayMs);
		if (signal.aborted) {
			resolve();
			return;
		}
		signal.addEventListener('abort', () => resolve(), { once: true });
	});
}
