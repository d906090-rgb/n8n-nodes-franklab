import type { FrankLabResourceDefinition } from './types';

export const dolaResource: FrankLabResourceDefinition = {
	moduleName: 'dola',
	displayName: 'DOLA',
	statusOperation: "getTask",
	operationProperty: {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'generate',
		displayOptions: { show: { resource: ['dola'] } },
		options: [
	{
		name: "Delete File",
		value: "deleteFile",
		action: "Delete a DOLA file"
	},
	{
		name: "File From URL",
		value: "fileFromUrl",
		action: "Import a file from a public URL"
	},
	{
		name: "Generate Text",
		value: "generate",
		action: "Generate text with an LLM"
	},
	{
		name: "Get File",
		value: "getFile",
		action: "Get a DOLA file"
	},
	{
		name: "Get Task",
		value: "getTask",
		action: "Get a DOLA billing task"
	},
	{
		name: "List Files",
		value: "listFiles",
		action: "List DOLA files"
	},
	{
		name: "List Models",
		value: "listModels",
		action: "List DOLA models"
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
		displayOptions: {
			show: {
				operation: [
					"generate"
				]
			}
		}
	},
	{
		displayName: "System Prompt",
		name: "system_prompt",
		type: "string",
		typeOptions: {
			rows: 4
		},
		default: "",
		displayOptions: {
			show: {
				operation: [
					"generate"
				]
			}
		}
	},
	{
		displayName: "Model Key",
		name: "model_key",
		type: "string",
		default: "",
		placeholder: "gemini_4_neon",
		description: "Optional model key (e.g. gemini_4_carbon, gemini_4_neon, gemini_4_hydrogen, gemini_4_argon, gemini_3_8_flash, opus, sonnet, gpt6_astra; see List Models)",
		displayOptions: {
			show: {
				operation: [
					"generate"
				]
			}
		}
	},
	{
		displayName: "Thinking Level",
		name: "thinking_level",
		type: "options",
		default: "",
		description: "Optional reasoning effort for Gemini models (xhigh is supported by gemini_4_neon and gemini_4_hydrogen)",
		options: [
			{
				name: "High",
				value: "high",
				action: "Use high thinking effort"
			},
			{
				name: "Low",
				value: "low",
				action: "Use low thinking effort"
			},
			{
				name: "Medium",
				value: "medium",
				action: "Use medium thinking effort"
			},
			{
				name: "Model Default",
				value: "",
				action: "Use the model default thinking level"
			},
			{
				name: "XHigh (Neon / Hydrogen)",
				value: "xhigh",
				action: "Use xhigh thinking effort (Gemini 4 Neon and Hydrogen)"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"generate"
				]
			}
		}
	},
	{
		displayName: "Async Mode",
		name: "async_mode",
		type: "boolean",
		default: false,
		description: "Whether to return a billing task ID immediately and poll with Get Task",
		displayOptions: {
			show: {
				operation: [
					"generate"
				]
			}
		}
	},
	{
		displayName: "Response Format",
		name: "response_format",
		type: "options",
		noDataExpression: true,
		default: "text",
		options: [
			{
				name: "Text",
				value: "text",
				action: "Return plain text"
			},
			{
				name: "JSON Object",
				value: "json_object",
				action: "Return a JSON object"
			},
			{
				name: "JSON Schema",
				value: "json_schema",
				action: "Return JSON matching a schema (pass json_schema in Additional JSON)"
			}
		],
		displayOptions: {
			show: {
				operation: [
					"generate"
				]
			}
		}
	},
	{
		displayName: "Max Tokens",
		name: "max_tokens",
		type: "number",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"generate"
				]
			}
		}
	},
	{
		displayName: "Temperature",
		name: "temperature",
		type: "number",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"generate"
				]
			}
		}
	},
	{
		displayName: "File URL",
		name: "url",
		type: "string",
		default: "",
		required: true,
		description: "Public http(s) URL of the file to import",
		displayOptions: {
			show: {
				operation: [
					"fileFromUrl"
				]
			}
		}
	},
	{
		displayName: "Filename",
		name: "filename",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"fileFromUrl"
				]
			}
		}
	},
	{
		displayName: "Purpose",
		name: "purpose",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				operation: [
					"fileFromUrl"
				]
			}
		}
	},
	{
		displayName: "File ID",
		name: "file_id",
		type: "string",
		default: "",
		required: true,
		displayOptions: {
			show: {
				operation: [
					"getFile",
					"deleteFile"
				]
			}
		}
	}
],
};
