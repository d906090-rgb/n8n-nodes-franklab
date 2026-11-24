import type { FrankLabResourceDefinition } from './types';

export const moonResource: FrankLabResourceDefinition = {
	moduleName: 'moon',
	displayName: 'MOON',
	statusOperation: {
	default: "getStatus",
	estimate: ""
},
	operationProperty: {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'createVideo',
		displayOptions: { show: { resource: ['moon'] } },
		options: [
	{
		name: "Create Video",
		value: "createVideo",
		action: "Submit a moon video task"
	},
	{
		name: "Estimate Cost",
		value: "estimate",
		action: "Estimate the cost of a moon video task"
	},
	{
		name: "Get Status",
		value: "getStatus",
		action: "Get a moon video task status"
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
					"createVideo",
					"estimate"
				]
			}
		}
	},
	{
		displayName: "Moon Operation",
		name: "operationMode",
		type: "options",
		noDataExpression: true,
		default: "text_to_video",
		options: [
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
					"createVideo",
					"estimate"
				]
			}
		}
	},
	{
		displayName: "Moon Model",
		name: "moonModel",
		type: "options",
		noDataExpression: true,
		default: "moon_base",
		options: [
			{
				name: "Moon 2.0 Mini",
				value: "moon_2_0_mini",
				action: "Use moon_2_0_mini"
			},
			{
				name: "Moon Base",
				value: "moon_base",
				action: "Use moon_base"
			},
			{
				name: "Moon Fast",
				value: "moon_fast",
				action: "Use moon_fast"
			},
			{
				name: "Moon Mini",
				value: "moon_mini",
				action: "Use moon_mini"
			},
			{
				name: "Moon Pro",
				value: "moon_pro",
				action: "Use moon_pro"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"createVideo",
					"estimate"
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
					"createVideo",
					"estimate"
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
					"createVideo",
					"estimate"
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
			},
			{
				name: "4K",
				value: "4k",
				action: "Render at 4K"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"createVideo",
					"estimate"
				]
			}
		}
	},
	{
		displayName: "Reference Image URL",
		name: "reference_image_url",
		type: "string",
		default: "",
		description: "Public http(s) URL of the reference image",
		displayOptions: {
			show: {
				operation: [
					"createVideo",
					"estimate"
				]
			}
		}
	}
],
};
