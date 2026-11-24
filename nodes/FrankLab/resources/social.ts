import type { FrankLabResourceDefinition } from './types';

export const socialResource: FrankLabResourceDefinition = {
	moduleName: 'social',
	displayName: 'Social',
	statusOperation: {
	default: "",
	publish: "getStatus"
},
	operationProperty: {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'publish',
		displayOptions: { show: { resource: ['social'] } },
		options: [
	{
		name: "Analytics Insights",
		value: "insights",
		action: "Fetch social analytics insights"
	},
	{
		name: "Get Connect Link",
		value: "getConnectLink",
		action: "Get o auth connect link for a social platform"
	},
	{
		name: "Get Multipost Status",
		value: "getMultipostStatus",
		action: "Get delivery status of a multipost"
	},
	{
		name: "Get Release Status",
		value: "getStatus",
		action: "Get publish status of a social release"
	},
	{
		name: "List Accounts",
		value: "listAccounts",
		action: "List connected social accounts"
	},
	{
		name: "List Boards",
		value: "listBoards",
		action: "List pinterest boards"
	},
	{
		name: "List Moderation Channels",
		value: "listModerationChannels",
		action: "List telegram pre moderation channels"
	},
	{
		name: "List Multipost Brands",
		value: "listMultipostBrands",
		action: "List active brands for multiposting"
	},
	{
		name: "List Multipost Destination Sets",
		value: "listMultipostDestinationSets",
		action: "List saved multipost destination sets"
	},
	{
		name: "List Multipost Destinations",
		value: "listMultipostDestinations",
		action: "List saved multipost destinations"
	},
	{
		name: "List Releases",
		value: "listReleases",
		action: "List social releases"
	},
	{
		name: "List Workspaces",
		value: "listWorkspaces",
		action: "List social workspaces"
	},
	{
		name: "Manage Release",
		value: "manage",
		action: "List inspect edit cancel retry or delete a release"
	},
	{
		name: "Publish Post",
		value: "publish",
		action: "Publish or schedule media on one of 14 social networks"
	},
	{
		name: "Submit Multipost",
		value: "multipost",
		action: "Submit a multi network post for review"
	}
		],
	},
	fields: [
	{
		displayName: "Platform",
		name: "platform",
		type: "options",
		noDataExpression: true,
		default: "telegram",
		options: [
			{
				name: "BlueSky",
				value: "bluesky",
				action: "Select BlueSky"
			},
			{
				name: "Facebook",
				value: "facebook",
				action: "Select Facebook"
			},
			{
				name: "Instagram",
				value: "instagram",
				action: "Select Instagram"
			},
			{
				name: "LinkedIn",
				value: "linkedin",
				action: "Select LinkedIn"
			},
			{
				name: "MAX",
				value: "max",
				action: "Select MAX"
			},
			{
				name: "Odnoklassniki (OK)",
				value: "ok",
				action: "Select Odnoklassniki"
			},
			{
				name: "Pinterest",
				value: "pinterest",
				action: "Select Pinterest"
			},
			{
				name: "Telegram",
				value: "telegram",
				action: "Select Telegram"
			},
			{
				name: "Threads",
				value: "threads",
				action: "Select Threads"
			},
			{
				name: "TikTok",
				value: "tiktok",
				action: "Select TikTok"
			},
			{
				name: "VK",
				value: "vk",
				action: "Select VK"
			},
			{
				name: "WordPress",
				value: "wordpress",
				action: "Select WordPress"
			},
			{
				name: "Yandex Zen",
				value: "yandex_zen",
				action: "Select Yandex Zen"
			},
			{
				name: "YouTube",
				value: "youtube",
				action: "Select YouTube"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"publish",
					"listAccounts",
					"getConnectLink"
				]
			}
		}
	},
	{
		displayName: "Platform Filter",
		name: "platform",
		type: "options",
		noDataExpression: true,
		default: "",
		options: [
			{
				name: "All Platforms",
				value: "",
				action: "Include all platforms"
			},
			{
				name: "BlueSky",
				value: "bluesky",
				action: "Select BlueSky"
			},
			{
				name: "Facebook",
				value: "facebook",
				action: "Select Facebook"
			},
			{
				name: "Instagram",
				value: "instagram",
				action: "Select Instagram"
			},
			{
				name: "LinkedIn",
				value: "linkedin",
				action: "Select LinkedIn"
			},
			{
				name: "MAX",
				value: "max",
				action: "Select MAX"
			},
			{
				name: "Odnoklassniki (OK)",
				value: "ok",
				action: "Select Odnoklassniki"
			},
			{
				name: "Pinterest",
				value: "pinterest",
				action: "Select Pinterest"
			},
			{
				name: "Telegram",
				value: "telegram",
				action: "Select Telegram"
			},
			{
				name: "Threads",
				value: "threads",
				action: "Select Threads"
			},
			{
				name: "TikTok",
				value: "tiktok",
				action: "Select TikTok"
			},
			{
				name: "VK",
				value: "vk",
				action: "Select VK"
			},
			{
				name: "WordPress",
				value: "wordpress",
				action: "Select WordPress"
			},
			{
				name: "Yandex Zen",
				value: "yandex_zen",
				action: "Select Yandex Zen"
			},
			{
				name: "YouTube",
				value: "youtube",
				action: "Select YouTube"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"listReleases",
					"insights"
				]
			}
		}
	},
	{
		displayName: "Media (URL or Stored File UUID)",
		name: "media",
		type: "string",
		default: "",
		description: "Public https:// media URL or FrankLab stored file UUID",
		displayOptions: {
			show: {
				operation: [
					"publish",
					"multipost"
				]
			}
		}
	},
	{
		displayName: "Caption / Post Text",
		name: "caption",
		type: "string",
		typeOptions: {
			rows: 4
		},
		default: "",
		displayOptions: {
			show: {
				operation: [
					"publish",
					"manage"
				]
			}
		}
	},
	{
		displayName: "Connection ID",
		name: "connectionId",
		type: "string",
		default: "",
		description: "Target connected social account UUID",
		displayOptions: {
			show: {
				operation: [
					"publish",
					"listBoards",
					"listMultipostDestinations"
				]
			}
		}
	},
	{
		displayName: "Workspace ID",
		name: "workspaceId",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"publish"
				]
			}
		}
	},
	{
		displayName: "YouTube Destination",
		name: "destination",
		type: "options",
		noDataExpression: true,
		default: "youtube_shorts",
		options: [
			{
				name: "YouTube Shorts",
				value: "youtube_shorts",
				action: "Publish as YouTube Shorts"
			},
			{
				name: "YouTube Video",
				value: "youtube",
				action: "Publish as standard YouTube video"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"publish"
				],
				platform: [
					"youtube"
				]
			}
		}
	},
	{
		displayName: "Publish Mode",
		name: "mode",
		type: "options",
		noDataExpression: true,
		default: "auto",
		options: [
			{
				name: "Auto Publish",
				value: "auto",
				action: "Publish automatically"
			},
			{
				name: "Pre-Moderation",
				value: "moderate",
				action: "Send to pre-moderation"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"publish"
				]
			}
		}
	},
	{
		displayName: "Moderation Channel ID",
		name: "moderationChannelId",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"publish",
					"multipost"
				]
			}
		}
	},
	{
		displayName: "Scheduled At (ISO 8601)",
		name: "scheduledAt",
		type: "string",
		default: "",
		description: "Optional ISO 8601 publish timestamp (not allowed with pre-moderation)",
		displayOptions: {
			show: {
				operation: [
					"publish",
					"manage"
				]
			}
		}
	},
	{
		displayName: "Article Title (Yandex Zen)",
		name: "articleTitle",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"publish",
					"manage"
				]
			}
		}
	},
	{
		displayName: "Article HTML (Yandex Zen)",
		name: "articleHtml",
		type: "string",
		typeOptions: {
			rows: 4
		},
		default: "",
		displayOptions: {
			show: {
				operation: [
					"publish",
					"manage"
				]
			}
		}
	},
	{
		displayName: "Manage Action",
		name: "operationMode",
		type: "options",
		noDataExpression: true,
		default: "list",
		options: [
			{
				name: "Cancel",
				value: "cancel",
				action: "Cancel a release"
			},
			{
				name: "Delete",
				value: "delete",
				action: "Delete a release record"
			},
			{
				name: "Edit",
				value: "edit",
				action: "Edit a draft or scheduled release"
			},
			{
				name: "Get",
				value: "get",
				action: "Get a single release"
			},
			{
				name: "List",
				value: "list",
				action: "List releases"
			},
			{
				name: "Remote Delete",
				value: "remote_delete",
				action: "Delete published post remotely"
			},
			{
				name: "Remote Edit",
				value: "remote_edit",
				action: "Edit published post remotely"
			},
			{
				name: "Retry",
				value: "retry",
				action: "Retry a failed release"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"manage"
				]
			}
		}
	},
	{
		displayName: "Release ID",
		name: "releaseId",
		type: "string",
		default: "",
		description: "Release UUID (required for all manage actions except list)",
		displayOptions: {
			show: {
				operation: [
					"manage"
				]
			}
		}
	},
	{
		displayName: "Insights View",
		name: "view",
		type: "options",
		noDataExpression: true,
		default: "summary",
		options: [
			{
				name: "Accounts",
				value: "accounts",
				action: "Fetch per-account metrics"
			},
			{
				name: "Posts",
				value: "posts",
				action: "Fetch per-post metrics"
			},
			{
				name: "Summary",
				value: "summary",
				action: "Fetch summary analytics"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"insights"
				]
			}
		}
	},
	{
		displayName: "From (YYYY-MM-DD)",
		name: "from",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"listReleases",
					"insights"
				]
			}
		}
	},
	{
		displayName: "To (YYYY-MM-DD)",
		name: "to",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"listReleases",
					"insights"
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
					"multipost",
					"listMultipostDestinations",
					"listMultipostDestinationSets"
				]
			}
		}
	},
	{
		displayName: "Title",
		name: "title",
		type: "string",
		default: "",
		description: "Multipost title (1-200 chars)",
		displayOptions: {
			show: {
				operation: [
					"multipost"
				]
			}
		}
	},
	{
		displayName: "Default Caption",
		name: "defaultCaption",
		type: "string",
		typeOptions: {
			rows: 3
		},
		default: "",
		displayOptions: {
			show: {
				operation: [
					"multipost"
				]
			}
		}
	},
	{
		displayName: "Destination Set ID",
		name: "destinationSetId",
		type: "string",
		default: "",
		description: "Saved destination set UUID (or supply destinations array in Additional JSON)",
		displayOptions: {
			show: {
				operation: [
					"multipost"
				]
			}
		}
	},
	{
		displayName: "Idempotency Key",
		name: "idempotencyKey",
		type: "string",
		default: "",
		required: true,
		description: "Unique key (1-128 chars, [A-Za-z0-9._:-]) sent in the Idempotency-Key HTTP header",
		displayOptions: {
			show: {
				operation: [
					"multipost"
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
					"listReleases",
					"listMultipostDestinations",
					"listMultipostDestinationSets"
				]
			}
		}
	},
	{
		displayName: "Cursor",
		name: "cursor",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"listReleases",
					"listMultipostDestinations",
					"listMultipostDestinationSets"
				]
			}
		}
	}
],
};
