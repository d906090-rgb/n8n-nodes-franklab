import type { IExecuteFunctions, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeFrankLabModule, jobIdProperty, payloadProperty, waitProperty } from '../shared/node-utils';

export class FrankLabPlastinka implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FrankLab PLASTINKA',
		name: 'frankLabPlastinka',
		icon: { light: 'file:plastinka.svg', dark: 'file:plastinka.dark.svg' },
		subtitle: '={{$parameter["operation"]}}',
		group: ['transform'],
		version: 1,
		description: 'Process audio and manage audio samples with FrankLab PLASTINKA.',
		defaults: {
			name: 'FrankLab PLASTINKA',
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
				default: 'processAudio',
				options: [
					{ name: 'Get Job Status', value: 'getStatus' },
					{ name: 'List Samples', value: 'listSamples' },
					{ name: 'Process Audio', value: 'processAudio' },
					{ name: 'Save Sample', value: 'saveSample' },
				],
			},
			{
				displayName: 'Video URL',
				name: 'videoUrl',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { operation: ['processAudio'] } },
			},
			{
				displayName: 'Audio URL',
				name: 'audioUrl',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['processAudio'] } },
			},
			{
				displayName: 'Sample URL',
				name: 'sampleUrl',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['saveSample'] } },
			},
			{
				displayName: 'Audio Operation',
				name: 'operationName',
				type: 'options',
				default: 'probe',
				options: [
					{ name: 'Convert', value: 'convert' },
					{ name: 'Extract', value: 'extract' },
					{ name: 'Fade', value: 'fade' },
					{ name: 'Fit', value: 'fit' },
					{ name: 'Merge', value: 'merge' },
					{ name: 'Normalize', value: 'normalize' },
					{ name: 'Overlay', value: 'overlay' },
					{ name: 'Probe', value: 'probe' },
					{ name: 'Remove', value: 'remove' },
					{ name: 'Replace', value: 'replace' },
					{ name: 'Replace Tags', value: 'replace_tags' },
					{ name: 'Speed', value: 'speed' },
					{ name: 'Strip Tags', value: 'strip_tags' },
					{ name: 'Trim', value: 'trim' },
					{ name: 'Write Tags', value: 'write_tags' },
				],
				displayOptions: { show: { operation: ['processAudio'] } },
			},
			{
				displayName: 'Sample ID',
				name: 'sampleId',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['processAudio'] } },
			},
			{
				displayName: 'Sample Name',
				name: 'name',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['saveSample'] } },
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
		return executeFrankLabModule(this, 'plastinka', 'getStatus');
	}
}
