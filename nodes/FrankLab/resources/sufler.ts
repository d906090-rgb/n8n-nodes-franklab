import type { FrankLabResourceDefinition } from './types';

export const suflerResource: FrankLabResourceDefinition = {
	moduleName: 'sufler',
	displayName: 'SUFLER',
	statusOperation: "getStatus",
	operationProperty: {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'subtitles',
		displayOptions: { show: { resource: ['sufler'] } },
		options: [
	{
		name: "Burn Subtitles",
		value: "subtitles",
		action: "Burn subtitles into a video"
	},
	{
		name: "Get Job Status",
		value: "getStatus",
		action: "Get a subtitles job status"
	}
		],
	},
	fields: [
	{
		displayName: "Video URL",
		name: "videoUrl",
		type: "string",
		default: "",
		required: true,
		description: "Public http(s) URL of the video to burn subtitles into",
		displayOptions: {
			show: {
				operation: [
					"subtitles"
				]
			}
		}
	},
	{
		displayName: "Caption Engine",
		name: "captionEngine",
		type: "options",
		noDataExpression: true,
		default: "v2",
		options: [
			{
				name: "V1",
				value: "v1",
				action: "Use the v1 caption engine"
			},
			{
				name: "V2",
				value: "v2",
				action: "Use the v2 caption engine"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"subtitles"
				]
			}
		}
	},
	{
		displayName: "Template ID",
		name: "templateId",
		type: "string",
		default: "",
		description: "Optional subtitle template ID (see FrankLab TextSticker List Subtitle Templates)",
		displayOptions: {
			show: {
				operation: [
					"subtitles"
				]
			}
		}
	},
	{
		displayName: "Language",
		name: "language",
		type: "string",
		default: "",
		description: "Source language code, for example ru or en",
		displayOptions: {
			show: {
				operation: [
					"subtitles"
				]
			}
		}
	},
	{
		displayName: "Transcription Engine",
		name: "transcriptionEngine",
		type: "options",
		noDataExpression: true,
		default: "",
		options: [
			{
				name: "Auto",
				value: "",
				action: "Let the server pick the transcription engine"
			},
			{
				name: "ElevenLabs Scribe V2",
				value: "elevenlabs_scribe",
				action: "Use ElevenLabs Scribe transcription"
			},
			{
				name: "Gemini",
				value: "gemini",
				action: "Use Gemini transcription"
			},
			{
				name: "Whisper",
				value: "whisper",
				action: "Use Whisper transcription"
			},
			{
				name: "xAI Grok Transcribe",
				value: "xai_grok_transcribe",
				action: "Use xAI Grok transcription"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"subtitles"
				]
			}
		}
	},
	{
		displayName: "Highlight Mode",
		name: "highlightMode",
		type: "string",
		default: "",
		description: "Optional word highlight mode",
		displayOptions: {
			show: {
				operation: [
					"subtitles"
				]
			}
		}
	},
	{
		displayName: "Platform",
		name: "platform",
		type: "string",
		default: "",
		description: "Optional target platform preset",
		displayOptions: {
			show: {
				operation: [
					"subtitles"
				]
			}
		}
	},
	{
		displayName: "Safe Zone Preset",
		name: "safeZonePreset",
		type: "string",
		default: "",
		description: "Optional safe zone preset ID",
		displayOptions: {
			show: {
				operation: [
					"subtitles"
				]
			}
		}
	}
],
};
