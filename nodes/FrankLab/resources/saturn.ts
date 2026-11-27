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
		type: "string",
		default: "",
		description: "Optional SATURN model ID",
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
		description: "Video duration in seconds",
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
