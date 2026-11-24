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
	headers?: Record<string, unknown>;
	json(): Promise<unknown>;
	text(): Promise<string>;
}

export class FrankLabHttpError extends Error {
	readonly statusCode: number;

	readonly httpCode: string;

	readonly body: unknown;

	readonly headers?: Record<string, unknown>;

	readonly response: { statusCode: number; body: unknown; headers?: Record<string, unknown> };

	constructor(message: string, statusCode: number, body: unknown, headers?: Record<string, unknown>) {
		super(message);
		this.name = 'FrankLabHttpError';
		this.statusCode = statusCode;
		this.httpCode = String(statusCode);
		this.body = body;
		this.headers = headers;
		this.response = { statusCode, body, headers };
	}

	toJsonObject(): Record<string, unknown> {
		return {
			message: this.message,
			statusCode: this.statusCode,
			httpCode: this.httpCode,
			response: {
				status: this.statusCode,
				statusCode: this.statusCode,
				data: this.body,
				body: this.body,
				...(this.headers ? { headers: this.headers } : {}),
			},
		};
	}
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
	pollInput?: RequestBody;
}

export interface FrankLabClient {
	request(endpointKey: string, input?: RequestBody): Promise<Record<string, unknown>>;
	poll(endpointKey: string, taskId: string, options?: PollOptions): Promise<Record<string, unknown>>;
}

const PATH_PARAM_NAMES = [
	'jobId',
	'taskId',
	'profileId',
	'dubbingId',
	'languageCode',
	'file_id',
	'billing_task_id',
	'pollKind',
	'id',
	'voiceId',
	'batchId',
	'releaseId',
	'importId',
	'sessionId',
	'resourceId',
	'videoId',
] as const;

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

			const endpoint = getEndpoint(endpointKey);
			for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
				lastResult = await requestEndpoint(endpoint, baseUrl, apiKey, options.fetch, {
					...(pollOptions.pollInput ?? {}),
					jobId: taskId,
					taskId,
					dubbingId: taskId,
					billing_task_id: taskId,
					batchId: taskId,
					releaseId: taskId,
					importId: taskId,
					sessionId: taskId,
					videoId: taskId,
					...(endpoint.endpointId === 'social.getStatus' ? { poll: '1' } : {}),
				});
				if (!lastResult.taskId) lastResult.taskId = taskId;
				if (lastResult.pollExpired === true) {
					return lastResult;
				}
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
	let url = buildApiUrl(baseUrl, endpoint.path, input);
	if (endpoint.method === 'GET' && endpoint.queryFields?.length) {
		const search = new URLSearchParams();
		for (const field of endpoint.queryFields) {
			const value = input[field];
			if (value === undefined || value === null || value === '') continue;
			search.set(field, Array.isArray(value) ? value.map(String).join(',') : String(value));
		}
		const queryString = search.toString();
		if (queryString) url = `${url}?${queryString}`;
	}
	const headers: HeadersMap = {
		Accept: 'application/json',
	};
	if (endpoint.authHeader === 'Authorization') {
		headers.Authorization = `Bearer ${apiKey}`;
	} else {
		headers['X-API-Key'] = apiKey;
	}

	if (endpoint.idempotencyHeader) {
		const rawIdem = input.idempotencyKey ?? input.idempotency_key;
		if (typeof rawIdem === 'string' && rawIdem.trim()) {
			headers['Idempotency-Key'] = rawIdem.trim();
		}
	}

	const init: FetchRequest = {
		method: endpoint.method,
		headers,
	};

	if (endpoint.method === 'POST' || endpoint.method === 'PATCH') {
		headers['Content-Type'] = 'application/json';
		init.body = JSON.stringify(buildBody(endpoint, input));
	}

	const response = await fetchTransport(url, init);
	const body = await readResponseBody(response);
	const statusAllowed = response.ok || (endpoint.allowHttpStatuses?.includes(response.status) ?? false);
	if (!statusAllowed) {
		throw new FrankLabHttpError(extractErrorMessage(body, response.status), response.status, body, response.headers);
	}
	if (endpoint.checkCodeEnvelopeError && isRecord(body) && typeof body.code === 'number' && body.code !== 200) {
		throw new FrankLabHttpError(extractErrorMessage(body, body.code), body.code, body, response.headers);
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
		if (endpoint.idempotencyHeader && (key === 'idempotencyKey' || key === 'idempotency_key')) continue;
		if (value === undefined || value === null || value === '') continue;
		body[key] = value;
	}

	const operation = defaultBodyOperation(endpoint.endpointId);
	if (operation && !body.operation) {
		body.operation = operation;
	}

	if (endpoint.endpointId === 'c2pa.generateSelfSigned') {
		body.action = 'generate_self_signed';
	}

	if (endpoint.bodyTransform === 'wrapOperationPayload') {
		const { operation: wrappedOperation, ...payload } = body;
		return {
			operation: typeof wrappedOperation === 'string' && wrappedOperation ? wrappedOperation : 'generate',
			payload,
		};
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
	const taskId =
		result.task_id ??
		result.taskId ??
		result.billing_task_id ??
		result.batch_id ??
		result.publicationId ??
		result.parentId ??
		result.importId ??
		result.sessionId ??
		result.videoId ??
		data.taskId ??
		data.billing_task_id ??
		data.batch_id ??
		data.publicationId ??
		data.parentId ??
		data.importId ??
		data.sessionId ??
		data.videoId ??
		input.taskId ??
		input.jobId ??
		input.dubbingId ??
		input.batchId ??
		input.releaseId ??
		input.importId ??
		input.sessionId ??
		input.videoId;

	if (endpoint.outputExtractor === 'list-result') {
		const items = extractListItems(rawData, result);
		const extra: Record<string, unknown> = {};
		for (const field of ['count', 'hasMore', 'nextCursor', 'nextToken', 'total_count']) {
			if (result[field] !== undefined) extra[field] = result[field];
			else if (data[field] !== undefined) extra[field] = data[field];
		}
		return { ...extra, items, profiles: items, data: items };
	}
	if (endpoint.outputExtractor === 'profile-options') {
		const items = Array.isArray(rawData) ? rawData : Array.isArray(result.items) ? result.items : Array.isArray(result.profiles) ? result.profiles : [];
		const options = items.filter(isRecord).map((item) => ({
			name: String(item.label ?? item.name ?? item.id ?? item.profileId ?? ''),
			value: String(item.id ?? item.profileId ?? ''),
		})).filter((option) => option.name && option.value);
		return { options, items, data: options };
	}

	const nestedVideo = isRecord(result.video) ? result.video : undefined;
	const videoUrl =
		result.videoUrl ??
		data.videoUrl ??
		nestedVideo?.video_url ??
		nestedVideo?.videoUrl ??
		nestedVideo?.url ??
		firstUrl(result.task_result, 'videos');

	return {
		...result,
		...pickCostFields(data),
		taskId,
		status,
		audioUrl: result.audioUrl ?? result.resultUrl ?? firstUrl(result.task_result, 'audios'),
		...(videoUrl !== undefined ? { videoUrl } : {}),
		resultUrl: result.resultUrl ?? result.audioUrl ?? videoUrl ?? firstUrl(result.task_result, 'audios'),
		downloadUrl: result.downloadUrl ?? data.downloadUrl ?? nestedVideo?.download_url ?? nestedVideo?.downloadUrl,
		error: result.error ?? data.error ?? root.message ?? root.msg ?? null,
	};
}

function extractListItems(rawData: unknown, result: Record<string, unknown>): unknown[] {
	if (Array.isArray(rawData)) return rawData;
	const arrayKeys = [
		'items',
		'profiles',
		'releases',
		'accounts',
		'boards',
		'channels',
		'workspaces',
		'brands',
		'destinations',
		'sets',
		'sessions',
		'styles',
		'videos',
		'avatarLooks',
		'voices',
	];
	for (const key of arrayKeys) {
		if (Array.isArray(result[key])) return result[key] as unknown[];
	}
	return [];
}

function extractErrorMessage(body: unknown, status: number): string {
	if (isRecord(body)) {
		const data = isRecord(body.data) ? body.data : {};
		const result = isRecord(data.result) ? data.result : {};
		const message = result.task_status_msg ?? result.error ?? data.error ?? body.msg ?? body.message ?? body.error;
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
		case 'volna.textToSpeechV4':
			return 'text-to-speech-v4';
		case 'volna.textToSpeechV4Turbo':
			return 'text-to-speech-v4-turbo';
		case 'volna.textToDialogue':
			return 'text-to-dialogue';
		case 'volna.textToSpeechTurbo':
			return 'text-to-speech-turbo';
		case 'volna.googleTts':
			return 'google-3-1-tts';
		case 'volna.googleTts38':
			return 'google-3-8-tts';
		case 'volna.googleTts38FlashLite':
			return 'google-3-8-flash-lite-tts';
		case 'volna.seedAudio':
			return 'seed-audio-1-0';
		case 'volna.xaiTts':
			return 'xai-text-to-speech';
		case 'volna.xaiTranscribe':
			return 'xai-speech-to-text';
		case 'volna.googleTranscribe':
			return 'google-speech-to-text';
		case 'volna.xaiVoiceList':
			return 'xai-voice-list';
		case 'variantPack.create':
			return 'variant_pack';
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
