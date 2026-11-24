import type { FrankLabResourceDefinition } from './types';

export const textStickerResource: FrankLabResourceDefinition = {
	moduleName: 'textSticker',
	displayName: 'TextSticker',
	statusOperation: "getStatus",
	operationProperty: {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'overlay',
		displayOptions: { show: { resource: ['textSticker'] } },
		options: [
	{
		name: "Apply Overlay",
		value: "overlay",
		action: "Overlay text and stickers on a video"
	},
	{
		name: "Get Job Status",
		value: "getStatus",
		action: "Get an overlay job status"
	},
	{
		name: "List Aspect Ratios",
		value: "listAspectRatios",
		action: "List aspect ratios"
	},
	{
		name: "List Emojis",
		value: "listEmojis",
		action: "List emojis"
	},
	{
		name: "List Fonts",
		value: "listFonts",
		action: "List fonts"
	},
	{
		name: "List Resize Presets",
		value: "listResizePresets",
		action: "List resize presets"
	},
	{
		name: "List Safe Zone Options",
		value: "listSafeZoneOptions",
		action: "List safe zone options"
	},
	{
		name: "List Stickers",
		value: "listStickers",
		action: "List stickers"
	},
	{
		name: "List Subtitle Templates",
		value: "listSubtitleTemplates",
		action: "List subtitle templates"
	},
	{
		name: "List Transition Sounds",
		value: "listTransitionSounds",
		action: "List transition sounds"
	},
	{
		name: "List Transitions",
		value: "listTransitions",
		action: "List transitions"
	},
	{
		name: "List Video Effects",
		value: "listVideoEffects",
		action: "List video effects"
	}
		],
	},
	fields: [
	{
		displayName: "Video URL",
		name: "videoUrl",
		type: "string",
		default: "",
		required: true,
		description: "Public http(s) URL of the target video",
		displayOptions: {
			show: {
				operation: [
					"overlay"
				]
			}
		}
	},
	{
		displayName: "Platform",
		name: "platform",
		type: "string",
		default: "",
		description: "Optional target platform preset for overlay placement",
		displayOptions: {
			show: {
				operation: [
					"overlay"
				]
			}
		}
	},
	{
		displayName: "Config ID",
		name: "configId",
		type: "string",
		default: "",
		description: "Optional saved overlay config ID",
		displayOptions: {
			show: {
				operation: [
					"overlay"
				]
			}
		}
	}
],
};
