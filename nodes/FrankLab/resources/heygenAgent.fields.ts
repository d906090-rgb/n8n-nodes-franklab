import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

export const heygenAgentOperations: INodePropertyOptions[] = [
	{
		name: "Create Session",
		value: "createSession",
		action: "Create a video agent chat or generate session"
	},
	{
		name: "Generate From Prompt",
		value: "generateFromPrompt",
		action: "Generate a video from a prompt with video agent"
	},
	{
		name: "Get Resource",
		value: "getResource",
		action: "Get a session resource artifact"
	},
	{
		name: "Get Session",
		value: "getSession",
		action: "Get video agent session status and details"
	},
	{
		name: "Get Video",
		value: "getVideo",
		action: "Get hey gen video status and download url"
	},
	{
		name: "List Avatar Looks",
		value: "listAvatarLooks",
		action: "List available hey gen avatar looks"
	},
	{
		name: "List Brand Glossaries",
		value: "listBrandGlossaries",
		action: "List hey gen brand glossaries"
	},
	{
		name: "List Brand Kits",
		value: "listBrandKits",
		action: "List hey gen brand kits"
	},
	{
		name: "List Saved Credentials",
		value: "listCredentials",
		action: "List saved partner hey gen credentials"
	},
	{
		name: "List Session Videos",
		value: "listSessionVideos",
		action: "List videos produced in a session"
	},
	{
		name: "List Sessions",
		value: "listSessions",
		action: "List video agent sessions"
	},
	{
		name: "List Styles",
		value: "listStyles",
		action: "List video agent styles"
	},
	{
		name: "List Voices",
		value: "listVoices",
		action: "List hey gen voices"
	},
	{
		name: "Send Message",
		value: "sendMessage",
		action: "Send a follow up prompt or edit message to a session"
	},
	{
		name: "Stop Session",
		value: "stopSession",
		action: "Stop an active video agent session"
	}
];

export const heygenAgentFields: INodeProperties[] = [
	{
		displayName: "Provider Account Mode",
		name: "providerAccountMode",
		type: "options",
		noDataExpression: true,
		default: "franklab",
		options: [
			{
				name: "FrankLab Managed",
				value: "franklab",
				action: "Use FrankLab managed HeyGen account"
			},
			{
				name: "Partner HeyGen Credential (BYO)",
				value: "partner_heygen",
				action: "Use saved partner HeyGen credential"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"generateFromPrompt",
					"createSession",
					"listSessions",
					"listStyles",
					"getSession",
					"sendMessage",
					"getResource",
					"listSessionVideos",
					"stopSession",
					"getVideo",
					"listAvatarLooks",
					"listVoices",
					"listBrandKits",
					"listBrandGlossaries"
				]
			}
		}
	},
	{
		displayName: "Saved HeyGen Credential ID",
		name: "providerCredentialId",
		type: "string",
		default: "",
		description: "Required only when Provider Account Mode is Partner HeyGen Credential",
		displayOptions: {
			show: {
				operation: [
					"generateFromPrompt",
					"createSession",
					"listSessions",
					"listStyles",
					"getSession",
					"sendMessage",
					"getResource",
					"listSessionVideos",
					"stopSession",
					"getVideo",
					"listAvatarLooks",
					"listVoices",
					"listBrandKits",
					"listBrandGlossaries"
				],
				providerAccountMode: [
					"partner_heygen"
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
					"generateFromPrompt",
					"createSession"
				]
			}
		}
	},
	{
		displayName: "Session Mode",
		name: "mode",
		type: "options",
		noDataExpression: true,
		default: "chat",
		options: [
			{
				name: "Generate Immediately",
				value: "generate",
				action: "Start video generation immediately"
			},
			{
				name: "Interactive Chat",
				value: "chat",
				action: "Start an interactive Video Agent chat session"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"createSession"
				]
			}
		}
	},
	{
		displayName: "Orientation",
		name: "orientation",
		type: "options",
		noDataExpression: true,
		default: "landscape",
		options: [
			{
				name: "Landscape",
				value: "landscape",
				action: "Render landscape video"
			},
			{
				name: "Portrait",
				value: "portrait",
				action: "Render portrait video"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"generateFromPrompt",
					"createSession"
				]
			}
		}
	},
	{
		displayName: "Avatar ID",
		name: "avatar_id",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"generateFromPrompt",
					"createSession"
				]
			}
		}
	},
	{
		displayName: "Voice ID",
		name: "voice_id",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"generateFromPrompt",
					"createSession"
				]
			}
		}
	},
	{
		displayName: "Style ID",
		name: "style_id",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"generateFromPrompt",
					"createSession"
				]
			}
		}
	},
	{
		displayName: "Brand Kit ID",
		name: "brand_kit_id",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"generateFromPrompt",
					"createSession"
				]
			}
		}
	},
	{
		displayName: "Brand Glossary ID",
		name: "brand_glossary_id",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"generateFromPrompt",
					"createSession"
				]
			}
		}
	},
	{
		displayName: "Session ID",
		name: "sessionId",
		type: "string",
		default: "",
		required: true,
		displayOptions: {
			show: {
				operation: [
					"sendMessage",
					"getResource"
				]
			}
		}
	},
	{
		displayName: "Message",
		name: "message",
		type: "string",
		typeOptions: {
			rows: 3
		},
		default: "",
		required: true,
		displayOptions: {
			show: {
				operation: [
					"sendMessage"
				]
			}
		}
	},
	{
		displayName: "Resource ID",
		name: "resourceId",
		type: "string",
		default: "",
		required: true,
		displayOptions: {
			show: {
				operation: [
					"getResource"
				]
			}
		}
	},
	{
		displayName: "Limit",
		name: "limit",
		type: "number",
		typeOptions: {
			minValue: 1
		},
		description: "Max number of results to return",
		default: 50,
		displayOptions: {
			show: {
				operation: [
					"listSessions",
					"listAvatarLooks",
					"listVoices",
					"listBrandKits",
					"listBrandGlossaries"
				]
			}
		}
	},
	{
		displayName: "Page Token",
		name: "pageToken",
		type: "string",
		typeOptions: {
			password: true
		},
		default: "",
		description: "Pagination cursor returned as nextToken by a previous list call",
		displayOptions: {
			show: {
				operation: [
					"listSessions",
					"listAvatarLooks",
					"listVoices",
					"listBrandKits",
					"listBrandGlossaries"
				]
			}
		}
	}
];
