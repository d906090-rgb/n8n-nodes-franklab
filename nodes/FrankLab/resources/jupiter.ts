import type { FrankLabResourceDefinition } from './types';

export const jupiterResource: FrankLabResourceDefinition = {
	moduleName: 'jupiter',
	displayName: 'JUPITER',
	statusOperation: {
	default: "getOmniStatus",
	seedreamImage: "getSeedreamStatus",
	recraftImage: "getRecraftStatus",
	geminiImage: "getGeminiStatus",
	gptImageCodex: "getGptImageCodexStatus",
	youchuanImage: "getYouchuanImageStatus",
	youchuanVideo: "getYouchuanVideoStatus",
	midjourneyImage: "getMidjourneyImageStatus",
	midjourneyVideo: "getMidjourneyVideoStatus"
},
	operationProperty: {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'omniImage',
		displayOptions: { show: { resource: ['jupiter'] } },
		options: [
	{
		name: "Generate Image (GPT Image 2 / Codex)",
		value: "gptImageCodex",
		action: "Generate an image with gpt image 2 codex"
	},
	{
		name: "Generate Image (Midjourney / Youchuan)",
		value: "youchuanImage",
		action: "Run a midjourney youchuan image operation"
	},
	{
		name: "Generate Image (Midjourney)",
		value: "midjourneyImage",
		action: "Run a midjourney image operation"
	},
	{
		name: "Generate Image (Nano Banana / Gemini)",
		value: "geminiImage",
		action: "Generate an image with nano banana google gemini"
	},
	{
		name: "Generate Image (Omni)",
		value: "omniImage",
		action: "Generate an image with omni image"
	},
	{
		name: "Generate Image (Recraft)",
		value: "recraftImage",
		action: "Create a recraft task"
	},
	{
		name: "Generate Image (Seedream)",
		value: "seedreamImage",
		action: "Generate an image with seedream"
	},
	{
		name: "Generate Video (Midjourney / Youchuan)",
		value: "youchuanVideo",
		action: "Generate a midjourney youchuan video"
	},
	{
		name: "Generate Video (Midjourney)",
		value: "midjourneyVideo",
		action: "Generate a midjourney video"
	},
	{
		name: "Get GPT Image 2 Status",
		value: "getGptImageCodexStatus",
		action: "Get a gpt image 2 codex task status"
	},
	{
		name: "Get Midjourney Image Status",
		value: "getMidjourneyImageStatus",
		action: "Get a midjourney image task status"
	},
	{
		name: "Get Midjourney Video Status",
		value: "getMidjourneyVideoStatus",
		action: "Get a midjourney video task status"
	},
	{
		name: "Get Nano Banana Status",
		value: "getGeminiStatus",
		action: "Get a nano banana gemini task status"
	},
	{
		name: "Get Omni Image Status",
		value: "getOmniStatus",
		action: "Get an omni image task status"
	},
	{
		name: "Get Recraft Status",
		value: "getRecraftStatus",
		action: "Get a recraft task status"
	},
	{
		name: "Get Seedream Image Status",
		value: "getSeedreamStatus",
		action: "Get a seedream task status"
	},
	{
		name: "Get Youchuan Midjourney Image Status",
		value: "getYouchuanImageStatus",
		action: "Get a youchuan midjourney image task status"
	},
	{
		name: "Get Youchuan Midjourney Video Status",
		value: "getYouchuanVideoStatus",
		action: "Get a youchuan midjourney video task status"
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
					"omniImage",
					"seedreamImage",
					"geminiImage"
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
					"omniImage",
					"seedreamImage",
					"geminiImage",
					"gptImageCodex"
				]
			}
		}
	},
	{
		displayName: "Prompt (Optional for Some Operations)",
		name: "prompt",
		type: "string",
		typeOptions: {
			rows: 3
		},
		default: "",
		displayOptions: {
			show: {
				operation: [
					"youchuanImage",
					"youchuanVideo",
					"midjourneyImage",
					"midjourneyVideo"
				]
			}
		}
	},
	{
		displayName: "Omni / Kling Model",
		name: "model_name",
		type: "options",
		noDataExpression: true,
		default: "jupiter-v1-5",
		options: [
			{
				name: "GPT Image 2 (Mist)",
				value: "mist",
				action: "Use GPT Image 2"
			},
			{
				name: "Kling 3.0 Omni Image (Jupiter V1.5)",
				value: "jupiter-v1-5",
				action: "Use Kling 3.0 Omni Image"
			},
			{
				name: "Kling 3.0 Omni Image Pro (Jupiter V1.5 Pro)",
				value: "jupiter-v1-5-pro",
				action: "Use Kling 3.0 Omni Image Pro"
			},
			{
				name: "Kling 4.0 Image — Standard (Jupiter V2)",
				value: "jupiter-v2",
				action: "Use Kling 4.0 Image Standard"
			},
			{
				name: "Kling 4.0 Long Image (Jupiter V2 Long)",
				value: "jupiter-v2-long",
				action: "Use Kling 4.0 Long Image"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"omniImage"
				]
			}
		}
	},
	{
		displayName: "Kling 4.0 Result Type",
		name: "kling4_result_type",
		type: "options",
		noDataExpression: true,
		default: "single",
		options: [
			{ name: "Series (2–10 / Auto)", value: "series", action: "Generate a coherent image series" },
			{ name: "Single (1–9 Images)", value: "single", action: "Generate independent images" }
		],
		displayOptions: {
			show: {
				operation: ["omniImage"],
				model_name: ["jupiter-v2"]
			}
		}
	},
	{
		displayName: "Series Amount",
		name: "series_amount",
		type: "options",
		noDataExpression: true,
		default: "auto",
		options: [
			{ name: "10", value: "10", action: "10 images in series" },
			{ name: "2", value: "2", action: "2 images in series" },
			{ name: "3", value: "3", action: "3 images in series" },
			{ name: "4", value: "4", action: "4 images in series" },
			{ name: "5", value: "5", action: "5 images in series" },
			{ name: "6", value: "6", action: "6 images in series" },
			{ name: "7", value: "7", action: "7 images in series" },
			{ name: "8", value: "8", action: "8 images in series" },
			{ name: "9", value: "9", action: "9 images in series" },
			{ name: "Auto (Up to 10, Billed on Actual)", value: "auto", action: "Auto series count" }
		],
		displayOptions: {
			show: {
				operation: ["omniImage"],
				model_name: ["jupiter-v2"],
				kling4_result_type: ["series"]
			}
		}
	},
	{
		displayName: "Kling 4.0 Long Skill",
		name: "kling4_long_skill",
		type: "options",
		noDataExpression: true,
		default: "ecommerce",
		options: [
			{ name: "E-Commerce Detail Page (1–3 Refs)", value: "ecommerce", action: "Generate ecommerce long image" },
			{ name: "Webpage Layout (T2I/I2I)", value: "webpage", action: "Generate webpage long image" }
		],
		displayOptions: {
			show: {
				operation: ["omniImage"],
				model_name: ["jupiter-v2-long"]
			}
		}
	},
	{
		displayName: "Kling 4.0 Long Length",
		name: "kling4_long_length",
		type: "options",
		noDataExpression: true,
		default: "medium",
		options: [
			{ name: "Short", value: "short", action: "Short ecommerce detail page" },
			{ name: "Medium", value: "medium", action: "Medium ecommerce detail page" },
			{ name: "Long", value: "long", action: "Long ecommerce detail page" }
		],
		displayOptions: {
			show: {
				operation: ["omniImage"],
				model_name: ["jupiter-v2-long"],
				kling4_long_skill: ["ecommerce"]
			}
		}
	},
	{
		displayName: "Reference Image URLs",
		name: "reference_images",
		type: "string",
		default: "",
		description: "Comma- or newline-separated public HTTPS URLs (up to 10 on jupiter-v2, 1–3 on jupiter-v2-long ecommerce)",
		displayOptions: {
			show: {
				operation: ["omniImage"],
				model_name: ["jupiter-v2", "jupiter-v2-long"]
			},
			hide: {
				kling4_long_skill: ["webpage"]
			}
		}
	},
	{
		displayName: "KUSOK Element IDs",
		name: "element_ids",
		type: "string",
		default: "",
		description: "Comma- or newline-separated image_refer element IDs (up to 10 combined with reference images)",
		displayOptions: {
			show: {
				operation: ["omniImage"],
				model_name: ["jupiter-v2"]
			}
		}
	},
	{
		displayName: "Style Reference Image URL",
		name: "style_refer_image_url",
		type: "string",
		default: "",
		description: "Optional style_refer_image HTTPS URL for Kling 4.0 Long webpage skill",
		displayOptions: {
			show: {
				operation: ["omniImage"],
				model_name: ["jupiter-v2-long"],
				kling4_long_skill: ["webpage"]
			}
		}
	},
	{
		displayName: "Subject Reference Image URL",
		name: "subject_refer_image_url",
		type: "string",
		default: "",
		description: "Optional subject_refer_image HTTPS URL for Kling 4.0 Long webpage skill",
		displayOptions: {
			show: {
				operation: ["omniImage"],
				model_name: ["jupiter-v2-long"],
				kling4_long_skill: ["webpage"]
			}
		}
	},
	{
		displayName: "Gemini Model",
		name: "model_id",
		type: "options",
		noDataExpression: true,
		default: "gemini-3.1-flash-image",
		options: [
			{
				name: "Gemini 2.5 Flash Image",
				value: "gemini-2.5-flash-image",
				action: "Use Gemini 2.5 Flash Image"
			},
			{
				name: "Gemini 3 Pro Image (Nano Banana Pro)",
				value: "gemini-3-pro-image",
				action: "Use Gemini 3 Pro Image"
			},
			{
				name: "Gemini 3.1 Flash Image (Nano Banana 2)",
				value: "gemini-3.1-flash-image",
				action: "Use Gemini 3.1 Flash Image"
			},
			{
				name: "Gemini 3.1 Flash Lite Image (Nano Banana 2 Lite)",
				value: "gemini-3.1-flash-lite-image",
				action: "Use Gemini 3.1 Flash Lite Image"
			},
			{
				name: "Nano Banana 2.1",
				value: "gemini-nano-banana-2.1",
				action: "Use Nano Banana 2.1"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"geminiImage"
				]
			}
		}
	},
	{
		displayName: "Image Size",
		name: "image_size",
		type: "options",
		noDataExpression: true,
		default: "1K",
		options: [
			{
				name: "0.5K",
				value: "0.5K",
				action: "Render at 0.5K"
			},
			{
				name: "1K",
				value: "1K",
				action: "Render at 1K"
			},
			{
				name: "2K",
				value: "2K",
				action: "Render at 2K"
			},
			{
				name: "4K",
				value: "4K",
				action: "Render at 4K"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"geminiImage"
				]
			}
		}
	},
	{
		displayName: "GPT Image Model",
		name: "model",
		type: "options",
		noDataExpression: true,
		default: "gpt-image-2",
		options: [
			{
				name: "GPT Image 2",
				value: "gpt-image-2",
				action: "Use GPT Image 2"
			},
			{
				name: "GPT Image 2.5 Flare",
				value: "gpt-image-2.5-flare",
				action: "Use GPT Image 2.5 Flare"
			},
			{
				name: "GPT Image 2.5 Sunburst",
				value: "gpt-image-2.5-sunburst",
				action: "Use GPT Image 2.5 Sunburst"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"gptImageCodex"
				]
			}
		}
	},
	{
		displayName: "Midjourney Image Operation",
		name: "operationMode",
		type: "options",
		noDataExpression: true,
		default: "imagine",
		options: [
			{
				name: "Blend",
				value: "blend",
				action: "Blend images"
			},
			{
				name: "Describe",
				value: "describe",
				action: "Describe an image"
			},
			{
				name: "Imagine",
				value: "imagine",
				action: "Generate image from prompt"
			},
			{
				name: "Inpaint",
				value: "inpaint",
				action: "Inpaint image region"
			},
			{
				name: "Outpaint",
				value: "outpaint",
				action: "Outpaint image"
			},
			{
				name: "Pan",
				value: "pan",
				action: "Pan image"
			},
			{
				name: "Reroll",
				value: "reroll",
				action: "Reroll previous generation"
			},
			{
				name: "Shorten",
				value: "shorten",
				action: "Shorten prompt"
			},
			{
				name: "Upscale",
				value: "upscale",
				action: "Upscale image"
			},
			{
				name: "Variation",
				value: "variation",
				action: "Create variation"
			},
			{
				name: "Zoom",
				value: "zoom",
				action: "Zoom out image"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"youchuanImage"
				]
			}
		}
	},
	{
		displayName: "Midjourney Video Operation",
		name: "operationMode",
		type: "options",
		noDataExpression: true,
		default: "video",
		options: [
			{
				name: "Video",
				value: "video",
				action: "Generate Midjourney video"
			},
			{
				name: "Video Extend",
				value: "video_extend",
				action: "Extend Midjourney video"
			},
			{
				name: "Video Upscale",
				value: "video_upscale",
				action: "Upscale Midjourney video"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"youchuanVideo"
				]
			}
		}
	},
	{
		displayName: "Midjourney Version",
		name: "version",
		type: "options",
		noDataExpression: true,
		default: "7",
		options: [
			{
				name: "6.1",
				value: "6.1",
				action: "Use Midjourney 6.1"
			},
			{
				name: "7",
				value: "7",
				action: "Use Midjourney 7"
			},
			{
				name: "8.1",
				value: "8.1",
				action: "Use Midjourney 8.1"
			},
			{
				name: "8.2",
				value: "8.2",
				action: "Use Midjourney 8.2"
			},
			{
				name: "Niji 7",
				value: "niji-7",
				action: "Use Niji 7"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"youchuanImage"
				]
			}
		}
	},
	{
		displayName: "Parent Task ID",
		name: "parent_task_id",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"youchuanImage",
					"youchuanVideo",
					"midjourneyImage",
					"midjourneyVideo"
				]
			}
		}
	},
	{
		displayName: "Midjourney Action",
		name: "operationMode",
		type: "options",
		noDataExpression: true,
		default: "imagine",
		options: [
			{
				name: "Blend",
				value: "blend"
			},
			{
				name: "Describe",
				value: "describe"
			},
			{
				name: "Edits",
				value: "edits"
			},
			{
				name: "High Variation",
				value: "high-variation"
			},
			{
				name: "Imagine",
				value: "imagine"
			},
			{
				name: "Inpaint",
				value: "inpaint"
			},
			{
				name: "Low Variation",
				value: "low-variation"
			},
			{
				name: "Modal",
				value: "modal"
			},
			{
				name: "Pan",
				value: "pan"
			},
			{
				name: "Remix Strong",
				value: "remix-strong"
			},
			{
				name: "Remix Subtle",
				value: "remix-subtle"
			},
			{
				name: "Reroll",
				value: "reroll"
			},
			{
				name: "Upscale",
				value: "upscale"
			},
			{
				name: "Variation",
				value: "variation"
			},
			{
				name: "Zoom",
				value: "zoom"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"midjourneyImage"
				]
			}
		}
	},
	{
		displayName: "Image URLs",
		name: "image_urls",
		type: "string",
		typeOptions: {
			multipleValues: true
		},
		default: [],
		description: "Public http(s) reference or source image URLs (up to 12 MiB each)",
		displayOptions: {
			show: {
				operation: [
					"midjourneyImage",
					"midjourneyVideo"
				]
			}
		}
	},
	{
		displayName: "Slot Index",
		name: "index",
		type: "options",
		default: "",
		description: "Optional grid slot index (1-4) of the parent task",
		options: [
			{
				name: "1",
				value: 1
			},
			{
				name: "2",
				value: 2
			},
			{
				name: "3",
				value: 3
			},
			{
				name: "4",
				value: 4
			},
			{
				name: "Default",
				value: ""
			}
		],
		displayOptions: {
			show: {
				operation: [
					"midjourneyImage",
					"midjourneyVideo"
				]
			}
		}
	},
	{
		displayName: "Custom ID",
		name: "custom_id",
		type: "string",
		default: "",
		description: "Optional button custom_id returned on a parent Midjourney task",
		displayOptions: {
			show: {
				operation: [
					"midjourneyImage",
					"midjourneyVideo"
				]
			}
		}
	},
	{
		displayName: "Midjourney Speed",
		name: "speed",
		type: "options",
		default: "",
		options: [
			{
				name: "Default",
				value: ""
			},
			{
				name: "Fast",
				value: "fast"
			},
			{
				name: "Relax",
				value: "relax"
			},
			{
				name: "Turbo",
				value: "turbo"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"midjourneyImage",
					"midjourneyVideo"
				]
			}
		}
	},
	{
		displayName: "Midjourney Model Version",
		name: "mjVersion",
		type: "options",
		default: "",
		options: [
			{
				name: "Default",
				value: ""
			},
			{
				name: "V6.1",
				value: "v6.1"
			},
			{
				name: "V7",
				value: "v7"
			},
			{
				name: "V8.1",
				value: "v8.1"
			},
			{
				name: "V8.2",
				value: "v8.2"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"midjourneyImage"
				]
			}
		}
	},
	{
		displayName: "Midjourney Aspect Ratio",
		name: "mjSize",
		type: "string",
		default: "",
		description: "Optional Midjourney aspect ratio sent as size (for example 1:1, 16:9, 9:16)",
		displayOptions: {
			show: {
				operation: [
					"midjourneyImage"
				]
			}
		}
	},
	{
		displayName: "Blend Dimensions",
		name: "dimensions",
		type: "options",
		default: "",
		options: [
			{
				name: "Default",
				value: ""
			},
			{
				name: "Landscape",
				value: "LANDSCAPE"
			},
			{
				name: "Portrait",
				value: "PORTRAIT"
			},
			{
				name: "Square",
				value: "SQUARE"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"midjourneyImage"
				]
			}
		}
	},
	{
		displayName: "Midjourney Quality",
		name: "mjQuality",
		type: "options",
		default: "",
		options: [
			{
				name: "0.25",
				value: 0.25
			},
			{
				name: "0.5",
				value: 0.5
			},
			{
				name: "1",
				value: 1
			},
			{
				name: "2",
				value: 2
			},
			{
				name: "Default",
				value: ""
			}
		],
		displayOptions: {
			show: {
				operation: [
					"midjourneyImage"
				]
			}
		}
	},
	{
		displayName: "Midjourney Style",
		name: "style",
		type: "options",
		default: "",
		options: [
			{
				name: "Default",
				value: ""
			},
			{
				name: "Raw",
				value: "raw"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"midjourneyImage"
				]
			}
		}
	},
	{
		displayName: "Seed",
		name: "seed",
		type: "number",
		default: "",
		description: "Optional generation seed",
		displayOptions: {
			show: {
				operation: [
					"midjourneyImage"
				]
			}
		}
	},
	{
		displayName: "Stylize",
		name: "stylize",
		type: "number",
		default: "",
		description: "Optional stylize strength (0-1000)",
		displayOptions: {
			show: {
				operation: [
					"midjourneyImage"
				]
			}
		}
	},
	{
		displayName: "Chaos",
		name: "chaos",
		type: "number",
		default: "",
		description: "Optional grid variation chaos (0-100)",
		displayOptions: {
			show: {
				operation: [
					"midjourneyImage"
				]
			}
		}
	},
	{
		displayName: "Weird",
		name: "weird",
		type: "number",
		default: "",
		description: "Optional weirdness strength (0-3000)",
		displayOptions: {
			show: {
				operation: [
					"midjourneyImage"
				]
			}
		}
	},
	{
		displayName: "Negative Prompt",
		name: "negative_prompt",
		type: "string",
		default: "",
		description: "Optional elements to exclude from the image",
		displayOptions: {
			show: {
				operation: [
					"midjourneyImage"
				]
			}
		}
	},
	{
		displayName: "Zoom Ratio",
		name: "zoom_ratio",
		type: "options",
		default: "",
		options: [
			{
				name: "1.5x",
				value: 1.5
			},
			{
				name: "2x",
				value: 2
			},
			{
				name: "Default",
				value: ""
			}
		],
		displayOptions: {
			show: {
				operation: [
					"midjourneyImage"
				]
			}
		}
	},
	{
		displayName: "Pan Direction",
		name: "direction",
		type: "options",
		default: "",
		options: [
			{
				name: "Default",
				value: ""
			},
			{
				name: "Down",
				value: "down"
			},
			{
				name: "Left",
				value: "left"
			},
			{
				name: "Right",
				value: "right"
			},
			{
				name: "Up",
				value: "up"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"midjourneyImage"
				]
			}
		}
	},
	{
		displayName: "Mask URL",
		name: "mask_url",
		type: "string",
		default: "",
		description: "Public http(s) black-and-white mask PNG URL (up to 12 MiB) for inpaint or modal",
		displayOptions: {
			show: {
				operation: [
					"midjourneyImage"
				]
			}
		}
	},
	{
		displayName: "Batch Size",
		name: "batch_size",
		type: "options",
		default: "",
		description: "Optional number of video clips to generate (1, 2, or 4)",
		options: [
			{
				name: "1",
				value: 1
			},
			{
				name: "2",
				value: 2
			},
			{
				name: "4",
				value: 4
			},
			{
				name: "Default",
				value: ""
			}
		],
		displayOptions: {
			show: {
				operation: [
					"midjourneyVideo"
				]
			}
		}
	},
	{
		displayName: "Aspect Ratio",
		name: "aspect_ratio",
		type: "string",
		default: "",
		description: "Optional aspect ratio, for example 16:9",
		displayOptions: {
			show: {
				operation: [
					"omniImage",
					"geminiImage",
					"gptImageCodex",
					"youchuanImage"
				]
			},
			hide: {
				model_name: ["jupiter-v2-long"]
			}
		}
	},
	{
		displayName: "Model Name",
		name: "model_name",
		type: "string",
		default: "",
		description: "Optional Omni Image model slug (for example jupiter-v1-5 on direct, or mist, gpt-image-2.5-sunburst, gpt-image-2.5-flare, gpt-image-2.6-sunburst, gpt-image-2.6-flare)",
		displayOptions: {
			show: {
				operation: [
					"omniImage"
				]
			}
		}
	},
	{
		displayName: "Resolution",
		name: "resolution",
		type: "string",
		default: "",
		description: "Optional resolution preset",
		displayOptions: {
			show: {
				operation: [
					"omniImage",
					"seedreamImage"
				]
			}
		}
	},
	{
		displayName: "Quality",
		name: "quality",
		type: "string",
		default: "",
		description: "Optional quality preset (e.g. low, medium, high)",
		displayOptions: {
			show: {
				operation: [
					"omniImage",
					"gptImageCodex"
				]
			},
			hide: {
				model_name: ["jupiter-v2", "jupiter-v2-long"]
			}
		}
	},
	{
		displayName: "Number of Images",
		name: "n",
		type: "number",
		default: 1,
		displayOptions: {
			show: {
				operation: [
					"omniImage"
				],
				model_name: [
					"jupiter-v1-5",
					"jupiter-v1-5-pro",
					"jupiter-v2",
					"mist"
				]
			},
			hide: {
				kling4_result_type: ["series"]
			}
		}
	},
	{
		displayName: "Size",
		name: "size",
		type: "string",
		default: "",
		description: "Optional explicit size for seedream images",
		displayOptions: {
			show: {
				operation: [
					"seedreamImage"
				]
			}
		}
	},
	{
		displayName: "Model",
		name: "model",
		type: "string",
		default: "",
		description: "Optional seedream model ID",
		displayOptions: {
			show: {
				operation: [
					"seedreamImage"
				]
			}
		}
	},
	{
		displayName: "Recraft Model",
		name: "recraftModel",
		type: "string",
		default: "",
		required: true,
		description: "Recraft model slug, for example recraft/remove-background",
		displayOptions: {
			show: {
				operation: [
					"recraftImage"
				]
			}
		}
	},
	{
		displayName: "Image URL",
		name: "image",
		type: "string",
		default: "",
		required: true,
		description: "Public http(s) image sent as the Recraft task input",
		displayOptions: {
			show: {
				operation: [
					"recraftImage"
				]
			}
		}
	}
],
};
