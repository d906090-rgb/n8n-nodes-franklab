import type { IExecuteFunctions, INodeType, INodeTypeDescription, INodeProperties } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeFrankLabModule, jobIdProperty, payloadProperty, waitProperty } from '../shared/node-utils';

const videoFields: INodeProperties[] = [
	{
		displayName: 'Prompt',
		name: 'prompt',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		displayOptions: { show: { operation: ['video', 'turboTextToVideo', 'turboImageToVideo'] } },
	},
	{
		displayName: 'Model',
		name: 'model_name',
		type: 'string',
		default: '',
		description: 'Optional SATURN model ID',
		displayOptions: { show: { operation: ['video'] } },
	},
	{
		displayName: 'Mode',
		name: 'mode',
		type: 'string',
		default: '',
		description: 'Optional generation mode',
		displayOptions: { show: { operation: ['video'] } },
	},
	{
		displayName: 'Image URL',
		name: 'image_url',
		type: 'string',
		default: '',
		required: true,
		description: 'Public http(s) URL of the first frame image',
		displayOptions: { show: { operation: ['turboImageToVideo'] } },
	},
	{
		displayName: 'Aspect Ratio',
		name: 'aspect_ratio',
		type: 'string',
		default: '',
		displayOptions: { show: { operation: ['video', 'turboTextToVideo', 'turboImageToVideo'] } },
	},
	{
		displayName: 'Duration',
		name: 'duration',
		type: 'number',
		default: '',
		required: true,
		description: 'Video duration in seconds',
		displayOptions: { show: { operation: ['video', 'turboTextToVideo', 'turboImageToVideo'] } },
	},
	{
		displayName: 'Resolution',
		name: 'resolution',
		type: 'string',
		default: '',
		displayOptions: { show: { operation: ['turboTextToVideo', 'turboImageToVideo'] } },
	},
];

export class FrankLabSaturn implements INodeType {
	// continueOnFail() is handled centrally in executeFrankLabModule.
	description: INodeTypeDescription = {
		displayName: 'FrankLab SATURN',
		name: 'frankLabSaturn',
		icon: 'file:saturn.svg',
		subtitle: '={{$parameter["operation"]}}',
		group: ['transform'],
		version: 1,
		description: 'Generate videos with FrankLab SATURN and SATURN Turbo (Kling-backed).',
		defaults: {
			name: 'FrankLab SATURN',
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
				default: 'video',
				options: [
					{ name: 'Generate Video', value: 'video', action: 'Generate a SATURN video' },
					{ name: 'Get Turbo Status', value: 'getTurboStatus', action: 'Get a saturn turbo task status' },
					{ name: 'Get Video Status', value: 'getVideoStatus', action: 'Get a SATURN video task status' },
					{ name: 'Turbo Image to Video', value: 'turboImageToVideo', action: 'Generate a saturn turbo video from an image' },
					{ name: 'Turbo Text to Video', value: 'turboTextToVideo', action: 'Generate a saturn turbo video from text' },
				],
			},
			...videoFields,
			jobIdProperty,
			payloadProperty,
			waitProperty,
		],
	};

	async execute(this: IExecuteFunctions) {
		return executeFrankLabModule(this, 'saturn', {
			default: 'getVideoStatus',
			turboTextToVideo: 'getTurboStatus',
			turboImageToVideo: 'getTurboStatus',
		});
	}
}
