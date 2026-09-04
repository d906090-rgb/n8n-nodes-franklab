import type { IExecuteFunctions, INodeType, INodeTypeDescription, INodeProperties } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeFrankLabModule, jobIdProperty, payloadProperty, waitProperty } from '../shared/node-utils';

const lipSyncFields: INodeProperties[] = [
	{
		displayName: 'Video URL',
		name: 'video_url',
		type: 'string',
		default: '',
		required: true,
		description: 'Public http(s) URL of the video to lip-sync',
		displayOptions: { show: { operation: ['lipSync', 'advancedLipSync'] } },
	},
	{
		displayName: 'Audio URL',
		name: 'audio_url',
		type: 'string',
		default: '',
		required: true,
		description: 'Public http(s) URL of the speech audio',
		displayOptions: { show: { operation: ['lipSync', 'advancedLipSync'] } },
	},
	{
		displayName: 'Image URL',
		name: 'image_url',
		type: 'string',
		default: '',
		required: true,
		description: 'Public http(s) image for face identification',
		displayOptions: { show: { operation: ['identifyFace'] } },
	},
];

export class FrankLabMercury implements INodeType {
	// continueOnFail() is handled centrally in executeFrankLabModule.
	description: INodeTypeDescription = {
		displayName: 'FrankLab MERCURY',
		name: 'frankLabMercury',
		icon: 'file:mercury.svg',
		subtitle: '={{$parameter["operation"]}}',
		group: ['transform'],
		version: 1,
		description: 'Lip-sync videos to speech audio and identify faces with FrankLab MERCURY.',
		defaults: {
			name: 'FrankLab MERCURY',
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
				default: 'lipSync',
				options: [
					{ name: 'Advanced Lip Sync', value: 'advancedLipSync', action: 'Run an advanced lip sync' },
					{ name: 'Get Advanced Lip Sync Status', value: 'getAdvancedLipSyncStatus', action: 'Get an advanced lip sync status' },
					{ name: 'Get Lip Sync Status', value: 'getLipSyncStatus', action: 'Get a lip sync status' },
					{ name: 'Identify Face', value: 'identifyFace', action: 'Identify faces in an image' },
					{ name: 'Lip Sync', value: 'lipSync', action: 'Lip sync a video to audio' },
				],
			},
			...lipSyncFields,
			jobIdProperty,
			payloadProperty,
			waitProperty,
		],
	};

	async execute(this: IExecuteFunctions) {
		return executeFrankLabModule(this, 'mercury', { default: 'getLipSyncStatus', advancedLipSync: 'getAdvancedLipSyncStatus', identifyFace: '' });
	}
}
