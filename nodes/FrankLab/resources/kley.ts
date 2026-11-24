import type { FrankLabResourceDefinition } from './types';

export const kleyResource: FrankLabResourceDefinition = {
	moduleName: 'kley',
	displayName: 'KLEY',
	statusOperation: "getStatus",
	operationProperty: {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'montage',
		displayOptions: { show: { resource: ['kley'] } },
		options: [
	{
		name: "Change Speed",
		value: "videoSpeed",
		action: 'Change speed'
	},
	{
		name: "Get Job Status",
		value: "getStatus",
		action: 'Get job status'
	},
	{
		name: "Montage",
		value: "montage",
		action: "Montage"
	},
	{
		name: "Overlay",
		value: "overlay",
		action: "Overlay"
	},
	{
		name: "Subtitles",
		value: "subtitles",
		action: "Subtitles"
	}
		],
	},
	fields: [
	{
		displayName: "Video URL",
		name: "videoUrl",
		type: "string",
		default: "",
		required: true,
		displayOptions: {
			show: {
				operation: [
					"montage",
					"videoSpeed",
					"subtitles",
					"overlay"
				]
			}
		}
	},
	{
		displayName: "Montage Operation",
		name: "operationName",
		type: "options",
		default: "probe",
		options: [
			{
				name: "Animated Loop",
				value: "animated"
			},
			{
				name: "BRIA Video Erase Object",
				value: "bria_video_erase_object"
			},
			{
				name: "BRIA Video Replace Background",
				value: "bria_video_replace_bg"
			},
			{
				name: "Chroma Key",
				value: "chroma_key"
			},
			{
				name: "Concat",
				value: "concat"
			},
			{
				name: "Crop",
				value: "crop"
			},
			{
				name: "Denoise",
				value: "denoise"
			},
			{
				name: "Fade",
				value: "fade"
			},
			{
				name: "Frame",
				value: "frame"
			},
			{
				name: "GIF",
				value: "gif"
			},
			{
				name: "HDR to SDR",
				value: "hdr_to_sdr"
			},
			{
				name: "Mezzanine Master",
				value: "mezzanine"
			},
			{
				name: "Picture in Picture",
				value: "pip"
			},
			{
				name: "Probe",
				value: "probe"
			},
			{
				name: "QC Report",
				value: "qc_report"
			},
			{
				name: "Quality Compare",
				value: "quality_compare"
			},
			{
				name: "Remove Background",
				value: "remove_bg"
			},
			{
				name: "Replace Tags",
				value: "replace_tags"
			},
			{
				name: "Resize",
				value: "resize"
			},
			{
				name: "Reverse",
				value: "reverse"
			},
			{
				name: "Round Video",
				value: "round"
			},
			{
				name: "Scene List",
				value: "scenes"
			},
			{
				name: "Slideshow",
				value: "slideshow"
			},
			{
				name: "Slow Motion",
				value: "slow_motion"
			},
			{
				name: "Smart Thumbnail",
				value: "thumbnail_smart"
			},
			{
				name: "Split Screen",
				value: "split_screen"
			},
			{
				name: "Stabilize",
				value: "stabilize"
			},
			{
				name: "Strip Tags",
				value: "strip_tags"
			},
			{
				name: "Transcode",
				value: "transcode"
			},
			{
				name: "Trim",
				value: "trim"
			},
			{
				name: "Variant Pack",
				value: "variant_pack"
			},
			{
				name: "Video on Image",
				value: "video_on_image"
			},
			{
				name: "Waveform",
				value: "waveform"
			},
			{
				name: "Write Tags",
				value: "write_tags"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"montage"
				]
			}
		}
	},
	{
		displayName: "Reference Video URL (Quality Compare)",
		name: "referenceVideoUrl",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"montage"
				],
				operationName: [
					"quality_compare"
				]
			}
		}
	},
	{
		displayName: "Overlay Image URL (Image on Video)",
		name: "overlayImageUrl",
		type: "string",
		default: "",
		description: "Optional public https:// image URL to place on top of the video",
		displayOptions: {
			show: {
				operation: [
					"overlay"
				]
			}
		}
	},
	{
		displayName: "Speed",
		name: "speed",
		type: "number",
		default: 1,
		typeOptions: {
			minValue: 0.25,
			maxValue: 4
		},
		displayOptions: {
			show: {
				operation: [
					"videoSpeed"
				]
			}
		}
	}
],
};
