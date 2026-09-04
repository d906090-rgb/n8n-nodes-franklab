import type { IExecuteFunctions, INodeType, INodeTypeDescription, INodeProperties } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeFrankLabModule, jobIdProperty, payloadProperty, waitProperty } from '../shared/node-utils';

const avatarFields: INodeProperties[] = [
	{
		displayName: 'Image URL',
		name: 'image',
		type: 'string',
		default: '',
		required: true,
		description: 'Public http(s) URL of the avatar portrait image',
		displayOptions: { show: { operation: ['avatarVideo'] } },
	},
	{
		displayName: 'Sound File URL',
		name: 'sound_file',
		type: 'string',
		default: '',
		description: 'Public http(s) URL of the audio for the avatar speech',
		displayOptions: { show: { operation: ['avatarVideo'] } },
	},
	{
		displayName: 'Audio ID',
		name: 'audio_id',
		type: 'string',
		default: '',
		description: 'Optional previously uploaded audio ID instead of a URL',
		displayOptions: { show: { operation: ['avatarVideo'] } },
	},
	{
		displayName: 'Prompt',
		name: 'prompt',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		displayOptions: { show: { operation: ['avatarVideo'] } },
	},
	{
		displayName: 'Mode',
		name: 'mode',
		type: 'string',
		default: '',
		description: 'Optional generation mode',
		displayOptions: { show: { operation: ['avatarVideo'] } },
	},
];

export class FrankLabVenus implements INodeType {
	// continueOnFail() is handled centrally in executeFrankLabModule.
	description: INodeTypeDescription = {
		displayName: 'FrankLab VENUS',
		name: 'frankLabVenus',
		icon: 'file:venus.svg',
		subtitle: '={{$parameter["operation"]}}',
		group: ['transform'],
		version: 1,
		description: 'Generate talking-avatar videos from a portrait image and audio with FrankLab VENUS.',
		defaults: {
			name: 'FrankLab VENUS',
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
				default: 'avatarVideo',
				options: [
					{ name: 'Create Avatar Video', value: 'avatarVideo', action: 'Generate an avatar video' },
					{ name: 'Get Status', value: 'getStatus', action: 'Get an avatar video task status' },
				],
			},
			...avatarFields,
			jobIdProperty,
			payloadProperty,
			waitProperty,
		],
	};

	async execute(this: IExecuteFunctions) {
		return executeFrankLabModule(this, 'venus', 'getStatus');
	}
}
