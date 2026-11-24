import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import type { FrankLabClient } from '../../shared/client';
import type { FrankLabModule } from '../../shared/registry';

export interface FrankLabResourceDefinition {
	moduleName: FrankLabModule;
	displayName: string;
	operationProperty: INodeProperties;
	fields: INodeProperties[];
	statusOperation: string | Record<string, string>;
	executeItem?: (
		context: IExecuteFunctions,
		client: FrankLabClient,
		itemIndex: number,
		operation: string,
	) => Promise<Record<string, unknown>>;
}
