import type { ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

export class FrankLabApi implements ICredentialType {
	name = 'frankLabApi';
	displayName = 'FrankLab API';
	documentationUrl = 'https://github.com/d906090-rgb/n8n-nodes-franklab#credentials';
	icon = 'file:franklab.svg' as const;

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'options',
			default: 'https://apergrex.ru/franklab/api',
			options: [
				{
					name: 'Apergrex Production',
					value: 'https://apergrex.ru/franklab/api',
				},
				{
					name: 'Apergrex Production Root',
					value: 'https://apergrex.ru',
				},
				{
					name: 'FrankLab Production (Legacy)',
					value: 'https://franklab.ru/franklab/api',
				},
				{
					name: 'FrankLab Production Root (Legacy)',
					value: 'https://franklab.ru',
				},
			],
			required: true,
			description: 'Supported production origins: https://apergrex.ru and https://franklab.ru.',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://apergrex.ru/franklab/api',
			url: '/franklab/integrations/text-sticker/auth/stats',
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};
}
