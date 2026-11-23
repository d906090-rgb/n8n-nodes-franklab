import type { IExecuteFunctions, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeFrankLabModule, jobIdProperty, payloadProperty, waitProperty } from '../shared/node-utils';

export class FrankLabKley implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FrankLab KLEY',
		name: 'frankLabKley',
		icon: { light: 'file:kley.svg', dark: 'file:kley.dark.svg' },
		subtitle: '={{$parameter["operation"]}}',
		group: ['transform'],
		version: 1,
		description: 'Process video montage, speed, subtitles, and overlays with FrankLab KLEY.',
		defaults: {
			name: 'FrankLab KLEY',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'frankLabApi',
				required: true,
			},
		],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'montage',
				options: [
					{ name: 'Change Speed', value: 'videoSpeed' },
					{ name: 'Get Job Status', value: 'getStatus' },
					{ name: 'Montage', value: 'montage' },
					{ name: 'Overlay', value: 'overlay' },
					{ name: 'Subtitles', value: 'subtitles' },
				],
			},
			{
				displayName: 'Video URL',
				name: 'videoUrl',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { operation: ['montage', 'videoSpeed', 'subtitles', 'overlay'] } },
			},
			{
				displayName: 'Montage Operation',
				name: 'operationName',
				type: 'options',
				default: 'probe',
				options: [
					{ name: 'Animated Loop', value: 'animated' },
					{ name: 'BRIA Video Erase Object', value: 'bria_video_erase_object' },
					{ name: 'BRIA Video Replace Background', value: 'bria_video_replace_bg' },
					{ name: 'Chroma Key', value: 'chroma_key' },
					{ name: 'Concat', value: 'concat' },
					{ name: 'Crop', value: 'crop' },
					{ name: 'Denoise', value: 'denoise' },
					{ name: 'Fade', value: 'fade' },
					{ name: 'Frame', value: 'frame' },
					{ name: 'GIF', value: 'gif' },
					{ name: 'HDR to SDR', value: 'hdr_to_sdr' },
					{ name: 'Mezzanine Master', value: 'mezzanine' },
					{ name: 'Picture in Picture', value: 'pip' },
					{ name: 'Probe', value: 'probe' },
					{ name: 'QC Report', value: 'qc_report' },
					{ name: 'Quality Compare', value: 'quality_compare' },
					{ name: 'Remove Background', value: 'remove_bg' },
					{ name: 'Replace Tags', value: 'replace_tags' },
					{ name: 'Resize', value: 'resize' },
					{ name: 'Reverse', value: 'reverse' },
					{ name: 'Round Video', value: 'round' },
					{ name: 'Scene List', value: 'scenes' },
					{ name: 'Slideshow', value: 'slideshow' },
					{ name: 'Slow Motion', value: 'slow_motion' },
					{ name: 'Smart Thumbnail', value: 'thumbnail_smart' },
					{ name: 'Split Screen', value: 'split_screen' },
					{ name: 'Stabilize', value: 'stabilize' },
					{ name: 'Strip Tags', value: 'strip_tags' },
					{ name: 'Transcode', value: 'transcode' },
					{ name: 'Trim', value: 'trim' },
					{ name: 'Variant Pack', value: 'variant_pack' },
					{ name: 'Video on Image', value: 'video_on_image' },
					{ name: 'Waveform', value: 'waveform' },
					{ name: 'Write Tags', value: 'write_tags' },
				],
				displayOptions: { show: { operation: ['montage'] } },
			},
			{
				displayName: 'Reference Video URL (Quality Compare)',
				name: 'referenceVideoUrl',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['montage'], operationName: ['quality_compare'] } },
			},
			{
				displayName: 'Overlay Image URL (Image on Video)',
				name: 'overlayImageUrl',
				type: 'string',
				default: '',
				description: 'Optional public https:// image URL to place on top of the video',
				displayOptions: { show: { operation: ['overlay'] } },
			},
			{
				displayName: 'Speed',
				name: 'speed',
				type: 'number',
				default: 1,
				typeOptions: { minValue: 0.25, maxValue: 4 },
				displayOptions: { show: { operation: ['videoSpeed'] } },
			},
			jobIdProperty,
			payloadProperty,
			waitProperty,
		],
	};

	// continueOnFail() is handled centrally in executeFrankLabModule() — see nodes/shared/node-utils.ts:
	// each item runs in a try/catch that checks this.continueOnFail() and otherwise throws a
	// NodeOperationError with { itemIndex }. The rule only scans the execute() body, so it cannot see the
	// handling across the helper boundary (confirmed false positive).
	async execute(this: IExecuteFunctions) {
		return executeFrankLabModule(this, 'kley', 'getStatus');
	}
}
