import type { IExecuteFunctions } from 'n8n-workflow';
import type { FrankLabClient } from '../../shared/client';
import { buildPayload } from '../../shared/node-utils';
import { keyFor } from '../../shared/registry';
import { normalizeBaseUrl } from '../../shared/url';
import type { FrankLabResourceDefinition } from './types';
import { variantPackFields, variantPackOperations } from './variantPack.fields';

const SHORTHAND_PRESETS: Record<string, Record<string, unknown>> = {
	stealth: {
		audio: { enabled: true, max: 0.5 },
		grain: { enabled: true, max: 2 },
		rotation: { enabled: true, max: 0.5 },
		zoom: { enabled: true, max: 2 },
		trimStart: { enabled: true, max: 0.2 },
		trimEnd: { enabled: true, max: 0.2 },
	},
	speech: {
		grain: { enabled: true, max: 2 },
		rotation: { enabled: true, max: 0.5 },
		zoom: { enabled: true, max: 2 },
		trimStart: { enabled: true, max: 0.2 },
		trimEnd: { enabled: true, max: 0.2 },
	},
	balanced: {
		eqTilt: true,
		grain: { enabled: true, max: 4 },
		rotation: { enabled: true, max: 1 },
		zoom: { enabled: true, max: 2 },
		trimStart: { enabled: true, max: 0.3 },
		trimEnd: { enabled: true, max: 0.3 },
	},
	deep: {
		audio: { enabled: true, max: 1 },
		grain: { enabled: true, max: 6 },
		rotation: { enabled: true, max: 1.5 },
		zoom: { enabled: true, max: 4 },
		trimStart: { enabled: true, max: 0.5 },
		trimEnd: { enabled: true, max: 0.5 },
	},
};

async function executeVariantPackItem(
	context: IExecuteFunctions,
	client: FrankLabClient,
	itemIndex: number,
	operation: string,
): Promise<Record<string, unknown>> {
	const credentials = await context.getCredentials('frankLabApi');
	const baseApiUrl = normalizeBaseUrl(String(credentials.baseUrl));
	const payload = buildPayload(context, itemIndex, 'variantPack', operation);

	if (operation === 'create' || operation === 'estimate') {
		const preset = String(payload.variantPreset ?? 'standard');
		if (SHORTHAND_PRESETS[preset]) {
			payload.variantPreset = 'custom';
			if (!payload.variantCustomSettings) {
				payload.variantCustomSettings =
					operation === 'estimate' ? JSON.stringify(SHORTHAND_PRESETS[preset]) : SHORTHAND_PRESETS[preset];
			}
		}
	}
	if (operation === 'estimate') {
		payload.operation = 'variant_pack';
		if (payload.captionsEnabled !== undefined && payload.captions === undefined) {
			payload.captions = payload.captionsEnabled;
		}
		delete payload.captionsEnabled;
	}
	if (operation === 'create') {
		if (!payload.videoUrl && typeof payload.mediaId === 'string' && payload.mediaId.trim()) {
			payload.videoUrl = `${baseApiUrl}/media/${encodeURIComponent(payload.mediaId.trim())}`;
		}
		delete payload.mediaId;
		if (typeof payload.brandId === 'string' && payload.brandId.trim()) {
			payload.contentAttribution = { brandId: payload.brandId.trim() };
		}
		delete payload.brandId;
	}

	const result = await client.request(keyFor('variantPack', operation), payload);
	const shouldPoll =
		(context.getNodeParameter('waitForCompletion', itemIndex, false) as boolean) && operation === 'create';
	const taskId = typeof result.taskId === 'string' ? result.taskId : '';
	return shouldPoll && taskId ? await client.poll(keyFor('variantPack', 'getStatus'), taskId) : result;
}

export const variantPackResource: FrankLabResourceDefinition = {
	moduleName: 'variantPack',
	displayName: 'VariantPack',
	statusOperation: 'getStatus',
	operationProperty: {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'create',
		displayOptions: { show: { resource: ['variantPack'] } },
		options: variantPackOperations,
	},
	fields: variantPackFields,
	executeItem: executeVariantPackItem,
};
