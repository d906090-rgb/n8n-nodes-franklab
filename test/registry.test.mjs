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
