import type { FrankLabResourceDefinition } from './types';

export const volnaResource: FrankLabResourceDefinition = {
	moduleName: 'volna',
	displayName: 'VOLNA',
	statusOperation: {
	default: "getTask",
	dubbing: "getDubbing"
},
	operationProperty: {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'textToSpeech',
		displayOptions: { show: { resource: ['volna'] } },
		options: [
	{
		name: "Audio Isolation",
		value: "audioIsolation",
		action: "Audio isolation an audio"
	},
	{
		name: "Create Dubbing",
		value: "dubbing",
		action: "Create a dubbing job"
	},
	{
		name: "Get Dubbing Status",
		value: "getDubbing",
		action: "Get dubbing status"
	},
	{
		name: "Get Task",
		value: "getTask",
		action: "Get task a task"
	},
	{
		name: "Get Usage",
		value: "usage",
		action: "Get audio usage"
	},
	{
		name: "Google 3.1 TTS",
		value: "googleTts",
		action: "Generate google 3 1 tts audio"
	},
	{
		name: "Google 3.8 Flash Lite TTS",
		value: "googleTts38FlashLite",
		action: "Generate google 3 8 flash lite tts audio"
	},
	{
		name: "Google 3.8 TTS",
		value: "googleTts38",
		action: "Generate google 3 8 tts audio"
	},
	{
		name: "Google Speech to Text",
		value: "googleTranscribe",
		action: "Transcribe audio with google gemini 3 5"
	},
	{
		name: "List ElevenLabs Voices (RPC)",
		value: "listElevenLabsVoicesRpc",
		action: "List eleven labs voices via rpc"
	},
	{
		name: "List Google Voices (RPC)",
		value: "listGoogleVoicesRpc",
		action: "List google gemini voices via rpc"
	},
	{
		name: "List Models",
		value: "listModels",
		action: "List models a model"
	},
	{
		name: "List Voices",
		value: "listVoices",
		action: "List voices a voice"
	},
	{
		name: "List xAI Voices",
		value: "xaiVoiceList",
		action: "List x ai voices via volna"
	},
	{
		name: "List xAI Voices (RPC)",
		value: "listXaiVoicesRpc",
		action: "List x ai voices via rpc"
	},
	{
		name: "Save Designed Voice",
		value: "voiceDesignSave",
		action: "Save designed voice a voice"
	},
	{
		name: "Seed Audio 1.0",
		value: "seedAudio",
		action: "Generate audio with byte plus seed audio 1 0"
	},
	{
		name: "Sound Effect",
		value: "soundEffect",
		action: "Sound effect an audio"
	},
	{
		name: "Speech to Text (ElevenLabs)",
		value: "transcribe",
		action: "Transcribe audio with eleven labs"
	},
	{
		name: "Text to Dialogue",
		value: "textToDialogue",
		action: "Generate dialogue audio"
	},
	{
		name: "Text to Speech",
		value: "textToSpeech",
		action: "Generate speech with eleven labs"
	},
	{
		name: "Text to Speech Turbo",
		value: "textToSpeechTurbo",
		action: "Generate turbo speech audio"
	},
	{
		name: "Text to Speech V4",
		value: "textToSpeechV4",
		action: "Generate speech with eleven labs v4"
	},
	{
		name: "Text to Speech V4 Turbo",
		value: "textToSpeechV4Turbo",
		action: "Generate speech with eleven labs v4 turbo"
	},
	{
		name: "Voice Clone",
		value: "voiceClone",
		action: "Voice clone a voice"
	},
	{
		name: "Voice Design",
		value: "voiceDesign",
		action: "Voice design a voice"
	},
	{
		name: "xAI Grok Speech to Text",
		value: "xaiTranscribe",
		action: "Transcribe audio with x ai grok"
	},
	{
		name: "xAI Grok TTS",
		value: "xaiTts",
		action: "Generate speech with x ai grok tts"
	}
		],
	},
	fields: [
	{
		displayName: "Text",
		name: "text",
		type: "string",
		default: "",
		typeOptions: {
			rows: 4
		},
		displayOptions: {
			show: {
				operation: [
					"textToSpeech",
					"textToSpeechV4",
					"textToSpeechV4Turbo",
					"textToDialogue",
					"textToSpeechTurbo",
					"googleTts",
					"googleTts38",
					"googleTts38FlashLite",
					"xaiTts",
					"soundEffect",
					"voiceDesign"
				]
			}
		}
	},
	{
		displayName: "Text Prompt (Seed Audio 1.0)",
		name: "text_prompt",
		type: "string",
		default: "",
		typeOptions: {
			rows: 4
		},
		description: "Prompt text for BytePlus Seed Audio 1.0 (max 3000 chars)",
		displayOptions: {
			show: {
				operation: [
					"seedAudio"
				]
			}
		}
	},
	{
		displayName: "Voice ID",
		name: "voice_id",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"textToSpeech",
					"textToSpeechV4",
					"textToSpeechV4Turbo",
					"textToDialogue",
					"textToSpeechTurbo",
					"xaiTts"
				]
			}
		}
	},
	{
		displayName: "Second Voice ID",
		name: "voice_id_2",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"textToDialogue"
				]
			}
		}
	},
	{
		displayName: "Google TTS Mode",
		name: "google_tts_mode",
		type: "options",
		default: "single",
		displayOptions: {
			show: {
				operation: [
					"googleTts",
					"googleTts38",
					"googleTts38FlashLite"
				]
			}
		},
		options: [
			{
				name: "Single Speaker",
				value: "single"
			},
			{
				name: "Two Speakers",
				value: "multi"
			}
		]
	},
	{
		displayName: "Google Voice Name",
		name: "google_voice_name",
		type: "string",
		default: "Kore",
		displayOptions: {
			show: {
				operation: [
					"googleTts",
					"googleTts38",
					"googleTts38FlashLite"
				]
			}
		}
	},
	{
		displayName: "Speaker 1 Name",
		name: "speaker_1_name",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"googleTts",
					"googleTts38",
					"googleTts38FlashLite"
				]
			}
		}
	},
	{
		displayName: "Speaker 1 Voice",
		name: "speaker_1_voice",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"googleTts",
					"googleTts38",
					"googleTts38FlashLite"
				]
			}
		}
	},
	{
		displayName: "Speaker 2 Name",
		name: "speaker_2_name",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"googleTts",
					"googleTts38",
					"googleTts38FlashLite"
				]
			}
		}
	},
	{
		displayName: "Speaker 2 Voice",
		name: "speaker_2_voice",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"googleTts",
					"googleTts38",
					"googleTts38FlashLite"
				]
			}
		}
	},
	{
		displayName: "Style Prompt",
		name: "style_prompt",
		type: "string",
		default: "",
		typeOptions: {
			rows: 3
		},
		displayOptions: {
			show: {
				operation: [
					"googleTts",
					"googleTts38",
					"googleTts38FlashLite"
				]
			}
		}
	},
	{
		displayName: "Audio URL",
		name: "audio_url",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"transcribe",
					"xaiTranscribe",
					"googleTranscribe",
					"audioIsolation"
				]
			}
		}
	},
	{
		displayName: "Name",
		name: "name",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"voiceClone",
					"dubbing"
				]
			}
		}
	},
	{
		displayName: "Source URL",
		name: "source_url",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"dubbing"
				]
			}
		}
	},
	{
		displayName: "Target Language",
		name: "target_lang",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"dubbing"
				]
			}
		}
	},
	{
		displayName: "Source Language",
		name: "source_lang",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"dubbing"
				]
			}
		}
	}
],
};
