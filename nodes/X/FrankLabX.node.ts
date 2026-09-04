import type { IExecuteFunctions, INodeType, INodeTypeDescription, INodeProperties } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeFrankLabModule, jobIdProperty, payloadProperty, waitProperty } from '../shared/node-utils';

const videoFields: INodeProperties[] = [
	{
		displayName: 'Grok Operation',
		name: 'operationMode',
		type: 'options',
		noDataExpression: true,
		default: 'text',
		options: [
			{ name: 'Edit', value: 'edit', action: 'Edit a video (Grok Legacy)' },
			{ name: 'Extend', value: 'extend', action: 'Extend a video (Grok Legacy)' },
			{ name: 'Reference', value: 'reference', action: 'Generate a video from references (Grok Legacy)' },
			{ name: 'Single Image', value: 'single_image', action: 'Generate a video from one image (Grok 1.5)' },
			{ name: 'Text', value: 'text', action: 'Generate a video from text (Grok Legacy)' },
		],
		displayOptions: { show: { operation: ['imagineVideo'] } },
	},
	{
		displayName: 'Prompt',
		name: 'prompt',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		displayOptions: { show: { operation: ['imagineVideo', 'imagineImage'] } },
	},
	{
		displayName: 'Execution Mode',
		name: 'execution_mode',
		type: 'string',
		default: '',
		description: 'Optional execution mode',
		displayOptions: { show: { operation: ['imagineVideo'] } },
	},
	{
		displayName: 'Source Mode',
		name: 'source_mode',
		type: 'string',
		default: '',
		displayOptions: { show: { operation: ['imagineVideo'] } },
	},
	{
		displayName: 'Image URL',
		name: 'image_url',
		type: 'string',
		default: '',
		description: 'Public http(s) URL of the input image',
		displayOptions: { show: { operation: ['imagineVideo', 'imagineImage'] } },
	},
	{
		displayName: 'Video URL',
		name: 'video_url',
		type: 'string',
		default: '',
		description: 'Public http(s) URL of the input video for edit and extend',
		displayOptions: { show: { operation: ['imagineVideo'] } },
	},
	{
		displayName: 'Aspect Ratio',
		name: 'aspect_ratio',
		type: 'string',
		default: '',
		displayOptions: { show: { operation: ['imagineVideo'] } },
	},
	{
		displayName: 'Resolution',
		name: 'resolution',
		type: 'string',
		default: '',
		displayOptions: { show: { operation: ['imagineVideo'] } },
	},
	{
		displayName: 'Duration',
		name: 'duration',
		type: 'string',
		default: '',
		description: 'Optional duration preset',
		displayOptions: { show: { operation: ['imagineVideo'] } },
	},
];

export class FrankLabX implements INodeType {
	// continueOnFail() is handled centrally in executeFrankLabModule.
	description: INodeTypeDescription = {
		displayName: 'FrankLab X',
		name: 'frankLabX',
		icon: 'file:x.svg',
		subtitle: '={{$parameter["operation"]}}',
		group: ['transform'],
		version: 1,
		description: 'Generate and edit videos and images with xAI Imagine Video (Grok) through FrankLab X.',
		defaults: {
			name: 'FrankLab X',
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
				default: 'imagineVideo',
				options: [
					{ name: 'Generate Image', value: 'imagineImage', action: 'Generate an image with x ai imagine' },
					{ name: 'Generate Video', value: 'imagineVideo', action: 'Generate a video with x ai imagine' },
					{ name: 'Get Image Status', value: 'getImageStatus', action: 'Get an x ai image task status' },
					{ name: 'Get Video Status', value: 'getVideoStatus', action: 'Get an x ai video task status' },
				],
			},
			...videoFields,
			jobIdProperty,
			payloadProperty,
			waitProperty,
		],
	};

	async execute(this: IExecuteFunctions) {
		return executeFrankLabModule(this, 'x', { default: 'getVideoStatus', imagineImage: 'getImageStatus' });
	}
}
