import type { FrankLabResourceDefinition } from './types';

export const saturnResource: FrankLabResourceDefinition = {
	moduleName: 'saturn',
	displayName: 'SATURN',
	statusOperation: {
	default: "getVideoStatus",
	turboTextToVideo: "getTurboStatus",
	turboImageToVideo: "getTurboStatus",
	videoExtend: "getVideoExtendStatus",
	multiImageToVideo: "getMultiImageStatus"
},
	operationProperty: {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'video',
		displayOptions: { show: { resource: ['saturn'] } },
		options: [
	{
		name: "Extend Video",
		value: "videoExtend",
		action: "Extend an existing SATURN video"
	},
	{
		name: "Generate Video",
		value: "video",
		action: "Generate a SATURN video"
	},
	{
		name: "Get Multi-Image Status",
		value: "getMultiImageStatus",
		action: "Get a multi image to video task status"
	},
	{
		name: "Get Turbo Status",
		value: "getTurboStatus",
		action: "Get a saturn turbo task status"
	},
	{
		name: "Get Video Extend Status",
		value: "getVideoExtendStatus",
		action: "Get a video extend task status"
	},
	{
		name: "Get Video Status",
		value: "getVideoStatus",
		action: "Get a SATURN video task status"
	},
	{
		name: "Multi-Image to Video",
		value: "multiImageToVideo",
		action: "Generate video from multiple reference images provide image list in additional json"
	},
	{
		name: "Turbo Image to Video",
		value: "turboImageToVideo",
		action: "Generate a saturn turbo video from an image"
	},
	{
		name: "Turbo Text to Video",
		value: "turboTextToVideo",
		action: "Generate a saturn turbo video from text"
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
					"video",
					"turboTextToVideo",
					"turboImageToVideo"
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
					"video",
					"turboTextToVideo",
					"turboImageToVideo",
					"videoExtend",
					"multiImageToVideo"
				]
			}
		}
	},
	{
		displayName: "Model",
		name: "model_name",
		type: "options",
		default: "",
		description: "SATURN model ID (saturn-v2 = Kling 4.0 Omni, saturn-v2-flash = Kling 4.0 Flash Omni, saturn-v1-5 = Kling 3.0 Omni)",
		options: [
			{
				name: "Default (Backend)",
				value: ""
			},
			{
				name: "Kling 3.0 Omni (Saturn V1.5)",
				value: "saturn-v1-5"
			},
			{
				name: "Kling 4.0 Flash Omni (Saturn V2 Flash)",
				value: "saturn-v2-flash"
			},
			{
				name: "Kling 4.0 Omni (Saturn V2)",
				value: "saturn-v2"
			},
			{
				name: "Kling Video O1 (Saturn V1)",
				value: "saturn-v1"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"video"
				]
			}
		}
	},
	{
		displayName: "Model",
		name: "model_name",
		type: "string",
		default: "",
		description: "Optional SATURN model ID",
		displayOptions: {
			show: {
				operation: [
					"multiImageToVideo"
				]
			}
		}
	},
	{
		displayName: "Resolution (Kling 4.0 Omni)",
		name: "resolution",
		type: "options",
		default: "1080p",
		description: "Output resolution for Kling 4.0 Omni (saturn-v2: 720p, 1080p, 4k; saturn-v2-flash: 720p only)",
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
					"video"
				],
				model_name: [
					"saturn-v2"
				]
			}
		}
	},
	{
		displayName: "Dynamic Range (Kling 4.0 Omni)",
		name: "dynamic_range",
		type: "options",
		default: "sdr",
		description: "Dynamic range for Kling 4.0 Omni (HDR is supported on 1080p and 4K only)",
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
					"video"
				],
				model_name: [
					"saturn-v2"
				]
			}
		}
	},
	{
		displayName: "Audio Mode (Kling 4.0 Omni)",
		name: "audio",
		type: "options",
		default: "native",
		description: "Generate native audio or preserve original audio from base_video / feature_video (incompatible with voice_ids)",
		options: [
			{
				name: "Native (Generate Audio)",
				value: "native"
			},
			{
				name: "Original (Keep Input Video Audio)",
				value: "original"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"video"
				],
				model_name: [
					"saturn-v2",
					"saturn-v2-flash"
				]
			}
		}
	},
	{
		displayName: "Base Video URL (Edit Mode)",
		name: "base_video_url",
		type: "string",
		default: "",
		description: "Optional public http(s) URL of source video to edit (base_video) on Kling 4.0 Omni",
		displayOptions: {
			show: {
				operation: [
					"video"
				],
				model_name: [
					"saturn-v2",
					"saturn-v2-flash"
				]
			}
		}
	},
	{
		displayName: "Feature Video URL (Reference)",
		name: "feature_video_url",
		type: "string",
		default: "",
		description: "Optional public http(s) URL of reference video (feature_video) on Kling 4.0 Omni",
		displayOptions: {
			show: {
				operation: [
					"video"
				],
				model_name: [
					"saturn-v2",
					"saturn-v2-flash"
				]
			}
		}
	},
	{
		displayName: "First Frame URL (Kling 4.0 Omni)",
		name: "first_frame_url",
		type: "string",
		default: "",
		description: "Optional public http(s) URL of the first frame",
		displayOptions: {
			show: {
				operation: [
					"video"
				],
				model_name: [
					"saturn-v2",
					"saturn-v2-flash"
				]
			}
		}
	},
	{
		displayName: "Middle Frame URLs (Kling 4.0 Omni)",
		name: "middle_frame_urls",
		type: "string",
		default: "",
		description: "Optional comma or newline separated public http(s) URLs of middle keyframes (saturn-v2 only)",
		displayOptions: {
			show: {
				operation: [
					"video"
				],
				model_name: [
					"saturn-v2"
				]
			}
		}
	},
	{
		displayName: "Last Frame URL (Kling 4.0 Omni)",
		name: "last_frame_url",
		type: "string",
		default: "",
		description: "Optional public http(s) URL of the last frame (saturn-v2 only)",
		displayOptions: {
			show: {
				operation: [
					"video"
				],
				model_name: [
					"saturn-v2"
				]
			}
		}
	},
	{
		displayName: "Reference Image URLs (Kling 4.0 Omni)",
		name: "refer_image_urls",
		type: "string",
		default: "",
		description: "Optional comma or newline separated public http(s) URLs of reference images",
		displayOptions: {
			show: {
				operation: [
					"video"
				],
				model_name: [
					"saturn-v2",
					"saturn-v2-flash"
				]
			}
		}
	},
	{
		displayName: "Element IDs (Kling 4.0 Omni)",
		name: "element_ids",
		type: "string",
		default: "",
		description: "Optional comma or newline separated KUSOK element IDs (up to 7)",
		displayOptions: {
			show: {
				operation: [
					"video"
				],
				model_name: [
					"saturn-v2",
					"saturn-v2-flash"
				]
			}
		}
	},
	{
		displayName: "Voice IDs (Kling 4.0 Omni)",
		name: "voice_ids",
		type: "string",
		default: "",
		description: "Optional comma or newline separated Kling voice IDs (up to 3, saturn-v2 only, incompatible with audio=original)",
		displayOptions: {
			show: {
				operation: [
					"video"
				],
				model_name: [
					"saturn-v2"
				]
			}
		}
	},
	{
		displayName: "Mode",
		name: "mode",
		type: "string",
		default: "",
		description: "Optional generation mode",
		displayOptions: {
			show: {
				operation: [
					"video",
					"multiImageToVideo"
				]
			}
		}
	},
	{
		displayName: "Video ID (Extend)",
		name: "video_id",
		type: "string",
		default: "",
		description: "Existing Kling/SATURN video ID to extend (or pass Video URL / Source Task ID)",
		displayOptions: {
			show: {
				operation: [
					"videoExtend"
				]
			}
		}
	},
	{
		displayName: "Video URL (Extend)",
		name: "video_url",
		type: "string",
		default: "",
		description: "Public http(s) URL of video to extend",
		displayOptions: {
			show: {
				operation: [
					"videoExtend"
				]
			}
		}
	},
	{
		displayName: "Source Task ID (Extend)",
		name: "source_task_id",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"videoExtend"
				]
			}
		}
	},
	{
		displayName: "Image URL",
		name: "image_url",
		type: "string",
		default: "",
		required: true,
		description: "Public http(s) URL of the first frame image",
		displayOptions: {
			show: {
				operation: [
					"turboImageToVideo"
				]
			}
		}
	},
	{
		displayName: "Aspect Ratio",
		name: "aspect_ratio",
		type: "string",
		default: "",
		description: "Aspect ratio (for Kling 4.0 Omni: 21:9, 16:9, 9:16, 1:1, 4:3, 3:4, or adaptive)",
		displayOptions: {
			show: {
				operation: [
					"video",
					"turboTextToVideo",
					"turboImageToVideo",
					"multiImageToVideo"
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
		description: "Video duration in seconds (3-15 for Kling 3.0, 3-20 for saturn-v2-flash, 3-30 for saturn-v2)",
		displayOptions: {
			show: {
				operation: [
					"video",
					"turboTextToVideo",
					"turboImageToVideo"
				]
			}
		}
	},
	{
		displayName: "Duration (Optional, 3-15s)",
		name: "duration",
		type: "number",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"multiImageToVideo"
				]
			}
		}
	},
	{
		displayName: "Resolution",
		name: "resolution",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"turboTextToVideo",
					"turboImageToVideo"
				]
			}
		}
	}
],
};
