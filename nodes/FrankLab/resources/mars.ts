import type { FrankLabResourceDefinition } from './types';

export const marsResource: FrankLabResourceDefinition = {
	moduleName: 'mars',
	displayName: 'MARS',
	statusOperation: {
	default: "getTextStatus",
	imageToVideo: "getImageStatus",
	effects: "getEffectsStatus",
	motionControl: "getMotionStatus"
},
	operationProperty: {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'textToVideo',
		displayOptions: { show: { resource: ['mars'] } },
		options: [
	{
		name: "Get Image Video Status",
		value: "getImageStatus",
		action: "Get an image to video task status"
	},
	{
		name: "Get Motion Status",
		value: "getMotionStatus",
		action: "Get a motion control task status"
	},
	{
		name: "Get Text Video Status",
		value: "getTextStatus",
		action: "Get a text to video task status"
	},
	{
		name: "Get Video Effects Status",
		value: "getEffectsStatus",
		action: "Get a video effects task status"
	},
	{
		name: "Image to Video",
		value: "imageToVideo",
		action: "Generate a video from an image"
	},
	{
		name: "Motion Control",
		value: "motionControl",
		action: "Apply motion control to a video"
	},
	{
		name: "Text to Video",
		value: "textToVideo",
		action: "Generate a video from text"
	},
	{
		name: "Video Effects",
		value: "effects",
		action: "Apply effects to a video"
	}
		],
	},
	fields: [
	{
		displayName: "Execution Mode",
		name: "execution_mode",
		type: "options",
		default: "",
		description: "Optional execution route (Economy Pool is a draft-tier route unavailable to confirmed B2B legal-entity accounts, without automatic fallback)",
		options: [
			{
				name: "Direct (Default)",
				value: ""
			},
			{
				name: "Economy Pool (Draft)",
				value: "economy_rail"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"textToVideo",
					"imageToVideo"
				]
			}
		}
	},
	{
		displayName: "Prompt",
		name: "prompt",
		type: "string",
		typeOptions: {
			rows: 4
		},
		default: "",
		required: true,
		displayOptions: {
			show: {
				operation: [
					"textToVideo"
				]
			}
		}
	},
	{
		displayName: "Prompt",
		name: "prompt",
		type: "string",
		typeOptions: {
			rows: 4
		},
		default: "",
		displayOptions: {
			show: {
				operation: [
					"imageToVideo",
					"motionControl"
				]
			}
		}
	},
	{
		displayName: "Image URL",
		name: "image",
		type: "string",
		default: "",
		required: true,
		description: "Public http(s) URL of the first frame or effects image",
		displayOptions: {
			show: {
				operation: [
					"imageToVideo",
					"effects"
				]
			}
		}
	},
	{
		displayName: "Video URL",
		name: "video_url",
		type: "string",
		default: "",
		required: true,
		description: "Public http(s) URL of the source video",
		displayOptions: {
			show: {
				operation: [
					"motionControl"
				]
			}
		}
	},
	{
		displayName: "Reference Frame URL",
		name: "image_url",
		type: "string",
		default: "",
		required: true,
		description: "Public http(s) URL of the anchor frame for motion control",
		displayOptions: {
			show: {
				operation: [
					"motionControl"
				]
			}
		}
	},
	{
		displayName: "Effect Scene",
		name: "effect_scene",
		type: "options",
		noDataExpression: true,
		default: "single_character",
		options: [
			{
				name: "Dual Character",
				value: "dual_character",
				action: "Use the dual character effect scene"
			},
			{
				name: "Single Character",
				value: "single_character",
				action: "Use the single character effect scene"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"effects"
				]
			}
		}
	},
	{
		displayName: "Effect",
		name: "effect",
		type: "string",
		default: "",
		required: true,
		description: "Effect identifier applied to the scene",
		displayOptions: {
			show: {
				operation: [
					"effects"
				]
			}
		}
	},
	{
		displayName: "Tail Image URL",
		name: "image_tail",
		type: "string",
		default: "",
		description: "Optional public http(s) URL of the tail/last frame image",
		displayOptions: {
			show: {
				operation: [
					"effects"
				]
			}
		}
	},
	{
		displayName: "Tail / Last Frame Image URL",
		name: "image_tail",
		type: "string",
		default: "",
		description: "Optional public http(s) URL of the last frame image (Kling 4.0 mars-v2 or legacy Kling 2.5-3.0; Flash does not support last_frame)",
		displayOptions: {
			show: {
				operation: [
					"imageToVideo"
				],
				model: [
					"",
					"mars-v2",
					"mars-v1-5",
					"mars-v1",
					"mars-v1-turbo"
				]
			}
		}
	},
	{
		displayName: "Middle Frame URLs (Kling 4.0)",
		name: "middle_frame_urls",
		type: "string",
		default: "",
		description: "Optional comma or newline separated public http(s) URLs of middle keyframes (mars-v2 imageToVideo only; Flash does not support middle_frame)",
		displayOptions: {
			show: {
				operation: [
					"imageToVideo"
				],
				model: [
					"mars-v2"
				]
			}
		}
	},
	{
		displayName: "Aspect Ratio",
		name: "aspect_ratio",
		type: "string",
		default: "",
		description: "Aspect ratio (for Kling 4.0 textToVideo: 21:9, 16:9, 9:16, 1:1, 4:3, 3:4; omitted on Kling 4.0 imageToVideo)",
		displayOptions: {
			show: {
				operation: [
					"textToVideo",
					"imageToVideo"
				]
			}
		}
	},
	{
		displayName: "Duration",
		name: "duration",
		type: "number",
		default: "",
		required: true,
		description: "Video duration in seconds (3-15 for Kling 2.5-3.0, 3-20 for mars-v2-flash, 3-30 for mars-v2)",
		displayOptions: {
			show: {
				operation: [
					"textToVideo",
					"imageToVideo"
				]
			}
		}
	},
	{
		displayName: "Duration",
		name: "duration",
		type: "string",
		default: "",
		required: true,
		description: "Motion control duration in seconds (3-30) as a string",
		displayOptions: {
			show: {
				operation: [
					"motionControl"
				]
			}
		}
	},
	{
		displayName: "Model",
		name: "model",
		type: "options",
		default: "",
		description: "MARS model ID (mars-v2 = Kling 4.0, mars-v2-flash = Kling 4.0 Flash, mars-v1-5 = Kling 3.0)",
		options: [
			{
				name: "Default (Backend)",
				value: ""
			},
			{
				name: "Kling 2.5 Turbo (Mars V1 Turbo)",
				value: "mars-v1-turbo"
			},
			{
				name: "Kling 2.6 (Mars V1)",
				value: "mars-v1"
			},
			{
				name: "Kling 3.0 (Mars V1.5)",
				value: "mars-v1-5"
			},
			{
				name: "Kling 4.0 (Mars V2)",
				value: "mars-v2"
			},
			{
				name: "Kling 4.0 Flash (Mars V2 Flash)",
				value: "mars-v2-flash"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"textToVideo",
					"imageToVideo"
				]
			}
		}
	},
	{
		displayName: "Resolution (Kling 4.0)",
		name: "resolution",
		type: "options",
		default: "1080p",
		description: "Output resolution for Kling 4.0 (mars-v2 supports 720p, 1080p, 4k; mars-v2-flash supports 720p only)",
		options: [
			{
				name: "720p",
				value: "720p"
			},
			{
				name: "1080p",
				value: "1080p"
			},
			{
				name: "4K",
				value: "4k"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"textToVideo",
					"imageToVideo"
				],
				model: [
					"mars-v2"
				]
			}
		}
	},
	{
		displayName: "Dynamic Range (Kling 4.0)",
		name: "dynamic_range",
		type: "options",
		default: "sdr",
		description: "Dynamic range for Kling 4.0 (HDR is supported on 1080p and 4K only)",
		options: [
			{
				name: "SDR",
				value: "sdr"
			},
			{
				name: "HDR (1080p / 4K)",
				value: "hdr"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"textToVideo",
					"imageToVideo"
				],
				model: [
					"mars-v2"
				]
			}
		}
	},
	{
		displayName: "Negative Prompt",
		name: "negative_prompt",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"textToVideo"
				]
			}
		}
	}
],
};
