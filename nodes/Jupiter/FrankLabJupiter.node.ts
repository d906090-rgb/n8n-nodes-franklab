import type { IExecuteFunctions, INodeType, INodeTypeDescription, INodeProperties } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeFrankLabModule, jobIdProperty, payloadProperty, waitProperty } from '../shared/node-utils';

const imageFields: INodeProperties[] = [
	{
		displayName: 'Prompt',
		name: 'prompt',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		displayOptions: { show: { operation: ['omniImage', 'seedreamImage'] } },
	},
	{
		displayName: 'Aspect Ratio',
		name: 'aspect_ratio',
		type: 'string',
		default: '',
		description: 'Optional aspect ratio, for example 16:9',
		displayOptions: { show: { operation: ['omniImage'] } },
	},
	{
		displayName: 'Resolution',
		name: 'resolution',
		type: 'string',
		default: '',
		description: 'Optional resolution preset',
		displayOptions: { show: { operation: ['omniImage'] } },
	},
	{
		displayName: 'Quality',
		name: 'quality',
		type: 'string',
		default: '',
		description: 'Optional quality preset',
		displayOptions: { show: { operation: ['omniImage'] } },
	},
	{
		displayName: 'Number of Images',
		name: 'n',
		type: 'number',
		default: 1,
		displayOptions: { show: { operation: ['omniImage'] } },
	},
	{
		displayName: 'Size',
		name: 'size',
		type: 'string',
		default: '',
		description: 'Optional explicit size for seedream images',
		displayOptions: { show: { operation: ['seedreamImage'] } },
	},
	{
		displayName: 'Model',
		name: 'model',
		type: 'string',
		default: '',
		description: 'Optional seedream model ID',
		displayOptions: { show: { operation: ['seedreamImage'] } },
	},
	{
		displayName: 'Recraft Model',
		name: 'recraftModel',
		type: 'string',
		default: '',
		required: true,
		description: 'Recraft model slug, for example recraft/remove-background',
		displayOptions: { show: { operation: ['recraftImage'] } },
	},
	{
		displayName: 'Image URL',
		name: 'image',
		type: 'string',
		default: '',
		required: true,
		description: 'Public http(s) image sent as the Recraft task input',
		displayOptions: { show: { operation: ['recraftImage'] } },
	},
];

export class FrankLabJupiter implements INodeType {
	// continueOnFail() is handled centrally in executeFrankLabModule.
	description: INodeTypeDescription = {
		displayName: 'FrankLab JUPITER',
		name: 'frankLabJupiter',
		icon: 'file:jupiter.svg',
		subtitle: '={{$parameter["operation"]}}',
		group: ['transform'],
		version: 1,
		description: 'Generate images with FrankLab JUPITER (omni-image and seedream).',
		defaults: {
			name: 'FrankLab JUPITER',
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
				default: 'omniImage',
				options: [
					{ name: 'Generate Image (Omni)', value: 'omniImage', action: 'Generate an image with omni image' },
					{ name: 'Generate Image (Recraft)', value: 'recraftImage', action: 'Create a recraft task' },
					{ name: 'Generate Image (Seedream)', value: 'seedreamImage', action: 'Generate an image with seedream' },
					{ name: 'Get Omni Image Status', value: 'getOmniStatus', action: 'Get an omni image task status' },
					{ name: 'Get Recraft Status', value: 'getRecraftStatus', action: 'Get a recraft task status' },
					{ name: 'Get Seedream Image Status', value: 'getSeedreamStatus', action: 'Get a seedream task status' },
				],
			},
			...imageFields,
			jobIdProperty,
			payloadProperty,
			waitProperty,
		],
	};

	async execute(this: IExecuteFunctions) {
		return executeFrankLabModule(this, 'jupiter', { default: 'getOmniStatus', seedreamImage: 'getSeedreamStatus', recraftImage: 'getRecraftStatus' });
	}
}
