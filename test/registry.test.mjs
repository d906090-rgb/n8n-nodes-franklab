import assert from 'node:assert/strict';
import { test } from 'node:test';

const registry = await import('../dist/nodes/shared/registry.js');
const urls = await import('../dist/nodes/shared/url.js');
const redaction = await import('../dist/nodes/shared/redaction.js');

test('normalizes only the public FrankLab production API origin', () => {
	assert.equal(urls.normalizeBaseUrl('https://franklab.ru'), 'https://franklab.ru/franklab/api');
	assert.equal(urls.normalizeBaseUrl('https://franklab.ru/franklab/api/'), 'https://franklab.ru/franklab/api');
	assert.throws(() => urls.normalizeBaseUrl('http://127.0.0.1:3010'), /Only https:\/\/franklab\.ru/);
	assert.throws(() => urls.normalizeBaseUrl('https://example.com/franklab/api'), /Only https:\/\/franklab\.ru/);
});

test('registry covers all first-wave module operations with route families and auth headers', () => {
	for (const moduleName of ['holst', 'kley', 'plastinka', 'volna', 'c2pa']) {
		assert.ok(registry.MODULE_OPERATIONS[moduleName]?.length > 0, `${moduleName} operations are registered`);
	}

	const required = [
		'holst.submitImage',
		'holst.getStatus',
		'kley.montage',
		'kley.videoSpeed',
		'kley.subtitles',
		'kley.overlay',
		'kley.getStatus',
		'plastinka.processAudio',
		'plastinka.saveSample',
		'plastinka.listSamples',
		'plastinka.getStatus',
		'volna.textToSpeech',
		'volna.textToDialogue',
		'volna.textToSpeechTurbo',
		'volna.googleTts',
		'volna.transcribe',
		'volna.soundEffect',
		'volna.audioIsolation',
		'volna.voiceClone',
		'volna.voiceDesign',
		'volna.voiceDesignSave',
		'volna.dubbing',
		'volna.listVoices',
		'volna.listModels',
		'volna.usage',
		'volna.getTask',
		'volna.getDubbing',
		'c2pa.listProfiles',
		'c2pa.profileOptions',
		'c2pa.generateSelfSigned',
		'c2pa.revokeProfile',
	];

	for (const key of required) {
		const endpoint = registry.getEndpoint(key);
		assert.ok(endpoint.routeFamily, `${key} has a route family`);
		assert.match(endpoint.path, /^\//, `${key} has an absolute API path`);
		assert.ok(['Authorization', 'X-API-Key'].includes(endpoint.authHeader), `${key} has supported auth`);
		assert.ok(endpoint.responseEnvelope, `${key} declares response envelope`);
		assert.ok(endpoint.outputExtractor, `${key} declares output extraction`);
	}

	assert.equal(registry.getEndpoint('volna.textToSpeech').authHeader, 'X-API-Key');
	assert.equal(registry.getEndpoint('holst.submitImage').authHeader, 'Authorization');
});

test('registry covers all Make-parity module operations with route families and auth headers', () => {
	const parityModules = [
		'sufler',
		'textSticker',
		'orkestr',
		'jupiter',
		'mars',
		'saturn',
		'moon',
		'venus',
		'x',
		'minimax',
		'dola',
		'alibaba',
	];
	for (const moduleName of parityModules) {
		assert.ok(registry.MODULE_OPERATIONS[moduleName]?.length > 0, `${moduleName} operations are registered`);
	}

	for (const moduleName of Object.keys(registry.MODULE_OPERATIONS)) {
		for (const operation of registry.MODULE_OPERATIONS[moduleName]) {
			const endpoint = registry.getEndpoint(`${moduleName}.${operation}`);
			assert.equal(endpoint.key, `${moduleName}.${operation}`);
			assert.ok(endpoint.routeFamily, `${moduleName}.${operation} has a route family`);
			assert.match(endpoint.path, /^\//, `${moduleName}.${operation} has an absolute API path`);
			assert.ok(['Authorization', 'X-API-Key'].includes(endpoint.authHeader), `${moduleName}.${operation} has supported auth`);
			assert.ok(endpoint.responseEnvelope, `${moduleName}.${operation} declares response envelope`);
			assert.ok(endpoint.outputExtractor, `${moduleName}.${operation} declares output extraction`);
		}
	}

	// Every registry entry is reachable through MODULE_OPERATIONS (no orphan endpoints).
	const listedKeys = new Set();
	for (const [moduleName, operations] of Object.entries(registry.MODULE_OPERATIONS)) {
		for (const operation of operations) listedKeys.add(`${moduleName}.${operation}`);
	}
	assert.deepEqual(
		Object.keys(registry.ENDPOINT_REGISTRY).filter((key) => !listedKeys.has(key)),
		[],
	);
});

test('Make-parity endpoints map to the documented partner API routes and auth families', () => {
	assert.equal(registry.getEndpoint('sufler.subtitles').path, '/franklab/jobs/subtitles');
	assert.equal(registry.getEndpoint('sufler.subtitles').authHeader, 'Authorization');
	assert.equal(registry.getEndpoint('textSticker.overlay').path, '/franklab/jobs/overlay');
	assert.equal(registry.getEndpoint('textSticker.overlay').authHeader, 'Authorization');
	assert.equal(registry.getEndpoint('textSticker.listFonts').path, '/franklab/integrations/text-sticker/fonts');

	assert.equal(registry.getEndpoint('orkestr.music').path, '/make/orkestr/music');
	assert.equal(registry.getEndpoint('orkestr.music').bodyTransform, 'wrapOperationPayload');
	assert.equal(registry.getEndpoint('orkestr.getTaskV1').path, '/make/orkestr/status/:pollKind/:taskId');
	assert.equal(registry.getEndpoint('orkestr.lyriaMusic').path, '/make/orkestr/v2/lyria-music');
	assert.equal(registry.getEndpoint('orkestr.getTaskV2').path, '/make/orkestr/v2/tasks/:taskId');

	assert.equal(registry.getEndpoint('jupiter.omniImage').path, '/v1/images/omni-image');
	assert.equal(registry.getEndpoint('jupiter.getSeedreamStatus').path, '/v1/images/seedream-image/:taskId');
	assert.equal(registry.getEndpoint('mars.textToVideo').path, '/v1/videos/text2video');
	assert.equal(registry.getEndpoint('mars.getMotionStatus').path, '/v1/videos/motion-control/:taskId');
	assert.equal(registry.getEndpoint('saturn.turboImageToVideo').path, '/v1/videos/saturn-turbo/image-to-video');
	assert.equal(registry.getEndpoint('saturn.getTurboStatus').path, '/v1/videos/saturn-turbo/:taskId');
	assert.equal(registry.getEndpoint('venus.avatarVideo').path, '/v1/videos/avatar/image2video');
	assert.equal(registry.getEndpoint('x.imagineVideo').path, '/v1/videos/xai');
	assert.equal(registry.getEndpoint('x.getImageStatus').path, '/v1/images/xai-imagine/:taskId');

	assert.equal(registry.getEndpoint('moon.createVideo').path, '/make/moon/videos');
	assert.equal(registry.getEndpoint('moon.getStatus').path, '/make/moon/status/:taskId');
	assert.equal(registry.getEndpoint('minimax.taskAction').path, '/make/minimax/videos/:taskId/action');
	assert.equal(registry.getEndpoint('dola.getTask').path, '/make/dola/tasks/:billing_task_id');
	assert.equal(registry.getEndpoint('alibaba.generateImage').path, '/make/alibaba/images');

	assert.equal(registry.getEndpoint('dola.deleteFile').method, 'DELETE');
	assert.equal(registry.getEndpoint('moon.createVideo').authHeader, 'X-API-Key');
	assert.equal(registry.getEndpoint('dola.generate').authHeader, 'X-API-Key');
	assert.equal(registry.getEndpoint('saturn.video').authHeader, 'X-API-Key');

	// make/<capability> controllers answer with the { code, msg, data } envelope.
	assert.equal(registry.getEndpoint('moon.createVideo').responseEnvelope, 'codeData');
	assert.equal(registry.getEndpoint('orkestr.lyriaMusic').responseEnvelope, 'codeData');
	// Query-string support is declared explicitly, never inferred.
	assert.deepEqual(registry.getEndpoint('minimax.listVideos').queryFields, ['page_num', 'page_size']);
	assert.equal(registry.getEndpoint('volna.listVoices').queryFields, undefined);

	// OMNI is the Google provider surface, separate from Kling-backed SATURN.
	assert.equal(registry.getEndpoint('omni.createVideo').path, '/make/omni/videos');
	assert.equal(registry.getEndpoint('omni.googleSubVideo').path, '/v1/videos/google-sub');
	assert.equal(registry.getEndpoint('omni.googleSubImage').path, '/v1/images/google-sub');
	assert.equal(registry.getEndpoint('omni.videoOmni').path, '/v1/videos/omni-video');
	assert.equal(registry.MODULE_OPERATIONS.saturn.includes('omniVideo'), false);
	assert.equal(registry.MODULE_OPERATIONS.saturn.includes('getOmniStatus'), false);
	assert.equal(registry.MODULE_OPERATIONS.jupiter.includes('recraftImage'), true);
	assert.deepEqual(registry.getEndpoint('jupiter.getRecraftStatus').queryFields, ['taskId']);

	// Slice 3: remaining live surfaces.
	assert.equal(registry.getEndpoint('mercury.lipSync').path, '/v1/videos/lip-sync');
	assert.equal(registry.getEndpoint('mercury.getAdvancedLipSyncStatus').path, '/v1/videos/advanced-lip-sync/:taskId');
	assert.equal(registry.getEndpoint('neptune.textToSpeech').path, '/v1/audio/tts');
	assert.equal(registry.getEndpoint('neptune.listVoices').path, '/v1/audio/tts/voices-rpc');
	assert.equal(registry.getEndpoint('pluto.videoToAudio').path, '/v1/audio/video-to-audio');
	assert.equal(registry.getEndpoint('aries.getStatus').path, '/v1/images/kolors-virtual-try-on/:taskId');
	assert.equal(registry.getEndpoint('titan.initSelection').path, '/v1/videos/multi-elements/init-selection');
	assert.equal(registry.getEndpoint('titan.createVideo').path, '/v1/videos/multi-elements');
	assert.equal(registry.getEndpoint('hotCoffe.generateImage').path, '/make/hot-coffe/images');
	assert.equal(registry.getEndpoint('hotCoffe.createVideo').path, '/v1/hot-coffe/videos/tasks');
	assert.equal(registry.getEndpoint('kusok.listTags').path, '/v1/elements/tags');
	assert.equal(registry.getEndpoint('kusok.createCustomVoice').guard, 'KusokApiKeyGuard');
	assert.equal(registry.getEndpoint('hotCoffe.generateImage').authHeader, 'X-API-Key');

	// KUSOK element/voice library surface.
	assert.equal(registry.getEndpoint('kusok.recognize').path, '/make/kusok/recognize');
	assert.equal(registry.getEndpoint('kusok.deleteVoice').method, 'DELETE');
	assert.equal(registry.getEndpoint('kusok.getVoice').path, '/make/kusok/voices/:voiceId');
	assert.deepEqual(registry.getEndpoint('kusok.listElements').queryFields, ['pageNum', 'pageSize']);
	assert.equal(registry.getEndpoint('kusok.createElement').guard, 'KusokApiKeyGuard');
});

test('public C2PA registry excludes private key import and rotation actions', () => {
	const c2paOperations = registry.MODULE_OPERATIONS.c2pa.join('|');
	assert.equal(c2paOperations.includes('create' + '_from_pem'), false);
	assert.equal(c2paOperations.includes('rotate' + '_from_pem'), false);
	assert.equal(c2paOperations.includes('generateSelfSigned'), true);
	assert.equal(c2paOperations.includes('profileOptions'), true);
	assert.equal(c2paOperations.includes('revokeProfile'), true);
});

test('public media URL validation rejects local and non-http sources', () => {
	assert.equal(urls.validatePublicMediaUrl('https://cdn.example.com/media/video.mp4'), true);
	assert.throws(() => urls.validatePublicMediaUrl('file:///tmp/video.mp4'), /Only http and https media URLs/);
	assert.throws(() => urls.validatePublicMediaUrl('http://localhost:3000/video.mp4'), /Local media URLs are not allowed/);
	assert.throws(() => urls.validatePublicMediaUrl('http://127.0.0.1/video.mp4'), /Local media URLs are not allowed/);
	assert.throws(() => urls.validatePublicMediaUrl('http://169.254.169.254/latest/meta-data'), /Local media URLs are not allowed/);
	assert.throws(() => urls.validatePublicMediaUrl('http://100.64.1.2/video.mp4'), /Local media URLs are not allowed/);
	assert.throws(() => urls.validatePublicMediaUrl('http://[::1]/video.mp4'), /Local media URLs are not allowed/);
	assert.throws(() => urls.validatePublicMediaUrl('http://[fe80::1]/video.mp4'), /Local media URLs are not allowed/);
	assert.throws(() => urls.validatePublicMediaUrl('http://[::ffff:169.254.169.254]/video.mp4'), /Local media URLs are not allowed/);
	assert.throws(() => urls.validatePublicMediaUrl('http://asset.local/video.mp4'), /Local media URLs are not allowed/);
	assert.throws(() => urls.validatePublicMediaUrl('http://127-0-0-1.nip.io/video.mp4'), /Local media URLs are not allowed/);
});

test('Additional JSON media URL validation checks nested arrays and generic URL keys', () => {
	assert.equal(urls.validatePublicMediaUrlsInPayload({
		overlay: [
			{ imageUrl: 'https://cdn.example.com/overlay.png' },
			{ url: 'https://cdn.example.com/mask.png' },
		],
	}), true);

	assert.throws(
		() => urls.validatePublicMediaUrlsInPayload({ overlay: [{ imageUrl: 'http://169.254.169.254/latest/meta-data' }] }),
		/payload\.overlay\[0\]\.imageUrl: Local media URLs are not allowed/,
	);
	assert.throws(
		() => urls.validatePublicMediaUrlsInPayload({ overlay: [{ url: 'file:///tmp/overlay.png' }] }),
		/payload\.overlay\[0\]\.url: Only http and https media URLs are allowed/,
	);
});

test('redaction removes auth headers and secret-like nested fields', () => {
	const privateKeyField = 'private' + 'KeyPem';
	const certChainField = 'certificate' + 'ChainPem';
	const output = redaction.redactSensitive({
		headers: {
			Authorization: 'Bearer test-token',
			'X-API-Key': 'test-token',
		},
		body: {
			apiKey: 'test-token',
			[privateKeyField]: 'test-token',
			[certChainField]: 'test-token',
			nested: { token: 'test-token', publicValue: 'ok' },
		},
	});

	assert.equal(output.headers.Authorization, '[redacted]');
	assert.equal(output.headers['X-API-Key'], '[redacted]');
	assert.equal(output.body.apiKey, '[redacted]');
	assert.equal(output.body[privateKeyField], '[redacted]');
	assert.equal(output.body[certChainField], '[redacted]');
	assert.equal(output.body.nested.token, '[redacted]');
	assert.equal(output.body.nested.publicValue, 'ok');
});
