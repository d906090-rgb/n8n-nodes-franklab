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
					{ name: 'Concat', value: 'concat' },
					{ name: 'Crop', value: 'crop' },
					{ name: 'Fade', value: 'fade' },
					{ name: 'Frame', value: 'frame' },
					{ name: 'GIF', value: 'gif' },
					{ name: 'Picture in Picture', value: 'pip' },
					{ name: 'Probe', value: 'probe' },
					{ name: 'Replace Tags', value: 'replace_tags' },
					{ name: 'Resize', value: 'resize' },
					{ name: 'Reverse', value: 'reverse' },
					{ name: 'Slideshow', value: 'slideshow' },
					{ name: 'Smart Thumbnail', value: 'thumbnail_smart' },
					{ name: 'Strip Tags', value: 'strip_tags' },
					{ name: 'Transcode', value: 'transcode' },
					{ name: 'Trim', value: 'trim' },
					{ name: 'Video on Image', value: 'video_on_image' },
					{ name: 'Write Tags', value: 'write_tags' },
				],
				displayOptions: { show: { operation: ['montage'] } },
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
