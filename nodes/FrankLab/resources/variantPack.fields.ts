import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

export const variantPackOperations: INodePropertyOptions[] = [
	{
		name: "Estimate Cost",
		value: "estimate",
		action: "Estimate cost of a variant pack"
	},
	{
		name: "Generate Copies",
		value: "create",
		action: "Generate batch unique video copies"
	},
	{
		name: "Get Status",
		value: "getStatus",
		action: "Get variant pack job status and copy ur ls"
	},
	{
		name: "List Brands",
		value: "listBrands",
		action: "List partner brands for attribution"
	},
	{
		name: "List Library Videos",
		value: "listLibraryVideos",
		action: "List videos in your frank lab library"
	}
];

export const variantPackFields: INodeProperties[] = [
	{
		displayName: "Video URL",
		name: "videoUrl",
		type: "string",
		default: "",
		description: "Public https:// video URL (or specify Library Media ID below)",
		displayOptions: {
			show: {
				operation: [
					"create"
				]
			}
		}
	},
	{
		displayName: "Library Media ID (UUID)",
		name: "mediaId",
		type: "string",
		default: "",
		description: "Optional FrankLab library video UUID (converted automatically to media URL when Video URL is empty)",
		displayOptions: {
			show: {
				operation: [
					"create"
				]
			}
		}
	},
	{
		displayName: "Copies (2-100)",
		name: "copies",
		type: "number",
		default: 5,
		required: true,
		description: "Number of unique video copies to generate (2-100)",
		displayOptions: {
			show: {
				operation: [
					"create",
					"estimate"
				]
			}
		}
	},
	{
		displayName: "Variant Preset",
		name: "variantPreset",
		type: "options",
		noDataExpression: true,
		default: "standard",
		options: [
			{
				name: "Balanced (Make Preset)",
				value: "balanced",
				action: "Use Balanced uniqueness profile"
			},
			{
				name: "Custom (Use Additional JSON)",
				value: "custom",
				action: "Provide variantCustomSettings in Additional JSON"
			},
			{
				name: "Deep (Make Preset)",
				value: "deep",
				action: "Use Deep uniqueness profile"
			},
			{
				name: "Light",
				value: "light",
				action: "Use Light preset"
			},
			{
				name: "Speech Safe (Make Preset)",
				value: "speech",
				action: "Preserve voice pitch while varying visuals"
			},
			{
				name: "Standard",
				value: "standard",
				action: "Use Standard preset"
			},
			{
				name: "Stealth (Make Preset)",
				value: "stealth",
				action: "Use subtle Stealth uniqueness profile"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"create",
					"estimate"
				]
			}
		}
	},
	{
		displayName: "Generate AI Titles & Captions",
		name: "captionsEnabled",
		type: "boolean",
		default: false,
		displayOptions: {
			show: {
				operation: [
					"create",
					"estimate"
				]
			}
		}
	},
	{
		displayName: "Caption Hint",
		name: "captionHint",
		type: "string",
		default: "",
		description: "Optional guidance for unique AI titles/descriptions (max 280 chars)",
		displayOptions: {
			show: {
				operation: [
					"create"
				]
			}
		}
	},
	{
		displayName: "Seed",
		name: "seed",
		type: "string",
		default: "",
		description: "Optional deterministic seed ([A-Za-z0-9_-]{1,64})",
		displayOptions: {
			show: {
				operation: [
					"create"
				]
			}
		}
	},
	{
		displayName: "Brand ID",
		name: "brandId",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"create"
				]
			}
		}
	}
];
