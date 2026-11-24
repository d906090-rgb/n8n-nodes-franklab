import type { FrankLabResourceDefinition } from './types';

export const omniResource: FrankLabResourceDefinition = {
	moduleName: 'omni',
	displayName: 'OMNI',
	statusOperation: {
	default: "getStatus",
	createBatch: "getBatchStatus",
	googleSubVideo: "getGoogleSubVideoStatus",
	googleSubImage: "getGoogleSubImageStatus",
	videoOmni: "getVideoOmniStatus",
	quoteVideo: "",
	quoteBatch: "",
	info: ""
},
	operationProperty: {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'createVideo',
		displayOptions: { show: { resource: ['omni'] } },
		options: [
	{
		name: "Create Batch (Google)",
		value: "createBatch",
		action: "Submit a 2 or 3 video OMNI batch"
	},
	{
		name: "Create Video (Google)",
		value: "createVideo",
		action: "Submit a google omni video task"
	},
	{
		name: "Get Batch Status",
		value: "getBatchStatus",
		action: "Get an OMNI batch status"
	},
	{
		name: "Get Google Sub Image Status",
		value: "getGoogleSubImageStatus",
		action: "Get a google subscription image status"
	},
	{
		name: "Get Google Sub Video Status",
		value: "getGoogleSubVideoStatus",
		action: "Get a google subscription video status"
	},
	{
		name: "Get V1 Video Status",
		value: "getVideoOmniStatus",
		action: "Get a v1 omni video task status"
	},
	{
		name: "Get Video Status",
		value: "getStatus",
		action: "Get a google omni video task status"
	},
	{
		name: "Google Sub Image",
		value: "googleSubImage",
		action: "Submit a google subscription image task"
	},
	{
		name: "Google Sub Video",
		value: "googleSubVideo",
		action: "Submit a google subscription video task"
	},
	{
		name: "Provider Info",
		value: "info",
		action: "Get google omni provider info"
	},
	{
		name: "Quote Batch (Google)",
		value: "quoteBatch",
		action: "Quote a 2 or 3 video OMNI batch"
	},
	{
		name: "Quote Video (Google)",
		value: "quoteVideo",
		action: "Estimate cost of a google omni video task"
	},
	{
		name: "Submit V1 Video",
		value: "videoOmni",
		action: "Submit a v1 omni video task"
	}
		],
	},
	fields: [
	{
		displayName: "Google Operation",
		name: "operationMode",
		type: "options",
		noDataExpression: true,
		default: "text_to_video",
		options: [
			{
				name: "Edit",
				value: "edit",
				action: "Edit an existing video"
			},
			{
				name: "Extend",
				value: "extend",
				action: "Extend an existing video (Omni 1.1 / 1.2)"
			},
			{
				name: "Image to Video",
				value: "image_to_video",
				action: "Generate a video from an image"
			},
			{
				name: "Reference to Video",
				value: "reference_to_video",
				action: "Generate a video from references"
			},
			{
				name: "Text to Video",
				value: "text_to_video",
				action: "Generate a video from text"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"createVideo",
					"quoteVideo",
					"quoteBatch",
					"createBatch"
				]
			}
		}
	},
	{
		displayName: "Model",
		name: "model",
		type: "options",
		noDataExpression: true,
		default: "omni",
		options: [
			{
				name: "Gemini Omni Flash (Omni)",
				value: "omni",
				action: "Use the omni engine"
			},
			{
				name: "Gemini Omni Flash 1.1 (Omni_1_1)",
				value: "omni_1_1",
				action: "Use the omni 1.1 engine"
			},
			{
				name: "Gemini Omni Flash 1.2 (Omni_1_2)",
				value: "omni_1_2",
				action: "Use the omni 1.2 engine"
			},
			{
				name: "Veo 3 (Veo3)",
				value: "veo3",
				action: "Use the veo3 engine"
			},
			{
				name: "Veo 3 Fast (Veo3_fast)",
				value: "veo3_fast",
				action: "Use the veo3_fast engine"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"createVideo",
					"quoteVideo",
					"quoteBatch",
					"createBatch"
				]
			}
		}
	},
	{
		displayName: "Batch Count",
		name: "count",
		type: "options",
		noDataExpression: true,
		default: 2,
		options: [
			{
				name: "2 Videos",
				value: 2,
				action: "Generate 2 videos in batch"
			},
			{
				name: "3 Videos",
				value: 3,
				action: "Generate 3 videos in batch"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"quoteBatch",
					"createBatch"
				]
			}
		}
	},
	{
		displayName: "Quote ID (Batch)",
		name: "quote_id",
		type: "string",
		default: "",
		description: "64-char hex quote_id returned by Quote Batch",
		displayOptions: {
			show: {
				operation: [
					"createBatch"
				]
			}
		}
	},
	{
		displayName: "Accepted Total Franks (Batch)",
		name: "accepted_total_franks",
		type: "number",
		default: "",
		description: "Total franks confirmed from Quote Batch",
		displayOptions: {
			show: {
				operation: [
					"createBatch"
				]
			}
		}
	},
	{
		displayName: "Idempotency Key (Batch)",
		name: "idempotency_key",
		type: "string",
		default: "",
		description: "Unique ASCII key (<=128 chars) for batch submission",
		displayOptions: {
			show: {
				operation: [
					"createBatch"
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
					"createVideo",
					"quoteVideo",
					"quoteBatch",
					"createBatch",
					"googleSubVideo",
					"googleSubImage",
					"videoOmni"
				]
			}
		}
	},
	{
		displayName: "Duration Seconds",
		name: "duration_seconds",
		type: "options",
		noDataExpression: true,
		default: 4,
		options: [
			{
				name: "4",
				value: 4,
				action: "Request a 4 second clip"
			},
			{
				name: "6",
				value: 6,
				action: "Request a 6 second clip"
			},
			{
				name: "8",
				value: 8,
				action: "Request an 8 second clip"
			}
		],
		description: "Veo only: requested clip length in seconds",
		displayOptions: {
			show: {
				operation: [
					"createVideo",
					"quoteVideo",
					"quoteBatch",
					"createBatch"
				],
				model: [
					"veo3",
					"veo3_fast"
				]
			}
		}
	},
	{
		displayName: "Resolution",
		name: "resolution",
		type: "options",
		noDataExpression: true,
		default: "720p",
		options: [
			{
				name: "720p",
				value: "720p",
				action: "Render at 720p"
			},
			{
				name: "1080p",
				value: "1080p",
				action: "Render at 1080p"
			},
			{
				name: "4K",
				value: "4k",
				action: "Render at 4K"
			}
		],
		description: "Veo only: output resolution",
		displayOptions: {
			show: {
				operation: [
					"createVideo",
					"quoteVideo",
					"quoteBatch",
					"createBatch"
				]
			}
		}
	},
	{
		displayName: "Aspect Ratio",
		name: "aspect_ratio",
		type: "options",
		noDataExpression: true,
		default: "16:9",
		options: [
			{
				name: "16:9",
				value: "16:9",
				action: "Use a 16:9 frame"
			},
			{
				name: "9:16",
				value: "9:16",
				action: "Use a 9:16 frame"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"createVideo",
					"quoteVideo",
					"quoteBatch",
					"createBatch"
				]
			}
		}
	},
	{
		displayName: "Negative Prompt",
		name: "negative_prompt",
		type: "string",
		default: "",
		description: "Veo only",
		displayOptions: {
			show: {
				operation: [
					"createVideo",
					"quoteVideo",
					"quoteBatch",
					"createBatch"
				]
			}
		}
	},
	{
		displayName: "Image URL",
		name: "image_url",
		type: "string",
		default: "",
		description: "Public http(s) input image for image-to-video, edit, and reference flows",
		displayOptions: {
			show: {
				operation: [
					"createVideo",
					"quoteVideo",
					"quoteBatch",
					"createBatch",
					"googleSubVideo",
					"googleSubImage"
				]
			}
		}
	},
	{
		displayName: "Video URL",
		name: "video_url",
		type: "string",
		default: "",
		description: "Public http(s) URL of the source video for edit and extend",
		displayOptions: {
			show: {
				operation: [
					"createVideo",
					"quoteVideo",
					"quoteBatch",
					"createBatch"
				]
			}
		}
	},
	{
		displayName: "Mode",
		name: "mode",
		type: "string",
		default: "",
		description: "Optional omni-video generation mode",
		displayOptions: {
			show: {
				operation: [
					"videoOmni"
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
		description: "Video duration in seconds",
		displayOptions: {
			show: {
				operation: [
					"videoOmni"
				]
			}
		}
	},
	{
		displayName: "Aspect Ratio (Omni Video)",
		name: "aspect_ratio",
		type: "string",
		default: "",
		description: "Optional aspect ratio for the omni-video route, for example 16:9",
		displayOptions: {
			show: {
				operation: [
					"videoOmni"
				]
			}
		}
	}
],
};
