import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const toolingPackageJson = JSON.parse(await readFile(new URL('../tooling/package.json', import.meta.url), 'utf8'));
const ciWorkflow = await readFile(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
const publishWorkflow = await readFile(new URL('../.github/workflows/publish.yml', import.meta.url), 'utf8');

test('package metadata is eligible for n8n community verification', () => {
	assert.equal(packageJson.name, '@apergrex/n8n-nodes-franklab');
	assert.equal(packageJson.license, 'MIT');
	assert.equal(packageJson.homepage, 'https://github.com/d906090-rgb/n8n-nodes-franklab#readme');
	assert.equal(packageJson.repository.url, 'git+https://github.com/d906090-rgb/n8n-nodes-franklab.git');
	assert.equal(packageJson.repository.directory, undefined);
	assert.deepEqual(packageJson.author, {
		name: 'FrankLab',
		email: 'fedorchuk.a@apergrex.com',
		url: 'https://franklab.ru',
	});
	assert.ok(packageJson.keywords.includes('n8n-community-node-package'));
	assert.deepEqual(packageJson.dependencies, {});
	assert.equal(packageJson.n8n.strict, true);
	assert.equal(packageJson.engines.node, '>=20.19');
	assert.equal(packageJson.scripts.pretest, 'npm run build');
	assert.deepEqual(packageJson.n8n.credentials, ['dist/credentials/FrankLabApi.credentials.js']);
	assert.deepEqual(packageJson.n8n.nodes, [
		'dist/nodes/FrankLab/FrankLab.node.js',
	]);
	assert.equal(packageJson.version, '0.5.0');
	// Monorepo tree keeps the host-lock wrapper; the public-mirror export rewrites
	// scripts.test to the standalone form, so both are valid depending on environment.
	assert.ok(
		[
			'bash ../../scripts/with-franklab-node-test-lock.sh node --test test/*.test.mjs',
			'node --test test/*.test.mjs',
		].includes(packageJson.scripts.test),
		`unexpected scripts.test: ${packageJson.scripts.test}`,
	);
	assert.equal(packageJson.overrides, undefined);
	assert.equal(packageJson.devDependencies['@n8n/node-cli'], undefined);
	assert.equal(packageJson.devDependencies['@types/node'], '18.19.130');
	assert.deepEqual(packageJson.files, ['dist', '!dist/tooling', 'README.md', 'LICENSE', 'examples']);
	assert.equal(toolingPackageJson.private, true);
	assert.equal(toolingPackageJson.devDependencies['@n8n/node-cli'], '0.46.2');
	assert.deepEqual(toolingPackageJson.overrides, {
		axios: '^1.20.0',
		'@n8n/utils': {
			nanoid: '^3.3.17',
		},
		// handlebars 4.7.10 (2026-10-14 drift triage): @n8n/node-cli pins 4.7.9 exactly;
		// GHSA-8R5X-FM3F-WHWJ + GHSA-P8WG-VRV2-V86F affect <=4.7.9. Dev-only tooling tree.
		handlebars: '4.7.10',
	});
	assert.equal(packageJson.scripts.build, 'node tooling/run-node-cli.mjs build');
	assert.equal(
		packageJson.scripts['tooling:ci'],
		'npm --prefix tooling ci --ignore-scripts && node tooling/link-node-cli.mjs',
	);
});

test('public workflows install and cache both deterministic development contours', () => {
	for (const [name, workflow] of [['ci', ciWorkflow], ['publish', publishWorkflow]]) {
		assert.match(workflow, /cache-dependency-path:\s*\|\s*\n\s+package-lock\.json\s*\n\s+tooling\/package-lock\.json/);
		assert.match(workflow, /run: npm ci --ignore-scripts/);
		assert.match(workflow, /run: npm run tooling:ci/, `${name} must install private tooling`);
	}
});

test('public Undici acceptance cannot cover a vulnerable private tooling copy', async () => {
	// The advisory job aggregates both locks under one workspace acceptance.
	// Keep its temporary public release-it exception out of the fixable tooling tree.
	const lock = JSON.parse(await readFile(new URL('../tooling/package-lock.json', import.meta.url), 'utf8'));
	const copies = Object.entries(lock.packages).filter(([location, entry]) =>
		entry.name === 'undici' || /(?:^|\/)node_modules\/undici$/.test(location),
	);
	assert.ok(copies.length > 0, 'private tooling Undici inventory must remain explicit');
	for (const [location, entry] of copies) {
		const match = /^7\.(\d+)\.(\d+)$/.exec(entry.version);
		assert.ok(
			match && (Number(match[1]) > 30 || (Number(match[1]) === 30 && Number(match[2]) >= 1)),
			`private tooling Undici must stay on a reviewed patched 7.x release (>=7.30.1): ${location}=${entry.version}`,
		);
	}
});
