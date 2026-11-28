import type { IExecuteFunctions, INodeExecutionData, INodeProperties, JsonObject } from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import { createFrankLabClient, FrankLabHttpError } from './client';
import type { FetchResponse, FrankLabClient } from './client';
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
				'getMidjourneyImageStatus',
				'getMidjourneyVideoStatus',
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
			resource: ['c2pa'],
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
	'getMidjourneyImageStatus',
	'getMidjourneyVideoStatus',
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
	jupiter: ['reference_images', 'sref', 'cref', 'oref'],
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

export function scopePropertiesToResource(moduleName: FrankLabModule, properties: INodeProperties[]): INodeProperties[] {
	return properties.map((property) => {
		const existingShow = property.displayOptions?.show ?? {};
		const nextDisplayOptions = {
			...(property.displayOptions ?? {}),
			show: {
				...existingShow,
				resource: [moduleName],
			},
		};
		return {
			...property,
			displayOptions: nextDisplayOptions,
		};
	});
}

export function createNodeApiError(context: IExecuteFunctions, error: unknown, itemIndex: number): NodeApiError | NodeOperationError {
	if (error instanceof NodeApiError || error instanceof NodeOperationError) {
		return error;
	}
	if (error instanceof FrankLabHttpError) {
		return new NodeApiError(context.getNode(), error.toJsonObject() as JsonObject, {
			itemIndex,
			httpCode: error.httpCode,
			message: error.message,
		});
	}
	const payload =
		error instanceof Error
			? ({ message: error.message, name: error.name } as JsonObject)
			: ({ message: String(error) } as JsonObject);
	return new NodeApiError(context.getNode(), payload, {
		itemIndex,
		message: error instanceof Error ? error.message : String(error),
	});
}

export async function executeFrankLabItem(
	context: IExecuteFunctions,
	client: FrankLabClient,
	itemIndex: number,
	moduleName: FrankLabModule,
	operation: string,
	statusOperation: string | Record<string, string>,
): Promise<Record<string, unknown>> {
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
	return shouldPoll && taskId && pollOperation ? await client.poll(keyFor(moduleName, pollOperation), taskId) : result;
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
			const finalResult = await executeFrankLabItem(context, client, itemIndex, moduleName, operation, statusOperation);
			output.push({ json: finalResult as JsonObject, pairedItem: itemIndex });
		} catch (error) {
			if (context.continueOnFail()) {
				output.push({ json: { error: error instanceof Error ? error.message : String(error) }, pairedItem: itemIndex });
				continue;
			}
			throw createNodeApiError(context, error, itemIndex);
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
		'thinking_level',
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
		'dynamic_range',
		'audio',
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
		'first_frame_url',
		'middle_frame_urls',
		'last_frame_url',
		'refer_image_urls',
		'base_video_url',
		'feature_video_url',
		'element_ids',
		'voice_ids',
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
		'kling4_result_type',
		'series_amount',
		'kling4_long_skill',
		'kling4_long_length',
		'reference_images',
		'element_ids',
		'style_refer_image_url',
		'subject_refer_image_url',
		'image_urls',
		'mjVersion',
		'mjSize',
		'mjQuality',
		'index',
		'custom_id',
		'dimensions',
		'stylize',
		'chaos',
		'weird',
		'zoom_ratio',
		'direction',
		'mask_url',
		'batch_size',
	];

	for (const field of simpleFields) {
		let value = context.getNodeParameter(field, itemIndex, undefined) as unknown;
		if (Array.isArray(value)) {
			const cleaned = value
				.map((item) => (typeof item === 'string' ? item.trim() : item))
				.filter((item) => item !== '' && item !== undefined && item !== null);
			if (cleaned.length === 0) continue;
			value = cleaned;
		} else if (field === 'image_urls' && typeof value === 'string') {
			const trimmed = value.trim();
			if (!trimmed) continue;
			value = [trimmed];
		}
		if (value !== undefined && value !== null && value !== '') {
			const targetField =
				field === 'operationName' || field === 'operationMode' || field === 'sampleOperation'
					? 'operation'
					: field === 'recraftModel'
						? 'model'
						: field === 'pageToken'
							? 'token'
							: field === 'mjVersion'
								? 'version'
								: field === 'mjSize'
									? 'size'
									: field === 'mjQuality'
										? 'quality'
										: field;
			// Do not let the UI default model_name ('jupiter-v1-5') clobber an explicit model_name in payloadJson.
			if (
				moduleName === 'jupiter' &&
				operation === 'omniImage' &&
				targetField === 'model_name' &&
				value === 'jupiter-v1-5' &&
				typeof payload.model_name === 'string' &&
				payload.model_name.trim() !== ''
			) {
				continue;
			}
			payload[targetField] = value;
		}
	}

	if (payload.execution_mode === 'direct') {
		delete payload.execution_mode;
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
	if (moduleName === 'hotCoffe' && operation === 'createVideo') {
		if (payload.execution_mode === 'economy_rail' && payload.operation === 'video_extend') {
			throw new Error('video_extend is not supported on economy_rail');
		}
		if (typeof payload.video_url === 'string' && payload.video_url) {
			if (!payload.video_list) {
				payload.video_list = [{ video_url: payload.video_url }];
			}
			delete payload.video_url;
		}
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
	normalizeKling4VideoPayload(moduleName, operation, payload);
	if (moduleName === 'jupiter' && operation === 'omniImage') {
		const rawModel = typeof payload.model_name === 'string' ? payload.model_name.trim().toLowerCase() : '';
		if (rawModel === 'jupiter-v2' || rawModel === 'jupiter-v2-long') {
			normalizeKling4ImagePayload(payload, rawModel);
		} else {
			for (const key of [
				'kling4_result_type', 'kling4_long_skill', 'kling4_long_length',
				'reference_images', 'element_ids', 'style_refer_image_url', 'subject_refer_image_url',
			]) {
				delete payload[key];
			}
		}
	}

	validateModulePayload(moduleName, payload);

	return payload;
}

function splitListField(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value.map((entry) => (typeof entry === 'string' ? entry.trim() : String(entry ?? '').trim())).filter(Boolean);
	}
	if (typeof value === 'string') {
		return value
			.split(/[\n,]+/)
			.map((entry) => entry.trim())
			.filter(Boolean);
	}
	return [];
}

const KLING_4_LEGACY_FLAT_KEYS = [
	'resolution',
	'dynamic_range',
	'duration',
	'aspect_ratio',
	'audio',
	'negative_prompt',
	'mode',
	'sound',
	'cfg_scale',
	'multi_shot',
	'shot_type',
	'multi_prompt',
	'image_list',
	'video_list',
	'element_list',
	'voice_list',
	'callback_url',
	'external_task_id',
	'first_frame_url',
	'middle_frame_urls',
	'last_frame_url',
	'refer_image_urls',
	'base_video_url',
	'feature_video_url',
	'element_ids',
	'voice_ids',
] as const;

function normalizeKling4VideoPayload(
	moduleName: FrankLabModule,
	operation: string,
	payload: Record<string, unknown>,
): void {
	if (moduleName === 'mars' && (operation === 'textToVideo' || operation === 'imageToVideo')) {
		const marsModel =
			typeof payload.model_name === 'string' && payload.model_name
				? payload.model_name
				: typeof payload.model === 'string'
					? payload.model
					: '';
		if (marsModel !== 'mars-v2' && marsModel !== 'mars-v2-flash') return;
		const isFlash = marsModel === 'mars-v2-flash';
		payload.model_name = marsModel;
		delete payload.model;

		const existingSettings =
			typeof payload.settings === 'object' && payload.settings !== null && !Array.isArray(payload.settings)
				? ({ ...(payload.settings as Record<string, unknown>) } as Record<string, unknown>)
				: {};
		if (isFlash) {
			existingSettings.resolution = '720p';
			delete existingSettings.dynamic_range;
		} else {
			if (payload.resolution !== undefined) existingSettings.resolution = payload.resolution;
			else if (existingSettings.resolution === undefined) existingSettings.resolution = '1080p';
			if (payload.dynamic_range !== undefined) existingSettings.dynamic_range = payload.dynamic_range;
		}
		if (payload.duration !== undefined) existingSettings.duration = Number(payload.duration);
		else if (existingSettings.duration === undefined) existingSettings.duration = 10;
		if (operation === 'textToVideo') {
			if (payload.aspect_ratio !== undefined) existingSettings.aspect_ratio = payload.aspect_ratio;
			else if (existingSettings.aspect_ratio === undefined) existingSettings.aspect_ratio = '16:9';
			delete payload.image;
			delete payload.image_tail;
			delete payload.contents;
		} else {
			delete existingSettings.aspect_ratio;
		}
		payload.settings = existingSettings;

		if (operation === 'imageToVideo') {
			if (!Array.isArray(payload.contents)) {
				const contents: Array<Record<string, unknown>> = [];
				if (typeof payload.prompt === 'string' && payload.prompt.trim()) {
					contents.push({ type: 'prompt', text: payload.prompt.trim() });
				}
				let imageIdx = 0;
				const firstFrame = typeof payload.image === 'string' ? payload.image.trim() : '';
				if (firstFrame) {
					imageIdx += 1;
					contents.push({ type: 'first_frame', url: firstFrame });
				}
				if (!isFlash) {
					const middleFrames = splitListField(payload.middle_frame_urls);
					for (const url of middleFrames) {
						imageIdx += 1;
						contents.push({ type: 'middle_frame', url, id: `Image${imageIdx}` });
					}
					const lastFrame = typeof payload.image_tail === 'string' ? payload.image_tail.trim() : '';
					if (lastFrame) {
						contents.push({ type: 'last_frame', url: lastFrame });
					}
				}
				payload.contents = contents;
			}
			delete payload.prompt;
			delete payload.image;
			delete payload.image_tail;
		}
		for (const key of KLING_4_LEGACY_FLAT_KEYS) delete payload[key];
		return;
	}

	if (moduleName === 'saturn' && operation === 'video') {
		const saturnModel = typeof payload.model_name === 'string' ? payload.model_name : '';
		if (saturnModel !== 'saturn-v2' && saturnModel !== 'saturn-v2-flash') return;
		const isFlash = saturnModel === 'saturn-v2-flash';

		const existingSettings =
			typeof payload.settings === 'object' && payload.settings !== null && !Array.isArray(payload.settings)
				? ({ ...(payload.settings as Record<string, unknown>) } as Record<string, unknown>)
				: {};
		if (isFlash) {
			existingSettings.resolution = '720p';
			delete existingSettings.dynamic_range;
		} else {
			if (payload.resolution !== undefined) existingSettings.resolution = payload.resolution;
			else if (existingSettings.resolution === undefined) existingSettings.resolution = '1080p';
			if (payload.dynamic_range !== undefined) existingSettings.dynamic_range = payload.dynamic_range;
		}
		if (payload.duration !== undefined) existingSettings.duration = Number(payload.duration);
		else if (existingSettings.duration === undefined) existingSettings.duration = 10;
		if (payload.aspect_ratio !== undefined) existingSettings.aspect_ratio = payload.aspect_ratio;
		else if (existingSettings.aspect_ratio === undefined) existingSettings.aspect_ratio = 'adaptive';
		if (payload.audio !== undefined) existingSettings.audio = payload.audio;
		payload.settings = existingSettings;

		if (!Array.isArray(payload.contents)) {
			const contents: Array<Record<string, unknown>> = [];
			if (typeof payload.prompt === 'string' && payload.prompt.trim()) {
				contents.push({ type: 'prompt', text: payload.prompt.trim() });
			}
			let imageIdx = 0;
			let videoIdx = 0;
			const firstFrame = typeof payload.first_frame_url === 'string' ? payload.first_frame_url.trim() : '';
			if (firstFrame) {
				imageIdx += 1;
				contents.push({ type: 'first_frame', url: firstFrame, id: `Image${imageIdx}` });
			}
			if (!isFlash) {
				for (const url of splitListField(payload.middle_frame_urls)) {
					imageIdx += 1;
					contents.push({ type: 'middle_frame', url, id: `Image${imageIdx}` });
				}
			}
			for (const url of splitListField(payload.refer_image_urls)) {
				imageIdx += 1;
				contents.push({ type: 'refer_image', url, id: `Image${imageIdx}` });
			}
			if (!isFlash) {
				const lastFrame = typeof payload.last_frame_url === 'string' ? payload.last_frame_url.trim() : '';
				if (lastFrame) {
					imageIdx += 1;
					contents.push({ type: 'last_frame', url: lastFrame, id: `Image${imageIdx}` });
				}
			}
			const baseVideo = typeof payload.base_video_url === 'string' ? payload.base_video_url.trim() : '';
			if (baseVideo) {
				videoIdx += 1;
				contents.push({ type: 'base_video', url: baseVideo, id: `Video${videoIdx}` });
			}
			const featureVideo = typeof payload.feature_video_url === 'string' ? payload.feature_video_url.trim() : '';
			if (featureVideo) {
				videoIdx += 1;
				contents.push({ type: 'feature_video', url: featureVideo, id: `Video${videoIdx}` });
			}
			splitListField(payload.element_ids).forEach((elementId, index) => {
				contents.push({ type: 'element', element_id: elementId, id: `Element${index + 1}` });
			});
			if (!isFlash) {
				splitListField(payload.voice_ids).forEach((voiceId, index) => {
					contents.push({ type: 'voice', voice_id: voiceId, id: `Voice${index + 1}` });
				});
			}
			payload.contents = contents;
		}
		delete payload.prompt;
		delete payload.image;
		delete payload.image_tail;
		for (const key of KLING_4_LEGACY_FLAT_KEYS) delete payload[key];
	}
}

function validateKling4HttpsMediaUrl(rawUrl: string): string {
	const cleaned = rawUrl.trim();
	validatePublicMediaUrl(cleaned);
	const parsed = new URL(cleaned);
	if (parsed.protocol !== 'https:') {
		throw new Error('Kling 4.0 Image media URLs must use https://');
	}
	return cleaned;
}

function normalizeKling4ImagePayload(payload: Record<string, unknown>, model: 'jupiter-v2' | 'jupiter-v2-long'): void {
	payload.model_name = model;
	const hasExplicitContents = Array.isArray(payload.contents);
	const existingSettings =
		typeof payload.settings === 'object' && payload.settings !== null && !Array.isArray(payload.settings)
			? ({ ...(payload.settings as Record<string, unknown>) })
			: {};

	if (model === 'jupiter-v2-long') {
		const rawSkill = String(existingSettings.skill ?? payload.kling4_long_skill ?? 'ecommerce').trim().toLowerCase();
		const skill = rawSkill === 'webpage' ? 'webpage' : 'ecommerce';
		const rawRes = String(existingSettings.resolution ?? payload.resolution ?? '2k').trim().toLowerCase();
		const resolution = rawRes === '1k' ? '1k' : '2k';
		if (!hasExplicitContents) {
			const contents: Array<Record<string, unknown>> = [];
			if (typeof payload.prompt === 'string' && payload.prompt.trim()) {
				contents.push({ type: 'prompt', text: payload.prompt.trim() });
			}
			if (skill === 'ecommerce') {
				const refUrls = splitListField(payload.reference_images);
				if (refUrls.length < 1 || refUrls.length > 3) {
					throw new Error('Kling 4.0 Long Image ecommerce skill requires 1 to 3 reference image URLs');
				}
				refUrls.forEach((url, idx) => {
					const safeUrl = validateKling4HttpsMediaUrl(url);
					contents.push({ type: 'refer_image', url: safeUrl, id: `Image${idx + 1}` });
				});
			} else {
				let webIdx = 0;
				const styleUrl = typeof payload.style_refer_image_url === 'string' ? payload.style_refer_image_url.trim() : '';
				if (styleUrl) {
					const safeUrl = validateKling4HttpsMediaUrl(styleUrl);
					webIdx += 1;
					contents.push({ type: 'style_refer_image', url: safeUrl, id: `Image${webIdx}` });
				}
				const subjectUrl = typeof payload.subject_refer_image_url === 'string' ? payload.subject_refer_image_url.trim() : '';
				if (subjectUrl) {
					const safeUrl = validateKling4HttpsMediaUrl(subjectUrl);
					webIdx += 1;
					contents.push({ type: 'subject_refer_image', url: safeUrl, id: `Image${webIdx}` });
				}
			}
			payload.contents = contents;
		}
		if (skill === 'ecommerce') {
			const rawLength = String(existingSettings.length ?? payload.kling4_long_length ?? 'medium').trim().toLowerCase();
			const length = rawLength === 'short' || rawLength === 'long' ? rawLength : 'medium';
			payload.settings = { skill: 'ecommerce', length, resolution };
		} else {
			payload.settings = { skill: 'webpage', resolution };
		}
	} else {
		const rawResultType = String(existingSettings.result_type ?? payload.kling4_result_type ?? 'single').trim().toLowerCase();
		const result_type = rawResultType === 'series' ? 'series' : 'single';
		const rawRes = String(existingSettings.resolution ?? payload.resolution ?? '2k').trim().toLowerCase();
		const resolution = rawRes === '4k' || rawRes === '8k' ? rawRes : '2k';
		const rawAr = String(existingSettings.aspect_ratio ?? payload.aspect_ratio ?? 'auto').trim().toLowerCase();
		const aspect_ratio = rawAr || 'auto';
		if (!hasExplicitContents) {
			const contents: Array<Record<string, unknown>> = [];
			if (typeof payload.prompt === 'string' && payload.prompt.trim()) {
				contents.push({ type: 'prompt', text: payload.prompt.trim() });
			}
			const refUrls = splitListField(payload.reference_images);
			const elementIds = splitListField(payload.element_ids);
			if (refUrls.length + elementIds.length > 10) {
				throw new Error('Kling 4.0 Image allows at most 10 combined reference images and elements');
			}
			refUrls.forEach((url, idx) => {
				const safeUrl = validateKling4HttpsMediaUrl(url);
				contents.push({ type: 'refer_image', url: safeUrl, id: `Image${idx + 1}` });
			});
			elementIds.forEach((element_id, idx) => {
				contents.push({ type: 'element', element_id, id: `Element${idx + 1}` });
			});
			payload.contents = contents;
		}
		const settings: Record<string, unknown> = { result_type, resolution, aspect_ratio };
		if (result_type === 'series') {
			const rawAmount = existingSettings.series_amount ?? payload.series_amount ?? 'auto';
			const normAmount = String(rawAmount).trim().toLowerCase();
			if (normAmount === 'auto' || normAmount === '') {
				settings.series_amount = 'auto';
			} else {
				const parsed = Number(normAmount);
				if (!Number.isInteger(parsed) || parsed < 2 || parsed > 10) {
					throw new Error('Kling 4.0 Image series_amount must be "auto" or an integer between 2 and 10');
				}
				settings.series_amount = parsed;
			}
		} else {
			const rawN = existingSettings.n ?? payload.n ?? 1;
			const parsedN = Number(rawN);
			if (!Number.isInteger(parsedN) || parsedN < 1 || parsedN > 9) {
				throw new Error('Kling 4.0 Image single count n must be an integer between 1 and 9');
			}
			settings.n = parsedN;
		}
		payload.settings = settings;
	}

	// Scrub all flat helper/legacy keys so Kling 4.0 Image receives canonical payload only.
	for (const key of [
		'prompt', 'resolution', 'aspect_ratio', 'n', 'quality',
		'kling4_result_type', 'series_amount', 'kling4_long_skill', 'kling4_long_length',
		'reference_images', 'element_ids', 'style_refer_image_url', 'subject_refer_image_url',
	]) {
		delete payload[key];
	}
}

export function validateModulePayload(moduleName: FrankLabModule, payload: Record<string, unknown>): void {
	validatePublicMediaUrlsInPayload(payload, MODULE_EXACT_MEDIA_FIELDS[moduleName] ?? []);
	validateConditionalUrls(moduleName, payload);
}

function validateConditionalUrls(moduleName: FrankLabModule, payload: Record<string, unknown>): void {
	if ((moduleName === 'mars' || moduleName === 'saturn') && Array.isArray(payload.contents)) {
		for (const entry of payload.contents) {
			if (typeof entry === 'object' && entry !== null && !Array.isArray(entry)) {
				const url = (entry as Record<string, unknown>).url;
				if (typeof url === 'string' && url.trim()) {
					validatePublicMediaUrl(url.trim());
				}
			}
		}
	}
	if (moduleName === 'jupiter' && Array.isArray(payload.contents)) {
		for (const item of payload.contents) {
			if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
				const url = (item as Record<string, unknown>).url;
				if (typeof url === 'string' && url.trim()) {
					validateKling4HttpsMediaUrl(url.trim());
				}
			}
		}
	}
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
	if (moduleName === 'jupiter') {
		if (typeof payload.mask_url === 'string' && payload.mask_url.trim()) {
			validatePublicMediaUrl(payload.mask_url.trim());
		}
		const imageUrls = Array.isArray(payload.image_urls)
			? payload.image_urls
			: typeof payload.image_urls === 'string'
				? [payload.image_urls]
				: [];
		for (const entry of imageUrls) {
			if (typeof entry === 'string' && entry.trim()) {
				validatePublicMediaUrl(entry.trim());
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
	const headers =
		isFull && 'headers' in rawResponse && typeof (rawResponse as { headers?: unknown }).headers === 'object' && (rawResponse as { headers?: unknown }).headers !== null
			? ((rawResponse as { headers: Record<string, unknown> }).headers)
			: undefined;
	return {
		ok: status >= 200 && status < 300,
		status,
		headers,
		async json() {
			return body;
		},
		async text() {
			return typeof body === 'string' ? body : JSON.stringify(body);
		},
	};
}
