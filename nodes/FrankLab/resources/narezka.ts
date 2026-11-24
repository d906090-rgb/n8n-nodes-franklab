import type { IExecuteFunctions } from 'n8n-workflow';
import type { FrankLabClient } from '../../shared/client';
import { buildPayload } from '../../shared/node-utils';
import { keyFor } from '../../shared/registry';
import { narezkaFields, narezkaOperations } from './narezka.fields';
import type { FrankLabResourceDefinition } from './types';

function generateNarezkaKey(): string {
	const rand = Math.random().toString(36).slice(2, 12);
	return `n8n-narezka-${Date.now()}-${rand}`;
}

async function executeNarezkaItem(
	context: IExecuteFunctions,
	client: FrankLabClient,
	itemIndex: number,
	operation: string,
): Promise<Record<string, unknown>> {
	const payload = buildPayload(context, itemIndex, 'narezka', operation);

	if (operation === 'submit' || operation === 'estimate') {
		const mode = String(payload.mode ?? 'clips');
		if (mode === 'clips') {
			delete payload.order;
			if (payload.clipCount !== undefined && payload.clipCount !== 'auto') {
				payload.clipCount = Number(payload.clipCount);
			}
		} else {
			delete payload.clipCount;
		}
	}
	if (operation === 'submit' || operation === 'importSource') {
		if (!payload.idempotencyKey) {
			payload.idempotencyKey = generateNarezkaKey();
		}
	}

	const result = await client.request(keyFor('narezka', operation), payload);
	const shouldPoll =
		(context.getNodeParameter('waitForCompletion', itemIndex, false) as boolean) &&
		(operation === 'submit' || operation === 'importSource');
	const taskId = typeof result.taskId === 'string' ? result.taskId : '';
	const pollOp = operation === 'submit' ? 'getStatus' : operation === 'importSource' ? 'getImportStatus' : '';
	return shouldPoll && taskId && pollOp ? await client.poll(keyFor('narezka', pollOp), taskId) : result;
}

export const narezkaResource: FrankLabResourceDefinition = {
	moduleName: 'narezka',
	displayName: 'Narezka',
	statusOperation: { submit: 'getStatus', importSource: 'getImportStatus' },
	operationProperty: {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'submit',
		displayOptions: { show: { resource: ['narezka'] } },
		options: narezkaOperations,
	},
	fields: narezkaFields,
	executeItem: executeNarezkaItem,
};
