import type { IExecuteFunctions, INodeType, INodeTypeDescription, INodeProperties } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeFrankLabModule, jobIdProperty, payloadProperty, waitProperty } from '../shared/node-utils';

const fileIdProperty: INodeProperties = {
	displayName: 'File ID',
	name: 'file_id',
	type: 'string',
	default: '',
	required: true,
	displayOptions: {
		show: {
			operation: ['getFile', 'deleteFile'],
		},
	},
};

const generateFields: INodeProperties[] = [
	{
		displayName: 'Prompt',
		name: 'prompt',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		displayOptions: { show: { operation: ['generate'] } },
	},
	{
		displayName: 'System Prompt',
		name: 'system_prompt',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		displayOptions: { show: { operation: ['generate'] } },
	},
	{
		displayName: 'Model Key',
		name: 'model_key',
		type: 'string',
		default: '',
		description: 'Optional model key (see List Models)',
		displayOptions: { show: { operation: ['generate'] } },
	},
	{
		displayName: 'Async Mode',
		name: 'async_mode',
		type: 'boolean',
		default: false,
		description: 'Whether to return a billing task ID immediately and poll with Get Task',
		displayOptions: { show: { operation: ['generate'] } },
	},
	{
		displayName: 'Response Format',
		name: 'response_format',
		type: 'options',
		noDataExpression: true,
		default: 'text',
		options: [
			{ name: 'Text', value: 'text', action: 'Return plain text' },
			{ name: 'JSON Object', value: 'json_object', action: 'Return a JSON object' },
			{ name: 'JSON Schema', value: 'json_schema', action: 'Return JSON matching a schema (pass json_schema in Additional JSON)' },
		],
		displayOptions: { show: { operation: ['generate'] } },
	},
	{
		displayName: 'Max Tokens',
		name: 'max_tokens',
		type: 'number',
		default: '',
		displayOptions: { show: { operation: ['generate'] } },
	},
	{
		displayName: 'Temperature',
		name: 'temperature',
		type: 'number',
		default: '',
		displayOptions: { show: { operation: ['generate'] } },
	},
	{
		displayName: 'File URL',
		name: 'url',
		type: 'string',
		default: '',
		required: true,
		description: 'Public http(s) URL of the file to import',
		displayOptions: { show: { operation: ['fileFromUrl'] } },
	},
	{
		displayName: 'Filename',
		name: 'filename',
		type: 'string',
		default: '',
		displayOptions: { show: { operation: ['fileFromUrl'] } },
	},
	{
		displayName: 'Purpose',
		name: 'purpose',
		type: 'string',
		default: '',
		displayOptions: { show: { operation: ['fileFromUrl'] } },
	},
];

export class FrankLabDola implements INodeType {
	// continueOnFail() is handled centrally in executeFrankLabModule.
	description: INodeTypeDescription = {
		displayName: 'FrankLab DOLA',
		name: 'frankLabDola',
		icon: 'file:dola.svg',
		subtitle: '={{$parameter["operation"]}}',
		group: ['transform'],
		version: 1,
		description: 'Generate text and structured JSON with FrankLab DOLA (MOON GPT) and manage its files.',
		defaults: {
			name: 'FrankLab DOLA',
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
				default: 'generate',
				options: [
					{ name: 'Delete File', value: 'deleteFile', action: 'Delete a DOLA file' },
					{ name: 'File From URL', value: 'fileFromUrl', action: 'Import a file from a public URL' },
					{ name: 'Generate', value: 'generate', action: 'Generate text with an LLM' },
					{ name: 'Get File', value: 'getFile', action: 'Get a DOLA file' },
					{ name: 'Get Task', value: 'getTask', action: 'Get a DOLA billing task' },
					{ name: 'List Files', value: 'listFiles', action: 'List DOLA files' },
					{ name: 'List Models', value: 'listModels', action: 'List DOLA models' },
				],
			},
			...generateFields,
			fileIdProperty,
			jobIdProperty,
			payloadProperty,
			waitProperty,
		],
	};

	async execute(this: IExecuteFunctions) {
		return executeFrankLabModule(this, 'dola', 'getTask');
	}
}
