import assert from 'node:assert/strict';
import { test } from 'node:test';

const { executeFrankLabModule } = await import('../dist/nodes/shared/node-utils.js');

test('KLEY videoSpeed ignores unrelated optional node parameters when building payload', async () => {
	const parameters = {
		operation: 'videoSpeed',
		payloadJson: '{}',
		videoUrl: 'https://cdn.example.com/input.mp4',
		speed: 2,
		waitForCompletion: false,
	};
	const requests = [];
	const context = {
		getInputData() {
			return [{ json: {} }];
		},
		async getCredentials(name) {
			assert.equal(name, 'frankLabApi');
			return {
				baseUrl: 'https://franklab.ru/franklab/api',
				apiKey: 'test_public_key',
			};
		},
		getNodeParameter(name) {
			if (!(name in parameters)) {
				throw new Error('Could not get parameter');
			}
			return parameters[name];
		},
		getNode() {
			return { name: 'FrankLab KLEY', type: '@apergrex/n8n-nodes-franklab.frankLabKley' };
		},
		continueOnFail() {
			return false;
		},
		helpers: {
			async httpRequest(request) {
				requests.push(request);
				return {
					success: true,
					data: { taskId: 'job_1', status: 'queued' },
				};
			},
		},
	};

	const result = await executeFrankLabModule(context, 'kley', 'getStatus');

	assert.equal(result[0][0].json.taskId, 'job_1');
	assert.equal(requests.length, 1);
	assert.equal(requests[0].url, 'https://franklab.ru/franklab/api/franklab/jobs/video-speed');
	assert.deepEqual(requests[0].body, {
		videoUrl: 'https://cdn.example.com/input.mp4',
		speed: 2,
	});
});
