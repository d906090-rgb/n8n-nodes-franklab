import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

export const alibabaOperations: INodePropertyOptions[] = [
	{
		name: "Estimate Cost",
		value: "estimate",
		action: "Estimate the cost of an alibaba task"
	},
	{
		name: "Generate Image",
		value: "generateImage",
		action: "Generate a z image image"
	},
	{
		name: "Generate Video",
		value: "generateVideo",
		action: "Submit a happy horse or wan video task"
	},
	{
		name: "Get Status",
		value: "getStatus",
		action: "Get an alibaba task status"
	}
];

export const alibabaFields: INodeProperties[] = [
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
					"generateVideo"
				]
			}
		}
	},
	{
		displayName: "Image Model",
		name: "model",
		type: "options",
		noDataExpression: true,
		default: "",
		options: [
			{
				name: "(Default) Z-Image Turbo",
				value: ""
			},
			{
				name: "Qwen Image 3.0",
				value: "qwen-image-3.0"
			},
			{
				name: "Qwen Image 3.0 Pro",
				value: "qwen-image-3.0-pro"
			},
			{
				name: "WAN 2.7 Image Pro",
				value: "wan2.7-image-pro"
			},
			{
				name: "Z-Image Turbo (Explicit)",
				value: "z-image-turbo"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"generateImage"
				]
			}
		}
	},
	{
		displayName: "Model (Estimate)",
		name: "model",
		type: "string",
		default: "",
		description: "Optional image or video model ID for cost estimation (e.g. qwen-image-3.0-pro, wan2.7-image-pro, wan3.0-video-prime)",
		displayOptions: {
			show: {
				operation: [
					"estimate"
				]
			}
		}
	},
	{
		displayName: "Qwen Operation",
		name: "qwenOperation",
		type: "options",
		noDataExpression: true,
		default: "text_to_image",
		options: [
			{
				name: "Text to Image",
				value: "text_to_image",
				action: "Generate a qwen image from text"
			},
			{
				name: "Image Edit",
				value: "image_edit",
				action: "Edit 1-3 FrankLab images with qwen"
			}
		],
		description: "Qwen Image 3.0 / 3.0 Pro only. Ignored when Model is left at the default (Z-Image Turbo).",
		displayOptions: {
			show: {
				operation: [
					"generateImage"
				]
			}
		}
	},
	{
		displayName: "Edit Image IDs",
		name: "editImageIds",
		type: "string",
		typeOptions: {
			multipleValues: true
		},
		default: [],
		description: "1-3 FrankLab storedFileId UUIDs of the source images to edit. Not an external URL — the backend rejects one.",
		displayOptions: {
			show: {
				operation: [
					"generateImage"
				],
				qwenOperation: [
					"image_edit"
				]
			}
		}
	},
	{
		displayName: "Video Model",
		name: "model",
		type: "options",
		default: "",
		options: [
			{
				name: "(Default) HappyHorse 1.1",
				value: ""
			},
			{
				name: "HappyHorse 1.0 Video Edit",
				value: "happyhorse-1.0-video-edit"
			},
			{
				name: "HappyHorse 1.1 (Image to Video)",
				value: "happyhorse-1.1-i2v"
			},
			{
				name: "HappyHorse 1.1 (Reference to Video)",
				value: "happyhorse-1.1-r2v"
			},
			{
				name: "HappyHorse 1.1 (Text to Video)",
				value: "happyhorse-1.1-t2v"
			},
			{
				name: "WAN 2.1 KF2V Plus",
				value: "wan2.1-kf2v-plus"
			},
			{
				name: "WAN 2.2 KF2V Flash",
				value: "wan2.2-kf2v-flash"
			},
			{
				name: "WAN 3.0 Video",
				value: "wan3.0-video"
			},
			{
				name: "WAN 3.0 Video Prime",
				value: "wan3.0-video-prime"
			}
		],
		description: "Omitted (default) keeps the historical HappyHorse body. WAN 3.0 Video / Prime also accept Audio, Prompt Extension, Watermark, Last Frame and Reference Images.",
		displayOptions: {
			show: {
				operation: [
					"generateVideo"
				]
			}
		}
	},
	{
		displayName: "Size",
		name: "size",
		type: "string",
		default: "",
		description: "Optional explicit image size",
		displayOptions: {
			show: {
				operation: [
					"generateImage"
				]
			}
		}
	},
	{
		displayName: "Width",
		name: "width",
		type: "number",
		default: "",
		description: "Image width (image estimates only; video estimates ignore it)",
		displayOptions: {
			show: {
				operation: [
					"generateImage",
					"estimate"
				]
			}
		}
	},
	{
		displayName: "Height",
		name: "height",
		type: "number",
		default: "",
		description: "Image height (image estimates only; video estimates ignore it)",
		displayOptions: {
			show: {
				operation: [
					"generateImage",
					"estimate"
				]
			}
		}
	},
	{
		displayName: "Number of Images",
		name: "n",
		type: "number",
		default: "",
		description: "Number of images (image estimates only; video estimates ignore it)",
		displayOptions: {
			show: {
				operation: [
					"generateImage",
					"estimate"
				]
			}
		}
	},
	{
		displayName: "Seed",
		name: "seed",
		type: "number",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"generateImage",
					"generateVideo"
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
				name: "File to Video (WAN 3.0)",
				value: "file_to_video",
				action: "Generate a video from a document file"
			},
			{
				name: "Image to Video",
				value: "image_to_video",
				action: "Generate a video from a first frame"
			},
			{
				name: "Keyframe to Video (WAN 2.1 / 2.2 KF2V)",
				value: "keyframe_to_video",
				action: "Generate a video between first and last keyframes"
			},
			{
				name: "Link to Video (WAN 3.0)",
				value: "link_to_video",
				action: "Generate a video from a web page link"
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
				name: "Video Extend (WAN 3.0)",
				value: "video_extend",
				action: "Extend an existing video"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"generateVideo",
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
		default: "720P",
		options: [
			{
				name: "480P",
				value: "480P",
				action: "Render at 480P"
			},
			{
				name: "720P",
				value: "720P",
				action: "Render at 720P"
			},
			{
				name: "1080P",
				value: "1080P",
				action: "Render at 1080P"
			}
		],
		required: true,
		displayOptions: {
			show: {
				operation: [
					"generateVideo",
					"estimate"
				]
			}
		}
	},
	{
		displayName: "Duration Seconds",
		name: "durationSeconds",
		type: "number",
		default: "",
		required: true,
		description: "Video duration in seconds (2-30, or -1 for provider default)",
		displayOptions: {
			show: {
				operation: [
					"generateVideo",
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
		description: "Required for HappyHorse Text to Video; optional for WAN. WAN Image to Video and Reference to Video also accept 'adaptive'; HappyHorse Image to Video ignores this field.",
		displayOptions: {
			show: {
				operation: [
					"generateVideo"
				]
			}
		}
	},
	{
		displayName: "Audio",
		name: "audio",
		type: "boolean",
		default: false,
		description: "Whether to request generated audio. WAN 3.0 Video / Prime only.",
		displayOptions: {
			show: {
				operation: [
					"generateVideo"
				],
				model: [
					"wan3.0-video",
					"wan3.0-video-prime"
				]
			}
		}
	},
	{
		displayName: "Prompt Extension",
		name: "prompt_extend",
		type: "boolean",
		default: false,
		description: "Whether to ask the provider to expand a short prompt. WAN 3.0 Video / Prime only.",
		displayOptions: {
			show: {
				operation: [
					"generateVideo"
				],
				model: [
					"wan3.0-video",
					"wan3.0-video-prime"
				]
			}
		}
	},
	{
		displayName: "Watermark",
		name: "watermark",
		type: "boolean",
		default: false,
		description: "Whether to apply the provider watermark. WAN 3.0 Video / Prime only.",
		displayOptions: {
			show: {
				operation: [
					"generateVideo"
				],
				model: [
					"wan3.0-video",
					"wan3.0-video-prime"
				]
			}
		}
	},
	{
		displayName: "First Frame (FrankLab Asset)",
		name: "firstFrame",
		type: "collection",
		placeholder: "Add Asset Field",
		default: {},
		description: "Required for Image to Video and Keyframe to Video. The frame must already be uploaded to FrankLab.",
		options: [
			{
				displayName: "Height (Px)",
				name: "height",
				type: "number",
				default: 0,
				description: "At least 300px; aspect ratio between 1:2.5 and 2.5:1"
			},
			{
				displayName: "MIME Type",
				name: "mimeType",
				type: "options",
				default: "image/png",
				options: [
					{
						name: "Image/png",
						value: "image/png"
					},
					{
						name: "Image/jpeg",
						value: "image/jpeg"
					},
					{
						name: "Image/webp",
						value: "image/webp"
					}
				]
			},
			{
				displayName: "Size (Bytes)",
				name: "sizeBytes",
				type: "number",
				default: 0,
				description: "File size in bytes, at most 20MB (20971520)"
			},
			{
				displayName: "Stored File ID",
				name: "storedFileId",
				type: "string",
				default: "",
				description: "UUID of a file already uploaded to FrankLab. An external (non-FrankLab) URL is rejected by the backend."
			},
			{
				displayName: "URL",
				name: "url",
				type: "string",
				default: "",
				description: "Https://franklab.ru/franklab/api/media/&lt;storedFileId&gt;"
			},
			{
				displayName: "Width (Px)",
				name: "width",
				type: "number",
				default: 0,
				description: "At least 300px; aspect ratio between 1:2.5 and 2.5:1"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"generateVideo"
				],
				operationMode: [
					"image_to_video",
					"keyframe_to_video"
				]
			}
		}
	},
	{
		displayName: "Last Frame (FrankLab Asset)",
		name: "lastFrame",
		type: "collection",
		placeholder: "Add Asset Field",
		default: {},
		description: "Optional for WAN 3.0 Image to Video; required for WAN 2.1/2.2 Keyframe to Video",
		options: [
			{
				displayName: "Height (Px)",
				name: "height",
				type: "number",
				default: 0,
				description: "At least 300px; aspect ratio between 1:2.5 and 2.5:1"
			},
			{
				displayName: "MIME Type",
				name: "mimeType",
				type: "options",
				default: "image/png",
				options: [
					{
						name: "Image/png",
						value: "image/png"
					},
					{
						name: "Image/jpeg",
						value: "image/jpeg"
					},
					{
						name: "Image/webp",
						value: "image/webp"
					}
				]
			},
			{
				displayName: "Size (Bytes)",
				name: "sizeBytes",
				type: "number",
				default: 0,
				description: "File size in bytes, at most 20MB (20971520)"
			},
			{
				displayName: "Stored File ID",
				name: "storedFileId",
				type: "string",
				default: "",
				description: "UUID of a file already uploaded to FrankLab. An external (non-FrankLab) URL is rejected by the backend."
			},
			{
				displayName: "URL",
				name: "url",
				type: "string",
				default: "",
				description: "Https://franklab.ru/franklab/api/media/&lt;storedFileId&gt;"
			},
			{
				displayName: "Width (Px)",
				name: "width",
				type: "number",
				default: 0,
				description: "At least 300px; aspect ratio between 1:2.5 and 2.5:1"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"generateVideo"
				],
				operationMode: [
					"image_to_video",
					"keyframe_to_video"
				],
				model: [
					"wan3.0-video",
					"wan3.0-video-prime",
					"wan2.2-kf2v-flash",
					"wan2.1-kf2v-plus"
				]
			}
		}
	},
	{
		displayName: "Reference Images",
		name: "referenceImages",
		type: "fixedCollection",
		typeOptions: {
			multipleValues: true
		},
		placeholder: "Add Reference Image",
		default: {},
		description: "Reference to Video only: 1-10 FrankLab-hosted reference images",
		options: [
			{
				displayName: "Reference Image",
				name: "referenceImage",
				values: [
					{
						displayName: "Type",
						name: "type",
						type: "options",
						default: "reference_image",
						options: [
							{
								name: "Reference_image",
								value: "reference_image"
							}
						]
					},
					{
						displayName: "URL",
						name: "url",
						type: "string",
						default: "",
						description: "Https://franklab.ru/franklab/api/media/&lt;storedFileId&gt;"
					}
				]
			}
		],
		displayOptions: {
			show: {
				operation: [
					"generateVideo"
				],
				operationMode: [
					"reference_to_video"
				],
				model: [
					"wan3.0-video",
					"wan3.0-video-prime",
					"happyhorse-1.1-r2v"
				]
			}
		}
	},
	{
		displayName: "Media",
		name: "media",
		type: "options",
		noDataExpression: true,
		default: "video",
		options: [
			{
				name: "Image",
				value: "image",
				action: "Estimate an image task"
			},
			{
				name: "Video",
				value: "video",
				action: "Estimate a video task"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"estimate"
				]
			}
		}
	}
];
