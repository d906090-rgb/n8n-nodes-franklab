import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

export const fluxOperations: INodePropertyOptions[] = [
	{
		name: "Check Image Availability",
		value: "imageAvailability",
		action: "Check flux 3 image availability"
	},
	{
		name: "Check Video Availability",
		value: "videoAvailability",
		action: "Check flux 3 video availability"
	},
	{
		name: "Get Image Status",
		value: "imageStatus",
		action: "Get flux 3 image task status"
	},
	{
		name: "Get Video Status",
		value: "videoStatus",
		action: "Get flux 3 video task status"
	},
	{
		name: "Quote Image",
		value: "imageQuote",
		action: "Estimate cost of a flux 3 image task"
	},
	{
		name: "Quote Video",
		value: "videoQuote",
		action: "Estimate cost of a flux 3 video task"
	},
	{
		name: "Submit Image",
		value: "imageSubmit",
		action: "Submit a flux 3 image or klein task"
	},
	{
		name: "Submit Video",
		value: "videoSubmit",
		action: "Submit a flux 3 video task"
	}
];

export const fluxFields: INodeProperties[] = [
	{
		displayName: "Video Mode",
		name: "videoMode",
		type: "options",
		noDataExpression: true,
		default: "t2v",
		options: [
			{
				name: "Draft Enhance",
				value: "draft_enhance",
				action: "Upscale a completed draft video"
			},
			{
				name: "Image to Video (Keyframes)",
				value: "i2v",
				action: "Generate video from keyframe image"
			},
			{
				name: "Text to Video",
				value: "t2v",
				action: "Generate video from text"
			},
			{
				name: "Video Continuation (V2V)",
				value: "v2v",
				action: "Continue an existing video"
			},
			{
				name: "Video Edit",
				value: "edit",
				action: "Edit an existing video"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"videoSubmit",
					"videoQuote"
				]
			}
		}
	},
	{
		displayName: "Image Model",
		name: "imageModel",
		type: "options",
		noDataExpression: true,
		default: "flux-3-image",
		options: [
			{
				name: "FLUX 3 Image",
				value: "flux-3-image",
				action: "Use FLUX 3 Image"
			},
			{
				name: "FLUX 3 Image Klein",
				value: "flux-3-image-klein",
				action: "Use FLUX 3 Image Klein"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"imageSubmit",
					"imageQuote"
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
					"videoSubmit",
					"videoQuote",
					"imageSubmit",
					"imageQuote"
				]
			}
		}
	},
	{
		displayName: "Aspect Ratio",
		name: "aspect_ratio",
		type: "string",
		default: "auto",
		description: "Aspect ratio such as auto, 16:9, 9:16, 1:1",
		displayOptions: {
			show: {
				operation: [
					"videoSubmit",
					"videoQuote",
					"imageSubmit",
					"imageQuote"
				]
			}
		}
	},
	{
		displayName: "Resolution",
		name: "resolution",
		type: "string",
		default: "",
		description: "Video: hd|fhd|qhd|uhd. Image: 768sq|1k|1.5k|2k|4k|match_input.",
		displayOptions: {
			show: {
				operation: [
					"videoSubmit",
					"videoQuote",
					"imageSubmit",
					"imageQuote"
				]
			}
		}
	},
	{
		displayName: "Duration (Seconds or Auto)",
		name: "duration",
		type: "string",
		default: "auto",
		description: "Auto or integer 5..20 (max 15 for v2v)",
		displayOptions: {
			show: {
				operation: [
					"videoSubmit",
					"videoQuote"
				]
			}
		}
	},
	{
		displayName: "Reference Image / Keyframe URL",
		name: "reference_image_url",
		type: "string",
		default: "",
		description: "Canonical FrankLab https:// URL for i2v keyframe or image reference",
		displayOptions: {
			show: {
				operation: [
					"videoSubmit",
					"videoQuote",
					"imageSubmit",
					"imageQuote"
				]
			}
		}
	},
	{
		displayName: "Start Video URL (V2V)",
		name: "startVideo",
		type: "string",
		default: "",
		description: "Partner-owned canonical FrankLab https:// MP4 URL for v2v continuation",
		displayOptions: {
			show: {
				operation: [
					"videoSubmit",
					"videoQuote"
				],
				videoMode: [
					"v2v"
				]
			}
		}
	},
	{
		displayName: "Video URL (Edit)",
		name: "videoInput",
		type: "string",
		default: "",
		description: "Partner-owned canonical FrankLab https:// MP4 URL for video edit",
		displayOptions: {
			show: {
				operation: [
					"videoSubmit",
					"videoQuote"
				],
				videoMode: [
					"edit"
				]
			}
		}
	},
	{
		displayName: "Draft Task ID (Draft Enhance)",
		name: "draftTaskId",
		type: "string",
		default: "",
		description: "UUID of a completed FLUX draft video task",
		displayOptions: {
			show: {
				operation: [
					"videoSubmit",
					"videoQuote"
				],
				videoMode: [
					"draft_enhance"
				]
			}
		}
	},
	{
		displayName: "Generate Audio",
		name: "generateAudio",
		type: "boolean",
		default: true,
		displayOptions: {
			show: {
				operation: [
					"videoSubmit",
					"videoQuote"
				],
				videoMode: [
					"t2v",
					"i2v",
					"v2v"
				]
			}
		}
	},
	{
		displayName: "Draft Mode (HD Only)",
		name: "draft",
		type: "boolean",
		default: false,
		displayOptions: {
			show: {
				operation: [
					"videoSubmit",
					"videoQuote"
				],
				videoMode: [
					"t2v",
					"i2v"
				]
			}
		}
	},
	{
		displayName: "Output Format (Klein)",
		name: "outputFormat",
		type: "options",
		noDataExpression: true,
		default: "jpeg",
		options: [
			{
				name: "JPEG",
				value: "jpeg",
				action: "Output JPEG"
			},
			{
				name: "PNG",
				value: "png",
				action: "Output PNG"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"imageSubmit",
					"imageQuote"
				],
				imageModel: [
					"flux-3-image-klein"
				]
			}
		}
	},
	{
		displayName: "Steps (Klein, 1-16)",
		name: "steps",
		type: "number",
		default: 16,
		displayOptions: {
			show: {
				operation: [
					"imageSubmit",
					"imageQuote"
				],
				imageModel: [
					"flux-3-image-klein"
				]
			}
		}
	},
	{
		displayName: "Safety Tolerance",
		name: "safetyTolerance",
		type: "number",
		default: 2,
		description: "0..7 (0..4 for video edit)",
		displayOptions: {
			show: {
				operation: [
					"videoSubmit",
					"videoQuote",
					"imageSubmit",
					"imageQuote"
				]
			}
		}
	},
	{
		displayName: "Idempotency Key",
		name: "idempotencyKey",
		type: "string",
		default: "",
		description: "Optional unique key (auto-generated when empty)",
		displayOptions: {
			show: {
				operation: [
					"videoSubmit",
					"imageSubmit"
				]
			}
		}
	},
	{
		displayName: "Accepted Max Franks",
		name: "acceptedMaxFranks",
		type: "number",
		default: "",
		description: "Price cap in ₣ (auto-quoted via /quote before submit when empty)",
		displayOptions: {
			show: {
				operation: [
					"videoSubmit",
					"imageSubmit"
				]
			}
		}
	}
];
