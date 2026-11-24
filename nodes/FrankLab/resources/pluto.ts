import type { FrankLabResourceDefinition } from './types';

export const plutoResource: FrankLabResourceDefinition = {
	moduleName: 'pluto',
	displayName: 'PLUTO',
	statusOperation: {
	default: "getAudioStatus",
	videoToAudio: "getVideoAudioStatus"
},
	operationProperty: {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'textToAudio',
		displayOptions: { show: { resource: ['pluto'] } },
		options: [
	{
		name: "Get Audio Status",
		value: "getAudioStatus",
		action: "Get a text to audio task status"
	},
	{
		name: "Get Video Audio Status",
		value: "getVideoAudioStatus",
		action: "Get a video to audio task status"
	},
	{
		name: "Text to Audio",
		value: "textToAudio",
		action: "Generate audio from a text prompt"
	},
	{
		name: "Video to Audio",
		value: "videoToAudio",
		action: "Generate audio for a video"
	}
		],
	},
	fields: [
	{
		displayName: "Prompt",
		name: "prompt",
		type: "string",
		typeOptions: {
			rows: 4
		},
		default: "",
		required: true,
		description: "Audio generation prompt",
		displayOptions: {
			show: {
				operation: [
					"textToAudio"
				]
			}
		}
	},
	{
		displayName: "Video URL",
		name: "video_url",
		type: "string",
		default: "",
		description: "Public http(s) video URL for video-to-audio (provider video IDs go via Additional JSON video_id)",
		displayOptions: {
			show: {
				operation: [
					"videoToAudio"
				]
			}
		}
	}
],
};
