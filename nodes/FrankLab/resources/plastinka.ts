import type { FrankLabResourceDefinition } from './types';

export const plastinkaResource: FrankLabResourceDefinition = {
	moduleName: 'plastinka',
	displayName: 'PLASTINKA',
	statusOperation: "getStatus",
	operationProperty: {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'processAudio',
		displayOptions: { show: { resource: ['plastinka'] } },
		options: [
	{
		name: "Apply Saved Sample",
		value: "applySample",
		action: 'Apply saved sample'
	},
	{
		name: "Get Job Status",
		value: "getStatus",
		action: 'Get job status'
	},
	{
		name: "List Samples",
		value: "listSamples",
		action: 'List samples'
	},
	{
		name: "Process Audio",
		value: "processAudio",
		action: 'Process audio'
	},
	{
		name: "Save Sample",
		value: "saveSample",
		action: 'Save sample'
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
		displayOptions: {
			show: {
				operation: [
					"processAudio",
					"applySample"
				]
			}
		}
	},
	{
		displayName: "Sample Application Mode",
		name: "sampleOperation",
		type: "options",
		noDataExpression: true,
		default: "overlay",
		options: [
			{
				name: "Fit to Duration",
				value: "fit"
			},
			{
				name: "Overlay",
				value: "overlay"
			},
			{
				name: "Replace Audio",
				value: "replace"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"applySample"
				]
			}
		}
	},
	{
		displayName: "Audio URL",
		name: "audioUrl",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"processAudio"
				]
			}
		}
	},
	{
		displayName: "Sample URL",
		name: "sampleUrl",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"saveSample"
				]
			}
		}
	},
	{
		displayName: "Audio Operation",
		name: "operationName",
		type: "options",
		default: "probe",
		options: [
			{
				name: "Analyze",
				value: "analyze"
			},
			{
				name: "Convert",
				value: "convert"
			},
			{
				name: "Enhance Dialogue",
				value: "enhance_dialogue"
			},
			{
				name: "Extract",
				value: "extract"
			},
			{
				name: "Fade",
				value: "fade"
			},
			{
				name: "Fingerprint",
				value: "fingerprint"
			},
			{
				name: "Fit",
				value: "fit"
			},
			{
				name: "Merge",
				value: "merge"
			},
			{
				name: "Normalize",
				value: "normalize"
			},
			{
				name: "Overlay",
				value: "overlay"
			},
			{
				name: "Probe",
				value: "probe"
			},
			{
				name: "Quality Compare",
				value: "quality_compare"
			},
			{
				name: "Remove",
				value: "remove"
			},
			{
				name: "Replace",
				value: "replace"
			},
			{
				name: "Replace Tags",
				value: "replace_tags"
			},
			{
				name: "Spectrogram",
				value: "spectrogram"
			},
			{
				name: "Speed",
				value: "speed"
			},
			{
				name: "Stereo Tools",
				value: "stereo_tools"
			},
			{
				name: "Strip Tags",
				value: "strip_tags"
			},
			{
				name: "Trim",
				value: "trim"
			},
			{
				name: "Waveform Image",
				value: "waveform_image"
			},
			{
				name: "Write Tags",
				value: "write_tags"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"processAudio"
				]
			}
		}
	},
	{
		displayName: "Reference Audio URL (Quality Compare)",
		name: "referenceAudioUrl",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"processAudio"
				],
				operationName: [
					"quality_compare"
				]
			}
		}
	},
	{
		displayName: "Sample ID",
		name: "sampleId",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"processAudio",
					"applySample"
				]
			}
		}
	},
	{
		displayName: "Sample Name",
		name: "name",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"saveSample"
				]
			}
		}
	}
],
};
