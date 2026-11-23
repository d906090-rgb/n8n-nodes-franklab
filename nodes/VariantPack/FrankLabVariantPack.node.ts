import type { IExecuteFunctions, INodeExecutionData, INodeProperties, INodeType, INodeTypeDescription, JsonObject } from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { buildPayload, createN8nFrankLabClient, jobIdProperty, payloadProperty, waitProperty } from '../shared/node-utils';
import { keyFor } from '../shared/registry';
import { normalizeBaseUrl } from '../shared/url';

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

const variantPackFields: INodeProperties[] = [
	{
		displayName: 'Video URL',
		name: 'videoUrl',
		type: 'string',
		default: '',
		description: 'Public https:// video URL (or specify Library Media ID below)',
		displayOptions: { show: { operation: ['create'] } },
	},
	{
		displayName: 'Library Media ID (UUID)',
		name: 'mediaId',
		type: 'string',
		default: '',
		description: 'Optional FrankLab library video UUID (converted automatically to media URL when Video URL is empty)',
		displayOptions: { show: { operation: ['create'] } },
	},
	{
		displayName: 'Copies (2-100)',
		name: 'copies',
		type: 'number',
		default: 5,
		required: true,
		description: 'Number of unique video copies to generate (2-100)',
		displayOptions: { show: { operation: ['create', 'estimate'] } },
	},
	{
		displayName: 'Variant Preset',
		name: 'variantPreset',
		type: 'options',
		noDataExpression: true,
		default: 'standard',
		options: [
			{ name: 'Balanced (Make Preset)', value: 'balanced', action: 'Use Balanced uniqueness profile' },
			{ name: 'Custom (Use Additional JSON)', value: 'custom', action: 'Provide variantCustomSettings in Additional JSON' },
			{ name: 'Deep (Make Preset)', value: 'deep', action: 'Use Deep uniqueness profile' },
			{ name: 'Light', value: 'light', action: 'Use Light preset' },
			{ name: 'Speech Safe (Make Preset)', value: 'speech', action: 'Preserve voice pitch while varying visuals' },
			{ name: 'Standard', value: 'standard', action: 'Use Standard preset' },
			{ name: 'Stealth (Make Preset)', value: 'stealth', action: 'Use subtle Stealth uniqueness profile' },
		],
		displayOptions: { show: { operation: ['create', 'estimate'] } },
	},
	{
		displayName: 'Generate AI Titles & Captions',
		name: 'captionsEnabled',
		type: 'boolean',
		default: false,
		displayOptions: { show: { operation: ['create', 'estimate'] } },
	},
	{
		displayName: 'Caption Hint',
		name: 'captionHint',
		type: 'string',
		default: '',
		description: 'Optional guidance for unique AI titles/descriptions (max 280 chars)',
		displayOptions: { show: { operation: ['create'] } },
	},
	{
		displayName: 'Seed',
		name: 'seed',
		type: 'string',
		default: '',
		description: 'Optional deterministic seed ([A-Za-z0-9_-]{1,64})',
		displayOptions: { show: { operation: ['create'] } },
	},
	{
		displayName: 'Brand ID',
		name: 'brandId',
		type: 'string',
		default: '',
		displayOptions: { show: { operation: ['create'] } },
	},
];

export class FrankLabVariantPack implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FrankLab VariantPack',
		name: 'frankLabVariantPack',
		icon: { light: 'file:variantpack.svg', dark: 'file:variantpack.dark.svg' },
		subtitle: '={{$parameter["operation"]}}',
		group: ['transform'],
		version: 1,
		description: 'Generate 2-100 uniquely varied video copies with individual download links, AI captions and ZIP archive.',
		defaults: {
			name: 'FrankLab VariantPack',
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
				default: 'create',
				options: [
					{ name: 'Create Variant Pack', value: 'create', action: 'Generate batch unique video copies' },
					{ name: 'Estimate Cost', value: 'estimate', action: 'Estimate cost of a variant pack' },
					{ name: 'Get Status', value: 'getStatus', action: 'Get variant pack job status and copy ur ls' },
					{ name: 'List Brands', value: 'listBrands', action: 'List partner brands for attribution' },
					{ name: 'List Library Videos', value: 'listLibraryVideos', action: 'List videos in your frank lab library' },
				],
			},
			...variantPackFields,
			jobIdProperty,
			payloadProperty,
			waitProperty,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const credentials = await this.getCredentials('frankLabApi');
		const baseApiUrl = normalizeBaseUrl(String(credentials.baseUrl));
		const client = await createN8nFrankLabClient(this);
		const output: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
			try {
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				const payload = buildPayload(this, itemIndex, 'variantPack', operation);

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
					(this.getNodeParameter('waitForCompletion', itemIndex, false) as boolean) && operation === 'create';
				const taskId = typeof result.taskId === 'string' ? result.taskId : '';
				const finalResult = shouldPoll && taskId ? await client.poll(keyFor('variantPack', 'getStatus'), taskId) : result;
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
