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
		displayOptions: { show: { operation: ['video', 'turboTextToVideo', 'turboImageToVideo', 'videoExtend', 'multiImageToVideo'] } },
	},
	{
		displayName: 'Model',
		name: 'model_name',
		type: 'string',
		default: '',
		description: 'Optional SATURN model ID',
		displayOptions: { show: { operation: ['video', 'multiImageToVideo'] } },
	},
	{
		displayName: 'Mode',
		name: 'mode',
		type: 'string',
		default: '',
		description: 'Optional generation mode',
		displayOptions: { show: { operation: ['video', 'multiImageToVideo'] } },
	},
	{
		displayName: 'Video ID (Extend)',
		name: 'video_id',
		type: 'string',
		default: '',
		description: 'Existing Kling/SATURN video ID to extend (or pass Video URL / Source Task ID)',
		displayOptions: { show: { operation: ['videoExtend'] } },
	},
	{
		displayName: 'Video URL (Extend)',
		name: 'video_url',
		type: 'string',
		default: '',
		description: 'Public http(s) URL of video to extend',
		displayOptions: { show: { operation: ['videoExtend'] } },
	},
	{
		displayName: 'Source Task ID (Extend)',
		name: 'source_task_id',
		type: 'string',
		default: '',
		displayOptions: { show: { operation: ['videoExtend'] } },
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
		displayOptions: { show: { operation: ['video', 'turboTextToVideo', 'turboImageToVideo', 'multiImageToVideo'] } },
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
		displayName: 'Duration (Optional, 3-15s)',
		name: 'duration',
		type: 'number',
		default: '',
		displayOptions: { show: { operation: ['multiImageToVideo'] } },
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
		icon: { light: 'file:saturn.svg', dark: 'file:saturn.dark.svg' },
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
					{ name: 'Extend Video', value: 'videoExtend', action: 'Extend an existing SATURN video' },
					{ name: 'Generate Video', value: 'video', action: 'Generate a SATURN video' },
					{ name: 'Get Multi-Image Status', value: 'getMultiImageStatus', action: 'Get a multi image to video task status' },
					{ name: 'Get Turbo Status', value: 'getTurboStatus', action: 'Get a saturn turbo task status' },
					{ name: 'Get Video Extend Status', value: 'getVideoExtendStatus', action: 'Get a video extend task status' },
					{ name: 'Get Video Status', value: 'getVideoStatus', action: 'Get a SATURN video task status' },
					{ name: 'Multi-Image to Video', value: 'multiImageToVideo', action: 'Generate video from multiple reference images provide image list in additional json' },
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
			videoExtend: 'getVideoExtendStatus',
			multiImageToVideo: 'getMultiImageStatus',
		});
	}
}
