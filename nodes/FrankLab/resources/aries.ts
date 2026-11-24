import type { FrankLabResourceDefinition } from './types';

export const ariesResource: FrankLabResourceDefinition = {
	moduleName: 'aries',
	displayName: 'Aries',
	statusOperation: "",
	operationProperty: {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'getStatus',
		displayOptions: { show: { resource: ['aries'] } },
		options: [
	{
		name: "Get Status",
		value: "getStatus",
		action: "Get a try on task status"
	}
		],
	},
	fields: [],
};
