import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { NodeApiError } = require('n8n-workflow');

const { buildPayload } = await import('../dist/nodes/shared/node-utils.js');
const { FrankLab } = await import('../dist/nodes/FrankLab/FrankLab.node.js');

function stubContext(params) {
	return {
		getNodeParameter(name, _itemIndex, fallback) {
			if (Object.prototype.hasOwnProperty.call(params, name)) return params[name];
			return fallback;
		},
	};
}

test('orkestr getTaskV1 promotes jobId to taskId even when pollKind is set', () => {
	const payload = buildPayload(stubContext({ jobId: 'ork_1', pollKind: 'lyrics' }), 0, 'orkestr', 'getTaskV1');
	assert.equal(payload.taskId, 'ork_1');
	assert.equal(payload.pollKind, 'lyrics');
});

test('minimax taskAction promotes jobId to taskId and keeps the action body only', () => {
	const payload = buildPayload(stubContext({ jobId: 'mm_1', action: 'cancel' }), 0, 'minimax', 'taskAction');
	assert.equal(payload.taskId, 'mm_1');
	assert.equal(payload.action, 'cancel');
});

test('mars imageToVideo sends the DTO-canonical image field, not image_url', () => {
	const payload = buildPayload(stubContext({ image: 'https://cdn.example.com/frame.png', prompt: 'fly' }), 0, 'mars', 'imageToVideo');
	assert.equal(payload.image, 'https://cdn.example.com/frame.png');
	assert.equal(payload.image_url, undefined);
});

test('mars effects carries the required effect_scene, effect and image fields', () => {
	const payload = buildPayload(
		stubContext({
			effect_scene: 'single_character',
			effect: 'fire Aura',
			image: 'https://cdn.example.com/char.png',
		}),
		0,
		'mars',
		'effects',
	);
	assert.equal(payload.effect_scene, 'single_character');
	assert.equal(payload.effect, 'fire Aura');
	assert.equal(payload.image, 'https://cdn.example.com/char.png');
});

test('venus avatarVideo sends image and sound_file, the keys the server normalizes', () => {
	const payload = buildPayload(
		stubContext({ image: 'https://cdn.example.com/face.png', sound_file: 'https://cdn.example.com/voice.mp3' }),
		0,
		'venus',
		'avatarVideo',
	);
	assert.equal(payload.image, 'https://cdn.example.com/face.png');
	assert.equal(payload.sound_file, 'https://cdn.example.com/voice.mp3');
	assert.equal(payload.image_url, undefined);
	assert.equal(payload.sound_file_url, undefined);
});

test('omni videoOmni wraps video_url into the video_list the DTO accepts', () => {
	const payload = buildPayload(stubContext({ video_url: 'https://cdn.example.com/src.mp4', prompt: 'remix' }), 0, 'omni', 'videoOmni');
	assert.deepEqual(payload.video_list, [{ video_url: 'https://cdn.example.com/src.mp4' }]);
	assert.equal(payload.video_url, undefined);
});

test('omni videoOmni leaves an explicit video_list untouched and drops video_url', () => {
	const explicit = [{ video_url: 'https://cdn.example.com/a.mp4' }, { video_url: 'https://cdn.example.com/b.mp4' }];
	const payload = buildPayload(
		stubContext({ video_url: 'https://cdn.example.com/src.mp4', payloadJson: JSON.stringify({ video_list: explicit }) }),
		0,
		'omni',
		'videoOmni',
	);
	assert.deepEqual(payload.video_list, explicit);
	assert.equal(payload.video_url, undefined);
});

test('orkestr v1 music maps operationName into operation for the envelope wrap', () => {
	const payload = buildPayload(stubContext({ operationName: 'extend', prompt: 'intro', style: 'synthwave' }), 0, 'orkestr', 'music');
	assert.equal(payload.operation, 'extend');
	assert.equal(payload.prompt, 'intro');
});

test('falsy values survive payload collection (false booleans and zero numbers)', () => {
	const payload = buildPayload(stubContext({ instrumental: false, seed: 0 }), 0, 'orkestr', 'generate');
	assert.equal(payload.instrumental, false);
	assert.equal(payload.seed, 0);
});

test('media URL validation still rejects local hosts in new-generation fields', () => {
	assert.throws(
		() => buildPayload(stubContext({ image: 'http://127.0.0.1:8080/face.png' }), 0, 'venus', 'avatarVideo'),
		/Local media URLs are not allowed/,
	);
	assert.throws(
		() => buildPayload(stubContext({ image: 'http://169.254.169.254/latest/meta-data' }), 0, 'mars', 'imageToVideo'),
		/Local media URLs are not allowed/,
	);
});

test('bare image keys stay legal for base64-capable surfaces like Jupiter', () => {
	const payload = buildPayload(
		stubContext({ payloadJson: JSON.stringify({ image: 'data:image/png;base64,aGVsbG8=', image_list: [{ image: 'aGVsbG8=' }] }) }),
		0,
		'jupiter',
		'omniImage',
	);
	assert.equal(payload.image, 'data:image/png;base64,aGVsbG8=');
	assert.deepEqual(payload.image_list, [{ image: 'aGVsbG8=' }]);
});

test('omni createVideo maps Google Operation to the operation body field', () => {
	const payload = buildPayload(
		stubContext({ operationMode: 'image_to_video', model: 'veo3', prompt: 'drone shot', duration_seconds: 8 }),
		0,
		'omni',
		'createVideo',
	);
	assert.equal(payload.operation, 'image_to_video');
	assert.equal(payload.model, 'veo3');
	assert.equal(payload.duration_seconds, 8);
});

test('omni google-sub submits carry the prompt and image URL', () => {
	const payload = buildPayload(
		stubContext({ prompt: 'trailer cut', image_url: 'https://cdn.example.com/poster.png' }),
		0,
		'omni',
		'googleSubVideo',
	);
	assert.equal(payload.prompt, 'trailer cut');
	assert.equal(payload.image_url, 'https://cdn.example.com/poster.png');
});

test('kusok createElement maps the portrait image into refer_images', () => {
	const payload = buildPayload(
		stubContext({
			image_url: 'https://cdn.example.com/face.png',
			element_name: 'Host',
			element_description: 'Main presenter',
			reference_type: 'image_refer',
		}),
		0,
		'kusok',
		'createElement',
	);
	assert.deepEqual(payload.refer_images, [{ image_url: 'https://cdn.example.com/face.png' }]);
	assert.equal(payload.image_url, undefined);
	assert.equal(payload.element_name, 'Host');
	assert.equal(payload.element_description, 'Main presenter');
	assert.equal(payload.reference_type, 'image_refer');
});

test('kusok recognize sends the DTO-canonical image field', () => {
	const payload = buildPayload(stubContext({ image: 'https://cdn.example.com/portrait.png' }), 0, 'kusok', 'recognize');
	assert.equal(payload.image, 'https://cdn.example.com/portrait.png');
});

test('kusok getElement passes the element id path parameter', () => {
	const payload = buildPayload(stubContext({ id: 'el_9' }), 0, 'kusok', 'getElement');
	assert.equal(payload.id, 'el_9');
});

test('jupiter recraftImage builds the kie task contract with model and input.image', () => {
	const payload = buildPayload(
		stubContext({ recraftModel: 'recraft/remove-background', image: 'https://cdn.example.com/product.png' }),
		0,
		'jupiter',
		'recraftImage',
	);
	assert.equal(payload.model, 'recraft/remove-background');
	assert.deepEqual(payload.input, { image: 'https://cdn.example.com/product.png' });
	assert.equal(payload.image, undefined);
});


test('hotCoffe createVideo maps operation and model variant fields', () => {
	const payload = buildPayload(
		stubContext({ operationMode: 'text_to_video', modelVariant: 'seedance_2_0', prompt: 'city run', resolution: '1080p' }),
		0,
		'hotCoffe',
		'createVideo',
	);
	assert.equal(payload.operation, 'text_to_video');
	assert.equal(payload.modelVariant, 'seedance_2_0');
	assert.equal(payload.resolution, '1080p');
});

test('neptune textToSpeech carries text and voice', () => {
	const payload = buildPayload(stubContext({ text: 'Hello there', voice: 'alloy' }), 0, 'neptune', 'textToSpeech');
	assert.equal(payload.text, 'Hello there');
	assert.equal(payload.voice, 'alloy');
});

test('pluto videoToAudio carries the video URL', () => {
	const payload = buildPayload(stubContext({ video_url: 'https://cdn.example.com/clip.mp4' }), 0, 'pluto', 'videoToAudio');
	assert.equal(payload.video_url, 'https://cdn.example.com/clip.mp4');
});

test('hotCoffe createVideo wraps video_url into video_list', () => {
	const payload = buildPayload(
		stubContext({ video_url: 'https://cdn.example.com/src.mp4', operationMode: 'video_edit', modelVariant: 'seedance_2_0', prompt: 'recut' }),
		0,
		'hotCoffe',
		'createVideo',
	);
	assert.deepEqual(payload.video_list, [{ video_url: 'https://cdn.example.com/src.mp4' }]);
	assert.equal(payload.video_url, undefined);
	assert.equal(payload.operation, 'video_edit');
});

test('omni quoteBatch wraps flat video fields into request object', () => {
	const payload = buildPayload(
		stubContext({ count: 2, operationMode: 'text_to_video', model: 'omni_1_2', prompt: 'sunset drone' }),
		0,
		'omni',
		'quoteBatch',
	);
	assert.equal(payload.count, 2);
	assert.deepEqual(payload.request, { operation: 'text_to_video', model: 'omni_1_2', prompt: 'sunset drone' });
});

test('dola generate forwards Gemini 4 model_key and thinking_level (including xhigh for Neon/Hydrogen)', () => {
	const neon = buildPayload(
		stubContext({ prompt: 'Design a 3D scene', model_key: 'gemini_4_neon', thinking_level: 'xhigh' }),
		0,
		'dola',
		'generate',
	);
	assert.equal(neon.model_key, 'gemini_4_neon');
	assert.equal(neon.thinking_level, 'xhigh');

	const hydrogen = buildPayload(
		stubContext({ prompt: 'Fast summary', model_key: 'gemini_4_hydrogen', thinking_level: 'high' }),
		0,
		'dola',
		'generate',
	);
	assert.equal(hydrogen.model_key, 'gemini_4_hydrogen');
	assert.equal(hydrogen.thinking_level, 'high');

	const carbon = buildPayload(
		stubContext({ prompt: 'Deep analysis', model_key: 'gemini_4_carbon', thinking_level: 'medium' }),
		0,
		'dola',
		'generate',
	);
	assert.equal(carbon.model_key, 'gemini_4_carbon');
	assert.equal(carbon.thinking_level, 'medium');
});

test('plastinka applySample maps sampleOperation to operation and preserves sampleId', () => {
	const payload = buildPayload(
		stubContext({ videoUrl: 'https://cdn.example.com/v.mp4', sampleOperation: 'replace', sampleId: 'smp_42' }),
		0,
		'plastinka',
		'applySample',
	);
	assert.equal(payload.operation, 'replace');
	assert.equal(payload.sampleId, 'smp_42');
});

test('social publish allows UUID media and rejects localhost media URLs including trimmed and array values', () => {
	const ok = buildPayload(
		stubContext({ platform: 'telegram', media: '11111111-1111-4111-8111-111111111111', caption: 'Hello' }),
		0,
		'social',
		'publish',
	);
	assert.equal(ok.media, '11111111-1111-4111-8111-111111111111');

	assert.throws(
		() => buildPayload(stubContext({ platform: 'telegram', media: 'http://127.0.0.1/secret.mp4', caption: 'No' }), 0, 'social', 'publish'),
		/Local media URLs are not allowed/,
	);

	assert.throws(
		() => buildPayload(stubContext({ platform: 'telegram', media: '  http://127.0.0.1/secret.mp4', caption: 'No' }), 0, 'social', 'publish'),
		/Local media URLs are not allowed/,
	);

	assert.throws(
		() =>
			buildPayload(
				stubContext({
					platform: 'telegram',
					payloadJson: JSON.stringify({ media: ['https://cdn.example.com/ok.mp4', ' http://127.0.0.1/bad.mp4'] }),
				}),
				0,
				'social',
				'publish',
			),
		/Local media URLs are not allowed/,
	);
});

test('flux rejects private/localhost URLs in keyframes with leading whitespace and in startVideo/videoInput UI fields', async () => {
	assert.throws(
		() =>
			buildPayload(
				stubContext({
					payloadJson: JSON.stringify({ request: { keyframes: ['  http://127.0.0.1/frame.png'] } }),
				}),
				0,
				'flux',
				'videoQuote',
			),
		/Local media URLs are not allowed/,
	);

	const frankLabNode = new FrankLab();
	for (const badCase of [
		{ resource: 'flux', operation: 'videoQuote', videoMode: 'v2v', startVideo: 'http://127.0.0.1/clip.mp4', expected: /Local media URLs are not allowed/ },
		{ resource: 'flux', operation: 'videoQuote', videoMode: 'v2v', startVideo: '  http://127.0.0.1/clip.mp4', expected: /Local media URLs are not allowed/ },
		{ resource: 'flux', operation: 'videoQuote', videoMode: 'edit', videoInput: 'http://169.254.169.254/latest/meta-data', expected: /Local media URLs are not allowed/ },
	]) {
		let httpCalled = false;
		const execCtx = {
			getInputData: () => [{ json: {} }],
			getCredentials: async () => ({ apiKey: 'fl_test_key', baseUrl: 'https://apergrex.ru' }),
			getNode: () => ({ name: 'FrankLab' }),
			continueOnFail: () => false,
			getNodeParameter(name, _itemIndex, fallback) {
				if (Object.prototype.hasOwnProperty.call(badCase, name)) return badCase[name];
				return fallback;
			},
			helpers: {
				httpRequest: async () => {
					httpCalled = true;
					return { statusCode: 200, body: {} };
				},
			},
		};
		await assert.rejects(() => frankLabNode.execute.call(execCtx), badCase.expected);
		assert.equal(httpCalled, false);
	}
});

test('unified FrankLab node wraps HTTP errors in NodeApiError with status code, body, and headers', async () => {
	const frankLabNode = new FrankLab();
	const execCtx = {
		getInputData: () => [{ json: {} }],
		getCredentials: async () => ({ apiKey: 'fl_test_key', baseUrl: 'https://apergrex.ru' }),
		getNode: () => ({ name: 'FrankLab', type: '@apergrex/n8n-nodes-franklab.frankLab' }),
		continueOnFail: () => false,
		getNodeParameter(name, _itemIndex, fallback) {
			if (name === 'resource') return 'holst';
			if (name === 'operation') return 'submitImage';
			if (name === 'imageUrl') return 'https://cdn.example.com/pic.png';
			return fallback;
		},
		helpers: {
			httpRequest: async () => ({
				statusCode: 422,
				headers: { 'x-request-id': 'req_422_test' },
				body: { error: 'Unsupported image format' },
			}),
		},
	};

	await assert.rejects(
		() => frankLabNode.execute.call(execCtx),
		(error) => {
			assert.ok(error instanceof NodeApiError, 'HTTP error must be wrapped in NodeApiError');
			assert.equal(error.httpCode, '422');
			assert.match(error.message, /Unsupported image format/);
			return true;
		},
	);
});

test('kusok moonOperation defaults backend to moon and heygenAgent maps pageToken to token', () => {
	const moon = buildPayload(stubContext({ action: 'verify_start' }), 0, 'kusok', 'moonOperation');
	assert.equal(moon.backend, 'moon');
	assert.equal(moon.action, 'verify_start');

	const heygen = buildPayload(stubContext({ providerAccountMode: 'franklab', pageToken: 'cursor_2' }), 0, 'heygenAgent', 'listSessions');
	assert.equal(heygen.token, 'cursor_2');
});

test('mars textToVideo and imageToVideo build canonical Kling 4.0 payloads for mars-v2 and mars-v2-flash', () => {
	const t2v = buildPayload(
		stubContext({
			model: 'mars-v2',
			prompt: 'A golden retriever runs along the beach',
			resolution: '4k',
			dynamic_range: 'hdr',
			duration: 12,
			aspect_ratio: '4:3',
		}),
		0,
		'mars',
		'textToVideo',
	);
	assert.deepEqual(t2v, {
		model_name: 'mars-v2',
		prompt: 'A golden retriever runs along the beach',
		settings: { resolution: '4k', dynamic_range: 'hdr', duration: 12, aspect_ratio: '4:3' },
	});

	const i2v = buildPayload(
		stubContext({
			model: 'mars-v2',
			prompt: 'Smooth transition through @Image2',
			image: 'https://cdn.example.com/start.png',
			middle_frame_urls: 'https://cdn.example.com/mid1.png, https://cdn.example.com/mid2.png',
			image_tail: 'https://cdn.example.com/end.png',
			resolution: '1080p',
			dynamic_range: 'hdr',
			duration: 15,
			aspect_ratio: '16:9',
		}),
		0,
		'mars',
		'imageToVideo',
	);
	assert.deepEqual(i2v, {
		model_name: 'mars-v2',
		settings: { resolution: '1080p', dynamic_range: 'hdr', duration: 15 },
		contents: [
			{ type: 'prompt', text: 'Smooth transition through @Image2' },
			{ type: 'first_frame', url: 'https://cdn.example.com/start.png' },
			{ type: 'middle_frame', url: 'https://cdn.example.com/mid1.png', id: 'Image2' },
			{ type: 'middle_frame', url: 'https://cdn.example.com/mid2.png', id: 'Image3' },
			{ type: 'last_frame', url: 'https://cdn.example.com/end.png' },
		],
	});

	// Custom contents via payloadJson must strip flat image/prompt/image_tail, and Flash must clamp to 720p without dynamic_range
	const customContents = buildPayload(
		stubContext({
			model: 'mars-v2-flash',
			prompt: 'stale flat prompt',
			image: 'https://cdn.example.com/stale.png',
			resolution: '4k',
			dynamic_range: 'hdr',
			payloadJson: JSON.stringify({
				contents: [
					{ type: 'prompt', text: 'Custom flash prompt' },
					{ type: 'first_frame', url: 'https://cdn.example.com/real.png' },
				],
				settings: { resolution: '4k', dynamic_range: 'hdr', aspect_ratio: '16:9', duration: 6 },
			}),
		}),
		0,
		'mars',
		'imageToVideo',
	);
	assert.deepEqual(customContents, {
		model_name: 'mars-v2-flash',
		settings: { resolution: '720p', duration: 6 },
		contents: [
			{ type: 'prompt', text: 'Custom flash prompt' },
			{ type: 'first_frame', url: 'https://cdn.example.com/real.png' },
		],
	});

	const flashI2v = buildPayload(
		stubContext({
			model: 'mars-v2-flash',
			prompt: 'Camera pushes in',
			image: 'https://cdn.example.com/start.png',
			middle_frame_urls: 'https://cdn.example.com/ignored.png',
			image_tail: 'https://cdn.example.com/ignored-end.png',
			duration: 8,
		}),
		0,
		'mars',
		'imageToVideo',
	);
	assert.deepEqual(flashI2v, {
		model_name: 'mars-v2-flash',
		settings: { resolution: '720p', duration: 8 },
		contents: [
			{ type: 'prompt', text: 'Camera pushes in' },
			{ type: 'first_frame', url: 'https://cdn.example.com/start.png' },
		],
	});
});

test('saturn video builds canonical Kling 4.0 Omni payload with base_video, feature_video, keyframes, elements, voices, audio and 4K HDR', () => {
	const omni = buildPayload(
		stubContext({
			model_name: 'saturn-v2',
			prompt: '@Element1 speaks with @Voice1 while editing @Video1',
			resolution: '4k',
			dynamic_range: 'hdr',
			duration: 10,
			aspect_ratio: 'adaptive',
			audio: 'native',
			first_frame_url: 'https://cdn.example.com/first.png',
			middle_frame_urls: 'https://cdn.example.com/mid.png',
			refer_image_urls: 'https://cdn.example.com/ref.png',
			last_frame_url: 'https://cdn.example.com/last.png',
			base_video_url: 'https://cdn.example.com/base.mp4',
			feature_video_url: 'https://cdn.example.com/ref.mp4',
			element_ids: 'el_1, el_2',
			voice_ids: 'v_1',
		}),
		0,
		'saturn',
		'video',
	);
	assert.deepEqual(omni, {
		model_name: 'saturn-v2',
		settings: { resolution: '4k', dynamic_range: 'hdr', duration: 10, aspect_ratio: 'adaptive', audio: 'native' },
		contents: [
			{ type: 'prompt', text: '@Element1 speaks with @Voice1 while editing @Video1' },
			{ type: 'first_frame', url: 'https://cdn.example.com/first.png', id: 'Image1' },
			{ type: 'middle_frame', url: 'https://cdn.example.com/mid.png', id: 'Image2' },
			{ type: 'refer_image', url: 'https://cdn.example.com/ref.png', id: 'Image3' },
			{ type: 'last_frame', url: 'https://cdn.example.com/last.png', id: 'Image4' },
			{ type: 'base_video', url: 'https://cdn.example.com/base.mp4', id: 'Video1' },
			{ type: 'feature_video', url: 'https://cdn.example.com/ref.mp4', id: 'Video2' },
			{ type: 'element', element_id: 'el_1', id: 'Element1' },
			{ type: 'element', element_id: 'el_2', id: 'Element2' },
			{ type: 'voice', voice_id: 'v_1', id: 'Voice1' },
		],
	});

	assert.throws(
		() => buildPayload(stubContext({ model_name: 'saturn-v2', base_video_url: 'http://127.0.0.1/private.mp4' }), 0, 'saturn', 'video'),
		/Local media URLs are not allowed/,
	);
});

test('jupiter midjourneyImage maps 16-action fields, skips empty image_urls[], and enforces SSRF on image_urls and mask_url', () => {
	const imagine = buildPayload(
		stubContext({
			operationMode: 'imagine',
			prompt: 'stormy lighthouse',
			image_urls: [],
			mjVersion: 'v8.2',
			mjSize: '16:9',
			mjQuality: 1,
			speed: 'fast',
			style: 'raw',
			stylize: 250,
			chaos: 0,
			weird: 0,
			seed: 42,
			negative_prompt: 'blurry',
		}),
		0,
		'jupiter',
		'midjourneyImage',
	);
	assert.equal(imagine.operation, 'imagine');
	assert.equal(imagine.version, 'v8.2');
	assert.equal(imagine.size, '16:9');
	assert.equal(imagine.quality, 1);
	assert.equal(imagine.chaos, 0);
	assert.equal(imagine.weird, 0);
	assert.equal(imagine.seed, 42);
	assert.equal(imagine.image_urls, undefined);

	const modal = buildPayload(
		stubContext({
			operationMode: 'modal',
			parent_task_id: 'franklab_parent_1',
			mask_url: 'https://cdn.example.com/mask.png',
			prompt: 'bright sky',
		}),
		0,
		'jupiter',
		'midjourneyImage',
	);
	assert.equal(modal.operation, 'modal');
	assert.equal(modal.parent_task_id, 'franklab_parent_1');
	assert.equal(modal.mask_url, 'https://cdn.example.com/mask.png');

	const props = new FrankLab().description.properties;
	const mjActionProp = props.find(
		(p) =>
			p.name === 'operationMode' &&
			p.displayOptions?.show?.resource?.[0] === 'jupiter' &&
			p.displayOptions?.show?.operation?.includes('midjourneyImage'),
	);
	assert.deepEqual(
		mjActionProp.options.map((o) => o.value),
		[
			'blend',
			'describe',
			'edits',
			'high-variation',
			'imagine',
			'inpaint',
			'low-variation',
			'modal',
			'pan',
			'remix-strong',
			'remix-subtle',
			'reroll',
			'upscale',
			'variation',
			'zoom',
		],
	);

	assert.throws(
		() =>
			buildPayload(
				stubContext({
					operationMode: 'blend',
					image_urls: ['https://cdn.example.com/ok.jpg', 'http://169.254.169.254/latest/meta-data'],
				}),
				0,
				'jupiter',
				'midjourneyImage',
			),
		/Local media URLs are not allowed/,
	);
	assert.throws(
		() =>
			buildPayload(
				stubContext({
					operationMode: 'modal',
					parent_task_id: 'franklab_parent_1',
					mask_url: 'http://127.0.0.1:8080/mask.png',
				}),
				0,
				'jupiter',
				'midjourneyImage',
			),
		/Local media URLs are not allowed/,
	);
});

test('economy_rail execution_mode scopes strictly to covered /v1 operations, strips direct, and rejects hotCoffe video_extend', () => {
	const ok = buildPayload(
		stubContext({
			operationMode: 'text_to_video',
			modelVariant: 'seedance_2_0',
			prompt: 'ocean waves',
			execution_mode: 'economy_rail',
		}),
		0,
		'hotCoffe',
		'createVideo',
	);
	assert.equal(ok.execution_mode, 'economy_rail');

	const explicitDirect = buildPayload(
		stubContext({
			prompt: 'portrait study',
			model_name: 'mist',
			execution_mode: 'direct',
			seed: null,
		}),
		0,
		'jupiter',
		'omniImage',
	);
	assert.equal(explicitDirect.execution_mode, undefined);
	assert.equal(explicitDirect.model_name, 'mist');
	assert.equal('seed' in explicitDirect, false);

	assert.throws(
		() =>
			buildPayload(
				stubContext({
					prompt: 'portrait study',
					payloadJson: JSON.stringify({ reference_images: ['http://127.0.0.1/private.png'] }),
				}),
				0,
				'jupiter',
				'gptImageCodex',
			),
		/Local media URLs are not allowed/,
	);

	assert.throws(
		() =>
			buildPayload(
				stubContext({
					operationMode: 'video_extend',
					modelVariant: 'seedance_2_0',
					prompt: 'extend clip',
					execution_mode: 'economy_rail',
				}),
				0,
				'hotCoffe',
				'createVideo',
			),
		/video_extend is not supported on economy_rail/,
	);

	const props = new FrankLab().description.properties;
	const execProps = props.filter((p) => p.name === 'execution_mode');
	for (const execProp of execProps) {
		const res = execProp.displayOptions?.show?.resource?.[0];
		if (['jupiter', 'mars', 'saturn', 'hotCoffe'].includes(res)) {
			assert.deepEqual(
				execProp.options.map((o) => o.value),
				['', 'economy_rail'],
			);
		}
	}
	const omniModelName = props.find(
		(p) => p.name === 'model_name' && p.displayOptions?.show?.resource?.[0] === 'jupiter',
	);
	assert.deepEqual(omniModelName.displayOptions.show.operation, ['omniImage']);
	const byResource = Object.fromEntries(execProps.map((p) => [p.displayOptions.show.resource[0], p.displayOptions.show.operation]));
	assert.deepEqual(byResource.jupiter, ['omniImage', 'seedreamImage', 'geminiImage']);
	assert.deepEqual(byResource.mars, ['textToVideo', 'imageToVideo']);
	assert.deepEqual(byResource.saturn, ['video', 'turboTextToVideo', 'turboImageToVideo']);
	assert.deepEqual(byResource.hotCoffe, ['createVideo']);
	assert.equal(byResource.omni, undefined);
	assert.equal(byResource.moon, undefined);
});



test('jupiter omniImage builds canonical Kling 4.0 Image Standard and Long payloads and rejects private URLs', () => {
	const std = buildPayload(
		stubContext({
			model_name: 'jupiter-v2',
			prompt: 'Editorial portrait @Element1 with @Image1',
			kling4_result_type: 'series',
			series_amount: 'auto',
			resolution: '8k',
			aspect_ratio: '3:4',
			reference_images: 'https://cdn.example.com/ref1.png',
			element_ids: 'el_img_1',
			n: 5,
		}),
		0,
		'jupiter',
		'omniImage',
	);
	assert.equal(std.model_name, 'jupiter-v2');
	assert.equal(std.prompt, undefined);
	assert.equal(std.n, undefined);
	assert.deepEqual(std.settings, {
		result_type: 'series',
		series_amount: 'auto',
		resolution: '8k',
		aspect_ratio: '3:4',
	});
	assert.deepEqual(std.contents, [
		{ type: 'prompt', text: 'Editorial portrait @Element1 with @Image1' },
		{ type: 'refer_image', url: 'https://cdn.example.com/ref1.png', id: 'Image1' },
		{ type: 'element', element_id: 'el_img_1', id: 'Element1' },
	]);

	const ecom = buildPayload(
		stubContext({
			model_name: 'jupiter-v2-long',
			prompt: 'Product detail page for @Image1',
			kling4_long_skill: 'ecommerce',
			kling4_long_length: 'long',
			resolution: '2k',
			reference_images: 'https://cdn.example.com/prod1.png, https://cdn.example.com/prod2.png',
		}),
		0,
		'jupiter',
		'omniImage',
	);
	assert.equal(ecom.model_name, 'jupiter-v2-long');
	assert.deepEqual(ecom.settings, { skill: 'ecommerce', length: 'long', resolution: '2k' });
	assert.deepEqual(ecom.contents, [
		{ type: 'prompt', text: 'Product detail page for @Image1' },
		{ type: 'refer_image', url: 'https://cdn.example.com/prod1.png', id: 'Image1' },
		{ type: 'refer_image', url: 'https://cdn.example.com/prod2.png', id: 'Image2' },
	]);

	const webpage = buildPayload(
		stubContext({
			model_name: 'jupiter-v2-long',
			prompt: 'SaaS landing page',
			kling4_long_skill: 'webpage',
			kling4_long_length: 'long',
			resolution: '1k',
			style_refer_image_url: 'https://cdn.example.com/style.png',
			subject_refer_image_url: 'https://cdn.example.com/subj.png',
		}),
		0,
		'jupiter',
		'omniImage',
	);
	assert.deepEqual(webpage.settings, { skill: 'webpage', resolution: '1k' });
	assert.deepEqual(webpage.contents, [
		{ type: 'prompt', text: 'SaaS landing page' },
		{ type: 'style_refer_image', url: 'https://cdn.example.com/style.png', id: 'Image1' },
		{ type: 'subject_refer_image', url: 'https://cdn.example.com/subj.png', id: 'Image2' },
	]);

	// Rejects private SSRF URLs and non-HTTPS URLs
	assert.throws(
		() =>
			buildPayload(
				stubContext({
					model_name: 'jupiter-v2',
					prompt: 'Bad SSRF',
					reference_images: 'http://127.0.0.1/secret.png',
				}),
				0,
				'jupiter',
				'omniImage',
			),
		/Local media URLs are not allowed/,
	);
	assert.throws(
		() =>
			buildPayload(
				stubContext({
					model_name: 'jupiter-v2',
					prompt: 'HTTP rejected',
					reference_images: 'http://cdn.example.com/insecure.png',
				}),
				0,
				'jupiter',
				'omniImage',
			),
		/https:\/\//i,
	);

	// Enforces combined <= 10 limit, ecommerce 1..3 limit, and valid series_amount
	assert.throws(
		() =>
			buildPayload(
				stubContext({
					model_name: 'jupiter-v2',
					prompt: 'Too many refs+elements',
					reference_images: Array.from({ length: 6 }, (_, i) => `https://cdn.example.com/${i}.png`).join(','),
					element_ids: 'e1,e2,e3,e4,e5',
				}),
				0,
				'jupiter',
				'omniImage',
			),
		/10/,
	);
	assert.throws(
		() =>
			buildPayload(
				stubContext({
					model_name: 'jupiter-v2-long',
					prompt: 'Missing ecommerce refs',
					kling4_long_skill: 'ecommerce',
				}),
				0,
				'jupiter',
				'omniImage',
			),
		/1 to 3/,
	);
	assert.throws(
		() =>
			buildPayload(
				stubContext({
					model_name: 'jupiter-v2',
					prompt: 'Invalid series amount',
					kling4_result_type: 'series',
					series_amount: 'abc',
				}),
				0,
				'jupiter',
				'omniImage',
			),
		/series_amount/,
	);

	// Preserves legacy jupiter-v1-5 / payloadJson model_name and scrubs kling4_* helpers
	const legacy = buildPayload(
		stubContext({
			model_name: 'jupiter-v1-5',
			payloadJson: JSON.stringify({ model_name: 'mist', prompt: 'Legacy mist' }),
			kling4_result_type: 'series',
			kling4_long_skill: 'webpage',
		}),
		0,
		'jupiter',
		'omniImage',
	);
	assert.equal(legacy.model_name, 'mist');
	assert.equal(legacy.kling4_result_type, undefined);
	assert.equal(legacy.kling4_long_skill, undefined);
});


