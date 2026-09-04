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
		required: true,
		displayOptions: { show: { operation: ['textToVideo'] } },
	},
	{
		displayName: 'Prompt',
		name: 'prompt',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		displayOptions: { show: { operation: ['imageToVideo', 'motionControl'] } },
	},
	{
		displayName: 'Image URL',
		name: 'image',
		type: 'string',
		default: '',
		required: true,
		description: 'Public http(s) URL of the first frame or effects image',
		displayOptions: { show: { operation: ['imageToVideo', 'effects'] } },
	},
	{
		displayName: 'Video URL',
		name: 'video_url',
		type: 'string',
		default: '',
		required: true,
		description: 'Public http(s) URL of the source video',
		displayOptions: { show: { operation: ['motionControl'] } },
	},
	{
		displayName: 'Reference Frame URL',
		name: 'image_url',
		type: 'string',
		default: '',
		required: true,
		description: 'Public http(s) URL of the anchor frame for motion control',
		displayOptions: { show: { operation: ['motionControl'] } },
	},
	{
		displayName: 'Effect Scene',
		name: 'effect_scene',
		type: 'options',
		noDataExpression: true,
		default: 'single_character',
		options: [
			{ name: 'Dual Character', value: 'dual_character', action: 'Use the dual character effect scene' },
			{ name: 'Single Character', value: 'single_character', action: 'Use the single character effect scene' },
		],
		displayOptions: { show: { operation: ['effects'] } },
	},
	{
		displayName: 'Effect',
		name: 'effect',
		type: 'string',
		default: '',
		required: true,
		description: 'Effect identifier applied to the scene',
		displayOptions: { show: { operation: ['effects'] } },
	},
	{
		displayName: 'Tail Image URL',
		name: 'image_tail',
		type: 'string',
		default: '',
		description: 'Optional public http(s) URL of the tail frame image',
		displayOptions: { show: { operation: ['effects'] } },
	},
	{
		displayName: 'Aspect Ratio',
		name: 'aspect_ratio',
		type: 'string',
		default: '',
		displayOptions: { show: { operation: ['textToVideo', 'imageToVideo'] } },
	},
	{
		displayName: 'Duration',
		name: 'duration',
		type: 'number',
		default: '',
		required: true,
		description: 'Video duration in seconds (3-15)',
		displayOptions: { show: { operation: ['textToVideo', 'imageToVideo'] } },
	},
	{
		displayName: 'Duration',
		name: 'duration',
		type: 'string',
		default: '',
		required: true,
		description: 'Motion control duration in seconds (3-30) as a string',
		displayOptions: { show: { operation: ['motionControl'] } },
	},
	{
		displayName: 'Model',
		name: 'model',
		type: 'string',
		default: '',
		description: 'Optional model ID',
		displayOptions: { show: { operation: ['textToVideo', 'imageToVideo'] } },
	},
	{
		displayName: 'Negative Prompt',
		name: 'negative_prompt',
		type: 'string',
		default: '',
		displayOptions: { show: { operation: ['textToVideo'] } },
	},
];

export class FrankLabMars implements INodeType {
	// continueOnFail() is handled centrally in executeFrankLabModule.
	description: INodeTypeDescription = {
		displayName: 'FrankLab MARS',
		name: 'frankLabMars',
		icon: 'file:mars.svg',
		subtitle: '={{$parameter["operation"]}}',
		group: ['transform'],
		version: 1,
		description: 'Generate videos from text or images, apply effects and motion control with FrankLab MARS.',
		defaults: {
			name: 'FrankLab MARS',
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
				default: 'textToVideo',
				options: [
					{ name: 'Get Image Video Status', value: 'getImageStatus', action: 'Get an image to video task status' },
					{ name: 'Get Motion Status', value: 'getMotionStatus', action: 'Get a motion control task status' },
					{ name: 'Get Text Video Status', value: 'getTextStatus', action: 'Get a text to video task status' },
					{ name: 'Get Video Effects Status', value: 'getEffectsStatus', action: 'Get a video effects task status' },
					{ name: 'Image to Video', value: 'imageToVideo', action: 'Generate a video from an image' },
					{ name: 'Motion Control', value: 'motionControl', action: 'Apply motion control to a video' },
					{ name: 'Text to Video', value: 'textToVideo', action: 'Generate a video from text' },
					{ name: 'Video Effects', value: 'effects', action: 'Apply effects to a video' },
				],
			},
			...videoFields,
			jobIdProperty,
			payloadProperty,
			waitProperty,
		],
	};

	async execute(this: IExecuteFunctions) {
		return executeFrankLabModule(this, 'mars', {
			default: 'getTextStatus',
			imageToVideo: 'getImageStatus',
			effects: 'getEffectsStatus',
			motionControl: 'getMotionStatus',
		});
	}
}
