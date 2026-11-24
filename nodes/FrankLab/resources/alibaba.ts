import type { IExecuteFunctions } from 'n8n-workflow';
import type { FrankLabClient } from '../../shared/client';
import { buildPayload } from '../../shared/node-utils';
import { keyFor } from '../../shared/registry';
import { validatePublicMediaUrlsInPayload } from '../../shared/url';
import { alibabaFields, alibabaOperations } from './alibaba.fields';
import type { FrankLabResourceDefinition } from './types';

interface ReferenceImageCollection {
	referenceImage?: Array<{ type: string; url: string }>;
}

function buildAlibabaPayload(context: IExecuteFunctions, itemIndex: number, operation: string): Record<string, unknown> {
	const payload = buildPayload(context, itemIndex, 'alibaba', operation);

	if (operation === 'generateImage') {
		const qwenOperation = context.getNodeParameter('qwenOperation', itemIndex, 'text_to_image') as string;
		payload.operation = qwenOperation === 'image_edit' ? 'image_edit' : 'text_to_image';
		if (qwenOperation === 'image_edit') {
			const editImageIds = context.getNodeParameter('editImageIds', itemIndex, []) as string[];
			if (editImageIds.length > 0) payload.editImageIds = editImageIds;
		}
	}

	if (operation === 'generateVideo') {
		const videoModel = context.getNodeParameter('model', itemIndex, '') as string;
		const isWan3 = videoModel === 'wan3.0-video' || videoModel === 'wan3.0-video-prime';
		const isKf2v = videoModel === 'wan2.2-kf2v-flash' || videoModel === 'wan2.1-kf2v-plus';
		if (isWan3) {
			payload.audio = context.getNodeParameter('audio', itemIndex, false) as boolean;
			payload.prompt_extend = context.getNodeParameter('prompt_extend', itemIndex, false) as boolean;
			payload.watermark = context.getNodeParameter('watermark', itemIndex, false) as boolean;
		}
		if (isWan3 || isKf2v) {
			const lastFrame = context.getNodeParameter('lastFrame', itemIndex, {}) as Record<string, unknown>;
			if (Object.keys(lastFrame).length > 0) payload.lastFrame = lastFrame;
		}
		if (isWan3 || videoModel === 'happyhorse-1.1-r2v') {
			const referenceImages = context.getNodeParameter('referenceImages', itemIndex, {}) as ReferenceImageCollection;
			if (referenceImages.referenceImage?.length) payload.media = referenceImages.referenceImage;
		}

		const firstFrame = context.getNodeParameter('firstFrame', itemIndex, {}) as Record<string, unknown>;
		if (Object.keys(firstFrame).length > 0) payload.firstFrame = firstFrame;
	}

	validatePublicMediaUrlsInPayload(payload);
	return payload;
}

async function executeAlibabaItem(
	context: IExecuteFunctions,
	client: FrankLabClient,
	itemIndex: number,
	operation: string,
): Promise<Record<string, unknown>> {
	const payload = buildAlibabaPayload(context, itemIndex, operation);
	const result = await client.request(keyFor('alibaba', operation), payload);
	const shouldPoll =
		(context.getNodeParameter('waitForCompletion', itemIndex, false) as boolean) &&
		operation !== 'getStatus' &&
		operation !== 'estimate';
	const taskId = typeof result.taskId === 'string' ? result.taskId : '';
	return shouldPoll && taskId ? await client.poll(keyFor('alibaba', 'getStatus'), taskId) : result;
}

export const alibabaResource: FrankLabResourceDefinition = {
	moduleName: 'alibaba',
	displayName: 'Alibaba',
	statusOperation: 'getStatus',
	operationProperty: {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'generateVideo',
		displayOptions: { show: { resource: ['alibaba'] } },
		options: alibabaOperations,
	},
	fields: alibabaFields,
	executeItem: executeAlibabaItem,
};
