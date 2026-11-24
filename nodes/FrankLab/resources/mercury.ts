import type { FrankLabResourceDefinition } from './types';

export const mercuryResource: FrankLabResourceDefinition = {
	moduleName: 'mercury',
	displayName: 'MERCURY',
	statusOperation: {
	default: "getLipSyncStatus",
	advancedLipSync: "getAdvancedLipSyncStatus",
	identifyFace: ""
},
	operationProperty: {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'lipSync',
		displayOptions: { show: { resource: ['mercury'] } },
		options: [
	{
		name: "Advanced Lip Sync",
		value: "advancedLipSync",
		action: "Run an advanced lip sync"
	},
	{
		name: "Get Advanced Lip Sync Status",
		value: "getAdvancedLipSyncStatus",
		action: "Get an advanced lip sync status"
	},
	{
		name: "Get Lip Sync Status",
		value: "getLipSyncStatus",
		action: "Get a lip sync status"
	},
	{
		name: "Identify Face",
		value: "identifyFace",
		action: "Identify faces in an image"
	},
	{
		name: "Lip Sync",
		value: "lipSync",
		action: "Lip sync a video to audio"
	}
		],
	},
	fields: [
	{
		displayName: "Video URL",
		name: "video_url",
		type: "string",
		default: "",
		required: true,
		description: "Public http(s) URL of the video to lip-sync",
		displayOptions: {
			show: {
				operation: [
					"lipSync",
					"advancedLipSync"
				]
			}
		}
	},
	{
		displayName: "Audio URL",
		name: "audio_url",
		type: "string",
		default: "",
		required: true,
		description: "Public http(s) URL of the speech audio",
		displayOptions: {
			show: {
				operation: [
					"lipSync",
					"advancedLipSync"
				]
			}
		}
	},
	{
		displayName: "Image URL",
		name: "image_url",
		type: "string",
		default: "",
		required: true,
		description: "Public http(s) image for face identification",
		displayOptions: {
			show: {
				operation: [
					"identifyFace"
				]
			}
		}
	}
],
};
