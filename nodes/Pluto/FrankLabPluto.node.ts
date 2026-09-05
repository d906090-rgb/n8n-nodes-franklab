import type { IExecuteFunctions, INodeType, INodeTypeDescription, INodeProperties } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeFrankLabModule, jobIdProperty, payloadProperty, waitProperty } from '../shared/node-utils';

const audioFields: INodeProperties[] = [
	{
		displayName: 'Prompt',
		name: 'prompt',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		description: 'Audio generation prompt',
		displayOptions: { show: { operation: ['textToAudio'] } },
	},
	{
		displayName: 'Video URL',
		name: 'video_url',
		type: 'string',
		default: '',
		description: 'Public http(s) video URL for video-to-audio (provider video IDs go via Additional JSON video_id)',
		displayOptions: { show: { operation: ['videoToAudio'] } },
	},
];

export class FrankLabPluto implements INodeType {
	// continueOnFail() is handled centrally in executeFrankLabModule.
	description: INodeTypeDescription = {
		displayName: 'FrankLab PLUTO',
		name: 'frankLabPluto',
		icon: { light: 'file:pluto.svg', dark: 'file:pluto.dark.svg' },
		subtitle: '={{$parameter["operation"]}}',
		group: ['transform'],
		version: 1,
		description: 'Generate audio from text or video soundtracks with FrankLab PLUTO.',
		defaults: {
			name: 'FrankLab PLUTO',
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
				default: 'textToAudio',
				options: [
					{ name: 'Get Audio Status', value: 'getAudioStatus', action: 'Get a text to audio task status' },
					{ name: 'Get Video Audio Status', value: 'getVideoAudioStatus', action: 'Get a video to audio task status' },
					{ name: 'Text to Audio', value: 'textToAudio', action: 'Generate audio from a text prompt' },
					{ name: 'Video to Audio', value: 'videoToAudio', action: 'Generate audio for a video' },
				],
			},
			...audioFields,
			jobIdProperty,
			payloadProperty,
			waitProperty,
		],
	};

	async execute(this: IExecuteFunctions) {
		return executeFrankLabModule(this, 'pluto', { default: 'getAudioStatus', videoToAudio: 'getVideoAudioStatus' });
	}
}
