import type { IExecuteFunctions, INodeExecutionData, INodeProperties, INodeType, INodeTypeDescription, JsonObject } from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { buildPayload, createN8nFrankLabClient, jobIdProperty, payloadProperty, waitProperty } from '../shared/node-utils';
import { keyFor } from '../shared/registry';

function generateNarezkaKey(): string {
	return `n8n-clips-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const narezkaFields: INodeProperties[] = [
	{
		displayName: 'Source URL (HTTPS)',
		name: 'sourceUrl',
		type: 'string',
		default: '',
		description: 'Direct public https:// video URL (use either Source URL or Media ID, never both)',
		displayOptions: { show: { operation: ['submit', 'estimate', 'importSource'] } },
	},
	{
		displayName: 'Media ID (UUID)',
		name: 'mediaId',
		type: 'string',
		default: '',
		description: 'Uploaded or imported FrankLab media UUID (mutually exclusive with Source URL)',
		displayOptions: { show: { operation: ['submit', 'estimate'] } },
	},
	{
		displayName: 'Mode',
		name: 'mode',
		type: 'options',
		noDataExpression: true,
		default: 'clips',
		options: [
			{ name: 'Clips (Separate Vertical Clips)', value: 'clips', action: 'Cut into separate vertical clips' },
			{ name: 'Compilation (Single Highlight Reel)', value: 'compilation', action: 'Assemble one highlight compilation' },
		],
		displayOptions: { show: { operation: ['submit', 'estimate'] } },
	},
	{
		displayName: 'Clip Count',
		name: 'clipCount',
		type: 'options',
		noDataExpression: true,
		default: '5',
		options: [
			{ name: '3 Clips', value: '3', action: 'Generate 3 clips' },
			{ name: '5 Clips', value: '5', action: 'Generate 5 clips' },
			{ name: '8 Clips', value: '8', action: 'Generate 8 clips' },
			{ name: '10 Clips', value: '10', action: 'Generate 10 clips' },
			{ name: 'Auto', value: 'auto', action: 'Auto-select clip count' },
		],
		displayOptions: { show: { operation: ['submit', 'estimate'], mode: ['clips'] } },
	},
	{
		displayName: 'Compilation Order',
		name: 'order',
		type: 'options',
		noDataExpression: true,
		default: 'chronological',
		options: [
			{ name: 'Chronological', value: 'chronological', action: 'Keep chronological order' },
			{ name: 'Strength (Best Moments First)', value: 'strength', action: 'Order by highlight strength' },
		],
		displayOptions: { show: { operation: ['submit', 'estimate'], mode: ['compilation'] } },
	},
	{
		displayName: 'Platform',
		name: 'platform',
		type: 'options',
		noDataExpression: true,
		default: 'reels',
		options: [
			{ name: 'Instagram Reels', value: 'reels', action: 'Format for Instagram Reels' },
			{ name: 'VK Clips', value: 'vk_clips', action: 'Format for VK Clips' },
			{ name: 'YouTube Shorts', value: 'shorts', action: 'Format for YouTube Shorts' },
		],
		displayOptions: { show: { operation: ['submit', 'estimate'] } },
	},
	{
		displayName: 'Subtitles Template',
		name: 'subtitles',
		type: 'string',
		default: 'shorts_pro',
		description: 'Subtitles v2 template ID or "off"',
		displayOptions: { show: { operation: ['submit', 'estimate'] } },
	},
	{
		displayName: 'Caption Position',
		name: 'captionPosition',
		type: 'options',
		noDataExpression: true,
		default: '',
		options: [
			{ name: 'Bottom Safe', value: 'bottom_safe', action: 'Place captions in bottom safe zone' },
			{ name: 'Center', value: 'center', action: 'Center captions' },
			{ name: 'Style Default', value: '', action: 'Use template default position' },
			{ name: 'Top Safe', value: 'top_safe', action: 'Place captions in top safe zone' },
		],
		displayOptions: { show: { operation: ['submit', 'estimate'] } },
	},
	{
		displayName: 'Language',
		name: 'language',
		type: 'string',
		default: 'auto',
		description: '"auto" or 2-letter ISO 639-1 code (e.g. ru, en)',
		displayOptions: { show: { operation: ['submit', 'estimate'] } },
	},
	{
		displayName: 'Framing',
		name: 'frame',
		type: 'options',
		noDataExpression: true,
		default: 'center',
		options: [
			{ name: 'Blur Fill', value: 'blur_fill', action: 'Use blurred background fill' },
			{ name: 'Center Crop', value: 'center', action: 'Center crop to vertical' },
		],
		displayOptions: { show: { operation: ['submit', 'estimate'] } },
	},
	{
		displayName: 'Topic Hint',
		name: 'topic',
		type: 'string',
		default: '',
		description: 'Optional topic hint (1-300 chars)',
		displayOptions: { show: { operation: ['submit', 'estimate'] } },
	},
	{
		displayName: 'Max Cost Franks',
		name: 'maxCostFranks',
		type: 'number',
		default: '',
		description: 'Optional maximum spend cap in ₣',
		displayOptions: { show: { operation: ['submit', 'estimate'] } },
	},
	{
		displayName: 'Idempotency Key',
		name: 'idempotencyKey',
		type: 'string',
		default: '',
		description: 'Unique header key (8-128 chars; auto-generated when empty)',
		displayOptions: { show: { operation: ['submit', 'importSource'] } },
	},
];

export class FrankLabNarezka implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FrankLab Narezka',
		name: 'frankLabNarezka',
		icon: { light: 'file:narezka.svg', dark: 'file:narezka.dark.svg' },
		subtitle: '={{$parameter["operation"]}}',
		group: ['transform'],
		version: 1,
		description: 'Cut long videos into vertical clips or highlight compilations with pre-run cost estimation.',
		defaults: {
			name: 'FrankLab Narezka',
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
				default: 'submit',
				options: [
					{ name: 'Estimate Cost', value: 'estimate', action: 'Estimate cost of a clipping job' },
					{ name: 'Get Import Status', value: 'getImportStatus', action: 'Get status of a source media import' },
					{ name: 'Get Status', value: 'getStatus', action: 'Get status of a clipping job' },
					{ name: 'Import Source', value: 'importSource', action: 'Import a remote video url into frank lab media' },
					{ name: 'Submit Clips Job', value: 'submit', action: 'Submit a smart video clipping or compilation job' },
				],
			},
			...narezkaFields,
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
				const payload = buildPayload(this, itemIndex, 'narezka', operation);

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
					(this.getNodeParameter('waitForCompletion', itemIndex, false) as boolean) &&
					(operation === 'submit' || operation === 'importSource');
				const taskId = typeof result.taskId === 'string' ? result.taskId : '';
				const pollOp = operation === 'submit' ? 'getStatus' : operation === 'importSource' ? 'getImportStatus' : '';
				const finalResult = shouldPoll && taskId && pollOp ? await client.poll(keyFor('narezka', pollOp), taskId) : result;
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
