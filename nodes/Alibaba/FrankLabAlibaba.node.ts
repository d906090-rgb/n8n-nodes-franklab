import type { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, INodeProperties, JsonObject } from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { buildPayload, jobIdProperty, payloadProperty, waitProperty } from '../shared/node-utils';
import { createFrankLabClient } from '../shared/client';
import type { FetchResponse } from '../shared/client';
import { keyFor } from '../shared/registry';
import { validatePublicMediaUrlsInPayload } from '../shared/url';

// Backend-authoritative shape: `franklab-api/src/make-capabilities/dto/alibaba-make.dto.ts`
// (`MakeAlibabaImageAssetDto`). Both firstFrame and lastFrame use this descriptor.
const FRANKLAB_ASSET_COLLECTION_OPTIONS: INodeProperties[] = [
	{
		displayName: 'Stored File ID',
		name: 'storedFileId',
		type: 'string',
		default: '',
		description: 'UUID of a file already uploaded to FrankLab. An external (non-FrankLab) URL is rejected by the backend.',
	},
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		default: '',
		description: 'Https://franklab.ru/franklab/api/media/&lt;storedFileId&gt;',
	},
	{
		displayName: 'MIME Type',
		name: 'mimeType',
		type: 'options',
		default: 'image/png',
		options: [
			{ name: 'Image/png', value: 'image/png' },
			{ name: 'Image/jpeg', value: 'image/jpeg' },
			{ name: 'Image/webp', value: 'image/webp' },
		],
	},
	{
		displayName: 'Width (Px)',
		name: 'width',
		type: 'number',
		default: 0,
		description: 'At least 300px; aspect ratio between 1:2.5 and 2.5:1',
	},
	{
		displayName: 'Height (Px)',
		name: 'height',
		type: 'number',
		default: 0,
		description: 'At least 300px; aspect ratio between 1:2.5 and 2.5:1',
	},
	{
		displayName: 'Size (Bytes)',
		name: 'sizeBytes',
		type: 'number',
		default: 0,
		description: 'File size in bytes, at most 20MB (20971520)',
	},
];

// Video model dropdown, gated separately from the image/estimate 'model' field below
// (disjoint 'operation' show-lists, same n8n pattern already used by e.g. Mars 'duration').
// Values match `MAKE_ALIBABA_VIDEO_MODELS` in the backend DTO. Omitted keeps the historical
// HappyHorse T2V/I2V body; only 'wan3.0-video' reaches audio/prompt extension/watermark/
// last frame/reference images below.
const videoModelField: INodeProperties = {
	displayName: 'Video Model',
	name: 'model',
	type: 'options',
	default: '',
	options: [
		{ name: '(Default) HappyHorse 1.1', value: '' },
		{ name: 'WAN 3.0 Video', value: 'wan3.0-video' },
		{ name: 'HappyHorse 1.1 (Text to Video)', value: 'happyhorse-1.1-t2v' },
		{ name: 'HappyHorse 1.1 (Image to Video)', value: 'happyhorse-1.1-i2v' },
	],
	description:
		'Omitted (default) keeps the historical HappyHorse body. WAN 3.0 Video also accepts Audio, Prompt Extension, Watermark, Last Frame and Reference Images below; HappyHorse rejects Reference to Video entirely.',
	displayOptions: { show: { operation: ['generateVideo'] } },
};

const generateFields: INodeProperties[] = [
	{
		displayName: 'Prompt',
		name: 'prompt',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		displayOptions: { show: { operation: ['generateImage', 'generateVideo'] } },
	},
	{
		displayName: 'Model',
		name: 'model',
		type: 'string',
		default: '',
		description: "Optional image model ID (e.g. qwen-image-3.0, qwen-image-3.0-pro; omitted keeps Z-Image Turbo), or a video model ID for a video estimate",
		displayOptions: { show: { operation: ['generateImage', 'estimate'] } },
	},
	// Qwen Image only (Z-Image Turbo has no edit mode). Named 'qwenOperation', not
	// 'operation', to avoid colliding with the node's own top-level Operation dropdown;
	// mapped onto the DTO's `operation` body field in buildAlibabaPayload below. Matches the
	// Make image module, which names its own UI field the same way for the same reason.
	{
		displayName: 'Qwen Operation',
		name: 'qwenOperation',
		type: 'options',
		noDataExpression: true,
		default: 'text_to_image',
		options: [
			{ name: 'Text to Image', value: 'text_to_image', action: 'Generate a qwen image from text' },
			{ name: 'Image Edit', value: 'image_edit', action: 'Edit 1-3 FrankLab images with qwen' },
		],
		description: 'Qwen Image 3.0 / 3.0 Pro only. Ignored when Model is left at the default (Z-Image Turbo).',
		displayOptions: { show: { operation: ['generateImage'] } },
	},
	{
		displayName: 'Edit Image IDs',
		name: 'editImageIds',
		type: 'string',
		typeOptions: { multipleValues: true },
		default: [],
		description: '1-3 FrankLab storedFileId UUIDs of the source images to edit. Not an external URL — the backend rejects one.',
		displayOptions: { show: { operation: ['generateImage'], qwenOperation: ['image_edit'] } },
	},
	videoModelField,
	{
		displayName: 'Size',
		name: 'size',
		type: 'string',
		default: '',
		description: 'Optional explicit image size',
		displayOptions: { show: { operation: ['generateImage'] } },
	},
	{
		displayName: 'Width',
		name: 'width',
		type: 'number',
		default: '',
		description: 'Image width (image estimates only; video estimates ignore it)',
		displayOptions: { show: { operation: ['generateImage', 'estimate'] } },
	},
	{
		displayName: 'Height',
		name: 'height',
		type: 'number',
		default: '',
		description: 'Image height (image estimates only; video estimates ignore it)',
		displayOptions: { show: { operation: ['generateImage', 'estimate'] } },
	},
	{
		displayName: 'Number of Images',
		name: 'n',
		type: 'number',
		default: '',
		description: 'Number of images (image estimates only; video estimates ignore it)',
		displayOptions: { show: { operation: ['generateImage', 'estimate'] } },
	},
	{
		displayName: 'Seed',
		name: 'seed',
		type: 'number',
		default: '',
		displayOptions: { show: { operation: ['generateImage', 'generateVideo'] } },
	},
	{
		displayName: 'Video Operation',
		name: 'operationMode',
		type: 'options',
		noDataExpression: true,
		default: 'text_to_video',
		options: [
			{ name: 'Image to Video', value: 'image_to_video', action: 'Generate a video from a first frame' },
			{ name: 'Reference to Video', value: 'reference_to_video', action: 'Generate a video from references' },
			{ name: 'Text to Video', value: 'text_to_video', action: 'Generate a video from text' },
		],
		displayOptions: { show: { operation: ['generateVideo', 'estimate'] } },
	},
	{
		displayName: 'Resolution',
		name: 'resolution',
		type: 'options',
		noDataExpression: true,
		default: '720P',
		options: [
			{ name: '480P', value: '480P', action: 'Render at 480P' },
			{ name: '720P', value: '720P', action: 'Render at 720P' },
			{ name: '1080P', value: '1080P', action: 'Render at 1080P' },
		],
		required: true,
		displayOptions: { show: { operation: ['generateVideo', 'estimate'] } },
	},
	{
		displayName: 'Duration Seconds',
		name: 'durationSeconds',
		type: 'number',
		default: '',
		required: true,
		description: 'Video duration in seconds (2-30, or -1 for provider default)',
		displayOptions: { show: { operation: ['generateVideo', 'estimate'] } },
	},
	{
		displayName: 'Ratio',
		name: 'ratio',
		type: 'string',
		default: '',
		description: "Required for HappyHorse Text to Video; optional for WAN. WAN Image to Video and Reference to Video also accept 'adaptive'; HappyHorse Image to Video ignores this field.",
		displayOptions: { show: { operation: ['generateVideo'] } },
	},
	// WAN 3.0 Video only (audio/prompt_extend/watermark are ignored by HappyHorse, so the
	// Make video module only exposes them under the WAN branch — mirrored here).
	{
		displayName: 'Audio',
		name: 'audio',
		type: 'boolean',
		default: false,
		description: 'Whether to request generated audio. WAN 3.0 Video only. Leaving this at the default is equivalent to omitting the field — the provider client defaults absent audio to false',
		displayOptions: { show: { operation: ['generateVideo'], model: ['wan3.0-video'] } },
	},
	{
		displayName: 'Prompt Extension',
		name: 'prompt_extend',
		type: 'boolean',
		default: false,
		description: 'Whether to ask the provider to expand a short prompt. WAN 3.0 Video only.',
		displayOptions: { show: { operation: ['generateVideo'], model: ['wan3.0-video'] } },
	},
	{
		displayName: 'Watermark',
		name: 'watermark',
		type: 'boolean',
		default: false,
		description: 'Whether to apply the provider watermark. WAN 3.0 Video only.',
		displayOptions: { show: { operation: ['generateVideo'], model: ['wan3.0-video'] } },
	},
	// First/last frame apply to Image to Video only: required for HappyHorse Image to Video
	// and WAN Image to Video, ignored for Text to Video, rejected for WAN Reference to Video.
	{
		displayName: 'First Frame (FrankLab Asset)',
		name: 'firstFrame',
		type: 'collection',
		placeholder: 'Add Asset Field',
		default: {},
		description:
			'Required for Image to Video (both HappyHorse and WAN). The frame must already be uploaded to FrankLab — fill in every field from the upload response; an external URL is rejected by the backend.',
		options: FRANKLAB_ASSET_COLLECTION_OPTIONS,
		displayOptions: { show: { operation: ['generateVideo'], operationMode: ['image_to_video'] } },
	},
	{
		displayName: 'Last Frame (FrankLab Asset)',
		name: 'lastFrame',
		type: 'collection',
		placeholder: 'Add Asset Field',
		default: {},
		description: 'WAN Image to Video only, optional. Not used by HappyHorse.',
		options: FRANKLAB_ASSET_COLLECTION_OPTIONS,
		displayOptions: { show: { operation: ['generateVideo'], operationMode: ['image_to_video'], model: ['wan3.0-video'] } },
	},
	// WAN Reference to Video only: 1-10 reference images. HappyHorse rejects this operation
	// entirely, so this field only ever applies to WAN.
	{
		displayName: 'Reference Images',
		name: 'referenceImages',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		placeholder: 'Add Reference Image',
		default: {},
		description: 'WAN Reference to Video only: 1-10 FrankLab-hosted reference images. Rejects first/last frame, video and audio input.',
		options: [
			{
				displayName: 'Reference Image',
				name: 'referenceImage',
				values: [
					{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						default: 'reference_image',
						options: [{ name: 'Reference_image', value: 'reference_image' }],
					},
					{
						displayName: 'URL',
						name: 'url',
						type: 'string',
						default: '',
						description: 'Https://franklab.ru/franklab/api/media/&lt;storedFileId&gt;',
					},
				],
			},
		],
		displayOptions: { show: { operation: ['generateVideo'], operationMode: ['reference_to_video'], model: ['wan3.0-video'] } },
	},
	{
		displayName: 'Media',
		name: 'media',
		type: 'options',
		noDataExpression: true,
		default: 'video',
		options: [
			{ name: 'Image', value: 'image', action: 'Estimate an image task' },
			{ name: 'Video', value: 'video', action: 'Estimate a video task' },
		],
		displayOptions: { show: { operation: ['estimate'] } },
	},
];

interface ReferenceImageCollection {
	referenceImage?: Array<{ type: string; url: string }>;
}

/**
 * Alibaba-only payload assembly. Reuses the shared `buildPayload` for every field it
 * already understands (prompt/model/size/width/height/n/seed/resolution/durationSeconds/
 * ratio/operationMode->operation/estimate media), then layers on the Qwen Image edit and
 * WAN-only video fields that have no home in the shared `simpleFields` allowlist
 * (`nodes/shared/node-utils.ts`) because that file is out of scope for this slice — only
 * `nodes/Alibaba/*` may change here.
 */
function buildAlibabaPayload(context: IExecuteFunctions, itemIndex: number, operation: string): Record<string, unknown> {
	const payload = buildPayload(context, itemIndex, 'alibaba', operation);

	if (operation === 'generateImage') {
		const qwenOperation = context.getNodeParameter('qwenOperation', itemIndex, 'text_to_image') as string;
		// Always set explicitly (not only for image_edit): buildPayload() above already probed
		// the shared 'operationMode' field for every module, and a value left over from an
		// earlier Generate Video use on the same node would otherwise leak into payload.operation.
		payload.operation = qwenOperation === 'image_edit' ? 'image_edit' : 'text_to_image';
		if (qwenOperation === 'image_edit') {
			const editImageIds = context.getNodeParameter('editImageIds', itemIndex, []) as string[];
			if (editImageIds.length > 0) payload.editImageIds = editImageIds;
		}
	}

	if (operation === 'generateVideo') {
		const videoModel = context.getNodeParameter('model', itemIndex, '') as string;
		if (videoModel === 'wan3.0-video') {
			payload.audio = context.getNodeParameter('audio', itemIndex, false) as boolean;
			payload.prompt_extend = context.getNodeParameter('prompt_extend', itemIndex, false) as boolean;
			payload.watermark = context.getNodeParameter('watermark', itemIndex, false) as boolean;

			const lastFrame = context.getNodeParameter('lastFrame', itemIndex, {}) as Record<string, unknown>;
			if (Object.keys(lastFrame).length > 0) payload.lastFrame = lastFrame;

			const referenceImages = context.getNodeParameter('referenceImages', itemIndex, {}) as ReferenceImageCollection;
			if (referenceImages.referenceImage?.length) payload.media = referenceImages.referenceImage;
		}

		const firstFrame = context.getNodeParameter('firstFrame', itemIndex, {}) as Record<string, unknown>;
		if (Object.keys(firstFrame).length > 0) payload.firstFrame = firstFrame;
	}

	// Re-validate the fully merged payload: buildPayload() already checked its own fields,
	// but firstFrame/lastFrame/media above were added after that call returned.
	validatePublicMediaUrlsInPayload(payload);
	return payload;
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

export class FrankLabAlibaba implements INodeType {
	// continueOnFail() is handled per item below, matching executeFrankLabModule's contract.
	description: INodeTypeDescription = {
		displayName: 'FrankLab Alibaba',
		name: 'frankLabAlibaba',
		icon: { light: 'file:alibaba.svg', dark: 'file:alibaba.dark.svg' },
		subtitle: '={{$parameter["operation"]}}',
		group: ['transform'],
		version: 1,
		description: 'Generate images with Alibaba Z-Image/Qwen Image and videos with HappyHorse or WAN 3.0 through FrankLab, with cost estimates.',
		defaults: {
			name: 'FrankLab Alibaba',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'frankLabApi',
				required: true,
			},
		],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'generateImage',
				options: [
					{ name: 'Estimate Cost', value: 'estimate', action: 'Estimate the cost of an alibaba task' },
					{ name: 'Generate Image', value: 'generateImage', action: 'Generate a z image image' },
					{ name: 'Generate Video', value: 'generateVideo', action: 'Submit a happy horse or wan video task' },
					{ name: 'Get Status', value: 'getStatus', action: 'Get an alibaba task status' },
				],
			},
			...generateFields,
			jobIdProperty,
			payloadProperty,
			waitProperty,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const credentials = await this.getCredentials('frankLabApi');
		const client = createFrankLabClient({
			baseUrl: String(credentials.baseUrl),
			apiKey: String(credentials.apiKey),
			fetch: async (url, init) => {
				const responseBody = await this.helpers.httpRequest({
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
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				const payload = buildAlibabaPayload(this, itemIndex, operation);
				const result = await client.request(keyFor('alibaba', operation), payload);
				// Alibaba has only 4 operations; 'estimate' never polls (it returns no
				// taskId), the other 3 always poll 'alibaba.getStatus' when asked to wait —
				// matching executeFrankLabModule's { default: 'getStatus', estimate: '' } map.
				const shouldPoll = (this.getNodeParameter('waitForCompletion', itemIndex, false) as boolean) && operation !== 'estimate';
				const taskId = typeof result.taskId === 'string' ? result.taskId : '';
				const finalResult = shouldPoll && taskId ? await client.poll(keyFor('alibaba', 'getStatus'), taskId) : result;
				output.push({ json: finalResult as JsonObject, pairedItem: itemIndex });
			} catch (error) {
				if (this.continueOnFail()) {
					output.push({ json: { error: error instanceof Error ? error.message : String(error) }, pairedItem: itemIndex });
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex });
			}
		}

		return [output];
	}
}
