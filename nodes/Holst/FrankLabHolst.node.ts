import type { IExecuteFunctions, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeFrankLabModule, jobIdProperty, payloadProperty, waitProperty } from '../shared/node-utils';

export class FrankLabHolst implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FrankLab HOLST',
		name: 'frankLabHolst',
		icon: 'file:holst.svg',
		group: ['transform'],
		version: 1,
		description: 'Process images with FrankLab HOLST.',
		defaults: {
			name: 'FrankLab HOLST',
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
				default: 'submitImage',
				options: [
					{
						name: 'Get Job Status',
						value: 'getStatus',
						description: 'Fetch a HOLST job status and output',
						action: 'Fetch a HOLST job status and output',
					},
					{
						name: 'Submit Image Job',
						value: 'submitImage',
						description: 'Create a HOLST image processing job',
						action: 'Create a HOLST image processing job',
					},
				],
			},
			{
				displayName: 'Image URL',
				name: 'imageUrl',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { operation: ['submitImage'] } },
			},
			{
				displayName: 'Image Operation',
				name: 'operationName',
				type: 'options',
				default: 'info',
				options: [
					{ name: 'Adjust', value: 'adjust' },
					{ name: 'Blur', value: 'blur' },
					{ name: 'Collage', value: 'collage' },
					{ name: 'Crop', value: 'crop' },
					{ name: 'Filter', value: 'filter' },
					{ name: 'Flip', value: 'flip' },
					{ name: 'Flop', value: 'flop' },
					{ name: 'Format', value: 'format' },
					{ name: 'Image Overlay', value: 'image_overlay' },
					{ name: 'Info', value: 'info' },
					{ name: 'Mask', value: 'mask' },
					{ name: 'Read Metadata', value: 'read_metadata' },
					{ name: 'Replace Metadata', value: 'replace_metadata' },
					{ name: 'Resize', value: 'resize' },
					{ name: 'Rotate', value: 'rotate' },
					{ name: 'Sharpen', value: 'sharpen' },
					{ name: 'Strip GPS', value: 'strip_gps' },
					{ name: 'Strip Metadata', value: 'strip_meta' },
					{ name: 'Text', value: 'text' },
					{ name: 'Watermark', value: 'watermark' },
					{ name: 'Write EXIF', value: 'write_exif' },
					{ name: 'Write Metadata', value: 'write_metadata' },
				],
				displayOptions: { show: { operation: ['submitImage'] } },
			},
			jobIdProperty,
			payloadProperty,
			waitProperty,
		],
	};

	async execute(this: IExecuteFunctions) {
		return executeFrankLabModule(this, 'holst', 'getStatus');
	}
}
