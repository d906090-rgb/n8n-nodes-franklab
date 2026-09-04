import type { IExecuteFunctions, INodeType, INodeTypeDescription, INodeProperties } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeFrankLabModule, jobIdProperty, payloadProperty, waitProperty } from '../shared/node-utils';

const generateFields: INodeProperties[] = [
	{
		displayName: 'Prompt',
		name: 'prompt',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		displayOptions: { show: { operation: ['generateImage', 'generateVideo'] } },
	},
	{
		displayName: 'Model',
		name: 'model',
		type: 'string',
		default: '',
		description: 'Optional image model ID',
		displayOptions: { show: { operation: ['generateImage', 'estimate'] } },
	},
	{
		displayName: 'Size',
		name: 'size',
		type: 'string',
		default: '',
		description: 'Optional explicit image size',
		displayOptions: { show: { operation: ['generateImage'] } },
	},
	{
		displayName: 'Width',
		name: 'width',
		type: 'number',
		default: '',
		description: 'Image width (image estimates only; video estimates ignore it)',
		displayOptions: { show: { operation: ['generateImage', 'estimate'] } },
	},
	{
		displayName: 'Height',
		name: 'height',
		type: 'number',
		default: '',
		description: 'Image height (image estimates only; video estimates ignore it)',
		displayOptions: { show: { operation: ['generateImage', 'estimate'] } },
	},
	{
		displayName: 'Number of Images',
		name: 'n',
		type: 'number',
		default: '',
		description: 'Number of images (image estimates only; video estimates ignore it)',
		displayOptions: { show: { operation: ['generateImage', 'estimate'] } },
	},
	{
		displayName: 'Seed',
		name: 'seed',
		type: 'number',
		default: '',
		displayOptions: { show: { operation: ['generateImage', 'generateVideo'] } },
	},
	{
		displayName: 'Video Operation',
		name: 'operationMode',
		type: 'options',
		noDataExpression: true,
		default: 'text_to_video',
		options: [
			{ name: 'Image to Video', value: 'image_to_video', action: 'Generate a video from a first frame' },
			{ name: 'Reference to Video', value: 'reference_to_video', action: 'Generate a video from references' },
			{ name: 'Text to Video', value: 'text_to_video', action: 'Generate a video from text' },
		],
		displayOptions: { show: { operation: ['generateVideo', 'estimate'] } },
	},
	{
		displayName: 'Resolution',
		name: 'resolution',
		type: 'options',
		noDataExpression: true,
		default: '720P',
		options: [
			{ name: '480P', value: '480P', action: 'Render at 480P' },
			{ name: '720P', value: '720P', action: 'Render at 720P' },
			{ name: '1080P', value: '1080P', action: 'Render at 1080P' },
		],
		required: true,
		displayOptions: { show: { operation: ['generateVideo', 'estimate'] } },
	},
	{
		displayName: 'Duration Seconds',
		name: 'durationSeconds',
		type: 'number',
		default: '',
		required: true,
		description: 'Video duration in seconds (2-30, or -1 for provider default)',
		displayOptions: { show: { operation: ['generateVideo', 'estimate'] } },
	},
	{
		displayName: 'Ratio',
		name: 'ratio',
		type: 'string',
		default: '',
		displayOptions: { show: { operation: ['generateVideo'] } },
	},
	{
		displayName: 'Media',
		name: 'media',
		type: 'options',
		noDataExpression: true,
		default: 'video',
		options: [
			{ name: 'Image', value: 'image', action: 'Estimate an image task' },
			{ name: 'Video', value: 'video', action: 'Estimate a video task' },
		],
		displayOptions: { show: { operation: ['estimate'] } },
	},
];

export class FrankLabAlibaba implements INodeType {
	// continueOnFail() is handled centrally in executeFrankLabModule.
	description: INodeTypeDescription = {
		displayName: 'FrankLab Alibaba',
		name: 'frankLabAlibaba',
		icon: 'file:alibaba.svg',
		subtitle: '={{$parameter["operation"]}}',
		group: ['transform'],
		version: 1,
		description: 'Generate images with Alibaba Z-Image and videos with HappyHorse through FrankLab, with cost estimates.',
		defaults: {
			name: 'FrankLab Alibaba',
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
				default: 'generateImage',
				options: [
					{ name: 'Estimate Cost', value: 'estimate', action: 'Estimate the cost of an alibaba task' },
					{ name: 'Generate Image', value: 'generateImage', action: 'Generate a z image image' },
					{ name: 'Generate Video', value: 'generateVideo', action: 'Submit a happy horse video task' },
					{ name: 'Get Status', value: 'getStatus', action: 'Get an alibaba task status' },
				],
			},
			...generateFields,
			jobIdProperty,
			payloadProperty,
			waitProperty,
		],
	};

	async execute(this: IExecuteFunctions) {
		return executeFrankLabModule(this, 'alibaba', { default: 'getStatus', estimate: '' });
	}
}
