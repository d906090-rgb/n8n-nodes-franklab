import type { IExecuteFunctions, INodeExecutionData, INodeProperties, INodeType, INodeTypeDescription, JsonObject } from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { buildPayload, createN8nFrankLabClient, jobIdProperty, payloadProperty, validateModulePayload, waitProperty } from '../shared/node-utils';
import { keyFor } from '../shared/registry';

function generateIdempotencyKey(): string {
	const rand = Math.random().toString(36).slice(2, 12);
	return `n8n-flux-${Date.now()}-${rand}`;
}

function buildClosedFluxBody(
	operation: string,
	raw: Record<string, unknown>,
	videoMode: string,
	imageModel: string,
	safetyTolerance: number,
	draft: boolean,
	generateAudio: boolean,
	draftTaskId: string,
	startVideo: string,
	videoInput: string,
	outputFormat: string,
	steps: number,
): Record<string, unknown> {
	const existingRequest =
		typeof raw.request === 'object' && raw.request !== null && !Array.isArray(raw.request)
			? ({ ...(raw.request as Record<string, unknown>) })
			: undefined;

	if (operation === 'videoQuote' || operation === 'videoSubmit') {
		const request: Record<string, unknown> = existingRequest ?? { mode: videoMode };
		if (!request.mode) request.mode = videoMode;
		const mode = String(request.mode);

		if (mode === 'draft_enhance') {
			if (draftTaskId && !request.draft_task_id) request.draft_task_id = draftTaskId;
			if (raw.resolution && !request.resolution) request.resolution = raw.resolution;
			if (request.safety_tolerance === undefined) request.safety_tolerance = safetyTolerance;
		} else if (mode === 'edit') {
			if (videoInput && !request.video) request.video = videoInput;
			if (raw.prompt && !request.prompt) request.prompt = raw.prompt;
			if (request.safety_tolerance === undefined) request.safety_tolerance = Math.min(4, Math.max(0, safetyTolerance));
		} else {
			if (raw.prompt && !request.prompt) request.prompt = raw.prompt;
			if (raw.aspect_ratio && !request.aspect_ratio) request.aspect_ratio = raw.aspect_ratio;
			if (raw.duration !== undefined && raw.duration !== '' && request.duration === undefined) {
				const parsed = Number(raw.duration);
				request.duration = Number.isFinite(parsed) ? parsed : raw.duration;
			}
			if (raw.resolution && !request.resolution) request.resolution = raw.resolution;
			if (request.generate_audio === undefined) request.generate_audio = generateAudio;
			if (request.safety_tolerance === undefined) request.safety_tolerance = safetyTolerance;
			if (mode !== 'v2v' && draft && request.draft === undefined) request.draft = true;
			if (mode === 'i2v' && raw.reference_image_url && !request.keyframes) {
				request.keyframes = [raw.reference_image_url];
			}
			if (mode === 'v2v' && startVideo && !request.start_video) {
				request.start_video = startVideo;
			}
		}

		if (operation === 'videoQuote') {
			return { request };
		}
		return {
			request,
			idempotencyKey: typeof raw.idempotencyKey === 'string' && raw.idempotencyKey.trim() ? raw.idempotencyKey.trim() : generateIdempotencyKey(),
			...(raw.acceptedMaxFranks !== undefined && raw.acceptedMaxFranks !== '' ? { acceptedMaxFranks: Number(raw.acceptedMaxFranks) } : {}),
		};
	}

	const model = typeof raw.model === 'string' && raw.model ? raw.model : imageModel;
	const request: Record<string, unknown> = existingRequest ?? {};
	if (raw.prompt && !request.prompt) request.prompt = raw.prompt;
	if (raw.aspect_ratio && !request.aspect_ratio) request.aspect_ratio = raw.aspect_ratio;
	if (raw.resolution && !request.resolution) request.resolution = raw.resolution;
	if (raw.reference_image_url && !request.images) request.images = [raw.reference_image_url];
	if (request.safety_tolerance === undefined) request.safety_tolerance = safetyTolerance;
	if (model === 'flux-3-image-klein') {
		if (outputFormat && !request.output_format) request.output_format = outputFormat;
		if (request.steps === undefined && steps > 0) request.steps = steps;
	}

	if (operation === 'imageQuote') {
		return { model, request };
	}
	return {
		model,
		request,
		idempotencyKey: typeof raw.idempotencyKey === 'string' && raw.idempotencyKey.trim() ? raw.idempotencyKey.trim() : generateIdempotencyKey(),
		...(raw.acceptedMaxFranks !== undefined && raw.acceptedMaxFranks !== '' ? { acceptedMaxFranks: Number(raw.acceptedMaxFranks) } : {}),
	};
}

const fluxFields: INodeProperties[] = [
	{
		displayName: 'Video Mode',
		name: 'videoMode',
		type: 'options',
		noDataExpression: true,
		default: 't2v',
		options: [
			{ name: 'Draft Enhance', value: 'draft_enhance', action: 'Upscale a completed draft video' },
			{ name: 'Image to Video (Keyframes)', value: 'i2v', action: 'Generate video from keyframe image' },
			{ name: 'Text to Video', value: 't2v', action: 'Generate video from text' },
			{ name: 'Video Continuation (V2V)', value: 'v2v', action: 'Continue an existing video' },
			{ name: 'Video Edit', value: 'edit', action: 'Edit an existing video' },
		],
		displayOptions: { show: { operation: ['videoSubmit', 'videoQuote'] } },
	},
	{
		displayName: 'Image Model',
		name: 'imageModel',
		type: 'options',
		noDataExpression: true,
		default: 'flux-3-image',
		options: [
			{ name: 'FLUX 3 Image', value: 'flux-3-image', action: 'Use FLUX 3 Image' },
			{ name: 'FLUX 3 Image Klein', value: 'flux-3-image-klein', action: 'Use FLUX 3 Image Klein' },
		],
		displayOptions: { show: { operation: ['imageSubmit', 'imageQuote'] } },
	},
	{
		displayName: 'Prompt',
		name: 'prompt',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		displayOptions: { show: { operation: ['videoSubmit', 'videoQuote', 'imageSubmit', 'imageQuote'] } },
	},
	{
		displayName: 'Aspect Ratio',
		name: 'aspect_ratio',
		type: 'string',
		default: 'auto',
		description: 'Aspect ratio such as auto, 16:9, 9:16, 1:1',
		displayOptions: { show: { operation: ['videoSubmit', 'videoQuote', 'imageSubmit', 'imageQuote'] } },
	},
	{
		displayName: 'Resolution',
		name: 'resolution',
		type: 'string',
		default: '',
		description: 'Video: hd|fhd|qhd|uhd. Image: 768sq|1k|1.5k|2k|4k|match_input.',
		displayOptions: { show: { operation: ['videoSubmit', 'videoQuote', 'imageSubmit', 'imageQuote'] } },
	},
	{
		displayName: 'Duration (Seconds or Auto)',
		name: 'duration',
		type: 'string',
		default: 'auto',
		description: 'Auto or integer 5..20 (max 15 for v2v)',
		displayOptions: { show: { operation: ['videoSubmit', 'videoQuote'] } },
	},
	{
		displayName: 'Reference Image / Keyframe URL',
		name: 'reference_image_url',
		type: 'string',
		default: '',
		description: 'Canonical FrankLab https:// URL for i2v keyframe or image reference',
		displayOptions: { show: { operation: ['videoSubmit', 'videoQuote', 'imageSubmit', 'imageQuote'] } },
	},
	{
		displayName: 'Start Video URL (V2V)',
		name: 'startVideo',
		type: 'string',
		default: '',
		description: 'Partner-owned canonical FrankLab https:// MP4 URL for v2v continuation',
		displayOptions: { show: { operation: ['videoSubmit', 'videoQuote'], videoMode: ['v2v'] } },
	},
	{
		displayName: 'Video URL (Edit)',
		name: 'videoInput',
		type: 'string',
		default: '',
		description: 'Partner-owned canonical FrankLab https:// MP4 URL for video edit',
		displayOptions: { show: { operation: ['videoSubmit', 'videoQuote'], videoMode: ['edit'] } },
	},
	{
		displayName: 'Draft Task ID (Draft Enhance)',
		name: 'draftTaskId',
		type: 'string',
		default: '',
		description: 'UUID of a completed FLUX draft video task',
		displayOptions: { show: { operation: ['videoSubmit', 'videoQuote'], videoMode: ['draft_enhance'] } },
	},
	{
		displayName: 'Generate Audio',
		name: 'generateAudio',
		type: 'boolean',
		default: true,
		displayOptions: { show: { operation: ['videoSubmit', 'videoQuote'], videoMode: ['t2v', 'i2v', 'v2v'] } },
	},
	{
		displayName: 'Draft Mode (HD Only)',
		name: 'draft',
		type: 'boolean',
		default: false,
		displayOptions: { show: { operation: ['videoSubmit', 'videoQuote'], videoMode: ['t2v', 'i2v'] } },
	},
	{
		displayName: 'Output Format (Klein)',
		name: 'outputFormat',
		type: 'options',
		noDataExpression: true,
		default: 'jpeg',
		options: [
			{ name: 'JPEG', value: 'jpeg', action: 'Output JPEG' },
			{ name: 'PNG', value: 'png', action: 'Output PNG' },
		],
		displayOptions: { show: { operation: ['imageSubmit', 'imageQuote'], imageModel: ['flux-3-image-klein'] } },
	},
	{
		displayName: 'Steps (Klein, 1-16)',
		name: 'steps',
		type: 'number',
		default: 16,
		displayOptions: { show: { operation: ['imageSubmit', 'imageQuote'], imageModel: ['flux-3-image-klein'] } },
	},
	{
		displayName: 'Safety Tolerance',
		name: 'safetyTolerance',
		type: 'number',
		default: 2,
		description: '0..7 (0..4 for video edit)',
		displayOptions: { show: { operation: ['videoSubmit', 'videoQuote', 'imageSubmit', 'imageQuote'] } },
	},
	{
		displayName: 'Idempotency Key',
		name: 'idempotencyKey',
		type: 'string',
		default: '',
		description: 'Optional unique key (auto-generated when empty)',
		displayOptions: { show: { operation: ['videoSubmit', 'imageSubmit'] } },
	},
	{
		displayName: 'Accepted Max Franks',
		name: 'acceptedMaxFranks',
		type: 'number',
		default: '',
		description: 'Price cap in ₣ (auto-quoted via /quote before submit when empty)',
		displayOptions: { show: { operation: ['videoSubmit', 'imageSubmit'] } },
	},
];

export class FrankLabFlux implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FrankLab FLUX',
		name: 'frankLabFlux',
		icon: { light: 'file:flux.svg', dark: 'file:flux.dark.svg' },
		subtitle: '={{$parameter["operation"]}}',
		group: ['transform'],
		version: 1,
		description: 'Generate, quote, edit and enhance FLUX 3 Video and FLUX 3 Image / Klein tasks on FrankLab.',
		defaults: {
			name: 'FrankLab FLUX',
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
				default: 'videoSubmit',
				options: [
					{ name: 'Check Image Availability', value: 'imageAvailability', action: 'Check flux 3 image availability' },
					{ name: 'Check Video Availability', value: 'videoAvailability', action: 'Check flux 3 video availability' },
					{ name: 'Get Image Status', value: 'imageStatus', action: 'Get flux 3 image task status' },
					{ name: 'Get Video Status', value: 'videoStatus', action: 'Get flux 3 video task status' },
					{ name: 'Quote Image', value: 'imageQuote', action: 'Estimate cost of a flux 3 image task' },
					{ name: 'Quote Video', value: 'videoQuote', action: 'Estimate cost of a flux 3 video task' },
					{ name: 'Submit Image', value: 'imageSubmit', action: 'Submit a flux 3 image or klein task' },
					{ name: 'Submit Video', value: 'videoSubmit', action: 'Submit a flux 3 video task' },
				],
			},
			...fluxFields,
			jobIdProperty,
			payloadProperty,
			waitProperty,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const client = await createN8nFrankLabClient(this);
		const output: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
			try {
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				const raw = buildPayload(this, itemIndex, 'flux', operation);
				let payload = raw;

				if (operation === 'videoQuote' || operation === 'videoSubmit' || operation === 'imageQuote' || operation === 'imageSubmit') {
					const videoMode = this.getNodeParameter('videoMode', itemIndex, 't2v') as string;
					const imageModel = this.getNodeParameter('imageModel', itemIndex, 'flux-3-image') as string;
					const safetyTolerance = this.getNodeParameter('safetyTolerance', itemIndex, 2) as number;
					const draft = this.getNodeParameter('draft', itemIndex, false) as boolean;
					const generateAudio = this.getNodeParameter('generateAudio', itemIndex, true) as boolean;
					const draftTaskId = this.getNodeParameter('draftTaskId', itemIndex, '') as string;
					const startVideo = this.getNodeParameter('startVideo', itemIndex, '') as string;
					const videoInput = this.getNodeParameter('videoInput', itemIndex, '') as string;
					const outputFormat = this.getNodeParameter('outputFormat', itemIndex, 'jpeg') as string;
					const steps = this.getNodeParameter('steps', itemIndex, 16) as number;

					payload = buildClosedFluxBody(
						operation,
						raw,
						videoMode,
						imageModel,
						safetyTolerance,
						draft,
						generateAudio,
						draftTaskId,
						startVideo,
						videoInput,
						outputFormat,
						steps,
					);
					validateModulePayload('flux', payload);

					if ((operation === 'videoSubmit' || operation === 'imageSubmit') && payload.acceptedMaxFranks === undefined) {
						const quoteOp = operation === 'videoSubmit' ? 'videoQuote' : 'imageQuote';
						const quoteBody = operation === 'videoSubmit' ? { request: payload.request } : { model: payload.model, request: payload.request };
						const quoteRes = await client.request(keyFor('flux', quoteOp), quoteBody);
						const quotedCost = Number(quoteRes.estimated_cost_franks ?? quoteRes.max_cost_franks ?? 0);
						if (!(quotedCost > 0)) {
							throw new NodeOperationError(this.getNode(), 'Could not resolve acceptedMaxFranks from FLUX quote', { itemIndex });
						}
						payload.acceptedMaxFranks = quotedCost;
					}
				}

				const result = await client.request(keyFor('flux', operation), payload);
				const shouldPoll =
					(this.getNodeParameter('waitForCompletion', itemIndex, false) as boolean) &&
					(operation === 'videoSubmit' || operation === 'imageSubmit');
				const taskId = typeof result.taskId === 'string' ? result.taskId : '';
				const pollOp = operation === 'videoSubmit' ? 'videoStatus' : operation === 'imageSubmit' ? 'imageStatus' : '';
				const finalResult = shouldPoll && taskId && pollOp ? await client.poll(keyFor('flux', pollOp), taskId) : result;
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
