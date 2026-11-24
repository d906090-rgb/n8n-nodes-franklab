import type { FrankLabResourceDefinition } from './types';

export const hotCoffeResource: FrankLabResourceDefinition = {
	moduleName: 'hotCoffe',
	displayName: 'Hot Coffee',
	statusOperation: {
	default: "getVideoStatus",
	generateImage: "getImageStatus"
},
	operationProperty: {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'createVideo',
		displayOptions: { show: { resource: ['hotCoffe'] } },
		options: [
	{
		name: "Create Video",
		value: "createVideo",
		action: "Submit a seedance video task"
	},
	{
		name: "Generate Image",
		value: "generateImage",
		action: "Generate an image"
	},
	{
		name: "Get Image Status",
		value: "getImageStatus",
		action: "Get an image task status"
	},
	{
		name: "Get Video Status",
		value: "getVideoStatus",
		action: "Get a video task status"
	}
		],
	},
	fields: [
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
					"generateImage",
					"createVideo"
				]
			}
		}
	},
	{
		displayName: "Video Operation",
		name: "operationMode",
		type: "options",
		noDataExpression: true,
		default: "text_to_video",
		options: [
			{
				name: "Reference to Video",
				value: "reference_to_video",
				action: "Generate a video from references"
			},
			{
				name: "Text to Video",
				value: "text_to_video",
				action: "Generate a video from text"
			},
			{
				name: "Video Edit",
				value: "video_edit",
				action: "Edit an existing video"
			},
			{
				name: "Video Extend",
				value: "video_extend",
				action: "Extend an existing video"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"createVideo"
				]
			}
		}
	},
	{
		displayName: "Model Variant",
		name: "modelVariant",
		type: "options",
		noDataExpression: true,
		default: "seedance_2_0_fast",
		options: [
			{
				name: "Seedance 2.0",
				value: "seedance_2_0",
				action: "Use seedance 2.0"
			},
			{
				name: "Seedance 2.0 Fast",
				value: "seedance_2_0_fast",
				action: "Use seedance 2.0 fast"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"createVideo"
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
				name: "480p",
				value: "480p",
				action: "Render at 480p"
			},
			{
				name: "720p",
				value: "720p",
				action: "Render at 720p"
			},
			{
				name: "1080p",
				value: "1080p",
				action: "Render at 1080p"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"createVideo"
				]
			}
		}
	},
	{
		displayName: "Duration",
		name: "duration",
		type: "number",
		default: "",
		description: "Optional video duration in seconds",
		displayOptions: {
			show: {
				operation: [
					"createVideo"
				]
			}
		}
	},
	{
		displayName: "Ratio",
		name: "ratio",
		type: "string",
		default: "",
		description: "Optional aspect ratio, for example 16:9",
		displayOptions: {
			show: {
				operation: [
					"createVideo"
				]
			}
		}
	},
	{
		displayName: "Video URL",
		name: "video_url",
		type: "string",
		default: "",
		description: "Public http(s) source video for edit and extend operations",
		displayOptions: {
			show: {
				operation: [
					"createVideo"
				]
			}
		}
	}
],
};
