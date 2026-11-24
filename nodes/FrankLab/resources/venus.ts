import type { FrankLabResourceDefinition } from './types';

export const venusResource: FrankLabResourceDefinition = {
	moduleName: 'venus',
	displayName: 'VENUS',
	statusOperation: "getStatus",
	operationProperty: {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'avatarVideo',
		displayOptions: { show: { resource: ['venus'] } },
		options: [
	{
		name: "Create Avatar Video",
		value: "avatarVideo",
		action: "Generate an avatar video"
	},
	{
		name: "Get Status",
		value: "getStatus",
		action: "Get an avatar video task status"
	}
		],
	},
	fields: [
	{
		displayName: "Image URL",
		name: "image",
		type: "string",
		default: "",
		required: true,
		description: "Public http(s) URL of the avatar portrait image",
		displayOptions: {
			show: {
				operation: [
					"avatarVideo"
				]
			}
		}
	},
	{
		displayName: "Sound File URL",
		name: "sound_file",
		type: "string",
		default: "",
		description: "Public http(s) URL of the audio for the avatar speech",
		displayOptions: {
			show: {
				operation: [
					"avatarVideo"
				]
			}
		}
	},
	{
		displayName: "Audio ID",
		name: "audio_id",
		type: "string",
		default: "",
		description: "Optional previously uploaded audio ID instead of a URL",
		displayOptions: {
			show: {
				operation: [
					"avatarVideo"
				]
			}
		}
	},
	{
		displayName: "Prompt",
		name: "prompt",
		type: "string",
		typeOptions: {
			rows: 4
		},
		default: "",
		displayOptions: {
			show: {
				operation: [
					"avatarVideo"
				]
			}
		}
	},
	{
		displayName: "Mode",
		name: "mode",
		type: "string",
		default: "",
		description: "Optional generation mode",
		displayOptions: {
			show: {
				operation: [
					"avatarVideo"
				]
			}
		}
	}
],
};
