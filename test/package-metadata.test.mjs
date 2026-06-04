import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));

test('package metadata is eligible for n8n community verification', () => {
	assert.equal(packageJson.name, '@apergrex/n8n-nodes-franklab');
	assert.equal(packageJson.license, 'MIT');
	assert.equal(packageJson.homepage, 'https://github.com/d906090-rgb/n8n-nodes-franklab#readme');
	assert.equal(packageJson.repository.url, 'git+https://github.com/d906090-rgb/n8n-nodes-franklab.git');
	assert.equal(packageJson.repository.directory, undefined);
	assert.ok(packageJson.keywords.includes('n8n-community-node-package'));
	assert.deepEqual(packageJson.dependencies, {});
	assert.equal(packageJson.n8n.strict, true);
	assert.equal(packageJson.engines.node, '>=20.19');
	assert.equal(packageJson.scripts.pretest, 'npm run build');
	assert.deepEqual(packageJson.n8n.credentials, ['dist/credentials/FrankLabApi.credentials.js']);
	assert.deepEqual(packageJson.n8n.nodes, [
		'dist/nodes/Holst/FrankLabHolst.node.js',
		'dist/nodes/Kley/FrankLabKley.node.js',
		'dist/nodes/Plastinka/FrankLabPlastinka.node.js',
		'dist/nodes/Volna/FrankLabVolna.node.js',
		'dist/nodes/C2pa/FrankLabC2pa.node.js',
	]);
	assert.ok(packageJson.devDependencies['@n8n/node-cli']);
	assert.notEqual(packageJson.devDependencies['@n8n/node-cli'], '*');
});
