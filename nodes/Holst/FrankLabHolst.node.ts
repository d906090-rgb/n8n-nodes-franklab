import type { IExecuteFunctions, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeFrankLabModule, jobIdProperty, payloadProperty, waitProperty } from '../shared/node-utils';

export class FrankLabHolst implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FrankLab HOLST',
		name: 'frankLabHolst',
		icon: { light: 'file:holst.svg', dark: 'file:holst.dark.svg' },
		subtitle: '={{$parameter["operation"]}}',
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
					{ name: 'Get Job Status', value: 'getStatus', action: 'Get an image job status' },
					{ name: 'Submit Image Job', value: 'submitImage', action: 'Submit an image processing job' },
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
					{ name: 'BRIA Erase by Text', value: 'bria_erase_by_text', action: 'Erase image area by text' },
					{ name: 'BRIA Erase Foreground', value: 'bria_erase_foreground', action: 'Erase the image foreground' },
					{ name: 'BRIA Image Product Cutout', value: 'bria_product_cutout', action: 'Cut out a product' },
					{ name: 'BRIA Image Product Lifestyle by Text', value: 'bria_product_lifestyle_by_text', action: 'Place a product in a lifestyle scene' },
					{ name: 'BRIA Image Remove Background', value: 'bria_image_remove_bg', action: 'Remove the image background' },
					{ name: 'BRIA Image Replace Background', value: 'bria_image_replace_bg', action: 'Replace the image background' },
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

	// continueOnFail() is handled centrally in executeFrankLabModule() — see nodes/shared/node-utils.ts:
	// each item runs in a try/catch that checks this.continueOnFail() and otherwise throws a
	// NodeOperationError with { itemIndex }. The rule only scans the execute() body, so it cannot see the
	// handling across the helper boundary (confirmed false positive).
	async execute(this: IExecuteFunctions) {
		return executeFrankLabModule(this, 'holst', 'getStatus');
	}
}
