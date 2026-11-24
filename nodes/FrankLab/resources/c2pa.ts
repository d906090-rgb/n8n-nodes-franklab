import type { FrankLabResourceDefinition } from './types';

export const c2paResource: FrankLabResourceDefinition = {
	moduleName: 'c2pa',
	displayName: 'C2PA',
	statusOperation: "listProfiles",
	operationProperty: {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'listProfiles',
		displayOptions: { show: { resource: ['c2pa'] } },
		options: [
	{
		name: "Generate Self-Signed Profile",
		value: "generateSelfSigned",
		action: 'Generate self signed profile'
	},
	{
		name: "List Profiles",
		value: "listProfiles",
		action: 'List profiles'
	},
	{
		name: "Profile Options",
		value: "profileOptions",
		action: 'Profile options'
	},
	{
		name: "Revoke Profile",
		value: "revokeProfile",
		action: 'Revoke profile'
	},
	{
		name: "Verify Asset",
		value: "verify",
		action: 'Verify asset'
	}
		],
	},
	fields: [
	{
		displayName: "Label",
		name: "label",
		type: "string",
		default: "",
		required: true,
		displayOptions: {
			show: {
				operation: [
					"generateSelfSigned"
				]
			}
		}
	},
	{
		displayName: "Media URL",
		name: "url",
		type: "string",
		default: "",
		required: true,
		description: "Public HTTPS URL of the asset to verify. Nothing is stored: the file is read, reported on, and discarded.",
		displayOptions: {
			show: {
				operation: [
					"verify"
				]
			}
		}
	}
],
};
