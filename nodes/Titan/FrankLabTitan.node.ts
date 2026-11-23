import type { IExecuteFunctions, INodeType, INodeTypeDescription, INodeProperties } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeFrankLabModule, jobIdProperty, payloadProperty, waitProperty } from '../shared/node-utils';

const titanFields: INodeProperties[] = [
	{
		displayName: 'Prompt',
		name: 'prompt',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		displayOptions: { show: { operation: ['createVideo'] } },
	},
	{
		displayName: 'Page Number',
		name: 'pageNum',
		type: 'number',
		default: '',
		description: 'Optional results page for List Tasks',
		displayOptions: { show: { operation: ['listTasks'] } },
	},
	{
		displayName: 'Page Size',
		name: 'pageSize',
		type: 'number',
		default: '',
		description: 'Optional page size for List Tasks',
		displayOptions: { show: { operation: ['listTasks'] } },
	},
];

export class FrankLabTitan implements INodeType {
	// continueOnFail() is handled centrally in executeFrankLabModule.
	description: INodeTypeDescription = {
		displayName: 'FrankLab TITAN',
		name: 'frankLabTitan',
		icon: { light: 'file:titan.svg', dark: 'file:titan.dark.svg' },
		subtitle: '={{$parameter["operation"]}}',
		group: ['transform'],
		version: 1,
		description: 'Compose multi-element videos through a staged selection flow with FrankLab TITAN.',
		defaults: {
			name: 'FrankLab TITAN',
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
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				default: 'video',
				options: [
					{ name: 'Selection', value: 'selection' },
					{ name: 'Video', value: 'video' },
				],
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'initSelection',
				displayOptions: { show: { resource: ['selection'] } },
				options: [
					{ name: 'Add', value: 'addSelection', action: 'Add elements to the selection' },
					{ name: 'Clear', value: 'clearSelection', action: 'Clear the selection' },
					{ name: 'Delete', value: 'deleteSelection', action: 'Delete elements from the selection' },
					{ name: 'Init', value: 'initSelection', action: 'Initialize the selection' },
					{ name: 'Preview', value: 'previewSelection', action: 'Preview the selection' },
				],
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'createVideo',
				displayOptions: { show: { resource: ['video'] } },
				options: [
					{ name: 'Create', value: 'createVideo', action: 'Create a multi element video' },
					{ name: 'Get Task', value: 'getTask', action: 'Get a multi element task' },
					{ name: 'List Tasks', value: 'listTasks', action: 'List multi element tasks' },
				],
			},
			...titanFields,
			jobIdProperty,
			payloadProperty,
			waitProperty,
		],
	};

	async execute(this: IExecuteFunctions) {
		return executeFrankLabModule(this, 'titan', { default: 'getTask' });
	}
}
