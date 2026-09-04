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
];

const NO_POLL_OPERATIONS = [
	'estimate',
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

export async function executeFrankLabModule(
	context: IExecuteFunctions,
	moduleName: FrankLabModule,
	statusOperation: string | Record<string, string>,
): Promise<INodeExecutionData[][]> {
	const items = context.getInputData();
	const credentials = await context.getCredentials('frankLabApi');
	const client = createFrankLabClient({
		baseUrl: String(credentials.baseUrl),
		apiKey: String(credentials.apiKey),
		fetch: async (url, init) => {
			const responseBody = await context.helpers.httpRequest({
				method: init.method,
				url,
				headers: init.headers,
				body: init.body ? JSON.parse(init.body) : undefined,
				json: true,
			});
			return responseFromBody(responseBody);
		},
	});

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
	];

	for (const field of simpleFields) {
		const value = context.getNodeParameter(field, itemIndex, undefined) as unknown;
		if (value !== undefined && value !== '') {
			const targetField =
			field === 'operationName' || field === 'operationMode'
				? 'operation'
				: field === 'recraftModel'
						? 'model'
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
	if (operation === 'taskAction' && payload.jobId && !payload.taskId) {
		payload.taskId = payload.jobId;
	}
	if (moduleName === 'dola' && operation === 'getTask') {
		payload.billing_task_id = payload.billing_task_id ?? payload.taskId ?? payload.jobId;
	}
	if (operation.startsWith('get') && payload.jobId && !payload.taskId && !payload.billing_task_id && !payload.file_id) {
		payload.taskId = payload.jobId;
	}
	if (moduleName === 'hotCoffe' && operation === 'createVideo' && typeof payload.video_url === 'string' && payload.video_url) {
		if (!payload.video_list) {
			payload.video_list = [{ video_url: payload.video_url }];
		}
		delete payload.video_url;
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

	validatePublicMediaUrlsInPayload(payload, MODULE_EXACT_MEDIA_FIELDS[moduleName] ?? []);

	return payload;
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

function responseFromBody(body: unknown): FetchResponse {
	return {
		ok: true,
		status: 200,
		async json() {
			return body;
		},
		async text() {
			return JSON.stringify(body);
		},
	};
}
