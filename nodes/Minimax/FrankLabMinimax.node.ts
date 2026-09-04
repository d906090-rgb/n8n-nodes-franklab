import type { IExecuteFunctions, INodeType, INodeTypeDescription, INodeProperties } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeFrankLabModule, jobIdProperty, payloadProperty, waitProperty } from '../shared/node-utils';

const videoFields: INodeProperties[] = [
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
		displayName: 'Scenario',
		name: 'scenario',
		type: 'options',
		noDataExpression: true,
		default: 'text_to_video',
		options: [
			{ name: 'First and Last Frame to Video', value: 'first_last_frame_to_video', action: 'Use first and last frames' },
			{ name: 'First Frame to Video', value: 'first_frame_to_video', action: 'Use a first frame' },
			{ name: 'Last Frame to Video', value: 'last_frame_to_video', action: 'Use a last frame' },
			{ name: 'Reference to Video', value: 'reference_to_video', action: 'Use reference media' },
			{ name: 'Text to Video', value: 'text_to_video', action: 'Generate from text' },
		],
		required: true,
		displayOptions: { show: { operation: ['createVideo'] } },
	},
	{
		displayName: 'Resolution',
		name: 'resolution',
		type: 'options',
		noDataExpression: true,
		default: '768P',
		options: [
			{ name: '768P', value: '768P', action: 'Render at 768P' },
			{ name: '2K', value: '2K', action: 'Render at 2K' },
		],
		displayOptions: { show: { operation: ['createVideo'] } },
	},
	{
		displayName: 'Duration',
		name: 'duration',
		type: 'number',
		default: '',
		required: true,
		description: 'Video duration in seconds (4-15)',
		displayOptions: { show: { operation: ['createVideo'] } },
	},
	{
		displayName: 'Ratio',
		name: 'ratio',
		type: 'string',
		default: '',
		description: 'Concrete aspect ratio for text_to_video (for example 16:9) or adaptive for frame-based scenarios',
		displayOptions: { show: { operation: ['createVideo'] } },
	},
	{
		displayName: 'Idempotency Key',
		name: 'idempotency_key',
		type: 'string',
		default: '',
		required: true,
		description: 'Idempotency key (mint one with the Idempotency Key operation)',
		displayOptions: { show: { operation: ['createVideo'] } },
	},
	{
		displayName: 'First Frame Stored File ID',
		name: 'first_frame_stored_file_id',
		type: 'string',
		default: '',
		description: 'Optional partner-scoped stored file ID for the first frame',
		displayOptions: { show: { operation: ['createVideo'] } },
	},
	{
		displayName: 'Action',
		name: 'action',
		type: 'options',
		noDataExpression: true,
		default: 'cancel',
		options: [
			{ name: 'Cancel', value: 'cancel', action: 'Cancel the task' },
			{ name: 'Delete', value: 'delete', action: 'Delete the task' },
		],
		required: true,
		displayOptions: { show: { operation: ['taskAction'] } },
	},
	{
		displayName: 'Page Number',
		name: 'page_num',
		type: 'number',
		default: '',
		description: 'Optional results page for List Videos',
		displayOptions: { show: { operation: ['listVideos'] } },
	},
	{
		displayName: 'Page Size',
		name: 'page_size',
		type: 'number',
		default: '',
		description: 'Optional page size for List Videos',
		displayOptions: { show: { operation: ['listVideos'] } },
	},
];

export class FrankLabMinimax implements INodeType {
	// continueOnFail() is handled centrally in executeFrankLabModule.
	description: INodeTypeDescription = {
		displayName: 'FrankLab MiniMax',
		name: 'frankLabMinimax',
		icon: 'file:minimax.svg',
		subtitle: '={{$parameter["operation"]}}',
		group: ['transform'],
		version: 1,
		description: 'Generate MiniMax H3 videos, mint idempotency keys, list tasks, and cancel or delete them.',
		defaults: {
			name: 'FrankLab MiniMax',
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
				default: 'createVideo',
				options: [
					{ name: 'Create Video', value: 'createVideo', action: 'Submit a mini max h3 video task' },
					{ name: 'Get Task', value: 'getTask', action: 'Get a mini max task' },
					{ name: 'Idempotency Key', value: 'idempotencyKey', action: 'Mint an idempotency key' },
					{ name: 'List Videos', value: 'listVideos', action: 'List mini max video tasks' },
					{ name: 'Task Action', value: 'taskAction', action: 'Cancel or delete a mini max task' },
				],
			},
			...videoFields,
			jobIdProperty,
			payloadProperty,
			waitProperty,
		],
	};

	async execute(this: IExecuteFunctions) {
		return executeFrankLabModule(this, 'minimax', 'getTask');
	}
}
