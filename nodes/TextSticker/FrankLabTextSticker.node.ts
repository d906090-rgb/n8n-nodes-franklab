import type { IExecuteFunctions, INodeType, INodeTypeDescription, INodeProperties } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeFrankLabModule, jobIdProperty, payloadProperty, waitProperty } from '../shared/node-utils';

const overlayFields: INodeProperties[] = [
	{
		displayName: 'Video URL',
		name: 'videoUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'Public http(s) URL of the target video',
		displayOptions: { show: { operation: ['overlay'] } },
	},
	{
		displayName: 'Platform',
		name: 'platform',
		type: 'string',
		default: '',
		description: 'Optional target platform preset for overlay placement',
		displayOptions: { show: { operation: ['overlay'] } },
	},
	{
		displayName: 'Config ID',
		name: 'configId',
		type: 'string',
		default: '',
		description: 'Optional saved overlay config ID',
		displayOptions: { show: { operation: ['overlay'] } },
	},
];

export class FrankLabTextSticker implements INodeType {
	// continueOnFail() is handled centrally in executeFrankLabModule.
	description: INodeTypeDescription = {
		displayName: 'FrankLab TextSticker',
		name: 'frankLabTextSticker',
		icon: { light: 'file:textsticker.svg', dark: 'file:textsticker.dark.svg' },
		subtitle: '={{$parameter["operation"]}}',
		group: ['transform'],
		version: 1,
		description: 'Overlay text, stickers, and emoji on videos with FrankLab TextSticker, plus studio option lists.',
		defaults: {
			name: 'FrankLab TextSticker',
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
				default: 'overlay',
				options: [
					{ name: 'Get Job Status', value: 'getStatus', action: 'Get an overlay job status' },
					{ name: 'List Aspect Ratios', value: 'listAspectRatios', action: 'List aspect ratios' },
					{ name: 'List Emojis', value: 'listEmojis', action: 'List emojis' },
					{ name: 'List Fonts', value: 'listFonts', action: 'List fonts' },
					{ name: 'List Resize Presets', value: 'listResizePresets', action: 'List resize presets' },
					{ name: 'List Safe Zone Options', value: 'listSafeZoneOptions', action: 'List safe zone options' },
					{ name: 'List Stickers', value: 'listStickers', action: 'List stickers' },
					{ name: 'List Subtitle Templates', value: 'listSubtitleTemplates', action: 'List subtitle templates' },
					{ name: 'List Transition Sounds', value: 'listTransitionSounds', action: 'List transition sounds' },
					{ name: 'List Transitions', value: 'listTransitions', action: 'List transitions' },
					{ name: 'List Video Effects', value: 'listVideoEffects', action: 'List video effects' },
					{ name: 'Overlay', value: 'overlay', action: 'Overlay text and stickers on a video' },
				],
			},
			...overlayFields,
			jobIdProperty,
			payloadProperty,
			waitProperty,
		],
	};

	async execute(this: IExecuteFunctions) {
		return executeFrankLabModule(this, 'textSticker', 'getStatus');
	}
}
