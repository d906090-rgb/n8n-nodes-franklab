import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { FrankLabClient } from '../../shared/client';
import { buildPayload, validateModulePayload } from '../../shared/node-utils';
import { keyFor } from '../../shared/registry';
import { fluxFields, fluxOperations } from './flux.fields';
import type { FrankLabResourceDefinition } from './types';

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
		if (steps && request.steps === undefined) request.steps = steps;
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

async function executeFluxItem(
	context: IExecuteFunctions,
	client: FrankLabClient,
	itemIndex: number,
	operation: string,
): Promise<Record<string, unknown>> {
	const raw = buildPayload(context, itemIndex, 'flux', operation);
	let payload = raw;

	if (operation === 'videoQuote' || operation === 'videoSubmit' || operation === 'imageQuote' || operation === 'imageSubmit') {
		const videoMode = context.getNodeParameter('videoMode', itemIndex, 't2v') as string;
		const imageModel = context.getNodeParameter('imageModel', itemIndex, 'flux-3-image') as string;
		const safetyTolerance = context.getNodeParameter('safetyTolerance', itemIndex, 2) as number;
		const draft = context.getNodeParameter('draft', itemIndex, false) as boolean;
		const generateAudio = context.getNodeParameter('generateAudio', itemIndex, true) as boolean;
		const draftTaskId = context.getNodeParameter('draftTaskId', itemIndex, '') as string;
		const startVideo = context.getNodeParameter('startVideo', itemIndex, '') as string;
		const videoInput = context.getNodeParameter('videoInput', itemIndex, '') as string;
		const outputFormat = context.getNodeParameter('outputFormat', itemIndex, 'jpeg') as string;
		const steps = context.getNodeParameter('steps', itemIndex, 16) as number;

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
				throw new NodeOperationError(context.getNode(), 'Could not resolve acceptedMaxFranks from FLUX quote', { itemIndex });
			}
			payload.acceptedMaxFranks = quotedCost;
		}
	}

	const result = await client.request(keyFor('flux', operation), payload);
	const shouldPoll =
		(context.getNodeParameter('waitForCompletion', itemIndex, false) as boolean) &&
		(operation === 'videoSubmit' || operation === 'imageSubmit');
	const taskId = typeof result.taskId === 'string' ? result.taskId : '';
	const pollOp = operation === 'videoSubmit' ? 'videoStatus' : operation === 'imageSubmit' ? 'imageStatus' : '';
	return shouldPoll && taskId && pollOp ? await client.poll(keyFor('flux', pollOp), taskId) : result;
}

export const fluxResource: FrankLabResourceDefinition = {
	moduleName: 'flux',
	displayName: 'FLUX',
	statusOperation: { videoSubmit: 'videoStatus', imageSubmit: 'imageStatus' },
	operationProperty: {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'videoSubmit',
		displayOptions: { show: { resource: ['flux'] } },
		options: fluxOperations,
	},
	fields: fluxFields,
	executeItem: executeFluxItem,
};
