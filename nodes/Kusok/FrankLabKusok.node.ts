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
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'createElement',
				options: [
					{ name: 'Create Custom Voice', value: 'createCustomVoice', action: 'Create a custom voice' },
					{ name: 'Create Element', value: 'createElement', action: 'Create a KUSOK element' },
					{ name: 'Create Element (Async)', value: 'createElementAsync', action: 'Create a KUSOK element asynchronously' },
					{ name: 'Create Voice', value: 'createVoice', action: 'Create a KUSOK voice' },
					{ name: 'Delete Custom Voices', value: 'deleteCustomVoices', action: 'Delete custom voices' },
					{ name: 'Delete Element', value: 'deleteElement', action: 'Delete a KUSOK element' },
					{ name: 'Delete Voice', value: 'deleteVoice', action: 'Delete a KUSOK voice' },
					{ name: 'Get Advanced Preset', value: 'getAdvancedPreset', action: 'Get an advanced preset element' },
					{ name: 'Get Async Task', value: 'getAsyncTask', action: 'Get a KUSOK async task' },
					{ name: 'Get Custom Voice', value: 'getCustomVoice', action: 'Get a custom voice' },
					{ name: 'Get Element', value: 'getElement', action: 'Get a KUSOK element' },
					{ name: 'Get Task', value: 'getTask', action: 'Get a KUSOK task' },
					{ name: 'Get Voice', value: 'getVoice', action: 'Get a KUSOK voice' },
					{ name: 'List Advanced Presets', value: 'listAdvancedPresets', action: 'List advanced preset elements' },
					{ name: 'List Custom Voices', value: 'listCustomVoices', action: 'List custom voices' },
					{ name: 'List Element Tags', value: 'listTags', action: 'List element tags' },
					{ name: 'List Element Voices', value: 'listElementVoices', action: 'List element voices' },
					{ name: 'List Elements', value: 'listElements', action: 'List KUSOK elements' },
					{ name: 'List Preset Voices', value: 'listPresetVoices', action: 'List KUSOK preset voices' },
					{ name: 'List Voices', value: 'listVoices', action: 'List KUSOK voices' },
					{ name: 'Recognize', value: 'recognize', action: 'Recognize a portrait image' },
					{ name: 'Recognize (Async)', value: 'recognizeAsync', action: 'Recognize a portrait image asynchronously' },
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
