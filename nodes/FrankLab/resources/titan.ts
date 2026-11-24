import type { FrankLabResourceDefinition } from './types';

export const titanResource: FrankLabResourceDefinition = {
	moduleName: 'titan',
	displayName: 'TITAN',
	statusOperation: {
	default: "getTask"
},
	operationProperty: {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'createVideo',
		displayOptions: { show: { resource: ['titan'] } },
		options: [
	{
		name: "Add Selection",
		value: "addSelection",
		action: "Add elements to the selection"
	},
	{
		name: "Clear Selection",
		value: "clearSelection",
		action: "Clear the selection"
	},
	{
		name: "Create Video",
		value: "createVideo",
		action: "Create a multi element video"
	},
	{
		name: "Delete Selection",
		value: "deleteSelection",
		action: "Delete elements from the selection"
	},
	{
		name: "Get Task",
		value: "getTask",
		action: "Get a multi element task"
	},
	{
		name: "Init Selection",
		value: "initSelection",
		action: "Initialize the selection"
	},
	{
		name: "List Tasks",
		value: "listTasks",
		action: "List multi element tasks"
	},
	{
		name: "Preview Selection",
		value: "previewSelection",
		action: "Preview the selection"
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
					"createVideo"
				]
			}
		}
	},
	{
		displayName: "Page Number",
		name: "pageNum",
		type: "number",
		default: "",
		description: "Optional results page for List Tasks",
		displayOptions: {
			show: {
				operation: [
					"listTasks"
				]
			}
		}
	},
	{
		displayName: "Page Size",
		name: "pageSize",
		type: "number",
		default: "",
		description: "Optional page size for List Tasks",
		displayOptions: {
			show: {
				operation: [
					"listTasks"
				]
			}
		}
	}
],
};
