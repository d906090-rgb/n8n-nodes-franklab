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

test('client submits MOON videos with X-API-Key and polls the moon status route', async () => {
	const calls = [];
	const client = createFrankLabClient({
		baseUrl: 'https://franklab.ru',
		apiKey: 'test_public_key',
		fetch: async (url, init) => {
			calls.push({ url, init });
			if (calls.length === 1) {
				return jsonResponse({ success: true, data: { task_id: 'moon_1', status: 'queued', final_cost_franks: 10 } });
			}
			return jsonResponse({ success: true, data: { task_id: 'moon_1', status: 'succeed', video_url: 'https://cdn.example.com/moon.mp4' } });
		},
	});

	const submitted = await client.request('moon.createVideo', { prompt: 'foggy forest', moonModel: 'moon_base' });
	assert.equal(submitted.taskId, 'moon_1');
	assert.equal(submitted.final_cost_franks, 10);

	const result = await client.poll('moon.getStatus', 'moon_1', { delayMs: 0, maxAttempts: 2 });
	assert.equal(result.status, 'succeed');
	assert.equal(calls[0].url, 'https://franklab.ru/franklab/api/make/moon/videos');
	assert.equal(calls[0].init.method, 'POST');
	assert.equal(calls[0].init.headers['X-API-Key'], 'test_public_key');
	assert.equal(JSON.parse(calls[0].init.body).moonModel, 'moon_base');
	assert.equal(calls[1].url, 'https://franklab.ru/franklab/api/make/moon/status/moon_1');
	assert.equal(calls[1].init.method, 'GET');
});

test('client derives task ids from DOLA billing_task_id and polls the dola task route', async () => {
	const calls = [];
	const client = createFrankLabClient({
		baseUrl: 'https://franklab.ru',
		apiKey: 'test_public_key',
		fetch: async (url, init) => {
			calls.push({ url, init });
			if (calls.length === 1) {
				return jsonResponse({ success: true, data: { billing_task_id: 'bt_9', status: 'processing', cost_status: 'reserved' } });
			}
			return jsonResponse({ success: true, data: { billing_task_id: 'bt_9', status: 'completed', cost_status: 'confirmed', output_text: 'done' } });
		},
	});

	const submitted = await client.request('dola.generate', { prompt: 'write a headline', async_mode: true });
	assert.equal(submitted.taskId, 'bt_9');

	const result = await client.poll('dola.getTask', 'bt_9', { delayMs: 0, maxAttempts: 2 });
	assert.equal(result.cost_status, 'confirmed');
	assert.equal(calls[1].url, 'https://franklab.ru/franklab/api/make/dola/tasks/bt_9');
	assert.equal(calls[1].init.method, 'GET');
});

test('client deletes DOLA files with DELETE and no request body', async () => {
	const calls = [];
	const client = createFrankLabClient({
		baseUrl: 'https://franklab.ru',
		apiKey: 'test_public_key',
		fetch: async (url, init) => {
			calls.push({ url, init });
			return jsonResponse({ success: true, data: { deleted: true } });
		},
	});

	const result = await client.request('dola.deleteFile', { file_id: 'file_1' });

	assert.equal(result.deleted, true);
	assert.equal(calls[0].url, 'https://franklab.ru/franklab/api/make/dola/files/file_1');
	assert.equal(calls[0].init.method, 'DELETE');
	assert.equal(calls[0].init.body, undefined);
	assert.equal(calls[0].init.headers['X-API-Key'], 'test_public_key');
});

test('client wraps ORKESTR v1 requests into the operation and payload envelope', async () => {
	const calls = [];
	const client = createFrankLabClient({
		baseUrl: 'https://franklab.ru',
		apiKey: 'test_public_key',
		fetch: async (url, init) => {
			calls.push({ url, init });
			return jsonResponse({ success: true, data: { taskId: 'ork_1', status: 'queued' } });
		},
	});

	await client.request('orkestr.music', { operation: 'extend', prompt: 'intro', style: 'synthwave' });

	assert.equal(calls[0].url, 'https://franklab.ru/franklab/api/make/orkestr/music');
	const body = JSON.parse(calls[0].init.body);
	assert.equal(body.operation, 'extend');
	assert.deepEqual(body.payload, { prompt: 'intro', style: 'synthwave' });
});

test('client builds ORKESTR v1 status URLs from pollKind and taskId path parameters', async () => {
	const calls = [];
	const client = createFrankLabClient({
		baseUrl: 'https://franklab.ru',
		apiKey: 'test_public_key',
		fetch: async (url, init) => {
			calls.push({ url, init });
			return jsonResponse({ success: true, data: { taskId: 'ork_2', status: 'running' } });
		},
	});

	const result = await client.request('orkestr.getTaskV1', { pollKind: 'vocal-removal', taskId: 'ork_2' });

	assert.equal(result.taskId, 'ork_2');
	assert.equal(calls[0].url, 'https://franklab.ru/franklab/api/make/orkestr/status/vocal-removal/ork_2');
});

test('client polls SATURN turbo tasks through the saturn-turbo status route', async () => {
	const calls = [];
	const client = createFrankLabClient({
		baseUrl: 'https://franklab.ru',
		apiKey: 'test_public_key',
		fetch: async (url, init) => {
			calls.push({ url, init });
			return jsonResponse({ code: 200, data: { task_id: 'st_1', status: calls.length === 1 ? 'processing' : 'completed', video_url: 'https://cdn.example.com/saturn.mp4' } });
		},
	});

	const submitted = await client.request('saturn.turboImageToVideo', { prompt: 'studio light', image_url: 'https://cdn.example.com/frame.png' });
	assert.equal(submitted.taskId, 'st_1');

	const result = await client.poll('saturn.getTurboStatus', 'st_1', { delayMs: 0, maxAttempts: 2 });
	assert.equal(result.status, 'completed');
	assert.equal(calls[0].url, 'https://franklab.ru/franklab/api/v1/videos/saturn-turbo/image-to-video');
	assert.equal(calls[1].url, 'https://franklab.ru/franklab/api/v1/videos/saturn-turbo/st_1');
});

test('client sends MiniMax task actions to the per-task action route', async () => {
	const calls = [];
	const client = createFrankLabClient({
		baseUrl: 'https://franklab.ru',
		apiKey: 'test_public_key',
		fetch: async (url, init) => {
			calls.push({ url, init });
			return jsonResponse({ success: true, data: { taskId: 'mm_1', status: 'cancelled' } });
		},
	});

	const result = await client.request('minimax.taskAction', { taskId: 'mm_1', action: 'cancel' });

	assert.equal(result.status, 'cancelled');
	assert.equal(calls[0].url, 'https://franklab.ru/franklab/api/make/minimax/videos/mm_1/action');
	assert.equal(calls[0].init.method, 'POST');
	assert.equal(JSON.parse(calls[0].init.body).action, 'cancel');
	assert.equal(JSON.parse(calls[0].init.body).taskId, undefined);
});

test('client appends registry-declared query fields to GET list requests', async () => {
	const calls = [];
	const client = createFrankLabClient({
		baseUrl: 'https://franklab.ru',
		apiKey: 'test_public_key',
		fetch: async (url, init) => {
			calls.push({ url, init });
			return jsonResponse({ success: true, data: { items: [], total: 0 } });
		},
	});

	await client.request('minimax.listVideos', { page_num: 2, page_size: 5, junk: 'ignored' });

	assert.equal(calls[0].url, 'https://franklab.ru/franklab/api/make/minimax/videos?page_num=2&page_size=5');
	assert.equal(calls[0].init.method, 'GET');
});

test('client extracts TextSticker integration option lists', async () => {
	const client = createFrankLabClient({
		baseUrl: 'https://franklab.ru',
		apiKey: 'test_public_key',
		fetch: async () => jsonResponse({ success: true, data: [{ id: 'font_1', name: 'Inter' }] }),
	});

	const result = await client.request('textSticker.listFonts');

	assert.deepEqual(result.items, [{ id: 'font_1', name: 'Inter' }]);
});

test('client sends Recraft status lookups through the taskId query parameter', async () => {
	const calls = [];
	const client = createFrankLabClient({
		baseUrl: 'https://franklab.ru',
		apiKey: 'test_public_key',
		fetch: async (url, init) => {
			calls.push({ url, init });
			return jsonResponse({ code: 200, data: { taskId: 'rc_1', status: 'completed' } });
		},
	});

	const result = await client.poll('jupiter.getRecraftStatus', 'rc_1', { delayMs: 0, maxAttempts: 2 });

	assert.equal(result.status, 'completed');
	assert.equal(calls[0].url, 'https://franklab.ru/franklab/api/v1/recraft/record-info?taskId=rc_1');
	assert.equal(calls[0].init.method, 'GET');
});

test('client appends KUSOK list pagination through declared query fields', async () => {
	const calls = [];
	const client = createFrankLabClient({
		baseUrl: 'https://franklab.ru',
		apiKey: 'test_public_key',
		fetch: async (url, init) => {
			calls.push({ url, init });
			return jsonResponse({ code: 200, data: { items: [], total: 0 } });
		},
	});

	await client.request('kusok.listElements', { pageNum: 1, pageSize: 20 });

	assert.equal(calls[0].url, 'https://franklab.ru/franklab/api/make/kusok/elements?pageNum=1&pageSize=20');
});

test('client submits Google Omni videos to the make/omni route', async () => {
	const calls = [];
	const client = createFrankLabClient({
		baseUrl: 'https://franklab.ru',
		apiKey: 'test_public_key',
		fetch: async (url, init) => {
			calls.push({ url, init });
			return jsonResponse({ code: 200, data: { taskId: 'gv_1', status: 'queued' } });
		},
	});

	const result = await client.request('omni.createVideo', { operation: 'text_to_video', model: 'veo3', prompt: 'aurora over mountains' });

	assert.equal(result.taskId, 'gv_1');
	assert.equal(calls[0].url, 'https://franklab.ru/franklab/api/make/omni/videos');
	const body = JSON.parse(calls[0].init.body);
	assert.equal(body.operation, 'text_to_video');
	assert.equal(body.model, 'veo3');
});

test('client submits Seedance videos to the hot-coffe v1 route', async () => {
	const calls = [];
	const client = createFrankLabClient({
		baseUrl: 'https://franklab.ru',
		apiKey: 'test_public_key',
		fetch: async (url, init) => {
			calls.push({ url, init });
			return jsonResponse({ code: 200, data: { task_id: 'hc_1', status: 'queued' } });
		},
	});

	const result = await client.request('hotCoffe.createVideo', { operation: 'text_to_video', modelVariant: 'seedance_2_0', prompt: 'latte art' });

	assert.equal(result.taskId, 'hc_1');
	assert.equal(calls[0].url, 'https://franklab.ru/franklab/api/v1/hot-coffe/videos/tasks');
	const body = JSON.parse(calls[0].init.body);
	assert.equal(body.operation, 'text_to_video');
	assert.equal(body.modelVariant, 'seedance_2_0');
});

test('client accepts apergrex.ru production origin for media API calls', async () => {
	const calls = [];
	const client = createFrankLabClient({
		baseUrl: 'https://apergrex.ru/franklab/api',
		apiKey: 'test_public_key',
		fetch: async (url, init) => {
			calls.push({ url, init });
			return jsonResponse({ code: 200, data: { task_id: 'apx_1', status: 'queued' } });
		},
	});

	const result = await client.request('hotCoffe.createVideo', { operation: 'text_to_video', modelVariant: 'seedance_2_0', prompt: 'product showcase' });

	assert.equal(result.taskId, 'apx_1');
	assert.equal(calls[0].url, 'https://apergrex.ru/franklab/api/v1/hot-coffe/videos/tasks');
});

test('client sends Idempotency-Key header and strips it from body on social.multipost and narezka.submit', async () => {
	const calls = [];
	const client = createFrankLabClient({
		baseUrl: 'https://apergrex.ru',
		apiKey: 'test_public_key',
		fetch: async (url, init) => {
			calls.push({ url, init });
			return jsonResponse({ code: 200, data: { parentId: 'mp_1', taskId: 'clip_1', status: 'queued' } });
		},
	});

	await client.request('social.multipost', { brandId: 'b1', title: 'Launch', media: 'uuid-1', idempotencyKey: 'idem-mp-001' });
	assert.equal(calls[0].init.headers['Idempotency-Key'], 'idem-mp-001');
	assert.equal(JSON.parse(calls[0].init.body).idempotencyKey, undefined);

	await client.request('narezka.submit', { sourceUrl: 'https://cdn.example.com/v.mp4', mode: 'clips', idempotencyKey: 'idem-clip-001' });
	assert.equal(calls[1].init.headers['Idempotency-Key'], 'idem-clip-001');
	assert.equal(calls[1].init.headers.Authorization, 'Bearer test_public_key');
	assert.equal(JSON.parse(calls[1].init.body).idempotencyKey, undefined);
});

test('client throws on social HTTP 200 codeData logical error and stops cleanly on pollExpired', async () => {
	const errorClient = createFrankLabClient({
		baseUrl: 'https://apergrex.ru',
		apiKey: 'test_public_key',
		fetch: async () => jsonResponse({ code: 400, msg: 'Caption too long', data: { error: 'Caption too long' } }),
	});
	await assert.rejects(() => errorClient.request('social.publish', { platform: 'telegram', caption: 'x' }), /Caption too long/);

	const pollCalls = [];
	const pollClient = createFrankLabClient({
		baseUrl: 'https://apergrex.ru',
		apiKey: 'test_public_key',
		fetch: async (url) => {
			pollCalls.push(url);
			return jsonResponse({ code: 200, data: { status: 'processing', pollExpired: true } });
		},
	});
	const res = await pollClient.poll('social.getStatus', 'rel_123', { delayMs: 0, maxAttempts: 5 });
	assert.equal(res.pollExpired, true);
	assert.equal(pollCalls.length, 1);
	assert.equal(pollCalls[0], 'https://apergrex.ru/franklab/api/make/social/status/rel_123?poll=1');
});

test('client allows HTTP 409 and 410 business outcomes on kusok.moonOperation', async () => {
	const client = createFrankLabClient({
		baseUrl: 'https://apergrex.ru',
		apiKey: 'test_public_key',
		fetch: async () => ({
			ok: false,
			status: 409,
			async json() {
				return { code: 200, data: { status: 'failed', result_code: 'FACE_MISMATCH' } };
			},
			async text() {
				return '';
			},
		}),
	});
	const res = await client.request('kusok.moonOperation', { backend: 'moon', action: 'verify_get_result', byted_token: 'bt_1' });
	assert.equal(res.status, 'failed');
	assert.equal(res.result_code, 'FACE_MISMATCH');
});

test('client polls omni.getBatchStatus via batchId and terminates on partial_success', async () => {
	const calls = [];
	const client = createFrankLabClient({
		baseUrl: 'https://apergrex.ru',
		apiKey: 'test_public_key',
		fetch: async (url) => {
			calls.push(url);
			return jsonResponse({ code: 200, data: { batch_id: 'bat_9', status: 'partial_success', succeeded: 1, failed: 1 } });
		},
	});
	const res = await client.poll('omni.getBatchStatus', 'bat_9', { delayMs: 0, maxAttempts: 3 });
	assert.equal(res.status, 'partial_success');
	assert.equal(calls[0], 'https://apergrex.ru/franklab/api/make/omni/batches/bat_9');
});

test('client sets default Volna v4, Seed Audio, xAI, Google STT operations and VariantPack operation', async () => {
	const sent = [];
	const client = createFrankLabClient({
		baseUrl: 'https://apergrex.ru',
		apiKey: 'test_public_key',
		fetch: async (url, init) => {
			sent.push({ url, body: JSON.parse(init.body) });
			return jsonResponse({ code: 200, data: { taskId: 't_1', status: 'queued' } });
		},
	});

	await client.request('volna.textToSpeechV4', { text: 'Hi', voice_id: 'v1' });
	await client.request('volna.seedAudio', { text_prompt: 'Calm voice' });
	await client.request('volna.xaiTranscribe', { audio_url: 'https://cdn.example.com/a.mp3' });
	await client.request('variantPack.create', { videoUrl: 'https://cdn.example.com/v.mp4', copies: 5, variantPreset: 'standard' });

	assert.equal(sent[0].body.operation, 'text-to-speech-v4');
	assert.equal(sent[1].body.operation, 'seed-audio-1-0');
	assert.equal(sent[2].body.operation, 'xai-speech-to-text');
	assert.equal(sent[3].body.operation, 'variant_pack');
});


