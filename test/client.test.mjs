import assert from 'node:assert/strict';
import { test } from 'node:test';

const { createFrankLabClient } = await import('../dist/nodes/shared/client.js');

function jsonResponse(body, status = 200) {
	return {
		ok: status >= 200 && status < 300,
		status,
		async json() {
			return body;
		},
		async text() {
			return JSON.stringify(body);
		},
	};
}

test('client sends Bearer auth to FrankLab-origin HOLST routes through the provided transport', async () => {
	const calls = [];
	const client = createFrankLabClient({
		baseUrl: 'https://franklab.ru',
		apiKey: 'test_public_key',
		fetch: async (url, init) => {
			calls.push({ url, init });
			assert.equal(new URL(url).origin, 'https://franklab.ru');
			return jsonResponse({ success: true, data: { taskId: 'job_1', status: 'queued' } });
		},
	});

	const result = await client.request('holst.submitImage', {
		imageUrl: 'https://cdn.example.com/image.png',
		operation: 'info',
	});

	assert.equal(result.taskId, 'job_1');
	assert.equal(calls.length, 1);
	assert.equal(calls[0].url, 'https://franklab.ru/franklab/api/franklab/jobs/image');
	assert.equal(calls[0].init.method, 'POST');
	assert.equal(calls[0].init.headers.Authorization, 'Bearer test_public_key');
	assert.equal(calls[0].init.headers['X-API-Key'], undefined);
});

test('client sends X-API-Key auth to VOLNA routes and does not retry failed POST submits', async () => {
	let attempts = 0;
	const client = createFrankLabClient({
		baseUrl: 'https://franklab.ru/franklab/api',
		apiKey: 'test_public_key',
		fetch: async () => {
			attempts += 1;
			return jsonResponse({ success: false, message: 'temporary failure' }, 503);
		},
	});

	await assert.rejects(
		() => client.request('volna.textToSpeech', { text: 'Hello', voice_id: 'voice' }),
		/temporary failure/,
	);
	assert.equal(attempts, 1);
});

test('client sets first-class VOLNA TTS operation values on shared TTS route', async () => {
	const calls = [];
	const client = createFrankLabClient({
		baseUrl: 'https://franklab.ru',
		apiKey: 'test_public_key',
		fetch: async (url, init) => {
			calls.push({ url, init });
			return jsonResponse({ code: 200, data: { taskId: 'task_1', status: 'queued' } });
		},
	});

	await client.request('volna.textToDialogue', { text: '[Speaker 1] Hi', voice_id: 'v1', voice_id_2: 'v2' });
	await client.request('volna.textToSpeechTurbo', { text: 'Hello', voice_id: 'v1' });
	await client.request('volna.googleTts', { text: 'Hello', google_tts_mode: 'single', google_voice_name: 'Kore' });

	assert.equal(JSON.parse(calls[0].init.body).operation, 'text-to-dialogue');
	assert.equal(JSON.parse(calls[1].init.body).operation, 'text-to-speech-turbo');
	assert.equal(JSON.parse(calls[2].init.body).operation, 'google-3-1-tts');
	assert.equal(calls.every((call) => call.url === 'https://franklab.ru/franklab/api/make/volna/tts'), true);
});

test('client polls VOLNA dubbing through the dedicated dubbing status route', async () => {
	const calls = [];
	const client = createFrankLabClient({
		baseUrl: 'https://franklab.ru',
		apiKey: 'test_public_key',
		fetch: async (url, init) => {
			calls.push({ url, init });
			return jsonResponse({ code: 200, data: { taskId: 'dub_1', status: 'completed' } });
		},
	});

	const result = await client.poll('volna.getDubbing', 'dub_1', { delayMs: 0, maxAttempts: 1 });

	assert.equal(result.taskId, 'dub_1');
	assert.equal(result.status, 'completed');
	assert.equal(calls[0].url, 'https://franklab.ru/franklab/api/make/volna/dubbing/dub_1');
	assert.equal(calls[0].init.method, 'GET');
});

test('client rejects public C2PA payloads that try to include private material', async () => {
	const calls = [];
	const privateKeyField = 'private' + 'KeyPem';
	const certChainField = 'certificate' + 'ChainPem';
	const client = createFrankLabClient({
		baseUrl: 'https://franklab.ru',
		apiKey: 'test_public_key',
		fetch: async (url, init) => {
			calls.push({ url, init });
			return jsonResponse({ success: true, data: { profileId: 'profile_1', status: 'active' } });
		},
	});

	await assert.rejects(
		() => client.request('c2pa.generateSelfSigned', {
			label: 'Unsafe',
			nested: {
				[privateKeyField]: 'hidden',
				[certChainField]: 'hidden',
			},
		}),
		/C2PA private material is not supported/,
	);
	assert.equal(calls.length, 0);
});

test('client extracts C2PA profile options as n8n option objects', async () => {
	const client = createFrankLabClient({
		baseUrl: 'https://franklab.ru',
		apiKey: 'test_public_key',
		fetch: async () => jsonResponse({
			success: true,
			data: [{ id: 'profile_1', label: 'Primary profile' }],
		}),
	});

	const result = await client.request('c2pa.profileOptions');

	assert.deepEqual(result.options, [{ name: 'Primary profile', value: 'profile_1' }]);
});

test('polling stops at terminal success and recovers task ids from status-only outputs', async () => {
	const statuses = ['queued', 'processing', 'completed'];
	const client = createFrankLabClient({
		baseUrl: 'https://franklab.ru',
		apiKey: 'test_public_key',
		fetch: async () => {
			const status = statuses.shift();
			return jsonResponse({ success: true, data: { status, downloadUrl: 'https://cdn.example.com/result.mp4' } });
		},
	});

	const result = await client.poll('kley.getStatus', 'job_from_submit', { delayMs: 0, maxAttempts: 5 });

	assert.equal(result.taskId, 'job_from_submit');
	assert.equal(result.status, 'completed');
	assert.equal(result.downloadUrl, 'https://cdn.example.com/result.mp4');
	assert.equal(statuses.length, 0);
});
