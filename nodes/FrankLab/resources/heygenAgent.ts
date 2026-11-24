import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { FrankLabClient } from '../../shared/client';
import { buildPayload } from '../../shared/node-utils';
import { keyFor } from '../../shared/registry';
import { isFailureStatus } from '../../shared/status';
import { heygenAgentFields, heygenAgentOperations } from './heygenAgent.fields';
import type { FrankLabResourceDefinition } from './types';

function extractHeygenVideoId(record: Record<string, unknown>): string {
	const direct = record.videoId ?? record.video_id;
	if (typeof direct === 'string' && direct.trim()) return direct.trim();
	const session = typeof record.session === 'object' && record.session !== null ? (record.session as Record<string, unknown>) : undefined;
	const nested = session?.video_id ?? session?.videoId;
	return typeof nested === 'string' && nested.trim() ? nested.trim() : '';
}

function extractHeygenVideoUrl(record: Record<string, unknown>): string {
	const video = typeof record.video === 'object' && record.video !== null ? (record.video as Record<string, unknown>) : undefined;
	const candidates = [
		record.videoUrl,
		record.downloadUrl,
		video?.video_url,
		video?.videoUrl,
		video?.url,
		video?.download_url,
		video?.downloadUrl,
	];
	for (const candidate of candidates) {
		if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
	}
	return '';
}

function extractHeygenStatus(record: Record<string, unknown>): string {
	const session = typeof record.session === 'object' && record.session !== null ? (record.session as Record<string, unknown>) : undefined;
	const video = typeof record.video === 'object' && record.video !== null ? (record.video as Record<string, unknown>) : undefined;
	const raw = record.status ?? record.providerStatus ?? session?.status ?? video?.status;
	return typeof raw === 'string' ? raw : '';
}

async function pausePoll(delayMs: number): Promise<void> {
	await new Promise<void>((resolve) => {
		const signal = AbortSignal.timeout(delayMs);
		if (signal.aborted) {
			resolve();
			return;
		}
		signal.addEventListener('abort', () => resolve(), { once: true });
	});
}

async function executeHeyGenAgentItem(
	context: IExecuteFunctions,
	client: FrankLabClient,
	itemIndex: number,
	operation: string,
): Promise<Record<string, unknown>> {
	const payload = buildPayload(context, itemIndex, 'heygenAgent', operation);

	if (payload.providerAccountMode !== 'partner_heygen') {
		delete payload.providerCredentialId;
	}
	if (operation === 'generateFromPrompt') {
		payload.mode = 'generate';
	}

	const accountQuery: Record<string, unknown> = {};
	if (typeof payload.providerAccountMode === 'string') {
		accountQuery.providerAccountMode = payload.providerAccountMode;
	}
	if (payload.providerAccountMode === 'partner_heygen' && typeof payload.providerCredentialId === 'string') {
		accountQuery.providerCredentialId = payload.providerCredentialId;
	}

	const result = await client.request(keyFor('heygenAgent', operation), payload);
	const shouldPoll =
		(context.getNodeParameter('waitForCompletion', itemIndex, false) as boolean) && operation === 'generateFromPrompt';

	if (!shouldPoll) {
		return result;
	}

	const sessionId = typeof result.sessionId === 'string' && result.sessionId ? result.sessionId : String(result.taskId ?? '');
	let videoId = extractHeygenVideoId(result);
	let lastSession: Record<string, unknown> = result;

	for (let attempt = 0; !videoId && sessionId && attempt < 120; attempt += 1) {
		lastSession = await client.request(keyFor('heygenAgent', 'getSession'), { ...accountQuery, sessionId });
		videoId = extractHeygenVideoId(lastSession);
		if (videoId) break;
		const status = extractHeygenStatus(lastSession);
		if (isFailureStatus(status)) {
			throw new NodeOperationError(context.getNode(), `HeyGen Video Agent session failed with status ${status}`, { itemIndex });
		}
		await pausePoll(5000);
	}

	if (!videoId) {
		return lastSession;
	}

	let finalVideo: Record<string, unknown> = lastSession;
	for (let attempt = 0; attempt < 120; attempt += 1) {
		finalVideo = await client.request(keyFor('heygenAgent', 'getVideo'), { ...accountQuery, videoId });
		if (extractHeygenVideoUrl(finalVideo)) {
			return { ...finalVideo, sessionId, videoId };
		}
		const status = extractHeygenStatus(finalVideo);
		if (isFailureStatus(status)) {
			throw new NodeOperationError(context.getNode(), `HeyGen video failed with status ${status}`, { itemIndex });
		}
		if (attempt === 119) {
			throw new NodeOperationError(context.getNode(), 'HeyGen video did not finish within 120 polling attempts', { itemIndex });
		}
		await pausePoll(5000);
	}

	return finalVideo;
}

export const heygenAgentResource: FrankLabResourceDefinition = {
	moduleName: 'heygenAgent',
	displayName: 'HeyGen Agent',
	statusOperation: '',
	operationProperty: {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'generateFromPrompt',
		displayOptions: { show: { resource: ['heygenAgent'] } },
		options: heygenAgentOperations,
	},
	fields: heygenAgentFields,
	executeItem: executeHeyGenAgentItem,
};
