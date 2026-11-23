import type { IExecuteFunctions, INodeExecutionData, INodeProperties, JsonObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createFrankLabClient } from './client';
import type { FetchResponse } from './client';
import { keyFor } from './registry';
import type { FrankLabModule } from './registry';
import { validatePublicMediaUrl, validatePublicMediaUrlsInPayload } from './url';

export const jobIdProperty: INodeProperties = {
	displayName: 'Job ID',
	name: 'jobId',
	type: 'string',
	default: '',
	required: true,
	displayOptions: {
		show: {
			operation: [
				'getStatus',
				'getTask',
				'getDubbing',
				'getTaskV1',
				'getTaskV2',
				'getOmniStatus',
				'getSeedreamStatus',
				'getTextStatus',
				'getImageStatus',
				'getEffectsStatus',
				'getMotionStatus',
				'getVideoStatus',
				'getTurboStatus',
				'getVideoOmniStatus',
				'getLipSyncStatus',
				'getAdvancedLipSyncStatus',
				'getAudioStatus',
				'getVideoAudioStatus',
				'getGoogleSubVideoStatus',
				'getGoogleSubImageStatus',
				'getRecraftStatus',
				'getGeminiStatus',
				'getGptImageCodexStatus',
				'getYouchuanImageStatus',
				'getYouchuanVideoStatus',
				'getVideoExtendStatus',
				'getMultiImageStatus',
				'getBatchStatus',
				'getMultipostStatus',
				'videoStatus',
				'imageStatus',
				'getImportStatus',
				'getSession',
				'listSessionVideos',
				'stopSession',
				'getVideo',
				'getAsyncTask',
				'taskAction',
			],
		},
	},
};

export const profileIdProperty: INodeProperties = {
	displayName: 'Profile ID',
	name: 'profileId',
	type: 'string',
	default: '',
	required: true,
	displayOptions: {
		show: {
			operation: ['revokeProfile'],
		},
	},
};

const READ_ONLY_OPERATIONS = [
	'getStatus',
	'getTask',
	'getDubbing',
	'getTaskV1',
	'getTaskV2',
	'getOmniStatus',
	'getSeedreamStatus',
	'getTextStatus',
	'getImageStatus',
	'getEffectsStatus',
	'getMotionStatus',
	'getVideoStatus',
	'getTurboStatus',
	'listProfiles',
	'profileOptions',
	'listSamples',
	'listVoices',
	'listModels',
	'usage',
	'revokeProfile',
	'listFonts',
	'listStickers',
	'listEmojis',
	'listSubtitleTemplates',
	'listVideoEffects',
	'listTransitions',
	'listTransitionSounds',
	'listSafeZoneOptions',
	'listAspectRatios',
	'listResizePresets',
	'info',
	'listElements',
	'getElement',
	'deleteElement',
	'getVoice',
	'deleteVoice',
	'listPresetVoices',
	'getVideoOmniStatus',
	'getLipSyncStatus',
	'getAdvancedLipSyncStatus',
	'getAudioStatus',
	'getVideoAudioStatus',
	'listTasks',
	'listTags',
	'listElementVoices',
	'listAdvancedPresets',
	'getAdvancedPreset',
	'listCustomVoices',
	'getCustomVoice',
	'getGoogleSubVideoStatus',
	'getGoogleSubImageStatus',
	'getRecraftStatus',
	'getAsyncTask',
	'listFiles',
	'getFile',
	'deleteFile',
	'listVideos',
	'idempotencyKey',
	'getGeminiStatus',
	'getGptImageCodexStatus',
	'getYouchuanImageStatus',
	'getYouchuanVideoStatus',
	'getVideoExtendStatus',
	'getMultiImageStatus',
	'getBatchStatus',
	'xaiVoiceList',
	'listElevenLabsVoicesRpc',
	'listXaiVoicesRpc',
	'listGoogleVoicesRpc',
	'listReleases',
	'insights',
	'listAccounts',
	'listBoards',
	'listModerationChannels',
	'listWorkspaces',
	'getConnectLink',
	'getMultipostStatus',
	'listMultipostBrands',
	'listMultipostDestinations',
	'listMultipostDestinationSets',
	'videoAvailability',
	'videoStatus',
	'imageAvailability',
	'imageStatus',
	'getImportStatus',
	'listBrands',
	'listLibraryVideos',
	'listSessions',
	'listStyles',
	'getSession',
	'getResource',
	'listSessionVideos',
	'getVideo',
	'listCredentials',
	'listAvatarLooks',
	'listBrandKits',
	'listBrandGlossaries',
];

const NO_POLL_OPERATIONS = [
	'estimate',
	'quoteVideo',
	'quoteBatch',
	'videoQuote',
	'imageQuote',
	'manage',
	'multipost',
	'moonOperation',
	'createSession',
	'sendMessage',
	'stopSession',
	'music',
	'lyrics',
	'style',
	'persona',
	'processing',
	'visuals',
	'taskAction',
	'identifyFace',
	'initSelection',
	'addSelection',
	'deleteSelection',
	'clearSelection',
	'previewSelection',
	'deleteCustomVoices',
];

// Bare keys that are media URLs on a specific module's DTO (validated by the shared
// SSRF policy). Modules whose DTOs accept base64 under the same bare key (e.g. Jupiter
// `image`) must NOT be listed here.
const MODULE_EXACT_MEDIA_FIELDS: Partial<Record<FrankLabModule, readonly string[]>> = {
	venus: ['image', 'sound_file'],
	mars: ['image'],
};

export const waitProperty: INodeProperties = {
	displayName: 'Wait for Completion',
	name: 'waitForCompletion',
	type: 'boolean',
	default: false,
	displayOptions: {
		hide: {
			operation: [...READ_ONLY_OPERATIONS, ...NO_POLL_OPERATIONS],
		},
	},
};

export const payloadProperty: INodeProperties = {
	displayName: 'Additional JSON',
	name: 'payloadJson',
	type: 'json',
	default: '{}',
	description: 'Additional FrankLab request fields as JSON. URL media fields must use public http or https URLs.',
	displayOptions: {
		hide: {
			operation: READ_ONLY_OPERATIONS,
		},
	},
};

export async function createN8nFrankLabClient(context: IExecuteFunctions) {
	const credentials = await context.getCredentials('frankLabApi');
	return createFrankLabClient({
		baseUrl: String(credentials.baseUrl),
		apiKey: String(credentials.apiKey),
		fetch: async (url, init) => {
			const rawResponse = await context.helpers.httpRequest({
				method: init.method,
				url,
				headers: init.headers,
				body: init.body ? JSON.parse(init.body) : undefined,
				json: true,
				returnFullResponse: true,
				ignoreHttpStatusErrors: true,
			});
			return responseFromHttpResult(rawResponse);
		},
	});
}

export async function executeFrankLabModule(
	context: IExecuteFunctions,
	moduleName: FrankLabModule,
	statusOperation: string | Record<string, string>,
): Promise<INodeExecutionData[][]> {
	const items = context.getInputData();
	const client = await createN8nFrankLabClient(context);

	const output: INodeExecutionData[] = [];

	for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
		try {
			const operation = context.getNodeParameter('operation', itemIndex) as string;
			const payload = buildPayload(context, itemIndex, moduleName, operation);
			const result = await client.request(keyFor(moduleName, operation), payload);
			// The wait toggle is hidden for NO_POLL/READ_ONLY operations, but workflows can
			// still carry waitForCompletion=true (imported JSON, API) — enforce it here so
			// those operations never poll a status endpoint from the wrong family.
			const shouldPoll =
				(context.getNodeParameter('waitForCompletion', itemIndex, false) as boolean) &&
				!NO_POLL_OPERATIONS.includes(operation) &&
				!READ_ONLY_OPERATIONS.includes(operation);
			const taskId = typeof result.taskId === 'string' ? result.taskId : '';
			const pollOperation = resolveStatusOperation(statusOperation, operation);
			const finalResult = shouldPoll && taskId && pollOperation ? await client.poll(keyFor(moduleName, pollOperation), taskId) : result;
			output.push({ json: finalResult as JsonObject, pairedItem: itemIndex });
		} catch (error) {
			if (context.continueOnFail()) {
				output.push({ json: { error: error instanceof Error ? error.message : String(error) }, pairedItem: itemIndex });
				continue;
			}
			throw new NodeOperationError(context.getNode(), error as Error, { itemIndex });
		}
	}

	return [output];
}

export function buildPayload(context: IExecuteFunctions, itemIndex: number, moduleName: FrankLabModule, operation: string): Record<string, unknown> {
	const payload = parsePayload(context.getNodeParameter('payloadJson', itemIndex, '{}') as string);
	const simpleFields = [
		'imageUrl',
		'videoUrl',
		'audioUrl',
		'audio_url',
		'sampleUrl',
		'text',
		'voice_id',
		'voice_id_2',
		'model_id',
		'language_code',
		'stability',
		'similarity_boost',
		'style',
		'output_format',
		'seed',
		'google_tts_mode',
		'google_voice_name',
		'speaker_1_name',
		'speaker_1_voice',
		'speaker_2_name',
		'speaker_2_voice',
		'style_prompt',
		'request_id',
		'label',
		'operationName',
		'speed',
		'duration_seconds',
		'prompt_influence',
		'jobId',
		'taskId',
		'dubbingId',
		'profileId',
		'sampleId',
		'name',
		'description',
		'clone_name',
		'clone_description',
		'file_url',
		'source_url',
		'target_lang',
		'source_lang',
		'dubbing_name',
		'num_speakers',
		'voice_description',
		'design_text',
		'voice_name',
		'generated_voice_id',
		'prompt',
		'system_prompt',
		'model',
		'model_key',
		'model_name',
		'moonModel',
		'templateId',
		'captionEngine',
		'language',
		'transcriptionEngine',
		'highlightMode',
		'platform',
		'safeZonePreset',
		'configId',
		'operationMode',
		'recraftModel',
		'modelVariant',
		'voice',
		'aspect_ratio',
		'resolution',
		'duration',
		'durationSeconds',
		'ratio',
		'mode',
		'source_mode',
		'execution_mode',
		'negative_prompt',
		'quality',
		'n',
		'size',
		'width',
		'height',
		'image_url',
		'video_url',
		'image',
		'sound_file',
		'effect',
		'effect_scene',
		'image_tail',
		'page_num',
		'page_size',
		'pageNum',
		'pageSize',
		'element_name',
		'element_description',
		'reference_type',
		'frontal_image',
		'element_voice_id',
		'voice_url',
		'video_id',
		'source_task_id',
		'voiceId',
		'id',
		'output_delivery',
		'url',
		'sound_file_url',
		'audio_id',
		'reference_image_url',
		'callback_url',
		'callbackUrl',
		'external_task_id',
		'idempotency_key',
		'scenario',
		'first_frame_stored_file_id',
		'title',
		'tags',
		'lyrics',
		'instrumental',
		'customMode',
		'async_mode',
		'response_format',
		'max_tokens',
		'temperature',
		'filename',
		'purpose',
		'file_id',
		'billing_task_id',
		'pollKind',
		'action',
		'media',
		'mediaUrl',
		'assetId',
		'mediaId',
		'caption',
		'destination',
		'connectionId',
		'workspaceId',
		'premoderation',
		'moderationChannelId',
		'moderationGroup',
		'scheduledAt',
		'externalRef',
		'articleTitle',
		'articleHtml',
		'articleCoverUrl',
		'aiDisclosure',
		'releaseId',
		'status',
		'from',
		'to',
		'limit',
		'cursor',
		'view',
		'platforms',
		'connectionIds',
		'brandIds',
		'brandId',
		'defaultCaption',
		'utmMode',
		'utmFallbackUrl',
		'destinationSetId',
		'destinationSetVersion',
		'poll',
		'confirmNoPostOnWall',
		'confirmRemoteDelete',
		'confirmPermanent',
		'idempotencyKey',
		'acceptedMaxFranks',
		'maxCostFranks',
		'sourceUrl',
		'importId',
		'clipCount',
		'order',
		'subtitles',
		'captionPosition',
		'frame',
		'topic',
		'copies',
		'variantPreset',
		'captionsEnabled',
		'captionHint',
		'captions',
		'referenceAudioUrl',
		'referenceVideoUrl',
		'overlayImageUrl',
		'overlayPosition',
		'overlayScale',
		'overlayOpacity',
		'overlayMargin',
		'sampleOperation',
		'text_prompt',
		'audio_format',
		'audio_sample_rate',
		'audio_speech_rate',
		'audio_loudness_rate',
		'audio_pitch_rate',
		'with_timestamps',
		'diarize',
		'format',
		'image_size',
		'version',
		'parent_task_id',
		'image_no',
		'video_no',
		'video_type',
		'batch',
		'motion',
		'loop',
		'end_image_url',
		'cfg_scale',
		'count',
		'quote_id',
		'accepted_total_franks',
		'batchId',
		'backend',
		'byted_token',
		'group_id',
		'asset_type',
		'asset_id',
		'project_name',
		'page_number',
		'providerAccountMode',
		'providerCredentialId',
		'sessionId',
		'resourceId',
		'videoId',
		'message',
		'avatar_id',
		'style_id',
		'brand_kit_id',
		'brand_glossary_id',
		'orientation',
		'visibility',
		'ownership',
		'avatar_type',
		'type',
		'engine',
		'gender',
		'pageToken',
	];

	for (const field of simpleFields) {
		const value = context.getNodeParameter(field, itemIndex, undefined) as unknown;
		if (value !== undefined && value !== '') {
			const targetField =
				field === 'operationName' || field === 'operationMode' || field === 'sampleOperation'
					? 'operation'
					: field === 'recraftModel'
						? 'model'
						: field === 'pageToken'
							? 'token'
							: field;
			payload[targetField] = value;
		}
	}

	if (operation === 'revokeProfile' && payload.profileId) {
		payload.profileId = String(payload.profileId);
	}

	if (operation === 'getTask' && payload.jobId && !payload.taskId) {
		payload.taskId = payload.jobId;
	}
	if (operation === 'getDubbing' && payload.jobId && !payload.dubbingId) {
		payload.dubbingId = payload.jobId;
	}
	if (operation === 'getBatchStatus' && payload.jobId && !payload.batchId) {
		payload.batchId = payload.jobId;
	}
	if (moduleName === 'social' && operation === 'getStatus' && payload.jobId && !payload.releaseId) {
		payload.releaseId = payload.jobId;
	}
	if (moduleName === 'social' && operation === 'getMultipostStatus' && payload.jobId && !payload.id) {
		payload.id = payload.jobId;
	}
	if (moduleName === 'narezka' && operation === 'getImportStatus' && payload.jobId && !payload.importId) {
		payload.importId = payload.jobId;
	}
	if (moduleName === 'heygenAgent') {
		if ((operation === 'getSession' || operation === 'listSessionVideos' || operation === 'stopSession') && payload.jobId && !payload.sessionId) {
			payload.sessionId = payload.jobId;
		}
		if (operation === 'getVideo' && payload.jobId && !payload.videoId) {
			payload.videoId = payload.jobId;
		}
	}
	if (moduleName === 'kusok' && operation === 'moonOperation' && !payload.backend) {
		payload.backend = 'moon';
	}
	if (moduleName === 'variantPack' && operation === 'estimate' && !payload.operation) {
		payload.operation = 'variant_pack';
	}
	if (operation === 'taskAction' && payload.jobId && !payload.taskId) {
		payload.taskId = payload.jobId;
	}
	if (moduleName === 'dola' && operation === 'getTask') {
		payload.billing_task_id = payload.billing_task_id ?? payload.taskId ?? payload.jobId;
	}
	if (
		(operation.startsWith('get') || operation === 'videoStatus' || operation === 'imageStatus') &&
		payload.jobId &&
		!payload.taskId &&
		!payload.billing_task_id &&
		!payload.file_id &&
		!payload.batchId &&
		!payload.releaseId &&
		!payload.importId &&
		!payload.sessionId &&
		!payload.videoId
	) {
		payload.taskId = payload.jobId;
	}
	if (moduleName === 'hotCoffe' && operation === 'createVideo' && typeof payload.video_url === 'string' && payload.video_url) {
		if (!payload.video_list) {
			payload.video_list = [{ video_url: payload.video_url }];
		}
		delete payload.video_url;
	}
	if (moduleName === 'omni' && (operation === 'quoteBatch' || operation === 'createBatch') && !payload.request) {
		const topLevelKeys = new Set(['count', 'idempotency_key', 'quote_id', 'accepted_total_franks']);
		const request: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(payload)) {
			if (!topLevelKeys.has(k)) {
				request[k] = v;
				delete payload[k];
			}
		}
		payload.request = request;
	}
	if (moduleName === 'omni' && operation === 'videoOmni' && typeof payload.video_url === 'string' && payload.video_url) {
		if (!payload.video_list) {
			payload.video_list = [{ video_url: payload.video_url }];
		}
		delete payload.video_url;
	}
	if (moduleName === 'kusok' && (operation === 'createElement' || operation === 'createElementAsync') && typeof payload.image_url === 'string' && payload.image_url) {
		const referImages = Array.isArray(payload.refer_images) ? [...(payload.refer_images as unknown[])] : [];
		referImages.unshift({ image_url: payload.image_url });
		payload.refer_images = referImages;
		delete payload.image_url;
	}
	if (moduleName === 'jupiter' && operation === 'recraftImage' && typeof payload.image === 'string' && payload.image) {
		validatePublicMediaUrl(payload.image);
		payload.input = { ...(typeof payload.input === 'object' && payload.input !== null ? (payload.input as Record<string, unknown>) : {}), image: payload.image };
		delete payload.image;
	}

	validateModulePayload(moduleName, payload);

	return payload;
}

export function validateModulePayload(moduleName: FrankLabModule, payload: Record<string, unknown>): void {
	validatePublicMediaUrlsInPayload(payload, MODULE_EXACT_MEDIA_FIELDS[moduleName] ?? []);
	validateConditionalUrls(moduleName, payload);
}

function validateConditionalUrls(moduleName: FrankLabModule, payload: Record<string, unknown>): void {
	if (moduleName === 'social') {
		const mediaEntries = Array.isArray(payload.media)
			? payload.media
			: typeof payload.media === 'string'
				? [payload.media]
				: [];
		for (const entry of mediaEntries) {
			if (typeof entry === 'string') {
				const trimmed = entry.trim();
				if (/^https?:\/\//i.test(trimmed)) {
					validatePublicMediaUrl(trimmed);
				}
			}
		}
		if (typeof payload.settings === 'object' && payload.settings !== null && !Array.isArray(payload.settings)) {
			const link = (payload.settings as Record<string, unknown>).link;
			if (typeof link === 'string' && link.trim()) {
				validatePublicMediaUrl(link.trim());
			}
		}
	}
	if (moduleName === 'flux') {
		const req =
			typeof payload.request === 'object' && payload.request !== null && !Array.isArray(payload.request)
				? (payload.request as Record<string, unknown>)
				: payload;
		for (const field of ['video', 'start_video']) {
			const val = req[field];
			if (typeof val === 'string' && val.trim()) {
				validatePublicMediaUrl(val.trim());
			}
		}
		for (const field of ['keyframes', 'images']) {
			const val = req[field];
			const entries = Array.isArray(val) ? val : typeof val === 'string' ? [val] : [];
			for (const entry of entries) {
				const candidate = Array.isArray(entry) ? entry[1] : entry;
				if (typeof candidate === 'string') {
					const trimmed = candidate.trim();
					if (/^https?:\/\//i.test(trimmed)) {
						validatePublicMediaUrl(trimmed);
					}
				}
			}
		}
	}
}

function resolveStatusOperation(statusOperation: string | Record<string, string>, operation: string): string {
	if (typeof statusOperation === 'string') return statusOperation;
	return statusOperation[operation] ?? statusOperation.default ?? '';
}

function parsePayload(raw: string): Record<string, unknown> {
	if (!raw.trim()) return {};
	const parsed = JSON.parse(raw);
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		throw new Error('Additional JSON must be an object');
	}
	return parsed as Record<string, unknown>;
}

function responseFromHttpResult(rawResponse: unknown): FetchResponse {
	const isFull =
		typeof rawResponse === 'object' &&
		rawResponse !== null &&
		'statusCode' in rawResponse &&
		typeof (rawResponse as { statusCode?: unknown }).statusCode === 'number' &&
		'body' in rawResponse;
	const status = isFull ? Number((rawResponse as { statusCode: number }).statusCode) : 200;
	const body = isFull ? (rawResponse as { body: unknown }).body : rawResponse;
	return {
		ok: status >= 200 && status < 300,
		status,
		async json() {
			return body;
		},
		async text() {
			return typeof body === 'string' ? body : JSON.stringify(body);
		},
	};
}
