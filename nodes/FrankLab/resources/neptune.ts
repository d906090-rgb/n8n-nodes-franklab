import type { FrankLabResourceDefinition } from './types';

export const neptuneResource: FrankLabResourceDefinition = {
	moduleName: 'neptune',
	displayName: 'NEPTUNE',
	statusOperation: "getTask",
	operationProperty: {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'textToSpeech',
		displayOptions: { show: { resource: ['neptune'] } },
		options: [
	{
		name: "Get Task",
		value: "getTask",
		action: "Get a TTS task"
	},
	{
		name: "List Voices",
		value: "listVoices",
		action: "List TTS voices"
	},
	{
		name: "Text to Speech",
		value: "textToSpeech",
		action: "Generate speech from text"
	}
		],
	},
	fields: [
	{
		displayName: "Text",
		name: "text",
		type: "string",
		typeOptions: {
			rows: 4
		},
		default: "",
		required: true,
		displayOptions: {
			show: {
				operation: [
					"textToSpeech"
				]
			}
		}
	},
	{
		displayName: "Voice",
		name: "voice",
		type: "string",
		default: "",
		description: "Optional voice identifier (see List Voices)",
		displayOptions: {
			show: {
				operation: [
					"textToSpeech"
				]
			}
		}
	},
	{
		displayName: "Model",
		name: "model",
		type: "string",
		default: "",
		description: "Optional model identifier",
		displayOptions: {
			show: {
				operation: [
					"textToSpeech"
				]
			}
		}
	}
],
};
