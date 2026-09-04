import type { IExecuteFunctions, INodeType, INodeTypeDescription, INodeProperties } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeFrankLabModule, jobIdProperty, payloadProperty, waitProperty } from '../shared/node-utils';

const ttsFields: INodeProperties[] = [
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		displayOptions: { show: { operation: ['textToSpeech'] } },
	},
	{
		displayName: 'Voice',
		name: 'voice',
		type: 'string',
		default: '',
		description: 'Optional voice identifier (see List Voices)',
		displayOptions: { show: { operation: ['textToSpeech'] } },
	},
	{
		displayName: 'Model',
		name: 'model',
		type: 'string',
		default: '',
		description: 'Optional model identifier',
		displayOptions: { show: { operation: ['textToSpeech'] } },
	},
];

export class FrankLabNeptune implements INodeType {
	// continueOnFail() is handled centrally in executeFrankLabModule.
	description: INodeTypeDescription = {
		displayName: 'FrankLab NEPTUNE',
		name: 'frankLabNeptune',
		icon: 'file:neptune.svg',
		subtitle: '={{$parameter["operation"]}}',
		group: ['transform'],
		version: 1,
		description: 'Generate speech from text with FrankLab NEPTUNE.',
		defaults: {
			name: 'FrankLab NEPTUNE',
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
				default: 'textToSpeech',
				options: [
					{ name: 'Get Task', value: 'getTask', action: 'Get a TTS task' },
					{ name: 'List Voices', value: 'listVoices', action: 'List TTS voices' },
					{ name: 'Text to Speech', value: 'textToSpeech', action: 'Generate speech from text' },
				],
			},
			...ttsFields,
			jobIdProperty,
			payloadProperty,
			waitProperty,
		],
	};

	async execute(this: IExecuteFunctions) {
		return executeFrankLabModule(this, 'neptune', 'getTask');
	}
}
