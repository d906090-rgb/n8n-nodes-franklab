import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

export const narezkaOperations: INodePropertyOptions[] = [
	{
		name: "Estimate Cost",
		value: "estimate",
		action: "Estimate cost of a clipping job"
	},
	{
		name: "Get Import Status",
		value: "getImportStatus",
		action: "Get status of a source media import"
	},
	{
		name: "Get Status",
		value: "getStatus",
		action: "Get status of a clipping job"
	},
	{
		name: "Import Source",
		value: "importSource",
		action: "Import a remote video url into frank lab media"
	},
	{
		name: "Submit Clips Job",
		value: "submit",
		action: "Submit a smart video clipping or compilation job"
	}
];

export const narezkaFields: INodeProperties[] = [
	{
		displayName: "Source URL (HTTPS)",
		name: "sourceUrl",
		type: "string",
		default: "",
		description: "Direct public https:// video URL (use either Source URL or Media ID, never both)",
		displayOptions: {
			show: {
				operation: [
					"submit",
					"estimate",
					"importSource"
				]
			}
		}
	},
	{
		displayName: "Media ID (UUID)",
		name: "mediaId",
		type: "string",
		default: "",
		description: "Uploaded or imported FrankLab media UUID (mutually exclusive with Source URL)",
		displayOptions: {
			show: {
				operation: [
					"submit",
					"estimate"
				]
			}
		}
	},
	{
		displayName: "Mode",
		name: "mode",
		type: "options",
		noDataExpression: true,
		default: "clips",
		options: [
			{
				name: "Clips (Separate Vertical Clips)",
				value: "clips",
				action: "Cut into separate vertical clips"
			},
			{
				name: "Compilation (Single Highlight Reel)",
				value: "compilation",
				action: "Assemble one highlight compilation"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"submit",
					"estimate"
				]
			}
		}
	},
	{
		displayName: "Clip Count",
		name: "clipCount",
		type: "options",
		noDataExpression: true,
		default: "5",
		options: [
			{
				name: "3 Clips",
				value: "3",
				action: "Generate 3 clips"
			},
			{
				name: "5 Clips",
				value: "5",
				action: "Generate 5 clips"
			},
			{
				name: "8 Clips",
				value: "8",
				action: "Generate 8 clips"
			},
			{
				name: "10 Clips",
				value: "10",
				action: "Generate 10 clips"
			},
			{
				name: "Auto",
				value: "auto",
				action: "Auto-select clip count"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"submit",
					"estimate"
				],
				mode: [
					"clips"
				]
			}
		}
	},
	{
		displayName: "Compilation Order",
		name: "order",
		type: "options",
		noDataExpression: true,
		default: "chronological",
		options: [
			{
				name: "Chronological",
				value: "chronological",
				action: "Keep chronological order"
			},
			{
				name: "Strength (Best Moments First)",
				value: "strength",
				action: "Order by highlight strength"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"submit",
					"estimate"
				],
				mode: [
					"compilation"
				]
			}
		}
	},
	{
		displayName: "Platform",
		name: "platform",
		type: "options",
		noDataExpression: true,
		default: "reels",
		options: [
			{
				name: "Instagram Reels",
				value: "reels",
				action: "Format for Instagram Reels"
			},
			{
				name: "VK Clips",
				value: "vk_clips",
				action: "Format for VK Clips"
			},
			{
				name: "YouTube Shorts",
				value: "shorts",
				action: "Format for YouTube Shorts"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"submit",
					"estimate"
				]
			}
		}
	},
	{
		displayName: "Subtitles Template",
		name: "subtitles",
		type: "string",
		default: "shorts_pro",
		description: "Subtitles v2 template ID or \"off\"",
		displayOptions: {
			show: {
				operation: [
					"submit",
					"estimate"
				]
			}
		}
	},
	{
		displayName: "Caption Position",
		name: "captionPosition",
		type: "options",
		noDataExpression: true,
		default: "",
		options: [
			{
				name: "Bottom Safe",
				value: "bottom_safe",
				action: "Place captions in bottom safe zone"
			},
			{
				name: "Center",
				value: "center",
				action: "Center captions"
			},
			{
				name: "Style Default",
				value: "",
				action: "Use template default position"
			},
			{
				name: "Top Safe",
				value: "top_safe",
				action: "Place captions in top safe zone"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"submit",
					"estimate"
				]
			}
		}
	},
	{
		displayName: "Language",
		name: "language",
		type: "string",
		default: "auto",
		description: "\"auto\" or 2-letter ISO 639-1 code (e.g. ru, en)",
		displayOptions: {
			show: {
				operation: [
					"submit",
					"estimate"
				]
			}
		}
	},
	{
		displayName: "Framing",
		name: "frame",
		type: "options",
		noDataExpression: true,
		default: "center",
		options: [
			{
				name: "Blur Fill",
				value: "blur_fill",
				action: "Use blurred background fill"
			},
			{
				name: "Center Crop",
				value: "center",
				action: "Center crop to vertical"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"submit",
					"estimate"
				]
			}
		}
	},
	{
		displayName: "Topic Hint",
		name: "topic",
		type: "string",
		default: "",
		description: "Optional topic hint (1-300 chars)",
		displayOptions: {
			show: {
				operation: [
					"submit",
					"estimate"
				]
			}
		}
	},
	{
		displayName: "Max Cost Franks",
		name: "maxCostFranks",
		type: "number",
		default: "",
		description: "Optional maximum spend cap in ₣",
		displayOptions: {
			show: {
				operation: [
					"submit",
					"estimate"
				]
			}
		}
	},
	{
		displayName: "Idempotency Key",
		name: "idempotencyKey",
		type: "string",
		default: "",
		description: "Unique header key (8-128 chars; auto-generated when empty)",
		displayOptions: {
			show: {
				operation: [
					"submit",
					"importSource"
				]
			}
		}
	}
];
