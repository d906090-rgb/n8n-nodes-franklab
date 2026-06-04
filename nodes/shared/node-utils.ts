import type { IExecuteFunctions, INodeExecutionData, INodeProperties, JsonObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createFrankLabClient } from './client';
import type { FetchResponse } from './client';
import { keyFor } from './registry';
import type { FrankLabModule } from './registry';
import { validatePublicMediaUrlsInPayload } from './url';

export const jobIdProperty: INodeProperties = {
	displayName: 'Job ID',
	name: 'jobId',
	type: 'string',
	default: '',
	required: true,
	displayOptions: {
		show: {
			operation: ['getStatus', 'getTask', 'getDubbing'],
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

export const waitProperty: INodeProperties = {
	displayName: 'Wait for Completion',
	name: 'waitForCompletion',
	type: 'boolean',
	default: false,
	displayOptions: {
		hide: {
			operation: ['getStatus', 'getTask', 'getDubbing', 'listProfiles', 'profileOptions', 'listSamples', 'listVoices', 'listModels', 'usage', 'revokeProfile'],
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
			operation: ['getStatus', 'getTask', 'getDubbing', 'listProfiles', 'profileOptions', 'listSamples', 'listVoices', 'listModels', 'usage', 'revokeProfile'],
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
			const payload = buildPayload(context, itemIndex, operation);
			const result = await client.request(keyFor(moduleName, operation), payload);
			const shouldPoll = context.getNodeParameter('waitForCompletion', itemIndex, false) as boolean;
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

function buildPayload(context: IExecuteFunctions, itemIndex: number, operation: string): Record<string, unknown> {
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
	];

	for (const field of simpleFields) {
		const value = getOptionalNodeParameter(context, field, itemIndex);
		if (value !== undefined && value !== '') {
			payload[field === 'operationName' ? 'operation' : field] = value;
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

	validatePublicMediaUrlsInPayload(payload);

	return payload;
}

function getOptionalNodeParameter(context: IExecuteFunctions, field: string, itemIndex: number): unknown {
	try {
		return context.getNodeParameter(field, itemIndex, undefined) as unknown;
	} catch (error) {
		if (isMissingNodeParameterError(error)) {
			return undefined;
		}
		throw error;
	}
}

function isMissingNodeParameterError(error: unknown): boolean {
	return error instanceof Error && error.message.includes('Could not get parameter');
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
