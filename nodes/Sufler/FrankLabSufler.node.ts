import type { IExecuteFunctions, INodeType, INodeTypeDescription, INodeProperties } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeFrankLabModule, jobIdProperty, payloadProperty, waitProperty } from '../shared/node-utils';

const subtitleFields: INodeProperties[] = [
	{
		displayName: 'Video URL',
		name: 'videoUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'Public http(s) URL of the video to burn subtitles into',
		displayOptions: { show: { operation: ['subtitles'] } },
	},
	{
		displayName: 'Caption Engine',
		name: 'captionEngine',
		type: 'options',
		noDataExpression: true,
		default: 'v2',
		options: [
			{ name: 'V1', value: 'v1', action: 'Use the v1 caption engine' },
			{ name: 'V2', value: 'v2', action: 'Use the v2 caption engine' },
		],
		displayOptions: { show: { operation: ['subtitles'] } },
	},
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		default: '',
		description: 'Optional subtitle template ID (see FrankLab TextSticker List Subtitle Templates)',
		displayOptions: { show: { operation: ['subtitles'] } },
	},
	{
		displayName: 'Language',
		name: 'language',
		type: 'string',
		default: '',
		description: 'Source language code, for example ru or en',
		displayOptions: { show: { operation: ['subtitles'] } },
	},
	{
		displayName: 'Transcription Engine',
		name: 'transcriptionEngine',
		type: 'options',
		noDataExpression: true,
		default: '',
		options: [
			{ name: 'Auto', value: '', action: 'Let the server pick the transcription engine' },
			{ name: 'Whisper', value: 'whisper', action: 'Use Whisper transcription' },
			{ name: 'xAI Grok Transcribe', value: 'xai_grok_transcribe', action: 'Use xAI Grok transcription' },
			{ name: 'Gemini', value: 'gemini', action: 'Use Gemini transcription' },
		],
		displayOptions: { show: { operation: ['subtitles'] } },
	},
	{
		displayName: 'Highlight Mode',
		name: 'highlightMode',
		type: 'string',
		default: '',
		description: 'Optional word highlight mode',
		displayOptions: { show: { operation: ['subtitles'] } },
	},
	{
		displayName: 'Platform',
		name: 'platform',
		type: 'string',
		default: '',
		description: 'Optional target platform preset',
		displayOptions: { show: { operation: ['subtitles'] } },
	},
	{
		displayName: 'Safe Zone Preset',
		name: 'safeZonePreset',
		type: 'string',
		default: '',
		description: 'Optional safe zone preset ID',
		displayOptions: { show: { operation: ['subtitles'] } },
	},
];

export class FrankLabSufler implements INodeType {
	// continueOnFail() is handled centrally in executeFrankLabModule.
	description: INodeTypeDescription = {
		displayName: 'FrankLab SUFLER',
		name: 'frankLabSufler',
		icon: { light: 'file:sufler.svg', dark: 'file:sufler.dark.svg' },
		subtitle: '={{$parameter["operation"]}}',
		group: ['transform'],
		version: 1,
		description: 'Burn styled subtitles and captions into videos with FrankLab SUFLER.',
		defaults: {
			name: 'FrankLab SUFLER',
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
				default: 'subtitles',
				options: [
					{ name: 'Burn Subtitles', value: 'subtitles', action: 'Burn subtitles into a video' },
					{ name: 'Get Job Status', value: 'getStatus', action: 'Get a subtitles job status' },
				],
			},
			...subtitleFields,
			jobIdProperty,
			payloadProperty,
			waitProperty,
		],
	};

	async execute(this: IExecuteFunctions) {
		return executeFrankLabModule(this, 'sufler', 'getStatus');
	}
}
