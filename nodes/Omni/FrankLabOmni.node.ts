import type { IExecuteFunctions, INodeType, INodeTypeDescription, INodeProperties } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeFrankLabModule, jobIdProperty, payloadProperty, waitProperty } from '../shared/node-utils';

const googleFields: INodeProperties[] = [
	{
		displayName: 'Google Operation',
		name: 'operationMode',
		type: 'options',
		noDataExpression: true,
		default: 'text_to_video',
		options: [
			{ name: 'Edit', value: 'edit', action: 'Edit an existing video' },
			{ name: 'Extend', value: 'extend', action: 'Extend an existing video (Omni 1.1)' },
			{ name: 'Image to Video', value: 'image_to_video', action: 'Generate a video from an image' },
			{ name: 'Reference to Video', value: 'reference_to_video', action: 'Generate a video from references' },
			{ name: 'Text to Video', value: 'text_to_video', action: 'Generate a video from text' },
		],
		displayOptions: { show: { operation: ['createVideo'] } },
	},
	{
		displayName: 'Model',
		name: 'model',
		type: 'options',
		noDataExpression: true,
		default: 'omni',
		options: [
			{ name: 'Gemini Omni Flash (Omni)', value: 'omni', action: 'Use the omni engine' },
			{ name: 'Gemini Omni Flash 1.1 (Omni_1_1)', value: 'omni_1_1', action: 'Use the omni 1.1 engine' },
			{ name: 'Veo 3 (Veo3)', value: 'veo3', action: 'Use the veo3 engine' },
			{ name: 'Veo 3 Fast (Veo3_fast)', value: 'veo3_fast', action: 'Use the veo3_fast engine' },
		],
		displayOptions: { show: { operation: ['createVideo'] } },
	},
	{
		displayName: 'Prompt',
		name: 'prompt',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		displayOptions: { show: { operation: ['createVideo', 'googleSubVideo', 'googleSubImage', 'videoOmni'] } },
	},
	{
		displayName: 'Duration Seconds',
		name: 'duration_seconds',
		type: 'options',
		noDataExpression: true,
		default: 4,
		options: [
			{ name: '4', value: 4, action: 'Request a 4 second clip' },
			{ name: '6', value: 6, action: 'Request a 6 second clip' },
			{ name: '8', value: 8, action: 'Request an 8 second clip' },
		],
		description: 'Veo only: requested clip length in seconds',
		displayOptions: { show: { operation: ['createVideo'] } },
	},
	{
		displayName: 'Resolution',
		name: 'resolution',
		type: 'options',
		noDataExpression: true,
		default: '720p',
		options: [
			{ name: '720p', value: '720p', action: 'Render at 720p' },
			{ name: '1080p', value: '1080p', action: 'Render at 1080p' },
			{ name: '4K', value: '4k', action: 'Render at 4K' },
		],
		description: 'Veo only: output resolution',
		displayOptions: { show: { operation: ['createVideo'] } },
	},
	{
		displayName: 'Aspect Ratio',
		name: 'aspect_ratio',
		type: 'options',
		noDataExpression: true,
		default: '16:9',
		options: [
			{ name: '16:9', value: '16:9', action: 'Use a 16:9 frame' },
			{ name: '9:16', value: '9:16', action: 'Use a 9:16 frame' },
		],
		displayOptions: { show: { operation: ['createVideo'] } },
	},
	{
		displayName: 'Negative Prompt',
		name: 'negative_prompt',
		type: 'string',
		default: '',
		description: 'Veo only',
		displayOptions: { show: { operation: ['createVideo'] } },
	},
	{
		displayName: 'Image URL',
		name: 'image_url',
		type: 'string',
		default: '',
		description: 'Public http(s) input image for image-to-video, edit, and reference flows',
		displayOptions: { show: { operation: ['createVideo', 'googleSubVideo', 'googleSubImage'] } },
	},
	{
		displayName: 'Video URL',
		name: 'video_url',
		type: 'string',
		default: '',
		description: 'Public http(s) URL of the source video for edit and extend',
		displayOptions: { show: { operation: ['createVideo'] } },
	},
	{
		displayName: 'Mode',
		name: 'mode',
		type: 'string',
		default: '',
		description: 'Optional omni-video generation mode',
		displayOptions: { show: { operation: ['videoOmni'] } },
	},
	{
		displayName: 'Duration',
		name: 'duration',
		type: 'number',
		default: '',
		required: true,
		description: 'Video duration in seconds',
		displayOptions: { show: { operation: ['videoOmni'] } },
	},
	{
		displayName: 'Aspect Ratio (Omni Video)',
		name: 'aspect_ratio',
		type: 'string',
		default: '',
		description: 'Optional aspect ratio for the omni-video route, for example 16:9',
		displayOptions: { show: { operation: ['videoOmni'] } },
	},
];

export class FrankLabOmni implements INodeType {
	// continueOnFail() is handled centrally in executeFrankLabModule.
	description: INodeTypeDescription = {
		displayName: 'FrankLab OMNI',
		name: 'frankLabOmni',
		icon: { light: 'file:omni.svg', dark: 'file:omni.dark.svg' },
		subtitle: '={{$parameter["operation"]}}',
		group: ['transform'],
		version: 1,
		description: 'Generate Google-backed videos and images with FrankLab OMNI (Gemini Omni / Veo, incl. the Google subscription rails).',
		defaults: {
			name: 'FrankLab OMNI',
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
					{ name: 'Create Video (Google Omni)', value: 'createVideo', action: 'Submit a google omni video task' },
					{ name: 'Get Google Sub Image Status', value: 'getGoogleSubImageStatus', action: 'Get a google subscription image status' },
					{ name: 'Get Google Sub Video Status', value: 'getGoogleSubVideoStatus', action: 'Get a google subscription video status' },
					{ name: 'Get Omni Video Status', value: 'getVideoOmniStatus', action: 'Get a v1 omni video task status' },
					{ name: 'Get Status', value: 'getStatus', action: 'Get a google omni video task status' },
					{ name: 'Google Sub Image', value: 'googleSubImage', action: 'Submit a google subscription image task' },
					{ name: 'Google Sub Video', value: 'googleSubVideo', action: 'Submit a google subscription video task' },
					{ name: 'Omni Video (V1)', value: 'videoOmni', action: 'Submit a v1 omni video task' },
					{ name: 'Provider Info', value: 'info', action: 'Get google omni provider info' },
				],
			},
			...googleFields,
			jobIdProperty,
			payloadProperty,
			waitProperty,
		],
	};

	async execute(this: IExecuteFunctions) {
		return executeFrankLabModule(this, 'omni', {
			default: 'getStatus',
			googleSubVideo: 'getGoogleSubVideoStatus',
			googleSubImage: 'getGoogleSubImageStatus',
			videoOmni: 'getVideoOmniStatus',
			info: '',
		});
	}
}
