import type { IExecuteFunctions, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeFrankLabModule, profileIdProperty } from '../shared/node-utils';

export class FrankLabC2pa implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FrankLab C2PA',
		name: 'frankLabC2pa',
		icon: { light: 'file:c2pa.svg', dark: 'file:c2pa.dark.svg' },
		subtitle: '={{$parameter["operation"]}}',
		group: ['transform'],
		version: 1,
		description: 'Manage safe FrankLab C2PA signer profiles and verify Content Credentials on any asset.',
		defaults: {
			name: 'FrankLab C2PA',
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
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'listProfiles',
				options: [
					{ name: 'Generate Self-Signed Profile', value: 'generateSelfSigned' },
					{ name: 'List Profiles', value: 'listProfiles' },
					{ name: 'Profile Options', value: 'profileOptions' },
					{ name: 'Revoke Profile', value: 'revokeProfile' },
					{ name: 'Verify Asset', value: 'verify' },
				],
			},
			{
				displayName: 'Label',
				name: 'label',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { operation: ['generateSelfSigned'] } },
			},
			{
				displayName: 'Media URL',
				name: 'url',
				type: 'string',
				default: '',
				required: true,
				description: 'Public HTTPS URL of the asset to verify. Nothing is stored: the file is read, reported on, and discarded.',
				displayOptions: { show: { operation: ['verify'] } },
			},
			profileIdProperty,
		],
	};

	// continueOnFail() is handled centrally in executeFrankLabModule() — see nodes/shared/node-utils.ts:
	// each item runs in a try/catch that checks this.continueOnFail() and otherwise throws a
	// NodeOperationError with { itemIndex }. The rule only scans the execute() body, so it cannot see the
	// handling across the helper boundary (confirmed false positive).
	async execute(this: IExecuteFunctions) {
		return executeFrankLabModule(this, 'c2pa', 'listProfiles');
	}
}
