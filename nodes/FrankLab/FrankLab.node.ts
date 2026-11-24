import type { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, JsonObject } from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import {
	createN8nFrankLabClient,
	createNodeApiError,
	executeFrankLabItem,
	jobIdProperty,
	payloadProperty,
	profileIdProperty,
	waitProperty,
} from '../shared/node-utils';
import type { FrankLabModule } from '../shared/registry';
import {
	FRANKLAB_RESOURCE_MAP,
	OPERATION_PROPERTIES,
	RESOURCE_FIELD_PROPERTIES,
	RESOURCE_PROPERTY,
} from './resources';

export class FrankLab implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FrankLab',
		name: 'frankLab',
		icon: { light: 'file:franklab.svg', dark: 'file:franklab.dark.svg' },
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		group: ['transform'],
		version: 1,
		description:
			'Generate and process video, images, audio, speech, subtitles, C2PA credentials, and social posts with FrankLab (Apergrex).',
		defaults: {
			name: 'FrankLab',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'frankLabApi',
				required: true,
			},
		],
		usableAsTool: true,
		properties: [
			RESOURCE_PROPERTY,
			...OPERATION_PROPERTIES,
			...RESOURCE_FIELD_PROPERTIES,
			profileIdProperty,
			jobIdProperty,
			payloadProperty,
			waitProperty,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const client = await createN8nFrankLabClient(this);
		const output: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
			try {
				const resourceName = this.getNodeParameter('resource', itemIndex) as FrankLabModule;
				const resourceDef = FRANKLAB_RESOURCE_MAP[resourceName];
				if (!resourceDef) {
					throw new NodeOperationError(this.getNode(), `Unknown FrankLab resource: ${String(resourceName)}`, { itemIndex });
				}
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				const finalResult = resourceDef.executeItem
					? await resourceDef.executeItem(this, client, itemIndex, operation)
					: await executeFrankLabItem(this, client, itemIndex, resourceDef.moduleName, operation, resourceDef.statusOperation);
				output.push({ json: finalResult as JsonObject, pairedItem: itemIndex });
			} catch (error) {
				if (this.continueOnFail()) {
					output.push({ json: { error: error instanceof Error ? error.message : String(error) }, pairedItem: itemIndex });
					continue;
				}
				throw createNodeApiError(this, error, itemIndex);
			}
		}

		return [output];
	}
}
