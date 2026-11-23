import type { IExecuteFunctions, INodeType, INodeTypeDescription, INodeProperties } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeFrankLabModule, jobIdProperty, payloadProperty, waitProperty } from '../shared/node-utils';

const elementIdProperty: INodeProperties = {
	displayName: 'Element ID',
	name: 'id',
	type: 'string',
	default: '',
	required: true,
	displayOptions: {
		show: {
			operation: ['getElement', 'deleteElement', 'getAdvancedPreset'],
		},
	},
};

const voiceIdProperty: INodeProperties = {
	displayName: 'Voice ID',
	name: 'voiceId',
	type: 'string',
	default: '',
	required: true,
	displayOptions: {
		show: {
			operation: ['getVoice', 'deleteVoice', 'getCustomVoice'],
		},
	},
};

const kusokFields: INodeProperties[] = [
	{
		displayName: 'Image URL',
		name: 'image_url',
		type: 'string',
		default: '',
		required: true,
		description: 'Public http(s) portrait image, sent as the first refer_images entry',
		displayOptions: { show: { operation: ['createElement', 'createElementAsync'] } },
	},
	{
		displayName: 'Element Name',
		name: 'element_name',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { operation: ['createElement', 'createElementAsync'] } },
	},
	{
		displayName: 'Element Description',
		name: 'element_description',
		type: 'string',
		typeOptions: { rows: 3 },
		default: '',
		required: true,
		displayOptions: { show: { operation: ['createElement', 'createElementAsync'] } },
	},
	{
		displayName: 'Reference Type',
		name: 'reference_type',
		type: 'options',
		noDataExpression: true,
		default: 'image_refer',
		options: [
			{ name: 'Image', value: 'image', action: 'Use an image reference' },
			{ name: 'Image Refer', value: 'image_refer', action: 'Use an image refer reference' },
			{ name: 'Img', value: 'img', action: 'Use an img reference' },
			{ name: 'Vid', value: 'vid', action: 'Use a vid reference' },
			{ name: 'Video', value: 'video', action: 'Use a video reference' },
			{ name: 'Video Refer', value: 'video_refer', action: 'Use a video refer reference' },
		],
		required: true,
		displayOptions: { show: { operation: ['createElement', 'createElementAsync'] } },
	},
	{
		displayName: 'Image URL',
		name: 'image',
		type: 'string',
		default: '',
		required: true,
		description: 'Public http(s) URL of the portrait image to recognize',
		displayOptions: { show: { operation: ['recognize', 'recognizeAsync'] } },
	},
	{
		displayName: 'Voice Name',
		name: 'voice_name',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { operation: ['createVoice'] } },
	},
	{
		displayName: 'Voice URL',
		name: 'voice_url',
		type: 'string',
		default: '',
		description: 'Optional public http(s) URL of the voice sample instead of Additional JSON audio list',
		displayOptions: { show: { operation: ['createVoice'] } },
	},
	{
		displayName: 'Page Number',
		name: 'pageNum',
		type: 'number',
		default: '',
		description: 'Optional results page for List Elements',
		displayOptions: { show: { operation: ['listElements', 'listVoices', 'listPresetVoices', 'listTags', 'listElementVoices', 'listAdvancedPresets', 'listCustomVoices'] } },
	},
	{
		displayName: 'Page Size',
		name: 'pageSize',
		type: 'number',
		default: '',
		description: 'Optional page size for list operations',
		displayOptions: { show: { operation: ['listElements', 'listVoices', 'listPresetVoices', 'listTags', 'listElementVoices', 'listAdvancedPresets', 'listCustomVoices'] } },
	},
	{
		displayName: 'Moon Action',
		name: 'action',
		type: 'options',
		noDataExpression: true,
		default: 'list_assets',
		options: [
			{ name: 'Create Asset', value: 'create_asset', action: 'Register a seedance moon asset' },
			{ name: 'Get Asset', value: 'get_asset', action: 'Get a seedance moon asset status and url' },
			{ name: 'List Assets', value: 'list_assets', action: 'List seedance moon assets' },
			{ name: 'Verify Get Result', value: 'verify_get_result', action: 'Check H5 identity verification result' },
			{ name: 'Verify Start (H5 Link)', value: 'verify_start', action: 'Start H5 identity verification session' },
		],
		displayOptions: { show: { operation: ['moonOperation'] } },
	},
	{
		displayName: 'Group ID',
		name: 'group_id',
		type: 'string',
		default: '',
		description: 'Seedance/Moon asset group ID (required for create_asset, optional filter for list_assets)',
		displayOptions: { show: { operation: ['moonOperation'] } },
	},
	{
		displayName: 'Asset URL (HTTPS)',
		name: 'url',
		type: 'string',
		default: '',
		description: 'Public https:// URL of media asset (required for create_asset)',
		displayOptions: { show: { operation: ['moonOperation'], action: ['create_asset'] } },
	},
	{
		displayName: 'Asset Type',
		name: 'asset_type',
		type: 'options',
		noDataExpression: true,
		default: 'Image',
		options: [
			{ name: 'Audio', value: 'Audio', action: 'Register an audio asset' },
			{ name: 'Image', value: 'Image', action: 'Register an image asset' },
			{ name: 'Video', value: 'Video', action: 'Register a video asset' },
		],
		displayOptions: { show: { operation: ['moonOperation'], action: ['create_asset'] } },
	},
	{
		displayName: 'Asset ID',
		name: 'asset_id',
		type: 'string',
		default: '',
		displayOptions: { show: { operation: ['moonOperation'], action: ['get_asset'] } },
	},
	{
		displayName: 'Verification Token (Byted_token)',
		name: 'byted_token',
		type: 'string',
		typeOptions: { password: true },
		default: '',
		description: 'Token returned by verify_start for verify_get_result',
		displayOptions: { show: { operation: ['moonOperation'], action: ['verify_get_result'] } },
	},
	{
		displayName: 'Asset Name',
		name: 'name',
		type: 'string',
		default: '',
		displayOptions: { show: { operation: ['moonOperation'], action: ['create_asset', 'list_assets'] } },
	},
	{
		displayName: 'Project Name',
		name: 'project_name',
		type: 'string',
		default: '',
		displayOptions: { show: { operation: ['moonOperation'] } },
	},
];

export class FrankLabKusok implements INodeType {
	// continueOnFail() is handled centrally in executeFrankLabModule.
	description: INodeTypeDescription = {
		displayName: 'FrankLab KUSOK',
		name: 'frankLabKusok',
		icon: { light: 'file:kusok.svg', dark: 'file:kusok.dark.svg' },
		subtitle: '={{$parameter["operation"]}}',
		group: ['transform'],
		version: 1,
		description: 'Manage KUSOK elements and voices, recognize portrait images, and poll KUSOK tasks (requires a Kusok-capable partner key).',
		defaults: {
			name: 'FrankLab KUSOK',
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
				default: 'element',
				options: [
					{ name: 'Element', value: 'element' },
					{ name: 'Task', value: 'task' },
					{ name: 'Tool', value: 'tool' },
					{ name: 'Voice', value: 'voice' },
				],
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'createElement',
				displayOptions: { show: { resource: ['element'] } },
				options: [
					{ name: 'Create', value: 'createElement', action: 'Create a KUSOK element' },
					{ name: 'Create (Async)', value: 'createElementAsync', action: 'Create a KUSOK element asynchronously' },
					{ name: 'Delete', value: 'deleteElement', action: 'Delete a KUSOK element' },
					{ name: 'Get', value: 'getElement', action: 'Get a KUSOK element' },
					{ name: 'Get Advanced Preset', value: 'getAdvancedPreset', action: 'Get an advanced preset element' },
					{ name: 'List', value: 'listElements', action: 'List KUSOK elements' },
					{ name: 'List Advanced Presets', value: 'listAdvancedPresets', action: 'List advanced preset elements' },
					{ name: 'List Tags', value: 'listTags', action: 'List element tags' },
					{ name: 'List Voices', value: 'listElementVoices', action: 'List element voices' },
				],
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'getTask',
				displayOptions: { show: { resource: ['task'] } },
				options: [
					{ name: 'Get', value: 'getTask', action: 'Get a KUSOK task' },
					{ name: 'Get Async', value: 'getAsyncTask', action: 'Get a KUSOK async task' },
				],
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'recognize',
				displayOptions: { show: { resource: ['tool'] } },
				options: [
					{ name: 'Moon H5 / Seedance', value: 'moonOperation', action: 'Run moon h5 verification or seedance asset action' },
					{ name: 'Recognize', value: 'recognize', action: 'Recognize a portrait image' },
					{ name: 'Recognize (Async)', value: 'recognizeAsync', action: 'Recognize a portrait image asynchronously' },
				],
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'createVoice',
				displayOptions: { show: { resource: ['voice'] } },
				options: [
					{ name: 'Create', value: 'createVoice', action: 'Create a KUSOK voice' },
					{ name: 'Create Custom', value: 'createCustomVoice', action: 'Create a custom voice' },
					{ name: 'Delete', value: 'deleteVoice', action: 'Delete a KUSOK voice' },
					{ name: 'Delete Custom', value: 'deleteCustomVoices', action: 'Delete custom voices' },
					{ name: 'Get', value: 'getVoice', action: 'Get a KUSOK voice' },
					{ name: 'Get Custom', value: 'getCustomVoice', action: 'Get a custom voice' },
					{ name: 'List', value: 'listVoices', action: 'List KUSOK voices' },
					{ name: 'List Custom', value: 'listCustomVoices', action: 'List custom voices' },
					{ name: 'List Presets', value: 'listPresetVoices', action: 'List KUSOK preset voices' },
				],
			},
			...kusokFields,
			elementIdProperty,
			voiceIdProperty,
			jobIdProperty,
			payloadProperty,
			waitProperty,
		],
	};

	async execute(this: IExecuteFunctions) {
		return executeFrankLabModule(this, 'kusok', {
			default: 'getTask',
			createElementAsync: 'getAsyncTask',
			recognizeAsync: 'getAsyncTask',
		});
	}
}
