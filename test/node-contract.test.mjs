import assert from 'node:assert/strict';
import { test } from 'node:test';

const { buildPayload } = await import('../dist/nodes/shared/node-utils.js');

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

