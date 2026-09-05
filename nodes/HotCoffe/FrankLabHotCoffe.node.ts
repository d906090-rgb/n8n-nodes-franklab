import type { IExecuteFunctions, INodeType, INodeTypeDescription, INodeProperties } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeFrankLabModule, jobIdProperty, payloadProperty, waitProperty } from '../shared/node-utils';

const hotCoffeFields: INodeProperties[] = [
	{
		displayName: 'Prompt',
		name: 'prompt',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		displayOptions: { show: { operation: ['generateImage', 'createVideo'] } },
	},
	{
		displayName: 'Video Operation',
		name: 'operationMode',
		type: 'options',
		noDataExpression: true,
		default: 'text_to_video',
		options: [
			{ name: 'Reference to Video', value: 'reference_to_video', action: 'Generate a video from references' },
			{ name: 'Text to Video', value: 'text_to_video', action: 'Generate a video from text' },
			{ name: 'Video Edit', value: 'video_edit', action: 'Edit an existing video' },
			{ name: 'Video Extend', value: 'video_extend', action: 'Extend an existing video' },
		],
		displayOptions: { show: { operation: ['createVideo'] } },
	},
	{
		displayName: 'Model Variant',
		name: 'modelVariant',
		type: 'options',
		noDataExpression: true,
		default: 'seedance_1_5',
		options: [
			{ name: 'Seedance 1.5', value: 'seedance_1_5', action: 'Use seedance 1.5' },
			{ name: 'Seedance 2.0', value: 'seedance_2_0', action: 'Use seedance 2.0' },
			{ name: 'Seedance 2.0 Fast', value: 'seedance_2_0_fast', action: 'Use seedance 2.0 fast' },
		],
		displayOptions: { show: { operation: ['createVideo'] } },
	},
	{
		displayName: 'Resolution',
		name: 'resolution',
		type: 'options',
		noDataExpression: true,
		default: '720p',
		options: [
			{ name: '480p', value: '480p', action: 'Render at 480p' },
			{ name: '720p', value: '720p', action: 'Render at 720p' },
			{ name: '1080p', value: '1080p', action: 'Render at 1080p' },
		],
		displayOptions: { show: { operation: ['createVideo'] } },
	},
	{
		displayName: 'Duration',
		name: 'duration',
		type: 'number',
		default: '',
		description: 'Optional video duration in seconds',
		displayOptions: { show: { operation: ['createVideo'] } },
	},
	{
		displayName: 'Ratio',
		name: 'ratio',
		type: 'string',
		default: '',
		description: 'Optional aspect ratio, for example 16:9',
		displayOptions: { show: { operation: ['createVideo'] } },
	},
	{
		displayName: 'Video URL',
		name: 'video_url',
		type: 'string',
		default: '',
		description: 'Public http(s) source video for edit and extend operations',
		displayOptions: { show: { operation: ['createVideo'] } },
	},
];

export class FrankLabHotCoffe implements INodeType {
	// continueOnFail() is handled centrally in executeFrankLabModule.
	description: INodeTypeDescription = {
		displayName: 'FrankLab Hot Coffe',
		name: 'frankLabHotCoffe',
		icon: { light: 'file:hotcoffe.svg', dark: 'file:hotcoffe.dark.svg' },
		subtitle: '={{$parameter["operation"]}}',
		group: ['transform'],
		version: 1,
		description: 'Generate images and Seedance videos with FrankLab Hot Coffe (ByteDance ModelArk).',
		defaults: {
			name: 'FrankLab Hot Coffe',
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
				default: 'createVideo',
				options: [
					{ name: 'Create Video', value: 'createVideo', action: 'Submit a seedance video task' },
					{ name: 'Generate Image', value: 'generateImage', action: 'Generate an image' },
					{ name: 'Get Image Status', value: 'getImageStatus', action: 'Get an image task status' },
					{ name: 'Get Video Status', value: 'getVideoStatus', action: 'Get a video task status' },
				],
			},
			...hotCoffeFields,
			jobIdProperty,
			payloadProperty,
			waitProperty,
		],
	};

	async execute(this: IExecuteFunctions) {
		return executeFrankLabModule(this, 'hotCoffe', { default: 'getVideoStatus', generateImage: 'getImageStatus' });
	}
}
