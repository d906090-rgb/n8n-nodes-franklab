import type { IExecuteFunctions, INodeExecutionData, INodeProperties, INodeType, INodeTypeDescription, JsonObject } from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { buildPayload, createN8nFrankLabClient, jobIdProperty, payloadProperty, waitProperty } from '../shared/node-utils';
import { keyFor } from '../shared/registry';
import { isFailureStatus } from '../shared/status';

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

const ACCOUNT_OPS = [
	'generateFromPrompt',
	'createSession',
	'listSessions',
	'listStyles',
	'getSession',
	'sendMessage',
	'getResource',
	'listSessionVideos',
	'stopSession',
	'getVideo',
	'listAvatarLooks',
	'listVoices',
	'listBrandKits',
	'listBrandGlossaries',
];

const heygenAgentFields: INodeProperties[] = [
	{
		displayName: 'Provider Account Mode',
		name: 'providerAccountMode',
		type: 'options',
		noDataExpression: true,
		default: 'franklab',
		options: [
			{ name: 'FrankLab Managed', value: 'franklab', action: 'Use FrankLab managed HeyGen account' },
			{ name: 'Partner HeyGen Credential (BYO)', value: 'partner_heygen', action: 'Use saved partner HeyGen credential' },
		],
		displayOptions: { show: { operation: ACCOUNT_OPS } },
	},
	{
		displayName: 'Saved HeyGen Credential ID',
		name: 'providerCredentialId',
		type: 'string',
		default: '',
		description: 'Required only when Provider Account Mode is Partner HeyGen Credential',
		displayOptions: { show: { operation: ACCOUNT_OPS, providerAccountMode: ['partner_heygen'] } },
	},
	{
		displayName: 'Prompt',
		name: 'prompt',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		displayOptions: { show: { operation: ['generateFromPrompt', 'createSession'] } },
	},
	{
		displayName: 'Session Mode',
		name: 'mode',
		type: 'options',
		noDataExpression: true,
		default: 'chat',
		options: [
			{ name: 'Generate Immediately', value: 'generate', action: 'Start video generation immediately' },
			{ name: 'Interactive Chat', value: 'chat', action: 'Start an interactive Video Agent chat session' },
		],
		displayOptions: { show: { operation: ['createSession'] } },
	},
	{
		displayName: 'Orientation',
		name: 'orientation',
		type: 'options',
		noDataExpression: true,
		default: 'landscape',
		options: [
			{ name: 'Landscape', value: 'landscape', action: 'Render landscape video' },
			{ name: 'Portrait', value: 'portrait', action: 'Render portrait video' },
		],
		displayOptions: { show: { operation: ['generateFromPrompt', 'createSession'] } },
	},
	{
		displayName: 'Avatar ID',
		name: 'avatar_id',
		type: 'string',
		default: '',
		displayOptions: { show: { operation: ['generateFromPrompt', 'createSession'] } },
	},
	{
		displayName: 'Voice ID',
		name: 'voice_id',
		type: 'string',
		default: '',
		displayOptions: { show: { operation: ['generateFromPrompt', 'createSession'] } },
	},
	{
		displayName: 'Style ID',
		name: 'style_id',
		type: 'string',
		default: '',
		displayOptions: { show: { operation: ['generateFromPrompt', 'createSession'] } },
	},
	{
		displayName: 'Brand Kit ID',
		name: 'brand_kit_id',
		type: 'string',
		default: '',
		displayOptions: { show: { operation: ['generateFromPrompt', 'createSession'] } },
	},
	{
		displayName: 'Brand Glossary ID',
		name: 'brand_glossary_id',
		type: 'string',
		default: '',
		displayOptions: { show: { operation: ['generateFromPrompt', 'createSession'] } },
	},
	{
		displayName: 'Session ID',
		name: 'sessionId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { operation: ['sendMessage', 'getResource'] } },
	},
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		typeOptions: { rows: 3 },
		default: '',
		required: true,
		displayOptions: { show: { operation: ['sendMessage'] } },
	},
	{
		displayName: 'Resource ID',
		name: 'resourceId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { operation: ['getResource'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		description: 'Max number of results to return',
		default: 50,
		displayOptions: { show: { operation: ['listSessions', 'listAvatarLooks', 'listVoices', 'listBrandKits', 'listBrandGlossaries'] } },
	},
	{
		displayName: 'Page Token',
		name: 'pageToken',
		type: 'string',
		typeOptions: { password: true },
		default: '',
		description: 'Pagination cursor returned as nextToken by a previous list call',
		displayOptions: { show: { operation: ['listSessions', 'listAvatarLooks', 'listVoices', 'listBrandKits', 'listBrandGlossaries'] } },
	},
];

export class FrankLabHeyGenAgent implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FrankLab HeyGen Agent',
		name: 'frankLabHeyGenAgent',
		icon: { light: 'file:heygenagent.svg', dark: 'file:heygenagent.dark.svg' },
		subtitle: '={{$parameter["operation"]}}',
		group: ['transform'],
		version: 1,
		description: 'Generate AI avatar videos, manage interactive Video Agent sessions, and browse HeyGen looks, voices and brand kits.',
		defaults: {
			name: 'FrankLab HeyGen Agent',
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
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				default: 'session',
				options: [
					{ name: 'Catalog', value: 'catalog' },
					{ name: 'Session', value: 'session' },
					{ name: 'Video', value: 'video' },
				],
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'listAvatarLooks',
				displayOptions: { show: { resource: ['catalog'] } },
				options: [
					{ name: 'List Avatar Looks', value: 'listAvatarLooks', action: 'List available hey gen avatar looks' },
					{ name: 'List Brand Glossaries', value: 'listBrandGlossaries', action: 'List hey gen brand glossaries' },
					{ name: 'List Brand Kits', value: 'listBrandKits', action: 'List hey gen brand kits' },
					{ name: 'List Saved Credentials', value: 'listCredentials', action: 'List saved partner hey gen credentials' },
					{ name: 'List Styles', value: 'listStyles', action: 'List video agent styles' },
					{ name: 'List Voices', value: 'listVoices', action: 'List hey gen voices' },
				],
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'generateFromPrompt',
				displayOptions: { show: { resource: ['session'] } },
				options: [
					{ name: 'Create', value: 'createSession', action: 'Create a video agent chat or generate session' },
					{ name: 'Generate From Prompt', value: 'generateFromPrompt', action: 'Generate a video from a prompt with video agent' },
					{ name: 'Get', value: 'getSession', action: 'Get video agent session status and details' },
					{ name: 'Get Resource', value: 'getResource', action: 'Get a session resource artifact' },
					{ name: 'List', value: 'listSessions', action: 'List video agent sessions' },
					{ name: 'List Videos', value: 'listSessionVideos', action: 'List videos produced in a session' },
					{ name: 'Send Message', value: 'sendMessage', action: 'Send a follow up prompt or edit message to a session' },
					{ name: 'Stop', value: 'stopSession', action: 'Stop an active video agent session' },
				],
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'getVideo',
				displayOptions: { show: { resource: ['video'] } },
				options: [
					{ name: 'Get', value: 'getVideo', action: 'Get hey gen video status and download url' },
				],
			},
			...heygenAgentFields,
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
				const payload = buildPayload(this, itemIndex, 'heygenAgent', operation);

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
					(this.getNodeParameter('waitForCompletion', itemIndex, false) as boolean) && operation === 'generateFromPrompt';

				if (!shouldPoll) {
					output.push({ json: result as JsonObject, pairedItem: itemIndex });
					continue;
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
						throw new NodeOperationError(this.getNode(), `HeyGen Video Agent session failed with status ${status}`, { itemIndex });
					}
					await pausePoll(5000);
				}

				if (!videoId) {
					output.push({ json: lastSession as JsonObject, pairedItem: itemIndex });
					continue;
				}

				let finalVideo: Record<string, unknown> = lastSession;
				for (let attempt = 0; attempt < 120; attempt += 1) {
					finalVideo = await client.request(keyFor('heygenAgent', 'getVideo'), { ...accountQuery, videoId });
					if (extractHeygenVideoUrl(finalVideo)) {
						output.push({ json: { ...finalVideo, sessionId, videoId } as JsonObject, pairedItem: itemIndex });
						break;
					}
					const status = extractHeygenStatus(finalVideo);
					if (isFailureStatus(status)) {
						throw new NodeOperationError(this.getNode(), `HeyGen video failed with status ${status}`, { itemIndex });
					}
					if (attempt === 119) {
						throw new NodeOperationError(this.getNode(), 'HeyGen video did not finish within 120 polling attempts', { itemIndex });
					}
					await pausePoll(5000);
				}
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
